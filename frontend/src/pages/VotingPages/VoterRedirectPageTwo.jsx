//this is the page for people with the voting_session_id but not the voter_key provided

import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom'

import { Link } from 'react-router-dom';

import ThemeContext from '../../contexts/ThemeContext';

import { Button, Input } from '@nextui-org/react';

export default function VoterRedirectPageTwo() {

    const [voterKey, setVoterKey] = useState('');
    const { voting_session_id } = useParams();

    return (<>
        <h2>You need a Voter Key to vote in Election #{voting_session_id}</h2>
        <Input labelPlaceholder='Voter Key' onChange={e => setVoterKey(e.target.value)}></Input>
        <Link to={`/voting_session/${voting_session_id}/vote/${voterKey}`}>
            <Button>Take me there!</Button>
        </Link>
    </>);
}