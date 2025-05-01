import { Card, CardContent } from "@/components/ui/card";
import OpenAIChat from "@/components/OpenAIChat";
import GeminiChat from "@/components/GeminiChat";
import MagicLoopsChat from "@/components/MagicLoopsChat";
import FloChat from "@/components/FloChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { isDevMode, hasDevSession } from "@/lib/dev-mode";

const AIChatPage = () => {
  const { user } = useAuth() || { user: null };
  const [, navigate] = useLocation();
  
  // Use localStorage to remember which tab was selected
  const getInitialTab = () => {
    const savedTab = localStorage.getItem('pathwise-ai-chat-tab');
    return savedTab || "standard"; // Default to standard if none saved
  };
  
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab());
  
  // Check if user has subscription or if dev mode is active
  // In a real production environment, we would check user.subscriptionTier or similar
  const hasActiveDevSession = isDevMode() && hasDevSession();
  
  // Only subscribed users or developers in dev mode can access premium features
  // For demonstration, we'll consider any logged-in user as subscribed
  const hasSubscription = !!user || hasActiveDevSession;
  
  // Premium AI assistants (May and Flo) require subscription
  const canAccessPremiumAssistants = hasSubscription || hasActiveDevSession;
  
  // Notify about dev mode bypass
  useEffect(() => {
    if (hasActiveDevSession) {
      console.log("[DEV MODE] Developer session active - premium features unlocked");
    }
  }, [hasActiveDevSession]);
  
  // Save selected tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pathwise-ai-chat-tab', currentTab);
  }, [currentTab]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">Career Coach</h1>
      <p className="text-center text-muted-foreground mb-6 dark:text-gray-300">Get personalized career advice and guidance from our AI assistants</p>
      
      <Tabs 
        value={currentTab}
        className="w-full"
        onValueChange={(value) => setCurrentTab(value)}
      >
        <div className="flex justify-center mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="standard">Standard — Gemini AI</TabsTrigger>
            <TabsTrigger value="may-assistant" disabled={!canAccessPremiumAssistants}>
              May — Career Assistant {!canAccessPremiumAssistants && "🔒"}
            </TabsTrigger>
            <TabsTrigger value="flo-assistant" disabled={!canAccessPremiumAssistants}>
              Flo — Empathetic AI {!canAccessPremiumAssistants && "🔒"}
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Standard Chat powered by Gemini - Available to all users */}
        <TabsContent value="standard" className="mt-0">
          <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
            <CardContent className="p-0 h-[800px]">
              <GeminiChat />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* May Career Assistant - Premium Feature */}
        <TabsContent value="may-assistant" className="mt-0">
          {canAccessPremiumAssistants ? (
            <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
              <CardContent className="p-0 h-[800px]">
                <MagicLoopsChat 
                  initialMessage="Hi, I'm May, your career assistant powered by GPT-4.1. I specialize in career advice, interview preparation, resume optimization, and job matching. How can I help you today?"
                  userInfo={{
                    careerInterest: user && typeof user.targetCareer === 'string' ? user.targetCareer : '',
                    educationLevel: user && typeof user.educationLevel === 'string' ? user.educationLevel : ''
                  }}
                  isSubscribed={true}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6">
              <h2 className="text-lg font-medium text-center mb-4">Meet May, Your Career Assistant</h2>
              <p className="text-muted-foreground text-center mb-6">
                This AI is available to subscribed users only. Upgrade to unlock.
              </p>
              <div className="flex justify-center space-x-4">
                {!user && (
                  <Button onClick={() => navigate("/auth")} variant="outline">
                    Sign In
                  </Button>
                )}
                <Button onClick={() => navigate("/pricing")} className="bg-primary hover:bg-primary/90">
                  Upgrade Now
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Flo - Empathetic AI Assistant - Premium Feature */}
        <TabsContent value="flo-assistant" className="mt-0">
          {canAccessPremiumAssistants ? (
            <Card className="shadow-lg border-purple-200 overflow-hidden min-h-[800px]">
              <CardContent className="p-0 h-[800px]">
                <FloChat
                  initialMessage="Hi, I'm Flo, your empathetic career companion. I'm here to listen, understand, and provide supportive guidance for your career journey. How are you feeling today about your career path?"
                  isSubscribed={true}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-purple-200 max-w-md mx-auto p-6">
              <h2 className="text-lg font-medium text-center mb-4">Meet Flo, Your Empathetic AI</h2>
              <p className="text-muted-foreground text-center mb-6">
                This AI is available to subscribed users only. Upgrade to unlock.
              </p>
              <div className="flex justify-center space-x-4">
                {!user && (
                  <Button onClick={() => navigate("/auth")} variant="outline">
                    Sign In
                  </Button>
                )}
                <Button onClick={() => navigate("/pricing")} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Upgrade Now
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIChatPage;