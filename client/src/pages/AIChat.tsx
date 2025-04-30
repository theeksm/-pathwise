import { Card, CardContent } from "@/components/ui/card";
import OpenAIChat from "@/components/OpenAIChat";
import GeminiChat from "@/components/GeminiChat";
import MagicLoopsChat from "@/components/MagicLoopsChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";

const AIChatPage = () => {
  const { user } = useAuth() || { user: null };
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState<string>("standard"); // default to standard chat

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">Career Coach</h1>
      <p className="text-center text-muted-foreground mb-6 dark:text-gray-300">Get personalized career advice and guidance from our AI assistant</p>
      
      <Tabs 
        defaultValue="standard" 
        className="w-full"
        onValueChange={(value) => setCurrentTab(value)}
      >
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="standard">Standard Mode — Gemini AI</TabsTrigger>
            <TabsTrigger value="may-assistant" disabled={!user}>May — Career Assistant</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Upgrade Membership upsell popup for when free users try to access May career assistant */}
        {currentTab === "may-assistant" && !user && (
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
      </Tabs>
    </div>
  );
};

export default AIChatPage;