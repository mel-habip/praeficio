"use strict"
import express from 'express';
const friendshipsRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import query from '../utils/db_connection.js';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';
import FriendshipService from "../modules/FriendshipService.mjs";
import UserService from "../modules/UserService.mjs";
import usersCache from '../stores/usersCache.js';
const friendshipHelper = new FriendshipService();
const userHelper = new UserService();


const log = console.log;

friendshipsRouter.use(authenticateToken);
friendshipsRouter.use(addUserFriendships);

async function addUserFriendships(req, res, next) {
    if (!req.user.friendships) {
        req.user.friendships = await friendshipHelper.fetch_by_user_id(req.user.id);
        usersCache.set(`user-${req.user.id}`, req.user);
    }

    next();
}

//test api
friendshipsRouter.get('/test', async (req, res) => {
    res.status(200).send('Hello World from the Friendships section!');
});

//fetch all friendships of the user
friendshipsRouter.get('/', async (req, res) => {
    res.status(200).json({
        data: req.user.friendships
    });
});

//Create a new Friendship
friendshipsRouter.post('/', validateAndSanitizeBodyParts({
    user_id: 'number', //refers to the 2nd person
    discovery_token: 'string', //let's users protect themselves
}, ['user_id', 'discovery_token']), async (req, res) => {

    const findMatch = req.user.friendships.find(friendship => [friendship.user_1_id, friendship.user_2_id].includes(parseInt(req.body.user_id)));

    if (findMatch) return res.status(400).json({
        message: `You are already friends with user #${req.body.user_id}.`,
    });

    const cacheCheck = usersCache.get(`user-${req.body.user_id}`);

    const userDetails = cacheCheck || await userHelper.fetch_by_id(req.body.user_id);

    if (!userDetails || userDetails?.deleted) return res.status(404).json({
        message: `User #${req.body.user_id} not found.`
    });

    if (userDetails.discovery_token !== req.body.discovery_token) return res.status(400).json({
        message: `Invalid Discovery Token`
    });

    if (!userDetails?.active) return res.status(400).json({
        message: `User #${req.body.user_id} is inactive and cannot make friends.`
    });

    const creation_result = await friendshipHelper.create_single({
        user_1_id: req.user.id,
        user_2_id: req.body.user_id,
    });

    if (!creation_result?.success) return res.status(422).json({
        message: creation_result.message || `Something went wrong`,
        details: creation_result.details,
    });

    usersCache.set(`user-${req.user.id}`, {
        ...req.user,
        friendships: req.user.friendships.concat(creation_result.details),
    });

    return res.status(201).json(creation_result.details);
});

//Delete a new Friendship
friendshipsRouter.delete('/:user_id', validateAndSanitizeBodyParts({
    user_id: 'number', //refers to the 2nd person
}, ['user_id']), async (req, res) => {

    const findMatch = req.user.friendships.find(friendship => [friendship.user_1_id, friendship.user_2_id].includes(parseInt(req.body.user_id)));

    if (!findMatch) return res.status(400).json({
        message: `You are not friends with user #${req.body.user_id}.`
    });

    const deletion_result = await friendshipHelper.delete_both_ways(req.user.id, req.body.user_id);

    if (!deletion_result?.success) return res.status(422).json({
        message: deletion_result?.message || `Something went wrong`,
    });

    usersCache.del(`user-${req.body.user_id}`);

    usersCache.set(`user-${req.user.id}`, {
        ...req.user,
        friendships: req.user.friendships.filter(frnd => ![frnd.user_1_id, frnd.user_2_id].includes(parseInt(req.body.user_id)))
    });

    return res.status(200).json({
        message: deletion_result.message
    });
});


export default friendshipsRouter;