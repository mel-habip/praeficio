import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom'

import IsLoggedInContext from '../../contexts/IsLoggedInContext';
import ThemeContext from '../../contexts/ThemeContext';
import axios from 'axios';

import useHandleError from '../../utils/handleError';
import NavMenu from '../../components/NavMenu';
import timestampFormatter from '../../utils/timestampFormatter';
import NewsLetterCard from '../../components/NewsLetterCard.jsx';
import { Button } from '@nextui-org/react';


export default function SpecificNewsletterPage() {

    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { newsletter_id } = useParams();
    const handleError = useHandleError();

    const [newsletterDetails, setNewsletterDetails] = useState({});

    useEffect(() => { //main fetcher on load
        console.log(`Loading newsletter_id #${newsletter_id}`);
        axios.get(`${process.env.REACT_APP_API_LINK}/newsletters/${newsletter_id}`).then(response => {
            setNewsletterDetails(response.data);
        }).catch(handleError);
    }, []);

    return (<>
        {isLoggedIn ? <NavMenu /> : <Button
            css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
            onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></Button>}
        <div style={{ width: '50%' }} >
            <NewsLetterCard {...newsletterDetails} expanded />

        </div >
    </>);
}