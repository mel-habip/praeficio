import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import './stylesheets/ServiceDesk.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

export default function SpecificDebtAccountPage() {
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const { debt_account_id } = useParams();

    //validate that user belongs to this account or is dev_



    return ( //user is looking at someone else's profile
        <>
            <NavMenu />
            <h1>DEBT ACCOUNT PAGE HERE</h1>
            <h2>
                <i className="fa-solid fa-file-invoice-dollar" />
                <i className="fa-solid fa-file-invoice-dollar" />
                <i className="fa-solid fa-file-invoice-dollar" />
            </h2>
            <h3>coming soon to a theater near you! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    );
}