import Board from './board.js';
import Player from './player.js';

import fs from 'fs';

const finalDictionary = {};

function new_game(depth = -1, startingPosition = 0) {
    //Instantiating a new player and an empty board
    const player = new Player(parseInt(depth));
    const board = new Board(6);

    board.insert('X', startingPosition);

    const starting_point = board.state.map((item, indx) => {
        if (item) return item;
        return indx;
    });

    let maximizing = true;
    while (!board.isFull()) {9
        player.getBestMove(board, maximizing, (pos) => {
            const symbol = maximizing ? 'O' : 'X';
            console.log(`${symbol} to ${pos}`);
            board.insert(symbol, parseInt(pos));
            maximizing = !maximizing;
            finalDictionary[starting_point] ||= {to: pos, winner: board.isTerminal()?.winner};
        });
    }

    console.log(board.isFull());
    console.log(board.isTerminal());
    console.log(board.state);


    board.printFormattedBoard();

};

for (let i = 0; i < 1; i++) {
    new_game(3, i);
}

fs.writeFileSync(`C:/Users/mhabi/Documents/GitHub/stock-portfolio-tracker/backend/constants/TicTacToeMaps/firstMap.json`, JSON.stringify(finalDictionary, null, 2));