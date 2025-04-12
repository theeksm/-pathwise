import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot, SendHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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
  
  // Advanced error handling states
  const [apiError, setApiError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'api-key' | 'rate-limit' | 'service' | 'network' | 'unknown' | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const { toast } = useToast();
  
  // Reset error states when component mounts or user changes
  useEffect(() => {
    setApiError(null);
    setErrorType(null);
    setRetryAttempts(0);
  }, [user]);

  // Enhanced error handling for the chat system
  const classifyError = (error: Error): { message: string; type: 'api-key' | 'rate-limit' | 'service' | 'network' | 'unknown' } => {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('api key') || errorMsg.includes('invalid key') || errorMsg.includes('expired key')) {
      return {
        message: "There's an issue with our AI service configuration. Our team has been notified.",
        type: 'api-key'
      };
    } else if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
      return {
        message: "We're experiencing high demand. Please try again in a moment.",
        type: 'rate-limit'
      };
    } else if (errorMsg.includes('service') || errorMsg.includes('unavailable')) {
      return {
        message: "Our AI service is temporarily unavailable. Please try again later.",
        type: 'service'
      };
    } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
      return {
        message: "Network connection issue. Please check your internet connection and try again.",
        type: 'network'
      };
    } else {
      return {
        message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
        type: 'unknown'
      };
    }
  };

  // Handle automatic retry for specific error types
  const handleRetry = () => {
    if (message.trim() && retryAttempts < 3) {
      setRetryAttempts(prev => prev + 1);
      setApiError(null);
      setErrorType(null);
      toast({
        title: "Retrying...",
        description: "Attempting to send your message again.",
        duration: 3000
      });
      
      // Small delay before retry to prevent hammering the API
      setTimeout(() => {
        sendMessageMutation.mutate(message);
      }, 1000);
    } else if (retryAttempts >= 3) {
      toast({
        title: "Multiple failures",
        description: "We're having trouble connecting to our AI service. Please try again later.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Send a message mutation with enhanced error handling
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Clear any previous errors
      setApiError(null);
      setErrorType(null);

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
      setRetryAttempts(0); // Reset retry counter on success
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
    onError: (error: Error) => {
      console.error("Error sending message:", error);
      
      // Classify the error for better handling
      const { message, type } = classifyError(error);
      setApiError(message);
      setErrorType(type);
      
      // Auto-retry for rate limit errors
      if (type === 'rate-limit' && retryAttempts < 2) {
        toast({
          title: "Service busy",
          description: "We'll automatically retry in a moment...",
          duration: 3000
        });
        
        setTimeout(() => {
          handleRetry();
        }, 3000);
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
    // Prevent default and stop propagation to ensure page doesn't scroll
    e.stopPropagation();
    
    if (message.trim()) {
      sendMessageMutation.mutate(message);
      // Keep focus on the input field after sending
      const inputElement = document.querySelector('.chat-page-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
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
                  <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">
                      {errorType === 'api-key' ? 'Configuration Issue' : 
                       errorType === 'rate-limit' ? 'Service Busy' :
                       errorType === 'service' ? 'Service Unavailable' :
                       errorType === 'network' ? 'Network Error' : 'Error'}
                    </AlertTitle>
                    <AlertDescription className="text-sm mt-1">{apiError}</AlertDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
                        onClick={() => {setApiError(null); setErrorType(null);}}
                      >
                        Dismiss
                      </Button>
                      
                      {(errorType === 'rate-limit' || errorType === 'network' || errorType === 'unknown') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-800 hover:bg-red-50"
                          onClick={handleRetry}
                          disabled={retryAttempts >= 3}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry {retryAttempts > 0 ? `(${retryAttempts}/3)` : ''}
                        </Button>
                      )}
                    </div>
                  </Alert>
                )}
              
                <div className="flex items-center">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here"
                    className="chat-page-input block w-full bg-gray-100 border-transparent rounded-md focus:border-primary-500 focus:bg-white focus:ring-0 text-sm"
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