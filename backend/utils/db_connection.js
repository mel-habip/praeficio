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
    return booleanize_db_data(result);
}


function booleanize_db_data(array = []) {
    if (!Array.isArray(array)) {
        return array;
    }

    return array.map(hash => {
        ['active', 'deleted', 'invitation_accepted', 'completed', 'archived'].forEach(property => {
            if (hash.hasOwnProperty(property)) hash[property] = Boolean(hash[property]);
        });
        ['to_do_categories', 'notes'].forEach(property => {
            if (hash.hasOwnProperty(property)) {
                try {
                    hash[property] = JSON.parse(hash[property]);
                } catch (e) {
                    console.log(`\nFailed to parse into JSON\n\tProperty: ${property}\n\tValue: ${hash[property]}`);
                }
            }
        });
        return hash;
    });
}