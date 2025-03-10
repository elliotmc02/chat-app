import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const server = createServer(app);

app.use(cors({
    origin: process.env.CLIENT_URL
}));

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello World' });
})

const PORT = process.env.PORT ?? 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});