import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Import assets properly with correct path
import userAvatarSrc from "../assets/user-avatar.svg";
import aiAvatarSrc from "../assets/ai-avatar.svg";

// Message type definition
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Chat type definition
interface Chat {
  id: number;
  userId: number;
  title: string;
  messages: Message[];
  createdAt: string;
}

const OpenAIChat = () => {
  const { user } = useAuth() || { user: null };
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get or create a chat
  const { data: chats, isLoading: isChatsLoading } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
    enabled: !!user,
  });

  useEffect(() => {
    if (chats && chats.length > 0 && !chatId) {
      // Use the most recent chat
      setChatId(chats[0].id);
    }
  }, [chats, chatId]);

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chats", {
        userId: user?.id,
        title: "New Career Chat",
        messages: [],
      });
      return res.json();
    },
    onSuccess: (data: Chat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setChatId(data.id);
      toast({
        title: "Chat created",
        description: "Started a new conversation",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get the current chat messages
  const { data: currentChat, isLoading: isChatLoading } = useQuery<Chat>({
    queryKey: ['/api/chats', chatId],
    enabled: !!chatId,
    select: (data) => {
      console.log("Current chat data received:", data);
      return data;
    }
  });

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      console.log("Sending message:", content);
      if (!chatId) {
        // Create a new chat first
        console.log("No chat ID, creating new chat");
        const newChat = await createChatMutation.mutateAsync();
        console.log("Created new chat:", newChat);
        const response = await apiRequest("POST", `/api/chats/${newChat.id}/message`, { content });
        console.log("Message response:", response);
        return response;
      }
      console.log("Using existing chat ID:", chatId);
      const response = await apiRequest("POST", `/api/chats/${chatId}/message`, { content });
      console.log("Message response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Message sent successfully, response data:", data);
      // Invalidate both the chats list and the specific chat
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: ['/api/chats', chatId] });
      }
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    onError: (error: Error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a new chat
  const handleNewChat = () => {
    createChatMutation.mutate();
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Loading states
  const isLoading = isChatsLoading || isChatLoading || sendMessageMutation.isPending;

  // UI output
  return (
    <div className="flex flex-col h-full">
      {/* Chat history panel could be added here in the future */}
      
      {/* Main chat area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Message display area */}
        <div className="flex-grow p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-t-md">
          {/* Welcome message if no messages */}
          {(!currentChat || !currentChat.messages || currentChat.messages.length === 0) && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">Welcome to the AI Career Coach</h3>
              <p className="text-muted-foreground">
                Ask me anything about career guidance, skill development, job search, 
                interview preparation, or professional growth.
              </p>
            </div>
          )}
          
          {/* Messages */}
          <div className="space-y-4">
            {currentChat?.messages && currentChat.messages.map((msg: Message, index: number) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <Avatar className={`${msg.role === 'user' ? 'ml-2' : 'mr-2'} h-8 w-8`}>
                    <AvatarImage 
                      src={msg.role === 'user' ? userAvatarSrc : aiAvatarSrc} 
                      alt={msg.role === 'user' ? 'User' : 'AI'} 
                    />
                    <AvatarFallback>
                      {msg.role === 'user' ? user?.username?.[0]?.toUpperCase() || 'U' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Message content */}
                  <Card className={`${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background'
                  }`}>
                    <CardContent className="p-3 text-sm whitespace-pre-wrap">
                      {msg.content}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage 
                      src={aiAvatarSrc} 
                      alt="AI" 
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Card>
                    <CardContent className="p-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message input area */}
        <div className="bg-card p-4 border-t rounded-b-md">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-grow resize-none min-h-[60px] max-h-[200px] overflow-auto"
              disabled={isLoading || !user}
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading || !message.trim() || !user}
              className="h-10 w-10"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <div className="mt-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for a new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAIChat;