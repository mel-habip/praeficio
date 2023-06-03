//URL here is like `/voting_session/${voting_session_id}/vote/${voter_key}`

import { useState, useContext, useEffect, useMemo } from 'react';

import ThemeContext from '../../contexts/ThemeContext';

import axios from 'axios';

import { useParams } from 'react-router-dom';

import { Button, Input, Loading, Checkbox } from '@nextui-org/react';

import CustomizedDropdown from '../../fields/CustomizedDropdown';
import NumberField from '../../fields/NumberField';

export default function SpecificVoterPage() {

    const { voting_session_id, voter_key } = useParams();

    const [votingSessionDetails, setVotingSessionDetails] = useState(null);

    const [votedAlready, setVotedAlready] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/voter_key/${voter_key}`).then(response => {
            if (response.status === 200) {
                setVotingSessionDetails(response.data ?? {});
            } else {
                console.log('fetch', response);
            }
        }).catch(err => {
            if (err.data?.error_part === 'is_completed') {
                window.location = '/voting_completed';
            } else {
                console.error(err)
            }
        });
    }, []);


    if (!votingSessionDetails) return <Loading size='xl' />

    if (votingSessionDetails.method === 'single') {
        return (<>
            <SingleVoteFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'multiple_votes') {
        return (<>
            <MultipleVotesFields options={votingSessionDetails.options} number_of_votes={votingSessionDetails.number_of_votes} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'approval') {
        return (<>
            <ApprovalStyleFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} />
        </>);
    }

    return (<>


    </>);

    function submit(selections = []) {
        axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/vote/`, {
            voter_key,
            selections,
        }).then(response => {
            if (response.status === 201) {
                setVotedAlready(true);
            } else {
                console.log('vote', response);
            }
        })
    }
}

function SingleVoteFields({ options, submit_func }) {

    const [selection, setSelection] = useState('');

    const formattedOptions = useMemo(() => {
        return options.map(opt => ({
            key: opt,
            label: opt,
        }))
    }, [options]);

    return (<>
        <h2>Please select the option you wish to support</h2>

        <CustomizedDropdown options={formattedOptions} mountDirectly outerUpdater={setSelection} />


        <Button color="success" disabled={!selection} onClick={() => submit_func([selection])}> Submit my vote</Button>
    </>);

}

function MultipleVotesFields({ options, number_of_votes, submit_func }) {
    const [rawSelections, setRawSelections] = useState({});

    const formattedSelections = useMemo(() => {
        const ar = [];

        Object.entries(rawSelections).forEach(([option, times]) => {
            for (let i = 0; i <= times; i++) {
                ar.push(option);
            }
        });

        return ar;
    }, [rawSelections]);

    const remainingVotes = useMemo(() => {
        return number_of_votes - formattedSelections.length;
    }, [number_of_votes, formattedSelections]);

    return (<>
        <h2>Please distribute your {number_of_votes} votes amongst the options below </h2>

        {options.map((opt, ind) =>
            <>
                <p key={ind + '-display'}>{opt}</p>
                <NumberField min={0} max={number_of_votes} key={ind + '-field'} outer_updater={v => setRawSelections(prev => ({ ...prev, [opt]: v }))} >{opt}</NumberField>
            </>
        )}

        <h4>Remaining Votes: {remainingVotes}</h4>


        <Button color="success" disabled={formattedSelections.length > number_of_votes} onClick={() => submit_func(formattedSelections)}> Submit my vote</Button>
    </>);
}

function ApprovalStyleFields({ options, submit_func }) {

    const [rawSelections, setRawSelections] = useState({});

    function selectionFormatter(rawSelections) {
        return Object.keys(rawSelections).filter(key => rawSelections[key]);
    }

    return (<>
        <h2>Please select all of the options you wish to support</h2>
        {options.map((opt, ind) => <Checkbox key={ind} onChange={v => setRawSelections(prev => ({ ...prev, [opt]: v }))} >{opt}</Checkbox>)}

        <Button color="success" onClick={() => submit_func(selectionFormatter(rawSelections))}> Submit my vote</Button>
    </>);
}

