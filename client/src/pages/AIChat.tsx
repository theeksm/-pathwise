import { Card, CardContent } from "@/components/ui/card";
import OpenAIChat from "@/components/OpenAIChat";
import GeminiChat from "@/components/GeminiChat";
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
            <TabsTrigger value="standard">Standard Mode — Powered by Gemini AI</TabsTrigger>
            <TabsTrigger value="enhanced" disabled={!user}>Enhanced Mode — Powered by OpenAI GPT</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Upgrade Membership upsell popup for when free users try to access enhanced mode */}
        {currentTab === "enhanced" && !user && (
          <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6 mb-4">
            <h2 className="text-lg font-medium text-center mb-4">Upgrade Your Membership</h2>
            <p className="text-muted-foreground text-center mb-6">
              Enhanced Mode gives you access to our premium OpenAI-powered career advisor with deeper analysis, personalized recommendations, and advanced features.
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
        
        {/* Enhanced Chat powered by OpenAI - only shown if user is logged in */}
        <TabsContent value="enhanced" className="mt-0">
          {user ? (
            <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
              <CardContent className="p-0 h-[800px]">
                <OpenAIChat />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6">
              <h2 className="text-lg font-medium text-center mb-4">Upgrade to Access Enhanced Mode</h2>
              <p className="text-muted-foreground text-center mb-6">
                Experience our advanced AI career advisor powered by OpenAI GPT. Get in-depth career analysis, personalized advice, and comprehensive guidance all in one place.
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