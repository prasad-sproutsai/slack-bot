import { tokens } from '../config/db';

export async function saveToken(teamId: string, token: string) {
  await tokens.updateOne({ teamId }, { $set: { token } }, { upsert: true });
}

export async function getToken(teamId: string): Promise<string | null> {
  const doc = await tokens.findOne({ teamId });
//   console.log("Document",doc)
  return doc ? doc.accessToken : null;
}


import { z } from 'zod';

// Define a simple Zod schema
export const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});