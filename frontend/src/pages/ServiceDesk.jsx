import { useState, useContext, useEffect } from 'react';

import './stylesheets/ServiceDesk.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

export default function ServiceDesk() {
    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);


    if (!user?.use_beta_features) {
        return (
            <h1>Service Desk Coming Soon!</h1>
        );
    }

    return (
        <h1>Service Desk Coming Soon!</h1>
    );
}