"use strict"
import express from 'express';
const ticTacToeRouter = express.Router();
const log = console.log;




ticTacToeRouter.post('/move', async (req, res) => {

    //req.body should have `board`, `to_position` and `player`

    
});


export default ticTacToeRouter;