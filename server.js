import express from 'express';
import connectDB from './config/db.js';
import helmet from 'helmet';
import { usersRouter } from './routes/users.js';
import { postsRouter } from './routes/posts.js';
import { authRouter } from './routes/auth.js';
import { profilesRouter } from './routes/profile.js';
import { followRouter } from './routes/follow.js';
import https from 'https';
import fs from 'fs';

const app = express();
const key = fs.readFileSync('./key.pem', 'utf-8');
const cert = fs.readFileSync('./cert.pem', 'utf-8');
const server = https.createServer({ key: key, cert: cert }, app);
connectDB();
const PORT = process.env.PORT || 5000;

app.use(express.json({ extended: false }));
app.use(helmet());
app.use('/api/users', usersRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/follow', followRouter);

server.listen(PORT, () => {
  console.log(`myportfolio.com server is up and running on port ${PORT}`);
});
