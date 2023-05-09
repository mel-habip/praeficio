import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import { CustomButton } from '../fields/CustomButton';
import { Button, Modal, Spacer, Text, Badge, Card, Grid, Loading } from '@nextui-org/react';

import LoadingPage from './LoadingPage';

export default function NewslettersAdmin() {
    document.title = "Newsletter | Admin";

    const [newsletterArticleList, setNewsletterArticleList] = useState(null);

    // if (!newsletterArticleList) { return (<LoadingPage />); }

    return (
        <>
            <NavMenu />
            <h1>Newsletters Admin Portal</h1>
            <CustomButton to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
            <h2>
                <i className="fa-solid fa-user-tie" />
                <i className="fa-solid fa-user-tie" />
                <i className="fa-solid fa-user-tie" />
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    )
};
