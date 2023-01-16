import mysql from 'mysql';

import dotenv from 'dotenv';
dotenv.config();
import env_dir from '../utils/env_dir.js';
dotenv.config({
    path: env_dir
});

export const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_ROOT_PASSWORD,
    database: 'stock_portfolio_db'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

export default connection;