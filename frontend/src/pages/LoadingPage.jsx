import { useState, useEffect, useContext } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import './stylesheets/LoadingPage.css';

import { CustomButton } from '../fields/CustomButton';

export default function LoadingPage() {
    
    const [potentiallyStuck, setPotentiallyStuck] = useState(false);
    const { setIsLoggedIn } = useContext(IsLoggedInContext);

    useEffect(() => {
        setTimeout(() => {
            setPotentiallyStuck(true);
        }, 10000) //after 10 seconds, show option to log out
    });

    return (<div className="loading-page-body">
        <h1 className="loading-page-text" data-text="Loading..." >Loading...</h1>
        <CustomButton onClick={() => window.history.go(-1)} > <i className="fa-solid fa-backward"></i> &nbsp;Back</CustomButton>
        {potentiallyStuck && <>
            <CustomButton onClick={() => { setIsLoggedIn(false); localStorage.removeItem('access_token'); window.location.replace('/login');}} > Stuck? Click here to sign-out </CustomButton>
        </> }
    </div>);
}