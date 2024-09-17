// import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// const generationConfig = {
//     candidateCount: 1,
//     // stopSequences: ["x"],
//     // maxOutputTokens: 1000,
//     temperature: 1.0,
//   }
// export const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig});
// module.exports={aiModel}



// export interface LanguageModelV1 {
//   specificationVersion: string;
//   provider: string;
//   modelId: string;
//   defaultObjectGenerationMode: string;
//   generativeModel: any; // Adjust the type as needed based on the actual generative model type
// }

interface CoreTool<P, R> {
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  call: (params: P) => Promise<any>;
}

interface Tool {
  name:string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  call: (params: any) => Promise<any>;
}


// const toolset: Record<string, Tool> = {
//   getWeather: {
//     name:"getWeather",
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

//     async call(params: { city: string }) {
//       console.log("Weather tool invoked with city:", params.city);
//       // Simulate fetching weather data
//       return `The current weather in ${params.city} is sunny.`;
//     },

//   },
//   getStockPrice: {
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
//     },
//     async call(params: { city: string }) {
//       console.log("Stock tool invoked");
//       // Simulate fetching weather data
//       return `The current weather in is sunny.`;
//     },
//   },
// };

// interface FunctionDeclaration {
//   name: string;
//   description?: string;
//   parameters?: {
//     type: string;
//     properties: Record<string, { type: string; description: string }>;
//     required: string[];
//   };
// }

// export interface FunctionDeclarationsTool {
//   functionDeclarations?: FunctionDeclaration[];
// }

// Example of toolset using FunctionDeclarationsTool


const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getStockPrice',
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
    }as FunctionDeclarationSchema
  },
  
  
  {
    name: 'getWeather',
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
    } as FunctionDeclarationSchema,
  },

];

// Define the toolset
const toolset: FunctionDeclarationsTool = {
  functionDeclarations,
};




import { GoogleGenerativeAI,GenerateContentRequest, GenerateContentResult} from '@google/generative-ai';
import {
  FunctionDeclarationsTool,
  FunctionDeclaration,
  FunctionDeclarationSchema,
  FunctionCallingMode
} from '@google/generative-ai';
  import { LanguageModelV1,LanguageModelV1StreamPart,LanguageModelV1CallOptions,LanguageModelV1Prompt} from 'ai';

  import { LanguageModelV1CallWarning,LanguageModelV1LogProbs } from '@ai-sdk/provider';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest"})


interface LanguageModelV1FunctionToolCall {
  // Add appropriate properties here
  // For example:
  functionName: string;
  arguments: any[];
}


// ... existing code ...

// Define the missing type
interface LanguageModelV1FunctionToolCall {
  functionName: string;
  arguments: any[];
}



// ... existing code ...
// const doGenerate = async (options: LanguageModelV1CallOptions)=> {
//   try {
//     // Define the correct type for the options parameter
//     const generateContentOptions: GenerateContentRequest = {
//       // Populate with the necessary properties
//       // prompt: options.prompt,
//       contents: [{ role: 'user', parts: [{ text: options.prompt.toString() }] }],
//       // Add other properties as needed
//     };

//     const result: GenerateContentResult = await generativeModel.generateContent(generateContentOptions);
//     console.log("RRRESULT====>", result);
//     return {
//       text: result.response.text() || undefined,
//       toolCalls: result.response.candidates?.[0]?.content?.parts?.flatMap(part => part.functionCall ? [{
//         toolCallType: 'function',
//         toolCallId: part.functionCall.name,
//         toolName: part.functionCall.name,
//         args: JSON.stringify(part.functionCall.args)
//       }] : []),
//       // finishReason: result.response.candidates?.[0]?.finishReason,
//       usage: {
//         promptTokens: result.response.promptFeedback,
//         completionTokens: result.response.candidates?.[0]?.content?.parts?.reduce((total, part) => total + (part.text?.length || 0), 0) || 0
//       },
//       rawCall: {
//         rawPrompt: options,
//         rawSettings: {}
//       },
//       rawResponse: {
//         headers: {}
//       }
//     };
//   } catch (error) {
//     console.error('Error in doGenerate:', error);
//     throw new Error('Failed to generate content');
//   }
// };

export const aimodel: LanguageModelV1 = {
  specificationVersion: 'v1',
  provider: 'Google',
  modelId: 'gemini-1.5-pro-latest',
  defaultObjectGenerationMode: 'tool',

  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text?: string;
    toolCalls?: Array<{
      toolCallType: 'function';
      toolCallId: string;
      toolName: string;
      args: string;
    }>;
    finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown'
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
    rawCall: {
      rawPrompt: unknown;
      rawSettings: Record<string, unknown>;
    };
    logprobs?: LanguageModelV1LogProbs;
    rawResponse?: {
      headers?: Record<string, string>;
    };
  }> {
    // const toolConfig = Object.keys(toolset).map(name => ({
    //   name,
    //   description: toolset[name].description,
    //   parameters: toolset[name].parameters,
    // }));

    const toolConfig = Object.keys(toolset).map(name => ({
   
      toolName: name,
    }));

    try {
      // Define the correct type for the options parameter
      const generateContentOptions: GenerateContentRequest = {
        // Populate with the necessary properties
        // prompt: options.prompt,
        contents: [{ role: 'user', parts: [{ text: options.prompt.toString() }] }],
  tools: [toolset], // Ensure tools match FunctionDeclarationsTool[]
  systemInstruction: "Handle tool invocation", // Instruction for handling the tools
  toolConfig: {
    functionCallingConfig: {
      mode: FunctionCallingMode.ANY,
      allowedFunctionNames: Object.keys(toolset),
    },
  },
        
        
        // tools: Object.keys(toolset).map(name => ({
        //   name,
        //   ...toolset[name] // Ensure your tool configuration aligns with what `GenerateContentRequest` expects
        // })),
        // toolConfig: {
        //   functionCallingConfig: {
        //     allowDynamicToolSelection: true,
        //   },
        // },
        // tools: Object.values(toolset),
        // Add other properties as needed
      };
  
      const result: GenerateContentResult = await generativeModel.generateContent(generateContentOptions);
      console.log("RRRESULT====>", result.response.candidates);
        const toolCalls = result.response.candidates?.[0]?.content?.parts?.flatMap(part => {
          console.log('Part:', part); 
          if (part.functionCall) {
            const tool = toolset[part.functionCall.name];
            if (tool) {
              const toolArgs = JSON.parse(JSON.stringify(part.functionCall.args));
              return [{
                toolCallType: 'function' as const,
                toolCallId: part.functionCall.name,
                toolName: part.functionCall.name,
                args: JSON.stringify(toolArgs)
              }];
            }
          }
          return [];
        }) || [];
    
        // If there's a tool call, invoke the tool
        const toolResults = await Promise.all(toolCalls.map(async (toolCall) => {
          const tool = toolset[toolCall.toolName];
          if (tool) {
            const toolArgs = JSON.parse(toolCall.args);
            console.log(`Invoking tool: ${toolCall.toolName} with args:`, toolArgs);
            const result = await tool.call(toolArgs);
            console.log(`Result from tool ${toolCall.toolName}:`, result);
            return { toolCallId: toolCall.toolCallId, result };
          }
          return null;
        }));

        const finishReasonMap: Record<string, 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown'> = {
          'FINISH_REASON_UNSPECIFIED': 'unknown',
          // Add other mappings as needed
        };
  
    
        const finishReason = result?.response?.candidates?.[0]?.finishReason
          ? finishReasonMap[result.response.candidates[0].finishReason] || 'unknown'
          : 'unknown';
  
          const promptTokens = typeof result.response.promptFeedback === 'number' ? result.response.promptFeedback : 0;
          
        return {
        text: result.response.text() || undefined,
        toolCalls,
          // toolCallType: 'function',
          // toolCallId: part.functionCall.name,
          // toolName: part.functionCall.name,
          // args: JSON.stringify(part.functionCall.args)
        // }] : []),
        finishReason,
        usage: {
          promptTokens,
          completionTokens: result.response.candidates?.[0]?.content?.parts?.reduce((total, part) => total + (part.text?.length || 0), 0) || 0
        },
        rawCall: {
          rawPrompt: options,
          rawSettings: {}
        },
        rawResponse: {
          headers: {},
        },
        // toolResults: toolResults.filter((result): result is NonNullable<typeof result> => result !== null)
      };
    } catch (error) {
      console.error('Error in doGenerate:', error);
      throw new Error('Failed to generate content');
    }

    
  
  },

  doStream(options: LanguageModelV1CallOptions): PromiseLike<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: {
      rawPrompt: unknown;
      rawSettings: Record<string, unknown>;
    };
    rawResponse?: {
      headers?: Record<string, string>;
    };
    warnings?: LanguageModelV1CallWarning[];
  }> {
    // Mock implementation
    return Promise.resolve({
      stream: new ReadableStream(),
      rawCall: {
        rawPrompt: options,
        rawSettings: {},
      },
      rawResponse: {
        headers: {}
      },
      warnings: []
    });
  },

}




module.exports = { aimodel };

// import { google } from '@ai-sdk/google';
// import { generateText } from 'ai';

// // // Define a weather tool
// // const weatherTool = {
// //   name: 'getWeather',
// //   description: 'Fetch the current weather for a specific city',
// //   async call(city) {
// //     const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=API_KEY&q=${city}`);
// //     const data = await response.json();
// //     return `The current weather in ${city} is ${data.current.condition.text}, temperature is ${data.current.temp_c}°C.`;
// //   },
// // };

// // // Define a stock price tool
// // const stockPriceTool = {
// //   name: 'getStockPrice',
// //   description: 'Fetch the current stock price for a company',
// //   async call(company) {
// //     const response = await fetch(`https://api.example.com/stocks?company=${company}`);
// //     const data = await response.json();
// //     return `The current stock price of ${company} is $${data.price}.`;
// //   },
// // };

// // // Provide a toolset with multiple tools
// // const toolset = {
// //   tools: [weatherTool, stockPriceTool],
// // };

// // // Call the model, and let it choose the tool based on the prompt
// // const { text } = await generateText({
// //   model: google('gemini-1.5-pro-latest'),
// //   prompt: 'What is the stock price of Google?',
// //   toolset: toolset,
// // });

// // console.log(text);


// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from 'dotenv';
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// const generationConfig = {
//     candidateCount: 1,
//     temperature: 1.0,
// };
// interface LanguageModelV1 {
//   specificationVersion: string;
//   provider: string;
//   modelId: string;
//   defaultObjectGenerationMode: string;
// }
// const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", 
//   specificationVersion: 'v1',
//   provider: 'Google',
//   generationConfig });

// export const aiModel = generativeModel;

// module.exports = { aiModel };

