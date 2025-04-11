import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const AIChatPage = () => {
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Define the user interface
  interface User {
    id: number;
    username: string;
    email: string;
  }

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false
  });
  
  // Query the active chat for the user
  const { data: chats, isLoading: isChatsLoading } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
    enabled: !!user,
    throwOnError: false
  });
  
  // Get or create a chat
  const getOrCreateChat = async (): Promise<Chat | null> => {
    if (!user) return null;
    
    // If user has chats, use the most recent one
    if (chats && chats.length > 0) {
      return chats[0]; // Assuming chats are sorted by most recent
    }
    
    // Otherwise, create a new chat
    const initialMessage: Message = {
      role: "assistant",
      content: "Hi there! I'm your AI Career Coach. How can I help with your career journey today?",
      timestamp: new Date().toISOString()
    };
    
    const res = await apiRequest("POST", "/api/chats", {
      userId: user.id,
      messages: [initialMessage]
    });
    
    const newChat = await res.json();
    return newChat as Chat;
  };
  
  // State for handling API errors
  const [apiError, setApiError] = useState<string | null>(null);

  // Send a message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setApiError(null); // Clear any previous errors

      if (!activeChat) {
        // Get or create a chat first
        const chat = await getOrCreateChat();
        setActiveChat(chat);
        
        if (!chat || !chat.id) {
          throw new Error("Failed to create or get a chat");
        }
        
        const res = await apiRequest("POST", `/api/chats/${chat.id}/message`, { content });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to send message");
        }
        return data;
      } else {
        const res = await apiRequest("POST", `/api/chats/${activeChat.id}/message`, { content });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to send message");
        }
        return data;
      }
    },
    onSuccess: (data) => {
      setActiveChat(data);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
    onError: (error: Error) => {
      console.error("Error sending message:", error);
      if (error.message.includes("API key")) {
        setApiError("There was an issue with the AI service. Please try again later or contact support.");
      } else {
        setApiError("Failed to send your message. Please try again.");
      }
    }
  });
  
  // Set active chat when data is loaded
  useEffect(() => {
    if (chats && chats.length > 0 && !activeChat) {
      setActiveChat(chats[0]);
    } else if (!isChatsLoading && !activeChat && user) {
      // If we have a user but no chats, create one
      getOrCreateChat().then(chat => {
        setActiveChat(chat);
      });
    }
  }, [chats, activeChat, isChatsLoading, user]);
  
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
    "What skills should I focus on developing?",
    "How can I switch to a career in tech?",
    "Help me improve my interview skills",
    "What certifications are in high demand?",
    "How do I negotiate a higher salary?"
  ];
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Career Coach</h1>
      <p className="text-center text-muted-foreground mb-8">Get personalized career advice and guidance from our AI assistant</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-400 text-white">
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Career Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4 bg-gray-50">
                {activeChat?.messages.map((msg, index) => (
                  msg.role === "assistant" ? (
                    <div key={index} className="flex items-start mb-4">
                      <div className="flex-shrink-0 bg-blue-400 rounded-full p-2">
                        <Bot className="h-4 w-4 text-white" />
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
                
                {!activeChat?.messages?.length && !isChatsLoading && (
                  <div className="text-center my-8">
                    <p className="text-gray-500">No messages yet. Start a conversation with our AI Career Coach.</p>
                  </div>
                )}
                
                {isChatsLoading && (
                  <div className="text-center my-8">
                    <p className="text-gray-500">Loading your conversation history...</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                {apiError && (
                  <div className="mb-3 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md">
                    <p className="font-medium mb-1">Error</p>
                    <p>{apiError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs bg-white hover:bg-gray-50"
                      onClick={() => setApiError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              
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
                    className="ml-2 flex-shrink-0 bg-blue-400 hover:bg-blue-500 rounded-full p-2 text-white transition-colors"
                    disabled={!message.trim() || !user || sendMessageMutation.isPending}
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                {sendMessageMutation.isPending && (
                  <p className="mt-2 text-xs text-center text-gray-500">
                    Sending message...
                  </p>
                )}
                
                {!user && (
                  <p className="mt-2 text-xs text-center text-gray-500">
                    <a href="/login" className="text-primary-600 hover:underline">Sign in</a> or <a href="/signup" className="text-primary-600 hover:underline">create an account</a> to chat with our AI assistant
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-2 px-3 text-left text-sm text-gray-800 hover:bg-gray-100 whitespace-normal break-words"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={!user || sendMessageMutation.isPending}
                  >
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Tips for effective conversations:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific about your career goals</li>
                  <li>• Mention your background and experience</li>
                  <li>• Ask focused questions for better guidance</li>
                  <li>• Follow up for more detailed advice</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;