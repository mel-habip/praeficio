import React, { useState, useContext, useEffect, lazy, Suspense } from 'react';
import ThemeContext from '../contexts/ThemeContext';

import TicTacToeUtils from './TicTacToeUtils';
import './stylesheets/TicTacToePage.css';


import { CustomButton } from '../fields/CustomButton';

const { AlekSpecial, generateWinningCombinations, resultWords, winning, playerOne, playerTwo, TicTacToeGrid } = TicTacToeUtils;
const NavMenu = lazy(() => import('../components/NavMenu'));


export default function SuperTictacToe() {
    document.title = "SUPER Tic-Tac-Toe";
    const { isDark, toggleTheme } = useContext(ThemeContext);

    const [innerDimensions, setInnerDimenstions] = useState(3); //to later have 4*4, 5*5, 6*6 ... games
    const [outerDimensions, setOuterDimenstions] = useState(3); //to later have 4*4, 5*5, 6*6 ... games

    const [pastMoves, setPastMoves] = useState([]);

    const boardStart = React.useMemo(() => {
        return Array.from({ length: innerDimensions * innerDimensions }, (_, i) => '');
    }, [innerDimensions]);

    const [board, setBoard] = useState([]);
    const [scoreBoard, setScoreBoard] = useState([]);

    useEffect(() => {
        setBoard(boardStart);
    }, [boardStart]);


    return <>
        <NavMenu />
        <CustomButton onClick={reset}>Reset <i className="fa-solid fa-arrows-rotate" /></CustomButton>
    </>


    function reset() {
        console.log('called reset');
        setPastMoves([]);
        setBoard(boardStart);
        setScoreBoard([]);
    };


}