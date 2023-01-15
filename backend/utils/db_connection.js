import mysql from 'mysql';

export const connection = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: 'mydb'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});