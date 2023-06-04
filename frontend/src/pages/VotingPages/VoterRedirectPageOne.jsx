//this is the page for people with neither the voting_session_id nor the key provided

import { useState } from 'react';

import { Link } from 'react-router-dom';
import NavMenu from '../../components/NavMenu';

import { Button, Input } from '@nextui-org/react';

export default function VoterRedirectPageOne() {

    const [votingSessionId, setVotingSessionId] = useState('');
    const [voterKey, setVoterKey] = useState('');

    return (<>
        <NavMenu />
        <Input color="primary" underlined clearable labelPlaceholder='Voting Session ID' onChange={e => setVotingSessionId(e.target.value)}></Input>
        <br />
        <Input color="primary" underlined clearable labelPlaceholder='Voter Key' onChange={e => setVoterKey(e.target.value)}></Input>
        <br />
        <Link to={`/voting_sessions/${votingSessionId}/vote/${voterKey}`}>
            <Button shadow >Take me there!</Button>
        </Link>
    </>);
}