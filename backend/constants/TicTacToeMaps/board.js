/**
 * @desc This class represents the board, contains methods that checks board state, insert a symbol, etc..
 * @param {Array} state - an array representing the state of the board
 */
export default class Board {
    //Initializing the board
    constructor(setup_details) {

        if (Array.isArray(setup_details)) {
            this.state = [...setup_details];
            this.scale = Math.sqrt(this.state.length);
        } else {
            this.state = new Array(setup_details * setup_details).fill('');
            this.scale = setup_details;
        }

        this.winningCombinations = generateWinningCombinations(this.scale);
    }
    //Logs a visualized board with the current state to the console
    printFormattedBoard() {
        let formattedString = '';
        this.state.forEach((cell, index) => {
            formattedString += cell ? ` ${cell} |` : '   |';
            if ((index + 1) % 3 === 0) {
                formattedString = formattedString.slice(0, -1);
                if (index < 8) formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
            }
        });
        console.log('%c' + formattedString, 'color: #c11dd4;font-size:16px');
    }
    //Checks if board has no symbols yet
    isEmpty() {
        return this.state.every(cell => !cell);
    }
    //Check if board has no spaces available
    isFull() {
        return this.state.every(cell => !!cell);
    }
    /**
     * Inserts a new symbol(X,O) into
     * @param {String} symbol 
     * @param {Number} position
     * @return {Boolean} boolean represent success of the operation
     */
    insert(symbol, position) {
        if (position < 0 || position > (this.state.length - 1)) {
            throw new Error(`Cell index ${position} does not exist!`);
        }
        if (!['X', 'O'].includes(symbol)) {
            throw new Error(`The symbol can only be X or O! Received: ${symbol}`);
        }
        if (this.state[position]) {
            return false;
        }
        this.state[position] = symbol;
        return true;
    }
    //Returns an array containing available moves for the current state
    getAvailableMoves() {
        const moves = [];
        this.state.forEach((cell, index) => {
            if (!cell) moves.push(index);
        });
        return moves;
    }
    /**
     * Checks if the board has a terminal state ie. a player wins or the board is full with no winner
     * @return {Object} an object containing the winner, direction of winning and row number
     */
    isTerminal() {
        //Return False if board in empty
        if (this.isEmpty()) return false;

        //If no winner but the board is full, then it's a draw
        if (this.isFull()) {
            return {
                'winner': 'draw'
            };
        }

        for (const arrangement of this.winningCombinations) {
            let first = this.state[arrangement[0]];
            if (!!first && arrangement.every(pos => this.state[pos] === first)) {
                return {
                    winner: first,
                    winning_combo: arrangement,
                };
            }
        }

        return false;
    }
};



function generateWinningCombinations(scale) {
    scale = parseInt(scale);
    const boardSize = scale * scale;
    const winningCombinations = [];

    // Generate row-winning combinations
    for (let i = 0; i < boardSize; i += scale) {
        const row = [];
        for (let j = i; j < i + scale; j++) {
            row.push(j);
        }
        winningCombinations.push(row);
    }

    // Generate column-winning combinations
    for (let i = 0; i < scale; i++) {
        const col = [];
        for (let j = i; j < boardSize; j += scale) {
            col.push(j);
        }
        winningCombinations.push(col);
    }

    // Generate diagonal-winning combinations
    const diagonal1 = [];
    const diagonal2 = [];
    for (let i = 0; i < boardSize; i += scale + 1) {
        diagonal1.push(i);
    }
    for (let i = scale - 1; i < boardSize - 1; i += scale - 1) {
        diagonal2.push(i);
    }
    winningCombinations.push(diagonal1);
    winningCombinations.push(diagonal2);

    return winningCombinations;
}