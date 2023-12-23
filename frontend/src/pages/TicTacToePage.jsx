import React, { useState, useContext, useEffect, lazy, Suspense } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import TicTacToeUtils from './TicTacToeUtils';


import './stylesheets/TicTacToePage.css';
import { Badge } from "@nextui-org/badge";
import { Button } from '@nextui-org/react';

const { AlekSpecial, generateWinningCombinations, resultWords, winning, playerOne, playerTwo, TicTacToeGrid } = TicTacToeUtils;
const NavMenu = lazy(() => import('../components/NavMenu'));
// const AudioPlayer = lazy(() => import('../components/AudioPlayer'));

export default function TicTacToePage() {
    document.title = "Tic-Tac-Toe";
    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);

    const queryParams = new URLSearchParams(window.location.search);
    const show_scores = queryParams.get("show_scores")?.trim()?.toLowerCase() === 'true';

    const [dimensions, setDimensions] = useState(3); //to later have 4*4, 5*5, 6*6 ... games

    const [pastMoves, setPastMoves] = useState([]);

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

    const lastMove = React.useMemo(() => {
        return pastMoves[pastMoves.length - 1];
    }, [pastMoves]);

    const [finalState, setFinalState] = useState(null);

    const finalColor = React.useMemo(() => {
        if (finalState === resultWords.lose) return 'error';
        if (finalState === resultWords.win) return 'success';
        return 'warning';
    }, [finalState]);

    const dimensionOptions = React.useMemo(() => [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => ({ key: i.toString(), name: `${i}x${i} grid`, description: i > 6 ? 'create a 6-streak to win' : null })), []);

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
        } else if (show_scores) {
            const { boardScores } = AlekSpecial(board, playerOne, playerTwo, winningArrangements);
            setScoreBoard(boardScores);
        }
    }, [playerTurn]);

    return (<>
        {isLoggedIn && <NavMenu></NavMenu>}
        {!isLoggedIn && <Button
            css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
            onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></Button>}

        <CustomizedDropdown disabled={round > 1} optionsList={dimensionOptions} title="Grid" mountDirectly default_value="3" outerUpdater={a => setDimensions(parseInt(a))} showDisabledColor />
        <CustomButton onClick={reset}>Reset <i className="fa-solid fa-arrows-rotate" /></CustomButton>
        <br />
        {finalState && <Badge color={finalColor} >{finalState}</Badge>}
        <br />
        <TicTacToeGrid {...{dimensions, move, board, lastMove}} />
        {show_scores && <table
            className="tictactoe-grid" //table of scores
        >
            <tbody>
                {Array.from({ length: dimensions }, (_, i) => i).map(x => <tr key={x + '-row'}>
                    {Array.from({ length: dimensions }, (_, i) => i).map(y => <td
                        onClick={() => move((dimensions * x) + y, playerOne)}
                        key={y + '-cell'}
                        className={`cell ${lastMove === ((dimensions * x) + y) ? 'is-last-move' : ''}`}>{scoreBoard[(dimensions * x) + y]?.toFixed(2)}</td>)}
                </tr>)}
            </tbody>
        </table>}
        <h4 style={{ color: 'grey' }} > &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Round: {round}</h4>
        <div style={{ position: 'absolute', right: '10px', bottom: '10px' }} >
            {/* <Suspense fallback={<Loading />}>
                <AudioPlayer />
            </Suspense> */}
        </div>
    </>);

    /**
     * @function move - serves to move the human player (X) to a specific position
     * @param {Number} to_position destination for X
     * @param player = human player
     * @return {String|undefined} final result or nothing
     */
    function move(to_position, player) {
        console.log('called move');

        { //validation step
            if (finalState) { console.error(`Game already ended as "${finalState}"`); return; }

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

        setPastMoves(pastMoves.concat(to_position));

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
        } else {
            toggleTurn();
        }
    };

    function reset() {
        console.log('called reset');
        setPastMoves([]);
        setRound(1);
        setBoard(boardStart);
        setScoreBoard([]);
        setFinalState(null);
        setPlayerTurn(playerOne);
    };

};