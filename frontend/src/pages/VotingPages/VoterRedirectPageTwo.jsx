//this is the page for people with the voting_session_id but not the voter_key provided

import { useState } from 'react';
import { useParams } from 'react-router-dom'

import { Link } from 'react-router-dom';
import NavMenu from '../../components/NavMenu';

import { Button, Input } from '@nextui-org/react';

export default function VoterRedirectPageTwo() {

    const [voterKey, setVoterKey] = useState('');
    const { voting_session_id } = useParams();

    return (<>
        <NavMenu />
        <h2>You need a Voter Key to vote in Voting Session #{voting_session_id}</h2>
        <br />
        <Input color="primary" underlined clearable labelPlaceholder='Voter Key' onChange={e => setVoterKey(e.target.value)}></Input>
        <br />
        <Link to={`/voting_sessions/${voting_session_id}/vote/${voterKey}`}>
            <Button shadow >Take me there!</Button>
        </Link>
    </>);
}