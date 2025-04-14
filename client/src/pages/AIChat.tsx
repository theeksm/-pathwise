import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simplified AIChat page component using Udify embedded iframe
const AIChatPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Career Coach</h1>
      <p className="text-center text-muted-foreground mb-8">Get personalized career advice and guidance from our AI assistant</p>
      
      <Card className="shadow-lg border-blue-200 overflow-hidden">
        <CardHeader className="bg-blue-400 text-white">
          <CardTitle className="flex items-center">
            Career Coach Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[700px]">
          <iframe
            src="https://udify.app/chatbot/GGYps3HPA5p9ZmrU"
            style={{ width: '100%', height: '100%', minHeight: '700px' }}
            frameBorder="0"
            allow="microphone"
            title="Career Coach Chatbot"
            className="w-full h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatPage;