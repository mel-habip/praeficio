import { useState, useEffect, useRef, useCallback } from 'react';

import axios from 'axios';

import NavMenu from '../components/NavMenu';

import { CustomButton } from '../fields/CustomButton';
import { Button, Modal, Spacer, Text, Badge, Card, Grid, Loading } from '@nextui-org/react';

import LoadingPage from './LoadingPage';

export default function Newsletters() {

    const [newsletterArticleList, setNewsletterArticleList] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { //main fetcher on load
        setIsLoading(true);
        console.log(`Loading page #${pageNumber}`);
        axios.get(`https://${process.env.REACT_APP_BUILD_ENV}.praeficio.com/newsletters?size=25&page=${pageNumber}`).then(response => {
            setNewsletterArticleList(prevList => [...(prevList || []), ...response.data.data]);
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
            <NavMenu />
            <h1>Newsletters</h1>
            <CustomButton to="/newsletters/admin" >Admin Portal <i className="fa-solid fa-angles-right" /></CustomButton>
            <Grid >
                {newsletterArticleList.map(({ newsletter_id, title, description, created_on, read_length, written_by, written_by_avatar, likes_count }, index) => <Card key={newsletter_id} ref={(newsletterArticleList.length === index + 1) ? lastNewsLetterArticleRef : undefined} >
                    <h3>{title}</h3>
                    <h2>{description}</h2>
                    <p>Created At: {created_on}</p>
                    <p>Written By: {written_by}</p>
                    <p>{likes_count}</p>
                    {written_by_avatar && <img src={written_by_avatar}></img>}
                    {read_length && <p>{read_length}-minute read</p>}
                </Card>)}
            </Grid>
            {isLoading && <Loading />}
        </>
    )
};
