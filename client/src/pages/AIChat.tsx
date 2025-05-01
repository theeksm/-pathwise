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

const AIChatPage = () => {
  const { user } = useAuth() || { user: null };
  const [, navigate] = useLocation();
  
  // Use localStorage to remember which tab was selected
  const getInitialTab = () => {
    const savedTab = localStorage.getItem('pathwise-ai-chat-tab');
    return savedTab || "standard"; // Default to standard if none saved
  };
  
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab());
  
  // Check if user has subscription
  // Since our user model doesn't have subscriptionTier field yet, we'll simulate with dev mode for now
  // In production, this would check the actual user subscription status
  const hasSubscription = !!user; // For testing: treat any logged-in user as subscribed
  
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
            <TabsTrigger value="may-assistant" disabled={!user}>May — Career Assistant</TabsTrigger>
            <TabsTrigger value="flo-assistant">Flo — Empathetic AI</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Show appropriate upgrade messages for locked assistants */}
        {(currentTab === "may-assistant" && !user) && (
          <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6 mb-4">
            <h2 className="text-lg font-medium text-center mb-4">Meet May, Your Career Assistant</h2>
            <p className="text-muted-foreground text-center mb-6">
              May is our premium career coach powered by Magic Loops AI, providing in-depth career guidance, interview prep, resume feedback, and personalized job recommendations.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate("/auth")} variant="outline">
                Sign In
              </Button>
              <Button onClick={() => navigate("/pricing")} className="bg-primary hover:bg-primary/90">
                See Pricing Plans
              </Button>
            </div>
          </Card>
        )}
        
        {/* Standard Chat powered by Gemini */}
        <TabsContent value="standard" className="mt-0">
          <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
            <CardContent className="p-0 h-[800px]">
              <GeminiChat />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* May Career Assistant powered by Magic Loops - only shown if user is logged in */}
        <TabsContent value="may-assistant" className="mt-0">
          {user ? (
            <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
              <CardContent className="p-0 h-[800px]">
                <MagicLoopsChat 
                  initialMessage="Hi, I'm May, your career assistant powered by GPT-4.1. I specialize in career advice, interview preparation, resume optimization, and job matching. How can I help you today?"
                  userInfo={{
                    careerInterest: typeof user.targetCareer === 'string' ? user.targetCareer : '',
                    educationLevel: typeof user.educationLevel === 'string' ? user.educationLevel : ''
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6">
              <h2 className="text-lg font-medium text-center mb-4">Meet May, Your Career Assistant</h2>
              <p className="text-muted-foreground text-center mb-6">
                May is our premium AI-powered career coach, trained on thousands of career paths to provide personalized guidance for your professional journey.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => navigate("/pricing")} className="bg-primary hover:bg-primary/90">
                  Upgrade Membership
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Flo - Empathetic AI Assistant - available for subscription users only */}
        <TabsContent value="flo-assistant" className="mt-0">
          <Card className="shadow-lg border-purple-200 overflow-hidden min-h-[800px]">
            <CardContent className="p-0 h-[800px]">
              <FloChat
                initialMessage="Hi, I'm Flo, your empathetic career companion. I'm here to listen, understand, and provide supportive guidance for your career journey. How are you feeling today about your career path?"
                isSubscribed={hasSubscription}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIChatPage;