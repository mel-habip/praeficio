//URL here is like `/voting_session/${voting_session_id}/vote/${voter_key}`

import { useState, useEffect, useMemo } from 'react';

import AnimatedCheckmark from '../../components/AnimatedCheckmark';

import NavMenu from '../../components/NavMenu';

import axios from 'axios';

import { useParams } from 'react-router-dom';

import { Button, Input, Loading, Checkbox } from '@nextui-org/react';

import CustomizedDropdown from '../../fields/CustomizedDropdown';
import NumberField from '../../fields/NumberField';
import CustomButton from '../../fields/CustomButton';
import AnimatedText from '../../components/AnimatedText.jsx';

export default function SpecificVoterPage() {

    const { voting_session_id, voter_key } = useParams();

    const [votingSessionDetails, setVotingSessionDetails] = useState(null);

    const [votedAlready, setVotedAlready] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const [voteDeleted, setVoteDeleted] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/vote/${voter_key}`).then(response => {
            if (response.status === 200) {
                if (response.data.already_voted) setVotedAlready(true);
                setVotingSessionDetails(response.data ?? {});
            } else {
                console.log('fetch', response);
            }
        }).catch(err => {
            if (err?.response?.data?.error_part === 'is_completed') {
                window.location = '/voting_completed';
            } else if (err?.response?.data?.message) {
                setErrorMessage(err?.response?.data?.message);
            } else {
                console.error(err);
            }
        });
    }, []);

    if (errorMessage) {
        return (<>
            <NavMenu />
            <div>
                <h3 style={{ color: 'red' }} >{errorMessage}</h3>
                <br />
                <h5>Contact your representative for further details.</h5>
            </div>
        </>);
    }

    if (voteDeleted) {
        return (<>
            <NavMenu />
            <div>
                {/* <h2>Your vote has been successfully removed.</h2> */}
                <AnimatedText text="Your vote has been removed." />
                <br />
                <h3>Thank you & have a great day!</h3>
                <CustomButton to={`/vote`} > Vote in another session <i className="fa-solid fa-check-to-slot" /></CustomButton>
            </div>
        </>);
    };

    if (votedAlready) {
        return (<>
            <NavMenu />
            <div>
                <h2>Your vote has been successfully saved.</h2>
                <AnimatedCheckmark />
                <br />
                <h3>Thank you for taking part in this voting session & have a great day!</h3>
                <CustomButton onClick={() => {
                    setVotedAlready(false);
                }} > Edit My Vote <i className="fa-regular fa-pen-to-square" /> </CustomButton>
                <CustomButton onClick={() => {
                    axios.delete(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/vote/${votingSessionDetails.vote_id}`).then(response => {
                        if (response.status === 200) {
                            setVoteDeleted(true);
                        } else {
                            console.log('vote', response);
                        }
                    }).catch(err => {
                        if (err?.response?.data?.error_part === 'is_completed') {
                            window.location = '/voting_completed';
                        } else if (err?.response?.data?.message) {
                            setErrorMessage(err?.response?.data?.message);
                        } else {
                            console.error(err);
                        }
                    });
                }} > Delete My Vote <i className="fa-solid fa-trash-can" /> </CustomButton>
            </div>
        </>);
    }

    if (!votingSessionDetails) return <Loading size='xl' />

    const MyIpLine = () => !!votingSessionDetails.voter_ip_address ? <h5 style={{ position: 'absolute', top: '5%', right: '5%' }} >Your IP: {votingSessionDetails.voter_ip_address}</h5> : <></>

    if (votingSessionDetails.method === 'simple') {
        return (<>
            <NavMenu />
            <MyIpLine />
            <SingleVoteFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'multiple_votes') {
        return (<>
            <NavMenu />
            <MyIpLine />
            <MultipleVotesFields options={votingSessionDetails.options} number_of_votes={votingSessionDetails.number_of_votes} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'approval') {
        return (<>
            <NavMenu />
            <MyIpLine />
            <ApprovalStyleFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} />
        </>);
    }

    return (<>
        <NavMenu />
        <div>
            <h3 style={{ color: 'red' }} >Invalid Session Details. Please contact your representative.</h3>
        </div>
    </>);

    function submit(selections = []) {

        if (votingSessionDetails.vote_id) {
            axios.put(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/vote/${votingSessionDetails.vote_id}`, {
                voter_key,
                selections,
            }).then(response => {
                if (response.status === 200) {
                    setVotedAlready(true);
                } else {
                    console.log('vote', response);
                }
            })
        } else {
            axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/vote/`, {
                voter_key,
                selections,
            }).then(response => {
                if (response.status === 201) {
                    setVotedAlready(true);
                    setVotingSessionDetails(prev => ({ ...prev, already_voted: true, vote_id: response.data.vote_id }))
                } else {
                    console.log('vote', response);
                }
            })
        }
    }
}

function SingleVoteFields({ options, submit_func }) {

    const [selection, setSelection] = useState('');

    const formattedOptions = useMemo(() => {
        return options.map(opt => ({
            key: opt,
            name: opt,
        }))
    }, [options]);

    return (<>
        <h3>Please select the option you wish to support</h3>

        <CustomizedDropdown optionsList={formattedOptions} mountDirectly outerUpdater={setSelection} />

        <br />

        <Button shadow color="success" disabled={!selection} onClick={() => submit_func([selection])}> Submit my vote</Button>
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

        <br />
        <Button shadow color="success" disabled={formattedSelections.length > number_of_votes} onClick={() => submit_func(formattedSelections)}> Submit my vote</Button>
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

        <br />
        <Button shadow color="success" onClick={() => submit_func(selectionFormatter(rawSelections))}> Submit my vote</Button>
    </>);
}

