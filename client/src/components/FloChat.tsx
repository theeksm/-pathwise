import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Crown } from "lucide-react";
import userAvatar from "@/assets/user-avatar.svg";
import aiAvatar from "@/assets/ai-avatar.svg";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Define the message type
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Define props
interface FloChatProps {
  initialMessage?: string;
  isSubscribed?: boolean;
}

export default function FloChat({ 
  initialMessage = "Hi, I'm Flo, your empathetic career companion. I'm here to support you through your career journey with understanding and helpful advice. How are you feeling today?", 
  isSubscribed = false 
}: FloChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Initialize with the assistant's greeting - without auto-scrolling
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

  // Note: We've intentionally removed all auto-scrolling behavior
  // per the requirements to never auto-scroll in this component
  
  // Function to send message to Magic Loops API for Flo
  const sendMessage = async (message: string) => {
    if (!message.trim() || !isSubscribed) return;

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

    try {
      console.log("Sending request to Flo API endpoint");
      const response = await fetch("https://magicloops.dev/api/loop/9ba423c7-3c4e-433f-a279-835d0b2cc700/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from Flo API:", data);
      
      // Add the AI response to the chat
      const assistantResponse: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: "assistant",
        content: data.response || "I'm sorry, I wasn't able to process that request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantResponse]);
    } catch (error) {
      console.error("Error calling Flo API:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from Flo. Please try again later.",
        variant: "destructive",
      });
      
      // Add an error message from the assistant
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isSubscribed) {
      sendMessage(input);
    }
  };

  return (
    <Card className="w-full h-[80vh] flex flex-col overflow-hidden border-0 shadow-lg rounded-xl">
      <div className="bg-purple-600 p-4 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <img src={aiAvatar} alt="AI Avatar" className="w-8 h-8 rounded-full" />
          <div>
            <h3 className="font-semibold">Flo – Empathetic AI</h3>
            <p className="text-xs opacity-90">Emotionally supportive career guidance</p>
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
                      message.role === "user" ? "bg-primary" : "bg-purple-100 dark:bg-purple-900"
                    }`}
                  >
                    <img
                      src={message.role === "user" ? userAvatar : aiAvatar}
                      alt={message.role === "user" ? "User" : "Flo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-pink-50 dark:bg-purple-900/30 text-gray-800 dark:text-gray-100"
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
                  <div className="flex-shrink-0 rounded-full w-8 h-8 overflow-hidden bg-purple-100 dark:bg-purple-900">
                    <img
                      src={aiAvatar}
                      alt="Flo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-pink-50 dark:bg-purple-900/30 text-gray-800 dark:text-gray-100 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Flo is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Input Area */}
      <div className="p-4 border-t">
        {isSubscribed ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Flo for empathetic career advice..."
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
              className="h-full aspect-square bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
              Flo is available for subscribed users only. Upgrade to unlock.
            </h3>
            <Button 
              onClick={() => navigate("/pricing")} 
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}