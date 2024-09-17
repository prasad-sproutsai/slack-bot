import { tokens } from '../config/db';
import {  InstallationQuery } from '@slack/bolt';

export async function storeInstallation(installation:any) {
  try {
    await tokens.updateOne(
      { teamId: installation.team?.id },
      { $set: installation },
      { upsert: true }
    );
    console.log('Installation stored:', installation);
  } catch (error) {
    console.error('Error storing installation:', error);
  }
}

export async function fetchInstallation(installQuery: InstallationQuery<boolean>):Promise<any> {
  try {
    const installation = await tokens.findOne({
      teamId: installQuery.teamId,
    });
    if (installation) {
      console.log('Installation fetched for:', installQuery.teamId);
      return installation;
    }
    throw new Error('No installation found');
  } catch (error) {
    console.error('Error fetching installation:', error);
  }
}
