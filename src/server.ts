import express from 'express';
import bodyParser from 'body-parser';
import { App, ExpressReceiver, ExpressReceiverOptions, Installation, InstallationQuery, Logger } from '@slack/bolt';
import socketModeClient from './controllers/socketClient';
import dotenv from 'dotenv';
import { connectToMongo } from './config/db';
import { storeInstallation, fetchInstallation } from './controllers/oAuthHandler';

dotenv.config();

const receiverOptions: ExpressReceiverOptions = {
    signingSecret: process.env.SLACK_SIGNING_SECRET as string,
    clientId: process.env.SLACK_CLIENT_ID as string,
    clientSecret: process.env.SLACK_CLIENT_SECRET as string,
    scopes: process.env.SCOPES?.split(',') || [],
    installationStore: {
      storeInstallation,
      fetchInstallation,
    },
    installerOptions: {
      redirectUriPath: '/api/slack/oauth',
    //   redirectUri: process.env.SLACK_REDIRECT_URI as string,
      authVersion: 'v2',
      stateVerification: false,
    },
  };
  
  const receiver = new ExpressReceiver(receiverOptions);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api/slack/oauth', async (req, res) => {


  try {

    const installer = receiver.installer;
    if (!installer) {
      throw new Error('Installer is not initialized');
    }
    const result = await installer.handleCallback(req, res);
    // console.log('OAuth result', result);
  } catch (error) {
    console.error('OAuth failed:', error);
    res.status(500).send('Error during OAuth');
  }
});

app.post('/slack/events', (req, res) => {
  const { type, challenge } = req.body;

  if (type === 'url_verification') {
    res.status(200).send({ challenge });
  } else {
    res.status(200).end();
  }
});

const port = process.env.PORT || 3008;

app.listen(port, async () => {
  await connectToMongo();
  await socketModeClient.start();
  console.log(`Server is running on port ${port}`);
});
