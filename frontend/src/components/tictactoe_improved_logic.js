/**
 * @function AlekSpecial - finds best position to move in the board during tic-tac-toe
 * @param {Array<string>} board - board state like ['','X', '', 'O',...]
 * @param {"X"|"O"} player
 * @param {"X"|"O"} opponent
 * @param {Array<Array<number>>} winningArrangements
 * @returns {number} best position that can be moved to
 */
function AlekSpecial(board, player, opponent, winningArrangements) {
    let bestMove; //what we are hoping to find

    const boardScores = new Array(board.length).fill(0);

    for (const arrangement of winningArrangements) {
        let playerMarks = 0,
            opponentMarks = 0,
            openSpots = 0;

        arrangement.forEach(pos => {
            if (board[pos] === player) {
                playerMarks++;
            } else if (board[pos] === opponent) {
                opponentMarks++;
            } else {
                openSpots++;
            }
        });
        if (openSpots === arrangement.length - 1) {
            //means we are 1 step from winning or 1 step from loosing, so we should conquer the available spot.
            bestMove = arrangement.filter(p => !!board[p]).pop();
            return bestMove;
            break;
        } else if (playerMarks && !opponentMarks) {
            //we have marks on the line and can win by continuing
            arrangement.forEach(p => {
                boardScores[p] += (1 + (playerMarks / arrangement.length));
            });
        } else if (opponentMarks && !playerMarks) {
            //opponent has marks on the line so we should occupy to avoid their win
            arrangement.forEach(p => {
                boardScores[p] += (opponentMarks / arrangement.length);
            });
        } else if (!opponentMarks && !playerMarks) {
            //line is empty
            arrangement.forEach(p => {
                boardScores[p] += 1;
            });
        } //else means line has both players and is unusable
    }

    if (bestMove) throw Error(`shouldn't have happenned`);

    //find the best move now based on boardScores

    let currentBestScore = 0;
    boardScores.forEach((cellScore, index) => {
        if (board[index]) return; //means its occupied

        if (cellScore > currentBestScore) {
            currentBestScore = cellScore;
            bestMove = index;
        }
    });
    if (!bestMove) throw Error(`no best move calculated`);

    return bestMove;
};

const playerOne = "X";
const playerTwo = "O";

const board = ['X', '', '', '', 'O', '', '', '', ''];


console.log(AlekSpecial(board, 'X', generateWinningCombinations(3)));


function available_spots_calculator(board, player) {
    return board.map((item, pos) => item || pos).filter(s => s !== playerOne && s !== playerTwo);
};

function generateWinningCombinations(scale) {
    console.log('called generateWinning');
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