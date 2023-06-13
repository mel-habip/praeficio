import { useState, useContext, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom'
import './stylesheets/SpecificUserProfilePage.css';

import NavMenu from '../components/NavMenu';
import { Button, Modal, Text, Row, Input } from '@nextui-org/react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import useHandleError from '../utils/handleError';

export default function SpecificUserProfilePage() {
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const { user_id } = useParams();

    const already_added = useMemo(() => !!user?.friendships?.find(frnd => [frnd.user_1_id, frnd.user_2_id].includes(parseInt(user_id))), [user?.friendships, user_id]);

    //validate their discovery token

    if (user?.id && user?.id === parseInt(user_id)) {
        return (
            <>
                <NavMenu />
                <UserSelfPage details={user} />
            </>
        );
    }

    return (
        <>
            <NavMenu />
            <OtherUserPage user_id={parseInt(user_id)} already_added={already_added} />
        </>
    );
}

//if looking at themselves
function UserSelfPage({ details }) {

    return (<>
        <h1>{details?.username || <em>Not provided.</em>}</h1>
        <p>First Name: {details?.first_name || <em>Not provided.</em>}</p>
        <p>Last Name: {details?.last_name || <em>Not provided.</em>}</p>
        <p>Email: {details?.email || <em>Not provided.</em>}</p>
        <p>Member Since: {details?.created_on?.slice(0, 10) || <em>Not provided.</em>}</p>

        <CustomButton>Settings</CustomButton>

        <div className="profile-sections-wrapper" >
            <div className="profile-section">
                <h4>Control Panel</h4>
                <CustomButton>Renew Discovery Token</CustomButton>

                <p>Discovery Token: {details?.discovery_token || <em>Not provided.</em>}</p>
                <p><Link>Your link</Link></p>

            </div>
            <div className="profile-section">
                <h4>Your Workspaces</h4>
                {!details.workspaces?.length ? <em>None yet, Join one now!</em> : details.workspaces.map(ws => <p key={ws.workspace_id}>{ws.name || 'asd'}</p>)}
            </div>

            <div className="profile-section">
                <h4>Your Feedback Logs</h4>
                {!details.feedback_logs?.length ? <em>None yet, create one now!</em> : details.feedback_logs.map(ws => <p key={ws.feedback_log_id}>{ws.name || 'asd'}</p>)}
            </div>

            <div className="profile-section">
                <h4>Your Friends</h4>
                {!details.friendships?.length ? <em>None yet</em> : details.friendships.map((frnd, x) => <p key={x}>{frnd.user_1_username === details.username ? frnd.user_2_username : frnd.user_1_username}</p>)}
            </div>

            <div className="profile-section">
                <h4>Your Debt Accounts</h4>
                {!details.debt_accounts?.length ? <em>None yet</em> : details.debt_accounts.map((frnd, x) => <p key={x}>{frnd.user_1_username === details.username ? frnd.user_2_username : frnd.user_1_username}</p>)}
            </div>

            <div className="profile-section">
                <h4>Your To-Do Categories</h4>
                {!details.to_do_categories?.length ? <em>None yet, customize them now!</em> : details.to_do_categories.map((cat, x) => <p key={x}>{cat || 'asd'}</p>)}
            </div>
        </div>

    </>);
};

//looking at a user that is not themselves
function OtherUserPage({ already_added = false, user_id }) {
    const queryParams = new URLSearchParams(window.location.search);
    const discovery_token = queryParams.get("discovery_token") || queryParams.get("discovery-token");
    const handleError = useHandleError();

    const [token, setToken] = useState(discovery_token || null);

    const [viewedUserDetails, setViewedUserDetails] = useState(null);


    useEffect(() => {
        if (!token && !already_added) return;
        axios.get(`${process.env.REACT_APP_API_LINK}/users/${user_id}?discovery_token=${token}`).then(response => {
            if (response.status === 200) {
                setViewedUserDetails(response.data);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
    }, [user_id, token]);



    return (<>
        {!token && !already_added && <DiscoveryTokenEntryModal setToken={setToken} />}

        {already_added ? <CustomButton disabled >Added ✔️</CustomButton> : <CustomButton onClick={() => {
            axios.post(`${process.env.REACT_APP_API_LINK}/friendships`, {
                user_id,
                discovery_token: token
            }).then(response => {
                if (response.status === 201) {
                    already_added = true
                } else {
                    console.warn('fetch', response);
                }
            }).catch(handleError);
        }}  >Add Friend</CustomButton>}

        <h1>{viewedUserDetails?.username || <em>Not provided.</em>}</h1>
        <p>First Name: {viewedUserDetails?.first_name || <em>Not provided.</em>}</p>
        <p>Last Name: {viewedUserDetails?.last_name || <em>Not provided.</em>}</p>
        <p>Member Since: {viewedUserDetails?.created_on?.slice(0, 10) || <em>Not provided.</em>}</p>
    </>)


};

function DiscoveryTokenEntryModal({ setToken }) {
    const [innerToken, setInnerToken] = useState(null);
    const [errors, setErrors] = useState({});

    return (
        <Modal css={{ 'background-color': '#0d0d0d' }} preventClose blur aria-labelledby="modal-title" open={true} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={18} > Accessing this profile requires a discovery token</Text>
            </Modal.Header>
            <Modal.Body>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (errors.invalid) return;
                        setToken(innerToken);
                        window.location.replace(window.location.pathname + `?discovery_token=${innerToken}`);
                    }}
                >
                    <Input
                        css={{ marginTop: '15px !important' }}
                        fullWidth
                        name='discovery-token'
                        onChange={e => setInnerToken(e.target.value)}
                        underlined
                        required
                        color="primary"
                        helperColor='error'
                        helperText={errors.invalid ? 'Invalid' : ''}
                        clearable
                        labelPlaceholder='Discovery Token' />
                    <Button
                        css={{ maxWidth: '200px', ml: 'auto', mr: 'auto', mt: '10px' }}
                        auto
                        type="submit"
                        shadow
                        color="success"
                        onPress={() => {
                            if (innerToken.length < 6) {
                                setErrors({ invalid: true });
                            } else {
                                setErrors({});
                            }
                        }}> Submit&nbsp;<i className="fa-regular fa-paper-plane" />
                    </Button>
                </form>
            </Modal.Body>
        </Modal>);
}