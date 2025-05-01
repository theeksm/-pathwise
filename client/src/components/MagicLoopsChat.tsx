import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, User } from "lucide-react";
import userAvatar from "@/assets/user-avatar.svg";
import aiAvatar from "@/assets/ai-avatar.svg";
import { useToast } from "@/hooks/use-toast";

// Define the message type
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Define props
interface MagicLoopsChatProps {
  initialMessage?: string;
  userInfo?: {
    careerInterest?: string;
    educationLevel?: string;
  };
}

export default function MagicLoopsChat({ initialMessage = "Hi, I'm May, your career assistant. How can I help you today?", userInfo = {} }: MagicLoopsChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with the assistant's greeting
  useEffect(() => {
    setMessages([
      {
        id: "welcome-message",
        role: "assistant",
        content: initialMessage,
        timestamp: new Date(),
      },
    ]);
  }, [initialMessage]);

  // Track previous messages length to determine when new messages are added
  const prevMessagesLengthRef = useRef(0);
  
  // Auto-scroll to the bottom only when new messages are received
  useEffect(() => {
    // Don't scroll on initial render with just the welcome message
    const isInitialLoad = messages.length === 1 && messages[0].id === "welcome-message";
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    
    // Only auto-scroll when:
    // 1. There are messages AND
    // 2. Either:
    //    a. It's not the initial welcome message AND
    //    b. New messages have been added
    if (messages.length > 0 && !isInitialLoad && isNewMessage) {
      // Add small delay to ensure rendering is complete before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    
    // Update the previous length reference
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Function to send message to Magic Loops API
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Generate a unique ID for the user message
    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Add user message to chat
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Prepare the request to server-side Magic Loops API endpoint
    const requestBody = {
      message: message,
      careerInterest: userInfo.careerInterest || "",
      educationLevel: userInfo.educationLevel || ""
    };

    try {
      console.log("Sending request to server Magic Loops endpoint:", requestBody);
      const response = await fetch("/api/chat/magic-loops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from Magic Loops API:", data);
      
      // Add the AI response to the chat
      const assistantResponse: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: "assistant",
        content: data.response || "I'm sorry, I wasn't able to process that request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantResponse]);
    } catch (error) {
      console.error("Error calling Magic Loops API:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again later.",
        variant: "destructive",
      });
      
      // Add an error message from the assistant
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to my services. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
    }
  };

  return (
    <Card className="w-full h-[80vh] flex flex-col overflow-hidden border-0 shadow-lg rounded-xl">
      <div className="bg-primary p-4 text-primary-foreground rounded-t-xl">
        <div className="flex items-center space-x-2">
          <img src={aiAvatar} alt="AI Avatar" className="w-8 h-8 rounded-full" />
          <div>
            <h3 className="font-semibold">May - Career Assistant</h3>
            <p className="text-xs opacity-90">Powered by Magic Loops</p>
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 rounded-full w-8 h-8 overflow-hidden ${
                      message.role === "user" ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <img
                      src={message.role === "user" ? userAvatar : aiAvatar}
                      alt={message.role === "user" ? "User" : "AI"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 rounded-full w-8 h-8 overflow-hidden bg-secondary">
                    <img
                      src={aiAvatar}
                      alt="AI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>May is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask May about your career questions..."
            className="flex-1 resize-none"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="h-full aspect-square"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}