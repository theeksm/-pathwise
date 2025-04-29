import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Helper function to validate API key availability
function validateApiKey(): void {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables');
  }
}

// Enhanced error handler for Gemini API calls
async function handleGeminiRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  validateApiKey();
  
  try {
    return await requestFn();
  } catch (error: any) {
    // Format error message for client
    let errorMessage = 'An error occurred with the Gemini AI service';
    
    if (error.message?.includes('invalid API key')) {
      errorMessage = 'Gemini API key is invalid or expired';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Gemini rate limit exceeded. Please try again later';
    } else if (error.message?.includes('internal server error')) {
      errorMessage = 'Gemini service is currently unavailable. Please try again later';
    } else if (error.message) {
      errorMessage = `Gemini AI service error: ${error.message}`;
    }
    
    console.error(`Gemini API Error:`, error.message || error);
    throw new Error(errorMessage);
  }
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate chat response using Gemini API
export async function generateGeminiChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  console.log("Gemini: Generating chat response with messages:", JSON.stringify(messages));
  
  try {
    return await handleGeminiRequest(async () => {
      console.log("Gemini: Creating formatted messages with system prompt");
      
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Setup safety settings for appropriate content
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];
      
      // Start a chat session
      const chat = model.startChat({
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 500,
        },
        // Inject a system message to guide the AI's behavior
        history: [
          {
            role: "user",
            parts: [{ text: "You are the Standard version chatbot on the PathWise platform named 'Gemini AI'. Follow these specific behavior guidelines:\n\n1. Provide good career conversation with basic advice.\n2. Suggest users try other features of the website such as the Skill Gap Analyzer, Resume Builder, or Market Trends. Do not deeply analyze user skills or generate career plans yourself.\n3. Keep your responses relatively brief (2-3 paragraphs max).\n4. If users ask for detailed analysis, career paths, or personalized resume help, recommend they use the specific tools on the site or consider upgrading to the Enhanced Mode for personalized AI analysis.\n5. Be conversational but don't provide extremely detailed career advice - your role is to guide users to the right tools in PathWise."}],
          },
          {
            role: "model",
            parts: [{ text: "I'll act as the Standard 'Gemini AI' chatbot for PathWise. I'll provide good career conversation with basic advice, suggest website features like Skill Gap Analyzer and Resume Builder, and keep responses brief. For detailed analysis, I'll direct users to specific tools or suggest upgrading to Enhanced Mode. I understand my role is to guide users to the right PathWise tools rather than providing extremely detailed advice myself."}],
          },
        ],
      });
      
      // Process user messages
      console.log("Gemini: Processing user messages");
      
      // Find the last user message
      let userPrompt = "How can I help with your career questions?";
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userPrompt = messages[i].content;
          break;
        }
      }
      
      console.log("Gemini: Sending user prompt to API:", userPrompt);
      
      try {
        // Send the message and get a response
        const result = await chat.sendMessage(userPrompt);
        const response = result.response;
        const text = response.text();
        
        console.log("Gemini: Received response:", text);
        return text || "I'm sorry, I couldn't generate a response. Please try again.";
      } catch (apiError) {
        console.error("Gemini: API error during request:", apiError);
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    });
  } catch (error: any) {
    console.error("Gemini: Error generating chat response:", error);
    
    // Check for API key issues and validate
    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini: API key is missing in environment variables");
    } else {
      console.log("Gemini: API key is present (key length:", process.env.GEMINI_API_KEY.length, ")");
    }
    
    // Return concise, user-friendly error message
    if (error.message.includes("API key is invalid")) {
      return "Service configuration issue. Please contact support.";
    } else if (error.message.includes("rate limit")) {
      return "Service busy. Try again in a few minutes.";
    } else {
      return "Technical difficulty. Please try again later.";
    }
  }
}