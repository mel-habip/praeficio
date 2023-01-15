import express from 'express';
const Router = express.Router();
const log = console.log;

import authenticateToken from '../jobs/authenticateToken.js'
import fetchPermission from '../jobs/fetchPermission.js'

Router.get('/', authenticateToken, (req, res) => {
    let sql = `SELECT * FROM Users`;
    let results = con.query(sql, function (err, result) {
        if (err) throw err;
        log("here you go", result);
        if (fetchPermission(req.user.id) === 'total') {
            return res.json(results);
        } else {
            return res.json(results.filter(user => user.id === req.user.id));
        } // or the people to whom you have access
    });
});

Router.post('/create_new_user', async (req, res) => {
    log('received: ', req.body || {});

    let sql = `SELECT * FROM Users WHERE Username = '${req.body.username}'`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        log('result', result);
        if (result?. [0]) {
            log(`Username ${req.body.username} already in use`);
            return res.status(401).json(`Username ${req.body.username} already in use`);
        };
    });
    try {
        //hashed = encrypted
        //encryption uses a "Salt" that is generated uniquely for each password. The salt is prepended to the hashed password and functions as the key to decrypt it later on.
        const hashedPassword = await bcyprt.hash(req.body.password, 10); //default strength for salt creation is 10

        let sql = `INSERT INTO Users (Username, Password, FirstName, LastName, Permissions) VALUES ('${req.body.username}', '${hashedPassword}','${req.body.FirstName}','${req.body.LastName}', 'basic_user')`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            log("1 record inserted", result);
            //Do we want to then create a table specifically for that user and their data?
            return res.status(201).send({
                id: result.UserID,
                message: 'Successfully created'
            });
        });
    } catch (err) {
        res.status(422).send(err)
    }
});

Router.post('/login', (req, res) => {
    let sql = `SELECT * FROM Users WHERE Username = '${req.body.username}'`;
    return connection.query(sql, async (err, result) => {
        if (err) throw err;
        if (result?.Username) {
            return res.status(401).json({
                message: `Username not recognized`
            });
        };
        try {
            if (await bcrypt.compare(req.body.password, result.Password)) {
                const user = {
                    id: result[0].id
                };
                const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
                return res.status(200).json({
                    id: user.id,
                    first_name: result[0].FirstName,
                    last_name: result[0].LastName,
                    created_on: result[0].CreatedOn,
                    message: ``,
                    access_token,
                });
            } else {
                return res.status(401).json({
                    message: `Incorrect Password`
                });
            }
        } catch {
            return res.status(422).json({
                message: `Something went wrong`
            });
        }
    });





    // log('received: ', req.body || {});

    let user_details = {};


    const user = {
        username: req.body?.username,
        id: user_details.id
    };

    const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);

    res.json({
        access_token
    });
});

Router.delete('/:user_id', authenticateToken, (req, res) => {
    if (fetchPermission(req.user.id) !== 'total') {
        return res.status(403).send('You do not have access to this.');
    };

    //TODO: soft-delete the user
});

Router.get('/:user_id', authenticateToken, async (req, res) => {
    if (req.user.id === req.params.user_id || await fetchPermission(req.user.id) === 'total') {
        let sql = `SELECT * FROM Users WHERE UserID = '${req.params.user_id}'`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            delete result.password;
            res.json(result);
        });
    } else {
        return res.status(403).send('You do not have access to this.');
    }
});

Router.put('/:user_id', authenticateToken, async (req, res) => {
    const allowed_changes =['first_name', 'last_name', 'username', 'updated_on', 'permissions'];
    delete res.body.created_at; //uneditable
    //TODO: update user details except CreatedOn, 
});