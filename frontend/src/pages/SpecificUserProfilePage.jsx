import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import './stylesheets/ServiceDesk.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

export default function SpecificUserProfilePage() {
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const { user_id } = useParams();

    //validate their discovery token

    if (user?.id && user?.id === user_id) { //if user is looking at their own profile
        return (
            <>
                <NavMenu />
                <UserSelfPage details={user} />
            </>
        );
    }

    return ( //user is looking at someone else's profile
        <>
            <NavMenu />
            <OtherUserPage />
        </>
    );
}

//if looking at themselves
function UserSelfPage({ details }) {

    return (<>
        <h1>{details?.username}</h1>
        <h4>{details?.first_name}</h4>
        <h4>{details?.last_name}</h4>
        <h4>{details?.email}</h4>
    </>);
}

//looking at a user that is not themselves
function OtherUserPage({ details }) {
    const queryParams = new URLSearchParams(window.location.search);
    const discovery_token = queryParams.get("discovery_token") || queryParams.get("discovery-token");

    const [token, setToken] = useState(null);



    return (<>
        {/* {!token && <discoveryTokenEntryModal setToken={setToken} />} */}
        <CustomButton>Add Friend</CustomButton>
        <h1>{details?.username || 'Not provided.'}</h1>
        <p>First Name: {details?.first_name || 'Not provided.'}</p>
        <p>Last Name: {details?.last_name || 'Not provided.'}</p>
    </>)


}


function discoveryTokenEntryModal({ setToken }) {


    return (<>
    </>);
}