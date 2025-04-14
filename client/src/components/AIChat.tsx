import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simplified AI Chat component using Udify embedded iframe
const AIChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isChatOpen && (
        <div className="shadow-xl rounded-lg overflow-hidden w-80 md:w-96 lg:w-[500px] bg-white border border-gray-200">
          <div className="px-4 py-2 bg-blue-400 text-white flex justify-end items-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-red-500 text-white hover:bg-red-600 rounded-full p-1"
              onClick={toggleChat}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="h-[600px] w-full overflow-hidden">
            <iframe
              src="https://udify.app/chatbot/GGYps3HPA5p9ZmrU"
              style={{ width: '100%', height: '100%', minHeight: '600px' }}
              frameBorder="0"
              allow="microphone"
              title="Career Coach Chatbot"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
      
      {!isChatOpen && (
        <Button
          onClick={toggleChat}
          className="p-4 bg-blue-400 rounded-full shadow-xl hover:bg-blue-500 flex items-center justify-center transition-all border-2 border-white animate-pulse hover:animate-none"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default AIChat;
