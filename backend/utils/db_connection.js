"use strict"

import mysql from 'mysql';
import dotenv from 'dotenv';
import util from 'util';
dotenv.config();
import env_dir from '../utils/env_dir.js';
dotenv.config({
    path: env_dir
});

console.log("root password", process.env.DB_ROOT_PASSWORD);

const connection = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin1",
    database: 'stock_portfolio_db',
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

//node native promisify, turns the query async so that we can wait for data to come back
const query_promise = util.promisify(connection.query).bind(connection);

export default async function query(sql) {
    let result;

    try {
        result = await query_promise(sql);
    } catch (err) {
        console.error('Error in Promise: ', err);
        console.warn('Received: ', sql);
    }

    return result;
}