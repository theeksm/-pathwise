import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface Chat {
  id: number;
  userId: number;
  messages: Message[];
  createdAt: string;
}

const AIChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false
  });
  
  // Query the active chat for the user
  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['/api/chats'],
    enabled: !!user,
    throwOnError: false
  });
  
  // Get or create a chat
  const getOrCreateChat = async () => {
    if (!user) return null;
    
    // If user has chats, use the most recent one
    if (chats && chats.length > 0) {
      return chats[0]; // Assuming chats are sorted by most recent
    }
    
    // Otherwise, create a new chat
    const initialMessage = {
      role: "assistant",
      content: "Hi there! I'm your AI Career Coach. How can I help with your career journey today?",
      timestamp: new Date().toISOString()
    };
    
    const res = await apiRequest("POST", "/api/chats", {
      userId: user.id,
      messages: [initialMessage]
    });
    
    const newChat = await res.json();
    return newChat;
  };
  
  // Send a message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeChat) {
        // Get or create a chat first
        const chat = await getOrCreateChat();
        setActiveChat(chat);
        
        if (!chat || !chat.id) {
          throw new Error("Failed to create or get a chat");
        }
        
        const res = await apiRequest("POST", `/api/chats/${chat.id}/message`, { content });
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/chats/${activeChat.id}/message`, { content });
        return res.json();
      }
    },
    onSuccess: (data) => {
      setActiveChat(data);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    }
  });
  
  // Set active chat when data is loaded
  useEffect(() => {
    if (chats && chats.length > 0 && !activeChat) {
      setActiveChat(chats[0]);
    }
  }, [chats, activeChat]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };
  
  const handleQuickQuestion = (question: string) => {
    sendMessageMutation.mutate(question);
  };
  
  const quickQuestions = [
    "What can I help with?",
    "What career suits my skills and interests?",
    "Help me write a professional summary.",
    "What jobs are good for creative people?"
  ];
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    
    // If opening the chat and there's no active chat, try to get or create one
    if (!isChatOpen && !activeChat && user) {
      getOrCreateChat().then(chat => {
        setActiveChat(chat);
      });
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isChatOpen && (
        <div className="shadow-xl rounded-lg overflow-hidden w-80 md:w-96 bg-white border border-gray-200">
          <div className="px-4 py-3 bg-primary-600 text-white flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl">🤖</span>
              <h3 className="ml-2 font-medium">AI Career Coach</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-primary-100"
              onClick={toggleChat}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="p-4 h-80 bg-gray-50">
            {activeChat?.messages.map((msg, index) => (
              msg.role === "assistant" ? (
                <div key={index} className="flex items-start mb-4">
                  <div className="flex-shrink-0 bg-primary-600 rounded-full p-2">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="ml-3 bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex items-start justify-end mb-4">
                  <div className="mr-3 bg-primary-100 p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              )
            ))}
            
            {!activeChat?.messages?.length && (
              <div className="text-center mb-4">
                <span className="text-xs text-gray-500 inline-block bg-white px-2 py-1 rounded-full">
                  Powered by AI, built around you.
                </span>
              </div>
            )}
            
            {(!user || (activeChat?.messages?.length === 1 && activeChat?.messages[0].role === "assistant")) && (
              <div className="space-y-2 mt-4">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full bg-white justify-start h-auto py-3 text-left text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={!user || sendMessageMutation.isPending}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here"
                className="block w-full bg-gray-100 border-transparent rounded-md focus:border-primary-500 focus:bg-white focus:ring-0 text-sm"
                disabled={!user || sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                className="ml-2 flex-shrink-0 bg-primary-600 rounded-full p-2 text-white"
                disabled={!message.trim() || !user || sendMessageMutation.isPending}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            {!user && (
              <p className="mt-2 text-xs text-center text-gray-500">
                <a href="/login" className="text-primary-600 hover:underline">Sign in</a> or <a href="/signup" className="text-primary-600 hover:underline">create an account</a> to chat with our AI assistant
              </p>
            )}
          </form>
        </div>
      )}
      
      {!isChatOpen && (
        <Button
          onClick={toggleChat}
          className="p-4 bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 flex items-center justify-center transition-all"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default AIChat;
