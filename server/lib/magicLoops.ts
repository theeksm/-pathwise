import fetch from 'node-fetch';

interface MagicLoopsRequest {
  user_message: string;
  career_interest?: string;
  education_level?: string;
}

interface MagicLoopsResponse {
  response: string;
  success: boolean;
  error?: string;
}

/**
 * Makes a request to the Magic Loops API to get a response from the AI assistant
 * @param userMessage - The message from the user
 * @param careerInterest - Optional career interest field
 * @param educationLevel - Optional education level field
 * @returns The response from the Magic Loops API
 */
export async function getMagicLoopsResponse(
  userMessage: string,
  careerInterest: string = '',
  educationLevel: string = ''
): Promise<MagicLoopsResponse> {
  try {
    // Log request details for debugging (excluding sensitive information)
    console.log('Making Magic Loops API request for message length:', userMessage.length);

    // Prepare the request payload
    const payload: MagicLoopsRequest = {
      user_message: userMessage,
    };

    // Only add optional fields if they have values
    if (careerInterest) {
      payload.career_interest = careerInterest;
    }

    if (educationLevel) {
      payload.education_level = educationLevel;
    }

    // Make the request to Magic Loops API
    const response = await fetch(
      'https://magicloops.dev/api/loop/b2a3319a-338d-4790-8564-9584a3d019d0/run',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Magic Loops API error:', response.status, errorText);
      throw new Error(`Magic Loops API returned ${response.status}: ${errorText}`);
    }

    // Parse the response
    const data = await response.json();
    
    return {
      response: data.response || 'I apologize, but I wasn\'t able to generate a proper response. Please try again with a different question.',
      success: true
    };
  } catch (error) {
    console.error('Error calling Magic Loops API:', error);
    return {
      response: 'I\'m sorry, but I encountered an error while processing your request. Please try again later.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}