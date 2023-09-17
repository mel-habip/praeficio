/**
 * @function AlekSpecial - finds best position to move in the board during tic-tac-toe
 * @param {Array<string>} board - board state like ['','X', '', 'O',...]
 * @param {"X"|"O"} player
 * @param {"X"|"O"} opponent
 * @param {Array<Array<number>>} winningArrangements
 * @returns {number} best position that can be moved to
 * @note with great thanks to my friend Alek for his help here
 */
function AlekSpecial(board, player, opponent, winningArrangements) {
    let bestMove; //what we are hoping to find

    // console.log(`Alek special called, board provided:`, board);

    const boardScores = new Array(board.length).fill(0);

    const boardDimension = Math.sqrt(board.length);

    let exhausted_arrangements = 0;

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

        // console.log(`arrangement & nums:`, arrangement, {
        //     playerMarks,
        //     opponentMarks,
        //     openSpots
        // });

        if (openSpots === 1 && (!playerMarks || !opponentMarks)) {
            //means we are 1 step from winning or 1 step from loosing, so we should conquer the available spot.\
            bestMove = arrangement.filter(p => !board[p])[0];
            console.log(`Critical move (type 1) triggerred, moving to ${bestMove}, arrangement found: `, arrangement);
            return { boardScores, bestMove };
            break;
        } else if (boardDimension > 6 && openSpots === 2 && !playerMarks) {
            //means the opponent is 2 moves away from winning and both spots are open.
            //this happens in 7*7 and larger games since we only require a streak of 6, which means they can add one to the other end
            bestMove = arrangement.filter(p => !board[p])[0];
            console.log(`Critical move (type 2) triggerred, moving to ${bestMove}, arrangement found: `, arrangement);
            return { boardScores, bestMove };
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
        } else {
            //means both the current and the opponent are on this path, so it is now useless
            exhausted_arrangements++;
        }
    }

    if (bestMove) throw Error(`shouldn't have happened`);

    //find the best move now based on boardScores

    let currentBestScore = 0;
    boardScores.forEach((cellScore, index) => {
        if (board[index]) return; //means its occupied

        if (cellScore > currentBestScore) {
            currentBestScore = cellScore;
            console.log(`index ${index} found better so far`);
            bestMove = index;
        }
    });

    if (bestMove == null) {
        console.error(`no best move calculated, picking randomly`, boardScores);
        bestMove = boardScores.map((_, i) => i).filter(p => !!board[p]).pop();
    }

    return {
        boardScores,
        bestMove,
        is_tie: exhausted_arrangements === winningArrangements.length, //if there is no winning arrangement left, we are headed to a tie
    };
};

const playerOne = "X";
const playerTwo = "O";

//available spots
function available_spots_calculator(board) {
    return board.filter(s => s !== playerOne && s !== playerTwo);
};

// winning combinations
function winning(board, player, winning_combinations) {
    return winning_combinations.some(arrangement => arrangement.every(pos => board[pos] === player))
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

    if (scale > 6) return winningCombinations.map(x => getAdjacentArrays(x)).flat(1);

    return winningCombinations;
};

//splits arrays larger than 6 into an array of arrays each of which are the 6 adjacent parts
function getAdjacentArrays(arr) {
    const result = [];
    const len = arr.length;
    for (let i = 0; i < len - 5; i++) {
        result.push(arr.slice(i, i + 6));
    }
    return result;
};

function adjacentCellFinder(board, index) {
    const side = Math.sqrt(board.length);

    const result = [];

    //left & right 
    const rowNum = Math.floor(index / side);

    const row = Array.from({
        length: 3
    }, (_, i) => rowNum * side + i);

    const position_in_row = row.findIndex(i => i === index);

    //diagonal 4
    if ((index - side - 1) >= 0) result.push(index - side - 1); //upperLeft
    if ((index - side) >= 0) result.push(index - side); //upper
    if ((index - side + 1) >= 0) result.push(index - side + 1); //upperRight

    if (!position_in_row) { //means all the way left
        result.push(index + 1);
    } else if (position_in_row === (side - 1)) { //means all the way right
        result.push(index - 1);
    } else { //means middle
        result.push(index + 1);
        result.push(index - 1);
    }

    if ((index + side - 1) < board.length) result.push(index + side - 1); //lowerLeft
    if ((index + side) < board.length) result.push(index + side); //lower
    if ((index + side + 1) < board.length) result.push(index + side + 1); //lowerRight

    return result;
};

const resultWords = {
    lose: 'YOU LOOOOOOSE',
    win: 'YOU WIN',
    end_tie: 'TIE',
    early_tie: 'TIE - NO WINNING COMBINATIONS LEFT',
};

function TicTacToeGrid({ dimensions, move, board, lastMove }) {

    function boardShow(ix) {
        return typeof board[ix] === 'number' ? ' ' : board[ix];
    };

    return <table
        className="tictactoe-grid" //dynamically generates the grid
    >
        <tbody>
            {Array.from({ length: dimensions }, (_, i) => i).map(x => <tr key={x + '-row'}>
                {Array.from({ length: dimensions }, (_, i) => i).map(y => <td
                    onClick={() => move((dimensions * x) + y, playerOne)}
                    key={y + '-cell'}
                    className={`cell ${lastMove === ((dimensions * x) + y) ? 'is-last-move' : ''}`}>{boardShow((dimensions * x) + y)}</td>)}
            </tr>)}
        </tbody>
    </table>
}

const TicTacToeUtils = {
    AlekSpecial,
    available_spots_calculator,
    winning,
    generateWinningCombinations,
    adjacentCellFinder,
    resultWords,
    playerOne,
    playerTwo,
    TicTacToeGrid,
}

export default TicTacToeUtils;