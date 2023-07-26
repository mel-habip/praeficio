import './ScrollingText.css';
import { useEffect, useState } from 'react';

export default function ScrollingText({ words = [], fadeInterval = 1800, minWidth = '100px' }) {

    //animation source --> https://bionicjulia.com/blog/creating-react-component-fades-changing-words 
    const [fadeProp, setFadeProp] = useState('fade-in');
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const fadeTimeout = setInterval(() => {
            setFadeProp(fadeProp === 'fade-in' ? 'fade-out' : 'fade-in');
        }, fadeInterval);

        return () => clearInterval(fadeTimeout)
    }, [fadeProp]);

    useEffect(() => {
        const wordChangeTimeout = setInterval(() => {
            setWordIndex(p => !!words[p + 1] ? p + 1 : 0);
        }, fadeInterval * 2)

        return () => clearInterval(wordChangeTimeout)
    }, []);

    return (
        <div className="carousel-underline-section" style={{ minWidth }}>
            <span className={`carousel-text carousel-style-${wordIndex} ${fadeProp}`}>{words[wordIndex]}</span>
            <span className="line" />
        </div>
    );
}