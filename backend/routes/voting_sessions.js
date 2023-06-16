"use strict"

import {
    Router
} from 'express';
const votingSessionRouter = Router();
import authenticateToken from '../jobs/authenticateToken.js';
import query from '../utils/db_connection.js';
import VotingSessionService from '../modules/VotingSessionService.mjs';
import VoteService from '../modules/VoteService.mjs';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';
import generateTemporaryPassword from '../utils/generateTemporaryPassword.js';
import votingSessionsCache from '../stores/votingSessionsCache.js';

const sessionHelper = new VotingSessionService();
const voteHelper = new VoteService();

//get all sessions user has access to
votingSessionRouter.get('/', authenticateToken, async (req, res) => {
    let results;

    try {

        console.log('votingSessionsCache.keys()', votingSessionsCache.keys())
        throw false;
        // votingSessionsCache.del((votingSessionsCache.keys() || []).filter(str => str.startsWith('user-')));
    } catch (e) {
        console.error(e?.stack || e?.message || e);
    }

    const checkCache = votingSessionsCache.get(`user-${req.user.id}-voting-sessions`);

    if (checkCache) {
        results = checkCache;
    } else {
        if (req.user.is_dev) {
            const sql = `SELECT * FROM ${sessionHelper.table_name};`;
            results = await query(sql);
        } else {
            results = await sessionHelper.fetch_by_user_id(req.user.id);
        }

        votingSessionsCache.set(`user-${req.user.id}-voting-sessions`, results);
        // results.forEach(session => {
        //  //can't do this because it will overwrite the cache but without the votes. We can `get` for each to check, but too much computation, not really worth it
        //     votingSessionsCache.set(`voting-session-${session.voting_session_id}`, session);
        // });
    }


    if (results) {
        return res.status(200).json({
            data: results,
            message: req.user.is_dev ? `is_dev --> all ${results.length} results shown.` : `${results.length} results found for user ${req.user.id}.`
        });
    }

    return res.status(422).json({
        message: 'Something went wrong.'
    });
});

//create a new voting session
votingSessionRouter.post('/', authenticateToken, validateAndSanitizeBodyParts({
    name: 'string',
    details: 'hash'
}, ['name', 'details']), async (req, res) => {

    try {

        console.log('votingSessionsCache.keys()', votingSessionsCache.keys())
        throw false;
        // votingSessionsCache.del((votingSessionsCache.keys() || []).filter(str => str.startsWith('user-')));
    } catch (e) {
        console.error(e?.stack || e?.message || e);
        votingSessionsCache.flushAll();
    }

    const filteredDetails = {};

    { //validate the options selected
        const {
            details
        } = req.body;

        if (!details.method) {
            return res.status(400).json({
                message: 'Method missing'
            });
        }

        const {
            options
        } = details;

        if (!options || !options?.length || !Array.isArray(options) || !options?.every(opt => !!opt && typeof opt === 'string' && opt.length <= 100) || Array.from(new Set(options.map(x => x.toLowerCase().trim()))).length !== details.options.length) {
            return res.status(400).json({
                message: `Provided options array is invalid`
            });
        }
        if (details.voter_limit != null && isNaN(details.voter_limit) && details.voter_limit > 1) {
            return res.status(400).json({
                message: `Voter Limit is invalid`
            });
        } else if (details.voter_limit != null) {
            filteredDetails.voter_limit = details.voter_limit;
        }

        const {
            method
        } = details;

        filteredDetails.method = method;
        filteredDetails.options = details.options;

        if (['simple'].includes(method)) {
            //nothing
        } else if (['approval', 'multiple_votes'].includes(method)) {
            if (!details.number_of_votes || isNaN(details.number_of_votes)) {
                return res.status(400).json({
                    message: `Number of Votes ("${details.number_of_votes}") is invalid`
                });
            }
            filteredDetails.number_of_votes = details.number_of_votes;
        } else if (method === 'preferential') {
            return res.status(400).json({
                message: `This method is not yet supported`
            });
        } else {
            return res.status(400).json({
                message: `Method "${method}" is not recognized`
            });
        }
    }

    const creation_details = await sessionHelper.create_single({
        name: req.body.name,
        voter_key: generateTemporaryPassword(16, true),
        created_by: req.user.id,
        details: JSON.stringify(filteredDetails),
    });

    if (!creation_details?.success) return res.status(422).json({
        message: creation_details?.message || `Something went wrong`,
        details: creation_details?.details,
    });

    votingSessionsCache.set(`voting-session-${creation_details.details.voting_session_id}`, creation_details.details);

    return res.status(201).json({
        ...creation_details.details
    });
});

//conclude and complete the election - calculate the result
votingSessionRouter.post(`/:voting_session_id/complete`, authenticateToken, async (req, res) => {

    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`
    });

    /**
     * @type {{}}
     */
    const candidatesMap = voting_session.details.options.reduce((acc, cur) => ({
        ...acc,
        [cur]: 0
    }), {});

    const errors = [];

    const allVotes = voting_session.votes;

    if (!allVotes || !allVotes.length) errors.push(`No votes detected in session`);

    //result determination process
    const result = {
        winner: 'indeterminate',
        total_votes: allVotes.length,
    };

    allVotes?.forEach(vote => {
        const candidates = vote.details?.selections;

        if (!candidates || !candidates.length) {
            errors.push(`A vote is missing candidates`);
            return;
        }

        candidates.forEach(candidate => {
            if (!candidatesMap.hasOwnProperty(candidate)) {
                errors.push(`Candidate "${candidate}" has received a vote but is not part of the voting session`);
            } else {
                candidatesMap[candidate]++;
            }
        });
    });

    const votesEntries = Object.entries(candidatesMap);

    let current_best = ['indeterminate', 0];

    result.valid_votes = votesEntries.filter(x => x[1]).length;

    votesEntries.forEach(([candidate, votes]) => {
        if (votes > current_best[1]) {
            current_best[0] = candidate;
            current_best[1] = votes;
        }
    });

    result.winner = current_best[0];
    result.winner_votes = current_best[1];
    result.winner_percentage = ((current_best[1] / result.valid_votes) * 100).toFixed(2) + '%';

    const update_details = await sessionHelper.update_single({
        details: JSON.stringify({
            ...voting_session.details,
            result,
        }),
        completed: true,
        completed_on: new Date(),
    }, req.params.voting_session_id);

    if (!update_details?.success) {
        return res.status(422).json({
            message: 'Something went wrong while updating the DB'
        });
    }

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        ...update_details.details
    });

    return res.status(200).json({
        success: true,
        ...update_details.details,
        result,
        errors,
    });
});

//renew voter key (in case you want to keep the session but make sure only the correct people can access it)
votingSessionRouter.post(`/:voting_session_id/renew_voter_key`, authenticateToken, async (req, res) => {

    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache || await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.created_by !== req.user.id && !req.user.is_dev) res.status(403).json({
        message: `Forbidden: You cannot renew the public key for this Voting Session`
    });

    const new_voter_key = generateTemporaryPassword(16, true);

    const update_result = await sessionHelper.update_single({
        voter_key: new_voter_key,
    }, req.params.voting_session_id);

    if (!update_result?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        ...update_result.details
    });

    return res.status(200).json({
        ...update_result.details,
        new_voter_key,
    });
});

//delete the session
votingSessionRouter.delete(`/:voting_session_id`, authenticateToken, async (req, res) => {
    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache || await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.created_by !== req.user.id && !req.user.is_dev) res.status(403).json({
        message: `Forbidden: You cannot delete this Voting Session`
    });

    const deletion_result = await sessionHelper.soft_delete(req.params.voting_session_id);

    if (!deletion_result?.success) res.status(422).json({
        message: `Something went wrong`
    });

    votingSessionsCache.del(`voting-session-${req.params.voting_session_id}`);

    res.status(204).json({
        success: deletion_result?.success,
        message: `deleted`
    });
});

//edit the session details
votingSessionRouter.put(`/:voting_session_id`, authenticateToken, validateAndSanitizeBodyParts({
    name: 'string',
    voter_limit: 'number',
    remove_voter_limit: 'boolean',
    options: 'array',
    number_of_votes: 'number',
    remove_number_of_votes: 'boolean'
}), async (req, res) => {
    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache || await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.created_by !== req.user.id && !req.user.is_dev) res.status(403).json({
        message: `Forbidden: You cannot edit this Voting Session`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`
    });

    const updatedDetails = {
        ...voting_session.details
    };

    if (req.body.remove_voter_limit) {
        delete updatedDetails.voter_limit;
    } else if (req.body.voter_limit) {
        updatedDetails.voter_limit = req.body.voter_limit;
    }

    if (req.body.options) {
        updatedDetails.options = Array.from(new Set(req.body.options));
    }

    if (req.body.number_of_votes && !isNaN(req.body.number_of_votes)) {
        updatedDetails.number_of_votes = req.body.number_of_votes;
    } else if (req.body.remove_number_of_votes) {
        delete updatedDetails.number_of_votes;
    }

    const sessionNewName = req.body.name || voting_session.name;

    const update_details = await sessionHelper.update_single({
        details: JSON.stringify(updatedDetails),
        name: sessionNewName
    }, req.params.voting_session_id);

    if (!update_details?.success) return res.status(422).json({
        message: update_details?.message || `Something went wrong.`,
        details: update_details?.details,
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        name: sessionNewName,
        details: updatedDetails,
    });

    return res.status(200).json({
        updatedDetails,
        name: sessionNewName
    });
});

//submit a new vote
votingSessionRouter.post(`/:voting_session_id/vote`, validateAndSanitizeBodyParts({
    voter_key: 'string',
    selections: 'array'
}, ['voter_key', 'selections']), async (req, res) => {

    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (req.body.voter_key !== voting_session.voter_key) return res.status(401).json({
        message: `Invalid Voter Key.`
    });

    if (voting_session.votes.some(vote => [req.ip, req.custom_ip].includes(vote.voter_ip_address))) return res.status(400).json({
        message: `You have already voted in this session.`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`
    });

    if (voting_session.details.voter_limit && voting_session.votes?.length >= voting_session.details.voter_limit) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is has reached the maximum number of votes.`
    });

    const session_method = voting_session.details.method;
    const session_options = voting_session.details.options;

    if (!req.body.selections?.length) return res.status(400).json({
        message: `Selections are required`
    });

    //validate that each selection is a valid option
    {
        const candidatesMap = session_options.reduce((acc, cur) => ({
            ...acc,
            [cur]: true
        }), {});

        let invalid_selections = [];

        req.body.selections.forEach(select => {
            if (!candidatesMap[select]) invalid_selections.push(select);
        });

        if (invalid_selections.length) return res.status(400).json({
            message: `invalid selections: ${invalid_selections.join(',')}`
        });
    }

    if (session_method === 'single' && req.body.selections.length !== 1) {
        return res.status(400).json({
            message: `Invalid selections`
        });
    }

    //check duplicate candidate selections
    if (session_method === 'approval' && req.body.selections.length > Array.from(new Set(req.body.selections)).length) return res.status(400).json({
        message: `Invalid selections`
    });

    //too many selections
    if (req.body.selections.length > voting_session.details.number_of_votes) return res.status(400).json({
        message: `Invalid selections`
    });

    const creation_result = await voteHelper.create_single({
        voting_session_id: req.params.voting_session_id,
        voter_ip_address: req.ip || req.custom_ip,
        details: JSON.stringify({
            selections: req.body.selections
        }),
    });

    if (!creation_result?.success) return res.status(422).json({
        message: creation_result?.message || 'Something went wrong.',
        details: creation_result?.details
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        votes: voting_session.votes.concat(creation_result.details)
    });

    return res.status(201).json({
        ...creation_result.details
    });
});

//update an existing vote
votingSessionRouter.put(`/:voting_session_id/vote/:vote_id`, validateAndSanitizeBodyParts({
    voter_key: 'string',
    selections: 'array'
}, ['voter_key', 'selections']), async (req, res) => {
    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (req.body.voter_key !== voting_session.voter_key) return res.status(401).json({
        message: `Invalid Voter Key.`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`,
        error_part: 'is_completed'
    });

    const vote_to_edit = voting_session.votes.find(vote => vote.vote_id === parseInt(req.params.vote_id));

    if (!vote_to_edit) return res.status(404).json({
        message: `Vote #${req.params.vote_id} is not found in voting session #${req.params.voting_session_id}.`
    });

    if (![req.ip, req.custom_ip].includes(vote_to_edit.voter_ip_address)) return res.status(403).json({
        message: `Forbidden: You cannot perform this action.`
    });

    const session_method = voting_session.details.method;
    const session_options = voting_session.details.options;

    if (!req.body.selections?.length) return res.status(400).json({
        message: `Selections are required`
    });

    //validate that each selection is a valid option
    {
        const candidatesMap = session_options.reduce((acc, cur) => ({
            ...acc,
            [cur]: true
        }), {});

        let invalid_selections = [];

        req.body.selections.forEach(select => {
            if (!candidatesMap[select]) invalid_selections.push(select);
        });

        if (invalid_selections.length) return res.status(400).json({
            message: `invalid selections: ${invalid_selections.join(',')}`
        });
    }

    if (session_method === 'single' && req.body.selections.length !== 1) {
        return res.status(400).json({
            message: `Invalid selections`
        });
    }

    //check duplicate candidate selections
    if (session_method === 'approval' && req.body.selections.length > Array.from(new Set(req.body.selections)).length) return res.status(400).json({
        message: `Invalid selections`
    });

    //too many selections
    if (req.body.selections.length > voting_session.details.number_of_votes) return res.status(400).json({
        message: `Invalid selections`
    });

    const update_result = await voteHelper.update_single({
        details: JSON.stringify({
            selections: req.body.selections
        }),
    }, req.params.vote_id);

    if (!update_result?.success) return res.status(422).json({
        message: update_result?.message || `Something went wrong`,
        details: update_result?.details
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        votes: voting_session.votes.map(vote => vote.vote_id === parseInt(req.params.vote_id) ? {
            ...vote,
            selections: req.body.selections
        } : vote)
    });

    return res.status(200).json({
        success: true,
        selections: req.body.selections
    });
});

//remove a vote from the voting session - external version
votingSessionRouter.delete(`/:voting_session_id/vote/:vote_id`, async (req, res, next) => {

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token) {
        return next();
        //if the request is made sans account, we take care of it as below
        // but if there is an account (token) then we want to send to the next function and take care of it in the authenticated way
        //unauthenticated is meant for external voters to delete their vote
        //authenticated is for session owners & devs but also supports logged-in voters
    }

    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`,
        error_part: 'is_completed'
    });

    const vote_to_delete = voting_session.votes.find(vote => vote.vote_id === parseInt(req.params.vote_id));

    if (!vote_to_delete) return res.status(404).json({
        message: `Vote #${req.params.vote_id} is not found in voting session #${req.params.voting_session_id}.`
    });

    // voters themselves can delete their vote (so long as the session is still in-progress)
    if (![req.ip, req.custom_ip].includes(vote_to_delete.voter_ip_address)) return res.status(403).json({
        message: `Forbidden: You cannot perform this action.`
    });

    const deletion_result = await voteHelper.soft_delete(req.params.vote_id);

    if (!deletion_result?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        votes: voting_session.votes.filter(vote => vote.vote_id !== parseInt(req.params.vote_id))
    });

    return res.status(200).json({
        success: deletion_result?.success,
        message: `deleted`
    });
}, authenticateToken, async (req, res) => {
    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.completed) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`,
        error_part: 'is_completed'
    });

    const vote_to_delete = voting_session.votes.find(vote => vote.vote_id === parseInt(req.params.vote_id));

    if (!vote_to_delete) return res.status(404).json({
        message: `Vote #${req.params.vote_id} is not found in voting session #${req.params.voting_session_id}.`
    });

    // voting session owner, devs and the voter themselves can delete their vote (so long as the session is still in-progress)
    if (voting_session.created_by === req.user.id || req.user.is_dev || [req.ip, req.custom_ip].includes(vote_to_delete.voter_ip_address)) {
        //we're good
    } else {
        return res.status(403).json({
            message: `Forbidden: You cannot perform this action.`
        });
    }

    const deletion_result = await voteHelper.soft_delete(req.params.vote_id);

    if (!deletion_result?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, {
        ...voting_session,
        votes: voting_session.votes.filter(vote => vote.vote_id !== parseInt(req.params.vote_id))
    });

    return res.status(200).json({
        success: deletion_result?.success,
        message: `deleted`
    });
});

//fetches the details for a potential voter
votingSessionRouter.get('/:voting_session_id/vote/:voter_key', async (req, res) => {

    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (req.params.voter_key !== voting_session.voter_key) return res.status(401).json({
        message: `Invalid Voter Key.`
    });

    if (voting_session.completed || (voting_session.details.voter_limit && voting_session.details.voter_limit <= voting_session.votes.length)) return res.status(400).json({
        message: `Voting Session #${req.params.voting_session_id} is already completed.`,
        error_part: 'is_completed'
    });

    let vote_id = voting_session.votes.find(vote => [req.ip, req.custom_ip].includes(vote.voter_ip_address))?.vote_id;

    if (!checkCache) {
        votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, voting_session);
    }

    return res.status(200).json({
        already_voted: !!vote_id,
        vote_id,
        voter_ip_address: req.ip || req.custom_ip,
        name: voting_session.name,
        voting_session_id: voting_session.voting_session_id,
        method: voting_session.details.method,
        options: voting_session.details.options,
        number_of_votes: voting_session.details.number_of_votes,
    });
});

//view the voting session details
votingSessionRouter.get(`/:voting_session_id`, authenticateToken, async (req, res) => {
    const checkCache = votingSessionsCache.get(`voting-session-${req.params.voting_session_id}`);

    const voting_session = checkCache?.votes ? checkCache : await sessionHelper.fetch_by_id(req.params.voting_session_id, {
        deleted: false
    }, {
        votes: true
    });

    if (!checkCache?.votes) {
        votingSessionsCache.set(`voting-session-${req.params.voting_session_id}`, voting_session);
    }

    if (!voting_session) return res.status(404).json({
        message: `Voting Session #${req.params.voting_session_id} is not found.`
    });

    if (voting_session.created_by !== req.user.id && !req.user.is_dev) res.status(403).json({
        message: `Forbidden: You do not have access to this Voting Session`
    });

    /**
     * @type {{}}
     */
    const candidatesMap = voting_session.details.options.reduce((acc, cur) => ({
        ...acc,
        [cur]: 0
    }), {});

    const errors = [];

    const allVotes = voting_session.votes;

    if (!allVotes || !allVotes.length) errors.push(`No votes detected in session`);

    //result determination process
    const result = {
        winner: 'indeterminate',
        number_of_voters: allVotes.length,
        total_votes: 0,
        valid_votes: 0,
        tie_parts: new Set(),
    };

    allVotes?.forEach((vote, ix) => {
        const candidates = vote.details?.selections;

        if (!candidates || !candidates.length) {
            errors.push(`A vote is missing candidates`);
            return;
        }

        if (candidates.length > 1 && voting_session.details.method === 'simple') {
            errors.push(`A vote has submitted more selections than allowed (1).`);
            voting_session.votes[ix].has_error = true;
        } else if (candidates.length > voting_session.details.number_of_votes) {
            errors.push(`A vote has submitted more selections than allowed (${voting_session.details.number_of_votes}).`);
            voting_session.votes[ix].has_error = true;
        } else if (voting_session.details.method === 'approval' && candidates.length !== Array.from(new Set(candidates)).length) {
            errors.push(`A vote has submitted invalid selections.`);
            voting_session.votes[ix].has_error = true;
        }

        candidates.forEach(candidate => {
            result.total_votes++;
            if (!candidatesMap.hasOwnProperty(candidate)) {
                errors.push(`Candidate "${candidate}" has received a vote but is not part of the voting session`);
                voting_session.votes[ix].has_error = true;
            } else {
                result.valid_votes++;
                candidatesMap[candidate]++;
            }
        });
        delete voting_session.votes[ix].details; //removing so that the admin doesn't see what the IP addresses voted for

        //hide the last section of the voter's IP to protect them
        const sectionsOfIp = voting_session.votes[ix].voter_ip_address.split('.');
        sectionsOfIp.pop();
        sectionsOfIp.push('***');
        voting_session.votes[ix].voter_ip_address = sectionsOfIp.join('.');
    });

    const votesEntries = Object.entries(candidatesMap);

    let current_best = ['indeterminate', 0];

    votesEntries.forEach(([candidate, votes]) => {
        if (votes > current_best[1]) {
            current_best[0] = candidate;
            current_best[1] = votes;
            result.tie_parts.clear();
        } else if (votes === current_best[1]) {
            //tie identified
            result.tie_parts.add(candidate);
            result.tie_parts.add(current_best[0]);
        }
    });

    result.tie_parts = Array.from(result.tie_parts);

    result.is_tie = !!result.tie_parts.length;

    result.winner = result.is_tie ? `Tie between ${result.tie_parts.join(' & ')}` : current_best[0];
    result.winner_votes = current_best[1];
    result.winner_percentage = ((current_best[1] / result.valid_votes) * 100).toFixed(2) + '%';
    result.valid_votes_percentage = (result.valid_votes === result.total_votes) ? '100%' : ((result.valid_votes / result.total_votes) * 100).toFixed(2) + '%';

    return res.status(200).json({
        ...voting_session,
        result,
        distribution: candidatesMap,
        errors,
    });
});

export default votingSessionRouter;