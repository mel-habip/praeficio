import React, { useState, useContext, useEffect } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import axios from 'axios';

import NavMenu from '../components/NavMenu';
import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import './stylesheets/TicTacToePage.css';

import { Button, Modal, Loading, Badge } from '@nextui-org/react';

const playerOne = "X";
const playerTwo = "O";
const resultWords = {
    lose: 'YOU LOOOOOOSE',
    win: 'YOU WIN',
    end_tie: 'TIE',
    early_tie: 'TIE - NO WINNING COMBINATIONS LEFT',
}

export default function TicTacToePage() {
    document.title = "Tic-Tac-Toe";
    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);

    const [dimensions, setDimensions] = useState(3); //to later have 4*4, 5*5, 6*6 ... games

    const winningArrangements = React.useMemo(() => {
        return generateWinningCombinations(dimensions || 3);
    }, [dimensions]);

    const boardStart = React.useMemo(() => {
        return Array.from({ length: dimensions * dimensions }, (_, i) => '');
    }, [dimensions]);

    const [board, setBoard] = useState([]);
    const [scoreBoard, setScoreBoard] = useState([]);

    useEffect(() => {
        setBoard(boardStart);
    }, [boardStart]);

    const [round, setRound] = useState(1);
    const [lastMove, setLastMove] = useState(null);

    const [finalState, setFinalState] = useState(null);

    const finalColor = React.useMemo(() => {
        if (finalState === resultWords.lose) return 'error';
        if (finalState === resultWords.win) return 'success';
        return 'warning';
    }, [finalState]);

    const dimensionOptions = React.useMemo(() => [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => ({ key: i.toString(), name: `${i}x${i} grid`, description: i > 6 ? 'create a 6-streak to win' : null, disabled: i > 10 })), []);

    const [playerTurn, setPlayerTurn] = useState(playerOne);

    const toggleTurn = () => setPlayerTurn(playerTurn === playerOne ? playerTwo : playerOne);

    useEffect(() => {
        if (playerTurn === playerTwo) {
            //find best move to make
            const { bestMove, boardScores, is_tie } = AlekSpecial(board, playerTwo, playerOne, winningArrangements);
            setScoreBoard(boardScores);
            if (is_tie) {
                console.log('Headed towards a tie');
                setFinalState(resultWords.early_tie);
            } else {
                console.log(`AI player moves to #${bestMove}`);
                move(bestMove, playerTwo);
            }
        }
    }, [playerTurn]);

    return (<>
        {isLoggedIn && <NavMenu></NavMenu>}
        {/* <pre>Board: {JSON.stringify(board, null, 0)}</pre>
        <pre>Scores: {JSON.stringify(scoreBoard, null, 0)}</pre>
        <pre>Last: {lastMove||'none'}</pre> */}
        {!isLoggedIn && <Button
            css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
            onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}/></Button>}

        <CustomizedDropdown disabled={round > 1} optionsList={dimensionOptions} title="Grid" mountDirectly default_value="3" outerUpdater={a => setDimensions(parseInt(a))} showDisabledColor />
        <CustomButton onClick={reset}>Reset <i className="fa-solid fa-arrows-rotate"/></CustomButton>
        <br />
        {finalState && <Badge color={finalColor} >{finalState}</Badge>}
        {playerTurn === playerTwo && !finalState && <Loading></Loading>}
        <br />
        <table
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
        <h4 style={{ color: 'grey' }} > &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Round: {round}</h4>
    </>);

    function boardShow(ix) {
        return typeof board[ix] === 'number' ? ' ' : board[ix];
    };

    /**
     * @function move - serves to move the human player (X) to a specific position
     * @param {Number} to_position destination for X
     * @param player = human player
     * @return {String|undefined} final result or nothing
     */
    function move(to_position, player) {
        console.log('called move');

        { //validation step
            if ([playerOne, playerTwo].includes(board[to_position])) { console.error(`Position ${to_position} has already been claimed`); return; }

            if (board[to_position] === undefined) { console.error(`Position ${to_position} not found on board`); return; }

            if (![playerOne, playerTwo].includes(player)) { console.error(`Player ${player} not recognized`); return; }
        }

        //these are needed since the setState doesn't happen right away but rather happens at the end of everything
        const newBoard = [...board];
        newBoard[to_position] = player;

        const newRound = round + 1;

        setRound(newRound);
        setBoard(newBoard);

        if (winning(newBoard, player, winningArrangements)) {
            if (player === playerOne) {
                console.log(resultWords.win);
                setFinalState(resultWords.win);
            } else {
                console.log(resultWords.lose);
                setFinalState(resultWords.lose);
            }
        } else if (newRound > board.length) {
            console.log(resultWords.end_tie);
            setFinalState(resultWords.end_tie);
        }
        setLastMove(to_position);
        if (!finalState) toggleTurn();
    };

    function reset() {
        console.log('called reset');
        setRound(1);
        setBoard(boardStart);
        setScoreBoard([]);
        setLastMove(null);
        setFinalState(null);
        setPlayerTurn(playerOne);
    };

};

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

        console.log(`arrangement & nums:`, arrangement, {
            playerMarks,
            opponentMarks,
            openSpots
        });

        if (openSpots === 1 && (!playerMarks || !opponentMarks)) {
            //means we are 1 step from winning or 1 step from loosing, so we should conquer the available spot.\
            bestMove = arrangement.filter(p => !board[p])[0];
            console.log(`Critical move triggerred, moving to ${bestMove}, arrangement found: `, arrangement);
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

    return winningCombinations;
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