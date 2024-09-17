import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGO_URI as string);
let db: Db;
let tokens: Collection;

export async function connectToMongo() {
  await client.connect();
  db = client.db('slack_app');
  tokens = db.collection('tokens');
  console.log('Connected to MongoDB');
}

export { db, tokens };
