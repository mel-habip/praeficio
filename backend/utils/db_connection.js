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

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: "admin",
    password: process.env.DB_PASSWORD,
    database: 'praeficio-database-1',
    charset: 'utf8mb4',
    // debug: true
});

function connectWithRetry() {
    connection.end((err) => {
        if (!err) {
            console.log(`Connection successfully terminated.`);
        } else {
            console.error(`Failed to end database connection: `, err)
        }
    })
    connection.connect(function (err) {
        if (err) {
            console.error('Failed to connect to the database: ', err);
            // Retry connection after a delay
            setTimeout(connectWithRetry, 60000);
        } else {
            console.log('Database Connected!');
        }
    });
}

connectWithRetry();

// Listen for connection error event
connection.on('error', function (err) {
    console.error('Database connection error:', err);
    // Retry connection after a delay
    setTimeout(connectWithRetry, 4000);
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
    return cleaner(result);
}


function cleaner(array = []) {
    if (!Array.isArray(array)) {
        return array;
    }

    return array.map(hash => {
        //boolean cleanup
        ['active', 'deleted', 'invitation_accepted', 'completed', 'archived', 'use_beta_features', 'starred', 'handled_externally', 'pinned'].forEach(property => {
            if (hash.hasOwnProperty(property)) hash[property] = Boolean(hash[property]);
        });
        //array JSON cleanup
        ['to_do_categories', 'notes', 'internal_notes', 'topics'].forEach(property => {
            if (hash.hasOwnProperty(property)) {
                try {
                    hash[property] = JSON.parse(hash[property] ?? []) ?? [];
                } catch (e) {
                    console.log(`\nFailed to parse into JSON\n\tProperty: ${property}\n\tValue: ${hash[property]}`);
                    hash[property] = [];
                }
            }
        });
        //hash JSON cleanup
        ['method', 'details'].forEach(property => {
            if (hash.hasOwnProperty(property)) {
                try {
                    hash[property] = JSON.parse(hash[property] ?? {}) ?? {};
                } catch (e) {
                    console.log(`\nFailed to parse into JSON\n\tProperty: ${property}\n\tValue: ${hash[property]}`);
                    hash[property] = {};
                }
            }
        });
        return hash;
    });
}