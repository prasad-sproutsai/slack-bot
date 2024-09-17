import { SocketModeClient } from '@slack/socket-mode';
import { App } from '@slack/bolt';
import { getToken } from '../utils/tokenStore';

import { generativeModel } from '../config/geminiai';
import { aimodel} from '../config/geminiai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

import { z } from 'zod';
import { generateText,generateObject, tool, LanguageModelV1 } from 'ai';
import dotenv from 'dotenv';
dotenv.config();
// import { validateUser } from '../validate';

import { WebClient } from '@slack/web-api';
import {
  FunctionDeclarationsTool,
  FunctionDeclaration,
  FunctionDeclarationSchema
} from '@google/generative-ai';

import { processQuery } from '../utils/processQuery';
import { getUserEmail } from '../utils/email';
import { userSchema } from '../utils/tokenStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Use the schema in your code
// const validateUser = (data: unknown) => {
//   try {
//     userSchema.parse(data);
//     console.log('Validation successful');
//   } catch (e) {
//     console.error('Validation failed', e);
//   }
// };

// const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const socketModeClient = new SocketModeClient({
  appToken: process.env.SLACK_APP_TOKEN as string,
});

// Define a weather tool
// const weatherTool = {
//   name: 'getWeather',
//   description: 'Fetch the current weather for a specific city',
//   async call(city) {
//     console.log("weather Hit")
//     // const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=API_KEY&q=${city}`);
//     // const data = await response.json();
//     city = "Dharwad"
//     return `The current weather in ${city}`;
//   },
// };

// // Define a stock price tool
// const stockPriceTool = {
//   name: 'getStockPrice',
//   description: 'Fetch the current stock price for a company',
//   async call(company) {
//     console.log("Stock price hit");
//     // const response = await fetch(`https://api.example.com/stocks?company=${company}`);
//     // const data = await response.json();
//     return `The current stock price of Tata is `;
//   },
// };


const WeatherParamsSchema = z.object({
  city: z.string().min(1, 'City name cannot be empty'),
});
const StockPriceParamsSchema = z.object({
  company: z.string().min(1, 'Company name cannot be empty'),
});
// Provide a toolset with multiple tools
// const toolset = {
//   weatherTool:{
//     name: 'getWeather',
//     description: 'Fetch the current weather for a specific city',
//     parameters: WeatherParamsSchema,
//     async call(city) {
//       console.log("weather Hit")
//       // const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=API_KEY&q=${city}`);
//       // const data = await response.json();
//       // city = "Dharwad"
//       return `The current weather in `;
//     },
//   },

//   stockPriceTool:{
//     name: 'getStockPrice',
//     description: 'Fetch the current stock price for a company',
//     parameters: StockPriceParamsSchema, 
//     async call(company) {
//       console.log("Stock price hit");
//       // const response = await fetch(`https://api.example.com/stocks?company=${company}`);
//       // const data = await response.json();
//       return `The current stock price of Tata is `;
//     },
//   }
// };

//  tool set v1
// const toolset: Record<string, CoreTool<any, any>> = {
//   getWeather: {
//     description: 'Fetch the current weather for a specific city',
//     parameters: {
//       type: 'object',
//       properties: {
//         city: {
//           type: 'string',
//           description: 'The city for which to fetch the weather',
//         },
//       },
//       required: ['city'],
//     },
//   },
//   getStockPrice: {
//     description: 'Fetch the current stock price for a company',
//     parameters: {
//       type: 'object',
//       properties: {
//         company: {
//           type: 'string',
//           description: 'The company for which to fetch the stock price',
//         },
//       },
//       required: ['company'],
//     },
//   },
// };

// toolset v1.0
// const toolset: Record<string, CoreTool<any, any>> = {
//   getWeather: {
//     description: 'Fetch the current weather for a specific city',
//     parameters: {
//       type: 'object',
//       properties: {
//         city: {
//           type: 'string',
//           description: 'The city for which to fetch the weather',
//         },
//       },
//       required: ['city'],
//     },

//     async execute(params: { city: string }) {
//       console.log("Weather tool invoked with city:", params.city);
//       // Simulate fetching weather data
//       return `The current weather in ${params.city} is sunny.`;
//     },

//   },
//   getStockPrice: {
//     description: 'Fetch the current stock price for a company',
//     parameters: {
//       type: 'object',
//       properties: {
//         company: {
//           type: 'string',
//           description: 'The company for which to fetch the stock price',
//         },
//       },
//       required: ['company'],
//     },
//     async execute(params: { city: string }) {
//       console.log("Stock tool invoked");
//       // Simulate fetching weather data
//       return `The current weather in is sunny.`;
//     },
//   },
// };


// const toolset= {
//   getWeather: {
//     description: 'Fetch the current weather for a specific city',
//     function_declarations: [
//       {
//         parameters: {
//           city: {
//             type: 'string',
//             description: 'The city for which to fetch the weather',
//           },
//         },
//       },
//     ],
//   },
//   getStockPrice: {
//     description: 'Fetch the current stock price for a company',
//     function_declarations: [
//       {
//         parameters: {
//           company: {
//             type: 'string',
//             description: 'The company for which to fetch the stock price',
//           },
//         },
//       },
//     ],
//   },
// };



interface CoreTool<P, R> {
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  call: (params: P) => Promise<R>;
}


const toolset: Record<string, CoreTool <any, any>> = { 
  getWeather: {
    description: 'Fetch the current weather for a specific city',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The city for which to fetch the weather',
        },
      },
      required: ['city'],
    },

    async call(params: { city: string }) {
      console.log("Weather tool invoked with city:", params.city);
      // Simulate fetching weather data
      return `The current weather in ${params.city} is sunny.`;
    },

  },
  getStockPrice: {
    description: 'Fetch the current stock price for a company',
    parameters: {
      type: 'object',
      properties: {
        company: {
          type: 'string',
          description: 'The company for which to fetch the stock price',
        },
      },
      required: ['company'],
    },
    async call(params: { city: string }) {
      console.log("Stock tool invoked");
      // Simulate fetching weather data
      return `The current weather in is sunny.`;
    },
  },
};


// const functionDeclarations: FunctionDeclaration[] = [
//   {
//     name: 'getStockPrice',
//     description: 'Fetch the current stock price for a company',
//     parameters: {
//       type: 'object',
//       properties: {
//         company: {
//           type: 'string',
//           description: 'The company for which to fetch the stock price',
//         },
//       },
//       required: ['company'],
//     }as FunctionDeclarationSchema
//   },
  
  
//   {
//     name: 'getWeather',
//     description: 'Fetch the current weather for a specific city',
//     parameters: {
//       type: 'object',
//       properties: {
//         city: {
//           type: 'string',
//           description: 'The city for which to fetch the weather',
//         },
//       },
//       required: ['city'],
//     } as FunctionDeclarationSchema,
//   },

// ];

// // Define the toolset
// const toolset: FunctionDeclarationsTool = {
//   functionDeclarations,
// };





socketModeClient.on('message', async (event) => {
  
  try {
    console.log('Received message:', event);
    // console.log('Authhhhh:', event.body?.authorizations);
    if (event.ack) await event.ack();
    

    
    if (event.event && event.event.text) {
      const { channel, bot_id, subtype } = event.body.event;
      const message = event.body.event.text;
      const teamId = event.body.team_id;

      if (bot_id || subtype === 'bot_message') {
        console.log('Ignoring message from bot.');
        return;
      }

      const token = await getToken(teamId);

      if(!token)
      {
        console.error("Access token not found")
        return
      }

      // Get a User Email
      const userEmail = await getUserEmail(token, event);
      console.log("Email", userEmail);

      

// const userData = {
//   name: 'John Doe',
//   email: 'john.doe@example.com',
//   age: 30,
// };

// const isValid = validateUser(userData);
// console.log('Is user data valid?', isValid);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const gmodel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest"})

// const gmodel = google('gemini-1.5-pro-latest', {
  
//   safetySettings: [
//     { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
//   ],
// });

let responseData;
try {
  const result = await generateText({
    model: aimodel,
    prompt: message,
    tools: toolset,
  });

  // if (!result || !result.text) {
  //   throw new Error('Failed to generate text');
  // }
  console.log("Result for tool", result)
  responseData = result;
  console.log("Generated text:", JSON.stringify(result));
} catch (error) {
  console.error("Error generating text:", error);
  throw error; // Handle or rethrow the error as needed
}


      console.log("Text check");

      if (message) {
        const responseApp = new App({
          token: token,
          signingSecret: process.env.SLACK_SIGNING_SECRET as string,
        });



        

        // console.log("Tool selected result",responseResult)


      // gemini ai 
        // const result = await model.generativeModel.generateContent({
        //   generationConfig: {
        //     temperature: 0.7,
        //     candidateCount: 1,
        //     topK: 40,
        //     topP: 0.95,
        //     maxOutputTokens: 1024,
        //   },
        //   safetySettings: [
        //     {
        //       category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as const,
        //       threshold: 'BLOCK_NONE' as const,
        //     },
        //   ],
        //   contents: [
        //     {
        //       role: 'user',
        //       parts: [{ text: text }]
        //     },
        //     // {
        //     //   role: 'tool',
        //     //   parts: [{ text: "weather_tool" }] // AI can suggest tool usage here.
        //     // }
        //   ]

        //   // contents: [
        //   //   {
        //   //     role: "user",
        //   //     parts: [
        //   //       { text: text }
        //   //     ]
        //   //   },
        //   // ],
  
        // });


        // const responseSchema = z.object({
        //   response: z.object({
        //     text: z.string(),
        //   }),
        // });
        // console.log("Zod Schema", responseSchema);
        

        // OPEN AI SDK 
        // const result = await generateText({
        //   model: openai.chat('gpt-3.5-turbo'),
        //   // model: model,
        //   tools: {
        //     pipelineStatus: tool({
        //       description: 'Get status of recruitment pipelines',
        //       parameters: z.object({
        //         role: z.string().describe('The role to get the pipeline status for'),
        //       }),
        //       execute: async ({ role }) => {
        //         // Custom logic to get pipeline status
        //         return `The ML Engineer pipeline is currently processing 5 candidates.`;
        //       },
        //     }),
        //     // More tools (e.g., for scheduling, candidate status, etc.)
        //     scheduleInterview: tool({
        //       description: 'Schedule an interview for a candidate',
        //       parameters: z.object({
        //         candidateId: z.string().describe('The ID of the candidate'),
        //         date: z.string().describe('The date for the interview'),
        //       }),
        //       execute: async ({ candidateId, date }) => {
        //         // Custom logic to schedule an interview
        //         return `Interview for candidate ${candidateId} has been scheduled on ${date}.`;
        //       },
        //     }),
        //     candidateStatus: tool({
        //       description: 'Get the status of a candidate',
        //       parameters: z.object({
        //         candidateId: z.string().describe('The ID of the candidate'),
        //       }),
        //       execute: async ({ candidateId }) => {
        //         // Custom logic to get candidate status
        //         return `Candidate ${candidateId} is currently in the final interview stage.`;
        //       },
        //     }),

        //     hi: tool({
        //       description: 'Responds with a greeting "Hi"',
        //       parameters: z.object({}),
        //       execute: async () => {
        //         return 'Hello! How can i help you';
        //       },
        //     }),
        //     hello: tool({
        //       description: 'Responds with a greeting "Hello"',
        //       parameters: z.object({}),
        //       execute: async () => {
        //         return 'Hello!';
        //       },
        //     }),
        //   },
        //   prompt: text,
        // });


        // const responseSchema = z.object({
        //   response: z.object({
        //     text: z.string(),
        //   }),
        // });

        // const parsedResponse = responseSchema.parse(result);
        // console.log("Parsed Response", parsedResponse);
        
        
        
        // const parsedResponse  = result;
        // console.log("Parsed Response", parsedResponse.response.candidates[0].content.parts[0].text);

        // Send response message to channel in the slack 
        await responseApp.client.chat.postMessage({
          channel,
          // text:"hello how are you"
          text: `Hello ${JSON.stringify(responseData.text)}`,
          // text: `<@${event.event.user}>, ${result.response.text()}`,
        });

        console.log("Message sent to the slack chat")
      }
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
});

export default socketModeClient;
