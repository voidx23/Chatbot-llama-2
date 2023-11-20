import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { v4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import connectDb from './db/connection.js';
import configureSocketIO from './socketIO/socketConfig.js';
import generateChatResponse from './replicateModel/replicateLlama-2Service.js';
import Message from './models/messageSchema.js';

// Configuration
dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 7700;
const apiToken = process.env.REPLICATE_API_TOKEN;

if (!apiToken) {
  console.error("Missing REPLICATE_API_TOKEN environment variable.");
  process.exit(1);
}

// Connect to the database
connectDb();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = configureSocketIO(server);
const messageIdMutex = new Mutex();


// Middleware
app.use(cors({ origin: 'http://localhost:7700' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const aiResponse = await generateChatResponse(message, apiToken);
    const formattedResponse = aiResponse.join(' ');

    // Generate a UUID for the sent message
    messageIdMutex.acquire();
    try {
      const sentMessageUuid = v4();

      const sentMessage = new Message({
        message: message,
        sender: 'User',
        timestamp: Date.now(),
        type: 'sent',
        messageId: sentMessageUuid,
      });

      await sentMessage.save();

      // Store the received message in the database
      const receivedMessage = new Message({
        message: formattedResponse,
        sender: 'Chatbot',
        timestamp: Date.now(),
        type: 'received',
        messageId: sentMessageUuid,
      });

      await receivedMessage.save();

      // Broadcasting to connected clients
      io.emit('chat message', { user: 'Chatbot', message: formattedResponse });

      res.status(200).json({ success: true, response: aiResponse });
    } finally {
      messageIdMutex.release();
    }
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});



// Start server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


