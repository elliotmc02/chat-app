import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { CLIENT_URL, PORT } from './config/env.js';
import { initializeSocket } from './sockets/index.js';

const app = express();
const server = createServer(app);

initializeSocket(server);

app.use(
  cors({
    origin: CLIENT_URL ?? 'http://localhost:3000',
  })
);

const startTime = new Date();

app.get('/status', (req, res) => {
  const uptime = Math.floor((new Date() - startTime) / 1000);

  res.json({
    status: 'server is running',
    started: startTime.toISOString(),
    uptime,
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
