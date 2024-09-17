import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const processQuery = async (text: string) => {
  try {
    const response = await axios.post(process.env.GEMINI_AI_API_URL!, {
      query: text,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`, // Using Bearer token for authentication
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Expecting response in the form { intent: string, entities: object }
  } catch (error) {
    console.error('❌ Error communicating with Gemini AI:', error);
    throw new Error('Gemini AI processing failed');
  }
};
