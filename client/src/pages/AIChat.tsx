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
        
        {/* Show a message if user attempts to select enhanced mode while not logged in */}
        {currentTab === "enhanced" && !user && (
          <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6 mb-4">
            <h2 className="text-lg font-medium text-center mb-4">Sign in to use the Enhanced AI chat</h2>
            <p className="text-muted-foreground text-center mb-6">To use our advanced OpenAI-powered career coach, please sign in to your account.</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90">
                Sign In
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
              <h2 className="text-lg font-medium text-center mb-4">Premium Feature</h2>
              <p className="text-muted-foreground text-center mb-6">The Enhanced AI Chat is available only for logged-in users.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIChatPage;