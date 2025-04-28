import { Card, CardContent } from "@/components/ui/card";
import OpenAIChat from "@/components/OpenAIChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const AIChatPage = () => {
  const { user } = useAuth() || { user: null };
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">Career Coach</h1>
      <p className="text-center text-muted-foreground mb-6 dark:text-gray-300">Get personalized career advice and guidance from our AI assistant</p>
      
      {!user ? (
        <Card className="shadow-lg border-blue-200 max-w-md mx-auto p-6">
          <h2 className="text-lg font-medium text-center mb-4">Sign in to use the Enhanced AI chat</h2>
          <p className="text-muted-foreground text-center mb-6">To use our advanced OpenAI-powered career coach, please sign in to your account.</p>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="openai" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList>
              <TabsTrigger value="openai">Enhanced AI Chat</TabsTrigger>
              <TabsTrigger value="udify">Standard Chat</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="openai" className="mt-0">
            <Card className="shadow-lg border-blue-200 overflow-hidden min-h-[800px]">
              <CardContent className="p-0 h-[800px]">
                <OpenAIChat />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="udify" className="mt-0">
            <Card className="shadow-lg border-blue-200 overflow-hidden">
              <CardContent className="p-0 h-[800px]">
                <iframe
                  src="https://udify.app/chatbot/GGYps3HPA5p9ZmrU"
                  style={{ width: '100%', height: '100%', minHeight: '800px' }}
                  frameBorder="0"
                  allow="microphone"
                  title="Career Coach Chatbot"
                  className="w-full h-full"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AIChatPage;