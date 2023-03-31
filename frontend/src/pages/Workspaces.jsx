import React, { useState, useContext, useEffect } from 'react';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import { Button, Modal, Spacer, Text, Input, Tooltip, Row, Table, Textarea, useAsyncList, useCollator, Loading, Badge, Dropdown } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import UserSearchModal from '../components/UserSearchModal';

export default function Workspaces() {

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    useEffect(() => { }, []); //fetch user's workspaces

    if (!user.use_beta_features) return (
        <>
            <NavMenu ></NavMenu>
            <h1>WORKSPACES PAGE HERE</h1>
            <h2>
                <i className="fa-regular fa-building"></i>&nbsp;
                <i className="fa-regular fa-building"></i>&nbsp;
                <i className="fa-regular fa-building"></i>
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    );

    return (
        <>
            <NavMenu ></NavMenu>
            <Button shadow onClick={() => true} > New Workspace </Button>
        </>
    );
}

