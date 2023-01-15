const PORT = 8000;
const DOMAIN = `http://localhost:${PORT}`;

// import {
//     axios
// } from 'axios';
import jwt from 'jsonwebtoken';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import env_dir from './utils/env_dir.js';
import connection from './utils/db_connection.js';
import userRouter from './routes/users.js';
import positionRouter from './routes/positions.js';

dotenv.config({
    path: env_dir
});

const log = console.log;


const APP = express(); //creating and starting the server
APP.use(cors());
APP.use(express.json());
APP.listen(PORT, 'localhost', () => console.log(`Server Running on PORT ${PORT}`));
APP.use('/users', userRouter);
APP.use('/positions', positionRouter);


const posts = [{
        user: 'Kyle',
        title: 'Post 1'
    },
    {
        user: 'Jim',
        title: 'Post 2'
    }
];

APP.get('/', (req, res) => {
    res.json('Hello World!');
});


APP.get('/positions/get_all_positions', (req, res) => {
    let sql = `SELECT ` //TODO: finisih this
});

