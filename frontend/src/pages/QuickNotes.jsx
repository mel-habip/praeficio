import { useContext, useState } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import { Button, Textarea } from '@nextui-org/react';

import NavMenu from '../components/NavMenu';

function Alerts() {
    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);

    const [noteValue, setNoteValue] = useState('');

    return (
        <>
            {isLoggedIn && <NavMenu></NavMenu>}
            {!isLoggedIn && <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>}
            <Textarea
                labelPlaceholder='Your question'
                bordered
                width="90%"
                color='primary'
                value={localStorage.getItem(`praeficio-note-q1`)}
                onChange={e => setNoteValue(e.target.value) || localStorage.setItem(`praeficio-note-q1`, e.target.value)}
                minRows={1} maxRows={1} />
            <br />
            <br />
            <Textarea
                labelPlaceholder='Your Notes'
                bordered
                width="90%"
                helperText='values you enter are only saved on your local device'
                color='primary'
                helperColor='primary'
                value={localStorage.getItem(`praeficio-note-a1`)}
                onChange={e => setNoteValue(e.target.value) || localStorage.setItem(`praeficio-note-a1`, e.target.value)}
                minRows={15} />
        </>
    )
}

export default Alerts;
