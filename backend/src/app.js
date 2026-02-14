import express from 'express';

import { createServer } from "node:http";

import { Server } from "socket.io";

import cors from 'cors';

import mongoose from 'mongoose';

import connectToSocket from './controllers/socketManager.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({limit: '40kb'}));
app.use(express.urlencoded({extended: true, limit: '40kb'}));


const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://rahulsaini2522_db_user:haribol1@nexlive.zfupqly.mongodb.net/?appName=NexLive")
    console.log('Mongo connected DB Host: ', connectionDb.connection.host)
    server.listen(app.get("port"), () => {
        console.log("Server is running on port " + app.get("port"))
    });
}

start();