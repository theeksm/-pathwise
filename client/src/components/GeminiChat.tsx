import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Send, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
// Import assets properly with correct path
import userAvatarSrc from "../assets/user-avatar.svg";
import aiAvatarSrc from "../assets/ai-avatar.svg";

// Message type definition
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  aiProvider?: string;
}

// Chat type definition
interface Chat {
  id: number;
  userId: number;
  title: string;
  messages: Message[];
  chatMode?: string;
  createdAt: string;
}

const GeminiChat = () => {
  const { user } = useAuth() || { user: null };
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track previous messages length to determine when new messages are added
  const prevMessagesLengthRef = useRef(0);
  
  // Get list of chats
  const { data: chats, isLoading: isChatsLoading } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
    enabled: !!user,
  });

  // Find existing standard chat or set new one
  useEffect(() => {
    if (chats && chats.length > 0 && !chatId) {
      // Look for an existing Standard chat
      const standardChat = chats.find(chat => chat.chatMode === 'standard');
      if (standardChat) {
        console.log("Found existing standard chat:", standardChat.id);
        setChatId(standardChat.id);
      }
    }
  }, [chats, chatId]);

  // Get the current chat messages
  const { data: currentChat, isLoading: isChatLoading } = useQuery<Chat>({
    queryKey: ['/api/chats', chatId],
    enabled: !!chatId,
  });
  
  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chats", {
        userId: user?.id,
        title: "New Standard Chat",
        messages: [],
        chatMode: "standard"
      });
      
      if (!res.ok) {
        throw new Error(`Failed to create chat: ${res.status}`);
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setChatId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create chat",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // If no chat exists, create one first
      if (!chatId) {
        const newChat = await createChatMutation.mutateAsync();
        setChatId(newChat.id);
        
        const res = await apiRequest("POST", `/api/chats/${newChat.id}/message`, {
          content,
          chatMode: "standard"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to send message: ${res.status}`);
        }
        
        return await res.json();
      } else {
        // Send to existing chat
        const res = await apiRequest("POST", `/api/chats/${chatId}/message`, {
          content,
          chatMode: "standard"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to send message: ${res.status}`);
        }
        
        return await res.json();
      }
    },
    onSuccess: (data) => {
      // Clear input field
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats', data.id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle creating a new chat
  const handleNewChat = () => {
    setChatId(null);
    createChatMutation.mutate();
  };
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(message);
  };
  
  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const currentLength = currentChat?.messages?.length || 0;
    const isNewMessage = currentLength > prevMessagesLengthRef.current;
    
    if (currentChat?.messages && isNewMessage) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
      prevMessagesLengthRef.current = currentLength;
    }
  }, [currentChat?.messages]);
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  // Combined loading state
  const isLoading = isChatsLoading || isChatLoading || sendMessageMutation.isPending;
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat toolbar */}
      <div className="flex justify-between items-center p-2 bg-background border-b">
        <h3 className="text-sm font-medium">Standard AI Chat</h3>
        <Button size="sm" variant="ghost" onClick={handleNewChat} title="Start new chat">
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>
      
      {/* Messages area */}
      <div className="flex-grow p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {/* Provider label */}
        <div className="text-center text-xs text-muted-foreground mb-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          Powered by Gemini AI
        </div>
        
        {/* Welcome message if no messages */}
        {(!currentChat || !currentChat.messages || currentChat.messages.length === 0) && (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">Welcome to the Standard AI Career Coach</h3>
            <p className="text-muted-foreground mb-2">
              Ask me questions about career guidance and I'll provide helpful basic advice.
            </p>
            <p className="text-muted-foreground text-sm">
              For more detailed career analysis, skill gap assessment, or personalized resume optimization, 
              try using the specific tools in PathWise or upgrade to Enhanced Mode.
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
      <div className="bg-card p-4 border-t">
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
  );
};

export default GeminiChat;