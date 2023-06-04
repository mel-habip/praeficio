import { useState, useContext, useEffect } from 'react';

import './stylesheets/ServiceDesk.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

export default function ServiceDesk() {
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);


    if (!user?.use_beta_features) {
        return (
            <>
                <NavMenu />
                <h1>SERVICE DESK HERE</h1>
                <h2>
                    <i className="fa-solid fa-headset"></i>
                    <i className="fa-solid fa-headset"></i>
                    <i className="fa-solid fa-headset"></i>
                </h2>
                <h3>coming soon to a theater near you! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
            </>
        );
    }

    return ( //the actual page details would go here
        <>
            <NavMenu />
            <h1>SERVICE DESK HERE</h1>
            <h2>
                <i className="fa-solid fa-headset"></i>
                <i className="fa-solid fa-headset"></i>
                <i className="fa-solid fa-headset"></i>
            </h2>
            <h3>coming soon to a theater near you! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    );
}