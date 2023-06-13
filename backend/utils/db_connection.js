"use strict"

import mysql from 'mysql';
import dotenv from 'dotenv';
import util from 'util';
dotenv.config();
import env_dir from '../utils/env_dir.js';
if (env_dir) {
    dotenv.config({
        path: env_dir
    });
}

const connection_details = {
    host: process.env.DB_HOST,
    port: 3306,
    user: "admin",
    password: process.env.DB_PASSWORD,
    database: 'praeficio-database-1',
    charset: 'utf8mb4',
    // debug: true,
    typeCast: function (field, next) {
        if (['TINY', 'TINYINT'].includes(field.type) && field.length === 1) {
            return (field.string() === '1'); // 1 = true, 0 = false
        } else if (field.type === 'JSON' && field) {
            let t;
            try {
                t = JSON.parse(field.string());
            } catch {
                console.log(`failed to parse JSON`);
            }
            return t ?? null;
        } else {
            return next();
        }
    },
    autoReconnect: true,
    reconnectDelay: 3000, // 3 seconds delay between reconnection attempts
};

const connection = mysql.createConnection(connection_details);

connection.connect((error) => {
    if (!error) console.log(`Connected to DB successfully`);
});

// Listen for connection error event
connection.on('error', function (error) {
    console.error('Database connection error:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting to MySQL database...');
        connection.connect((connectError) => {
            if (connectError) {
                console.error('Error reconnecting to MySQL database:', connectError);
            } else {
                console.log('Reconnected to MySQL database!');
            }
        });
    }

    // Handle fatal errors
    if (error.fatal) {
        console.error('Fatal error occurred! Server will need to restart');

        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            // Connection lost, cannot be recovered automatically
            console.error('Connection lost! Exiting...');
        } else if (error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
            // Cannot enqueue queries after a fatal error
            console.error('Cannot enqueue queries after a fatal error! Exiting...');
        } else {
            // Other fatal errors
            console.error('Unknown fatal error! Exiting...');
        }
        throw error;
    }
});

/**
 * @middleware to check database connection
 */
export function checkDatabaseConnection(req, res, next) {
    if (connection?.state !== 'authenticated') {
        // Database connection is not active, return 500 error
        return res.status(500).json({
            message: 'Database connection error'
        });
    }
    next(); // Proceed to the next middleware or route handler
}

//node native promisify, turns the query async so that we can wait for data to come back
const query_promise = util.promisify(connection.query).bind(connection);

/**
 * @function query - executes a query to the DB
 * @param {String} sql - SQL query to be executed, with `?` or `??` where values would go
 * @param {Array|String|Null} values - as many values as needs to be templated
 * @returns {Promise<Hash[]|Undefined>} result from DB
 * @note values should be passes as `values` to prevent injection
 */
export default async function query(sql, ...values) {
    sql = mysql.format(sql, [...values].flat(Infinity));
    let result;


    try {
        result = await query_promise(sql);
    } catch (err) {
        console.error('Error in Promise: ', err);
        console.warn('Received: ', sql);
    }
    return result;
}