//this is the page for people with neither the voting_session_id nor the key provided

import { useState, useContext } from 'react';

import { Link } from 'react-router-dom';

import ThemeContext from '../../contexts/ThemeContext';

import { Button, Input } from '@nextui-org/react';

export default function VoterRedirectPageOne() {

    const [votingSessionId, setVotingSessionId] = useState('');
    const [voterKey, setVoterKey] = useState('');

    return (<>
        <Input labelPlaceholder='Election ID' onChange={e => setVotingSessionId(e.target.value)}></Input>
        <Input labelPlaceholder='Voter Key' onChange={e => setVoterKey(e.target.value)}></Input>
        <Link to={`/voting_session/${votingSessionId}/vote/${voterKey}`}>
            <Button>Take me there!</Button>
        </Link>
    </>);
}