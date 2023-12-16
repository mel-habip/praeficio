import { useState, useEffect, useRef, useCallback, useContext } from 'react';

import '../stylesheets/Newsletters.css';
import IsLoggedInContext from '../../contexts/IsLoggedInContext';
import ThemeContext from '../../contexts/ThemeContext';

import axios from 'axios';

import NavMenu from '../../components/NavMenu';

import { CustomButton } from '../../fields/CustomButton';
import { Grid, Loading, Button } from '@nextui-org/react';

import LoadingPage from '../LoadingPage';

import toUniqueArray from '../../utils/toUniqueArray';

import NewsLetterCard from '../../components/NewsLetterCard.jsx';

export default function Newsletters() {
    document.title = "Newsletter";

    const [newsletterArticleList, setNewsletterArticleList] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);

    useEffect(() => { //main fetcher on load
        setIsLoading(true);
        console.log(`Loading page #${pageNumber}`);
        axios.get(`/newsletters?size=25&page=${pageNumber}`).then(response => {
            setNewsletterArticleList(prevList => toUniqueArray([...(prevList || []), ...response.data.data], 'newsletter_id'));
            setHasMore(response.data.has_more);
            setIsLoading(false);
        }).catch(e => { setIsLoading(false); console.error(e); });
    }, [pageNumber]);

    const observer = useRef();

    const lastNewsLetterArticleRef = useCallback(node => {
        if (isLoading) return; //we don't want to trigger it while loading
        if (observer.current) observer.current.disconnect(); //severs the last reference I guess?
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) { //we check hasMore so that we don't try to render extra when there aren't any left
                setPageNumber(pageNumber + 1);
            }
        });
        if (node) observer.current.observe(node);
    });

    if (!newsletterArticleList) { return (<LoadingPage />); }

    return (
        <>
            {isLoggedIn ? <NavMenu /> : <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></Button>}
            <h1>Newsletters</h1>
            <CustomButton style={{ position: 'absolute', right: '15px', top: '15px' }} to="/newsletters/admin" >Admin Portal <i className="fa-solid fa-angles-right" /></CustomButton>
            <Grid.Container justify="center" gap={2}>
                {newsletterArticleList.map(({ newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content }, index) =>
                    <Grid key={index + '-card'} css={{margin:'10px'}} >
                        <NewsLetterCard  {...{ lastNewsLetterArticleRef: (newsletterArticleList.length === index + 1) ? lastNewsLetterArticleRef : undefined, newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content, index }} />
                    </Grid>
                )}
            </Grid.Container>
            {isLoading && <Loading />}
        </>
    )
};
