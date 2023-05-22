import { useState, useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import WordListField from '../fields/WordList';
import NavMenu from '../components/NavMenu';
import { Button, Loading } from '@nextui-org/react';

export default function RandomizerPage() {

    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);


    const [options, setOptions] = useState([]);

    return (
        <>
            {isLoggedIn ? <NavMenu /> : <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></Button>}
            <WordListField style={{ maxWidth: '400px' }} onListChange={v => setOptions(v)}>Enter your values here and hit "Enter" to detect</WordListField>
            <br />
            <br />
            <br />
            <OptionsDisplay options={options} />
        </>
    );
}

/**
 * @param {Array<any>} Array an array of values one of which is to be chosen
 * @return {any} one of the provided values
 */
function pickRandomValue(Array) {
    const ranNum = Math.floor(Math.random() * Array.length);
    return Array[ranNum];
}


function OptionsDisplay({ options }) {
    const mainStyle = {
        padding: '15px',
        borderRadius: '0.7rem',
        border: '1px solid var(--text-primary)',
        margin: '10px',
    };

    const [highlightedOption, setHighlightedOption] = useState('');
    const [inProgress, setInProgress] = useState(false);

    const startAnimation = () => {
        setInProgress(true);
        let iteration = 0;
        const maxIterations = (Math.floor(Math.random() * options.length) + options.length) * 4; // Randomly determine the maximum number of iterations
        const animationDelay = 1000; // Delay between each option change (in milliseconds)
        const stopDelay = 10; // Delay before stopping the animation (in milliseconds)

        const animateOptions = () => {
            let randomIndex = Math.floor(Math.random() * options.length);

            if (highlightedOption === options.at(randomIndex)) {
                randomIndex--;
            }

            setHighlightedOption(options.at(randomIndex));

            iteration++;

            if (iteration < maxIterations) {
                setTimeout(animateOptions, animationDelay);
            } else {
                setTimeout(() => {
                    const finalIndex = Math.floor(Math.random() * options.length);
                    setHighlightedOption(options[finalIndex]);
                    console.log('DONE');
                    setInProgress(false);
                }, stopDelay);
            }
        };

        animateOptions();

    };

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
            }} >
                {options.map((item, index) => (
                    <div className="randomization-page-card" style={item === highlightedOption ? { boxShadow: '3px 8px 16px 9px #28CDFF', ...mainStyle } : mainStyle} key={index + '-item-for-randomization'} >
                        {item}
                    </div>
                ))}
            </div>
            {/* <p>Highlighted Option: {highlightedOption}</p> */}
            <Button onPress={startAnimation}>Start Animation</Button>
            {inProgress && <Loading />}
        </div>
    );
};