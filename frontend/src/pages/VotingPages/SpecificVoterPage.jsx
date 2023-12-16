//URL here is like `/voting_session/${voting_session_id}/vote/${voter_key}`

import { useState, useEffect, useMemo, useContext } from 'react';

import AnimatedCheckmark from '../../components/AnimatedCheckmark';

import LanguageContext from '../../contexts/LanguageContext';

import NavMenu from '../../components/NavMenu';

import axios from 'axios';

import { useParams } from 'react-router-dom';

import { Button, Loading, Checkbox } from '@nextui-org/react';

import CustomizedDropdown from '../../fields/CustomizedDropdown';
import NumberField from '../../fields/NumberField';
import CustomButton from '../../fields/CustomButton';
import AnimatedText from '../../components/AnimatedText.jsx';

const dictionary = {
    contact_rep: {
        en: 'Contact your representative for further details.',
        fr: 'Contactez votre représentant pour plus de détails.'
    },
    thank_you_1: {
        en: 'Thank you & have a great day!',
        fr: 'Merci & bonne journée!'
    },
    thank_you_2: {
        en: 'Thank you for taking part in this voting session & have a great day!',
        fr: `Merci d'avoir participé à cette séance de vote et bonne journée !`
    },
    removed: {
        en: 'Your vote has been removed.',
        fr: 'Votre vote a été annulé.'
    },
    invalid_details: {
        en: 'Invalid Session Details. Please contact your representative.',
        fr: 'Détails de la session non valides. Veuillez contacter votre représentant.'
    },
    single_select: {
        en: 'Please select the option you wish to support',
        fr: `Veuillez sélectionner l'option que vous souhaitez prendre en charge`
    },
    single_select_1: {
        en: 'Your selection',
        fr: 'Votre sélection'
    },
    your_ip: {
        en: 'Your IP',
        fr: 'Votre adresse IP'
    },
    approval_select: {
        en: 'Please select all of the options you wish to support',
        fr: 'Veuillez sélectionner toutes les options que vous souhaitez prendre en charge'
    },
    multi_select_1: {
        en: 'Please distribute your',
        fr: 'Veuillez répartir vos'
    },
    multi_select_2: {
        en: 'votes amongst the options below',
        fr: 'votes parmi les options ci-dessous'
    },
    submit: {
        en: 'Submit my vote',
        fr: 'Votez'
    },
    number_of_selections: {
        en: 'Number of selections:',
        fr: 'Nombre de sélections :'
    },
    remaining_votes: {
        en: 'Remaining Votes:',
        fr: 'Voix restantes :'
    },
    vote_elsewhere: {
        en: 'Vote in another session',
        fr: 'Voter dans une autre session'
    },
    vote_success: {
        en: 'Your vote has been successfully saved.',
        fr: 'Votre vote a été enregistré avec succès.'
    },
    delete: {
        en: 'Delete my vote',
        fr: 'Annuler mon vote'
    },
    edit: {
        en: 'Edit my vote',
        fr: 'Modifier mon vote'
    }
};

export default function SpecificVoterPage() {

    const { language, toggleLanguage } = useContext(LanguageContext);

    const { voting_session_id, voter_key } = useParams();

    const [votingSessionDetails, setVotingSessionDetails] = useState(null);

    const [votedAlready, setVotedAlready] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const [voteDeleted, setVoteDeleted] = useState(false);

    useEffect(() => {
        axios.get(`/voting_sessions/${voting_session_id}/vote/${voter_key}`).then(response => {
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

    const RightUpperCorner = () => <div style={{ position: 'absolute', top: '10%', right: '5%' }}>
        {!!votingSessionDetails.voter_ip_address ? <h5 >{dictionary.your_ip[language]}: {votingSessionDetails.voter_ip_address}</h5> : <></>}
    </div>

    if (errorMessage) {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner />
            <div>
                <h3 style={{ color: 'red' }} >{errorMessage}</h3>
                <br />
                <h5>{dictionary.contact_rep[language]}</h5>
            </div>
        </>);
    }

    if (voteDeleted) {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner />
            <div>
                <AnimatedText text={dictionary.removed[language]} />
                <br />
                <h3>{dictionary.thank_you_1[language]}</h3>
                <CustomButton to={`/vote`} > {dictionary.vote_elsewhere[language]} <i className="fa-solid fa-check-to-slot" /></CustomButton>
            </div>
        </>);
    };

    if (votedAlready) {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner />
            <div>
                <h2>{dictionary.vote_success[language]}</h2>
                <AnimatedCheckmark />
                <br />
                <h3>{dictionary.thank_you_2[language]}</h3>
                <CustomButton onClick={() => {
                    setVotedAlready(false);
                }} > {dictionary.edit[language]} <i className="fa-regular fa-pen-to-square" /> </CustomButton>
                <CustomButton onClick={() => {
                    axios.delete(`/voting_sessions/${voting_session_id}/vote/${votingSessionDetails.vote_id}`).then(response => {
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
                }} > {dictionary.delete[language]} <i className="fa-solid fa-trash-can" /> </CustomButton>
            </div>
        </>);
    }

    if (!votingSessionDetails) return <Loading size='xl' />

    if (votingSessionDetails.method === 'simple') {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner />
            <SingleVoteFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'multiple_votes') {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner show_language_button_externally />
            <MultipleVotesFields options={votingSessionDetails.options} number_of_votes={votingSessionDetails.number_of_votes} submit_func={selections => submit(selections)} />
        </>);
    }

    if (votingSessionDetails.method === 'approval') {
        return (<>
            <NavMenu show_language_button_externally />
            <RightUpperCorner />
            <ApprovalStyleFields options={votingSessionDetails.options} submit_func={selections => submit(selections)} number_of_votes={votingSessionDetails.number_of_votes} />
        </>);
    }

    return (<>
        <NavMenu show_language_button_externally />
        <RightUpperCorner />
        <CustomButton
            onClick={toggleLanguage}
            style={{ textTransform: 'uppercase', position: 'absolute', top: '5%', right: '5%' }}
        >  {language}  <i className="fa-solid fa-arrows-spin" /></CustomButton>
        <div>
            <h3 style={{ color: 'red' }} >{dictionary.invalid_details[language]}</h3>
        </div>
    </>);

    function submit(selections = []) {

        if (votingSessionDetails.vote_id) {
            axios.put(`/voting_sessions/${voting_session_id}/vote/${votingSessionDetails.vote_id}`, {
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
            axios.post(`/voting_sessions/${voting_session_id}/vote/`, {
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
    const { language } = useContext(LanguageContext);

    const [selection, setSelection] = useState('');

    const formattedOptions = useMemo(() => {
        return options.map(opt => ({
            key: opt,
            name: opt,
        }))
    }, [options]);

    return (<>
        <h3>{dictionary.single_select[language]}</h3>

        <CustomizedDropdown title={dictionary.single_select_1[language]} optionsList={formattedOptions} mountDirectly outerUpdater={setSelection} />

        <br />

        <Button shadow color="success" disabled={!selection} onPress={() => submit_func([selection])}>{dictionary.submit[language]}</Button>
    </>);

}

function MultipleVotesFields({ options, number_of_votes, submit_func }) {
    const { language } = useContext(LanguageContext);

    const [rawSelections, setRawSelections] = useState({});

    const formattedSelections = useMemo(() => {
        const ar = [];

        Object.entries(rawSelections).forEach(([option, times]) => {
            for (let i = 0; i < times; i++) {
                ar.push(option);
            }
        });

        return ar;
    }, [rawSelections]);

    const remainingVotes = useMemo(() => {
        return number_of_votes - formattedSelections.length;
    }, [number_of_votes, formattedSelections]);

    return (<>
        <h2>{dictionary.multi_select_1[language]} {number_of_votes} {dictionary.multi_select_2[language]}</h2>

        {options.map((opt, ind) =>
            <>
                <p key={ind + '-display'}>{opt}</p>
                <NumberField default_value={0} min={0} max={number_of_votes} key={ind + '-field'} outer_updater={v => setRawSelections(prev => ({ ...prev, [opt]: v }))} >{opt}</NumberField>
            </>
        )}

        <h4>{dictionary.remaining_votes[language]} {remainingVotes}</h4>

        <br />
        <Button shadow color="success" disabled={formattedSelections.length > number_of_votes} onPress={() => submit_func(formattedSelections)}>{dictionary.submit[language]}</Button>
    </>);
}

function ApprovalStyleFields({ options, number_of_votes = Infinity, submit_func }) {
    const { language } = useContext(LanguageContext);

    const [rawSelections, setRawSelections] = useState({});

    const formattedSelections = useMemo(() => {
        return Object.keys(rawSelections).filter(key => rawSelections[key]);
    }, [rawSelections]);

    return (<>
        <h2>{dictionary.approval_select[language]}</h2>
        {options.map((opt, ind) => <Checkbox key={ind} onChange={v => setRawSelections(prev => ({ ...prev, [opt]: v }))} >{opt}</Checkbox>)}

        <br />
        {number_of_votes !== Infinity && <p>{dictionary.number_of_selections[language]} {formattedSelections.length}/{number_of_votes}</p>}
        <Button
            disabled={formattedSelections.length > number_of_votes}
            shadow color="success"
            onPress={() => submit_func(formattedSelections)}>{dictionary.submit[language]}</Button>
    </>);
}

