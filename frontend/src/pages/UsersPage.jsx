import { useState, useMemo, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import NavMenu from '../components/NavMenu';
import LanguageContext from '../contexts/LanguageContext';

import './stylesheets/UsersPage.css';

import { Button, Loading, Input, Card, Progress, Spacer, Text } from '@nextui-org/react';
import { CustomButton } from '../fields/CustomButton';

const dictionary = {
    page_1_header: {
        en: 'Use the search fields below to find a user & add them as a friend!',
        fr: `Utilisez les champs de recherche ci-dessous pour trouver un utilisateur et l'ajouter en tant qu'ami !`
    },
    next: {
        en: 'Next',
        fr: 'Suivante'
    },
    previous: {
        en: 'Previous',
        fr: 'Précédente'
    },
    page_2_line_1: {
        en: 'Fetching users...',
        fr: `Récupération des profils...`
    },
    page_2_line_2: {
        en: 'Please hang tight!',
        fr: `S'il vous plaît accrochez-vous!`
    },
    username_or_id: {
        en: "Username or User ID",
        fr: 'Nom ou identifiant du profil'
    },
    discovery_token: {
        en: 'Discovery Token',
        fr: 'Jeton de découverte'
    },
    page_3_no_match: {
        en: 'No Match Found.',
        fr: 'Pas de résultat trouvé.'
    },
    page_3_one_match: {
        en: 'Match Found!',
        fr: 'Résultat trouvé !'
    },
    page_3_many_match: {
        en: 'Multiple Matches Found!',
        fr: 'Plusieurs résultats trouvés !'
    },
    member_since: {
        en: 'Member Since',
        fr: 'Membre depuis'
    },
    page_3_update: {
        en: 'Go back & update your search',
        fr: 'Revenir en arrière & mettre à jour votre recherche'
    }
};

export default function UsersPage() {
    document.title = `Praeficio | Users`;
    const { language } = useContext(LanguageContext);
    const [pageOpen, setPageOpen] = useState(1);
    const next = () => setPageOpen(p => p >= 3 ? 3 : p + 1) || setError('');
    const previous = () => setPageOpen(1) || setError('');

    const [formData, setFormData] = useState({});

    const [results, setResults] = useState([]);

    const [error, setError] = useState('');

    useEffect(() => {
        if (pageOpen === 2) {
            setTimeout(() => {
                axios.post(`/users/search`, {
                    discovery_token: formData.discovery_token || undefined,
                    user_id: !isNaN(formData.user) ? parseInt(formData.user) : undefined,
                    username: isNaN(formData.user) ? formData.user : undefined,
                }).then(response => {
                    if (response.status === 200) {
                        setResults(response.data.data ?? []);
                        next();
                    } else {
                        console.log('fetch', response);
                    }
                }).catch(err => {
                    setError(err?.response?.data?.message || err?.response?.data);
                    next();
                });
            }, 1200)
        }
    }, [pageOpen]);

    return (<>
        <NavMenu />
        <div className="wrapper">

            <Progress color="gradient" shadow value={(33 * pageOpen) + 1} />

            <div className={`section ${pageOpen === 1 ? 'active' : ''}`} >
                <h4>{dictionary.page_1_header[language]}</h4>
                <Button disabled={!formData.user && !formData.discovery_token} auto shadow bordered color="primary" className="next-button" onPress={next}> {dictionary.next[language]} </Button>
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, user: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder={dictionary.username_or_id[language]} />
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, discovery_token: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder={dictionary.discovery_token[language]} />
            </div>

            <div className={`section ${pageOpen === 2 ? 'active' : ''}`} >
                <h4>{dictionary.page_2_line_1[language]}</h4>
                <Loading />
                <p>{dictionary.page_2_line_2[language]}</p>
            </div>

            <div className={`section ${pageOpen === 3 ? 'active' : ''}`} >
                <Button auto shadow bordered color="warning" className="previous-button" onPress={previous}> {dictionary.previous[language]} </Button>
                <Results data={results} error={error} />

            </div>

        </div>

    </>);
};

function UserCard({ details }) {
    const { language } = useContext(LanguageContext);
    return (<Card css={{ $$cardColor: '$colors$primary', width: '300px' }} isHoverable isPressable>
        <Link to={`/users/${details.user_id}${details.discovery_token ? `?discovery-token=${details.discovery_token}` : ''}`}>
            <div style={{ width: '100%', height: '100$', display: 'flex', 'justify-content': 'flex-start', }}>
                <Text size={21} color="darkgray" css={{ ml: '10px' }}>
                    #{details.user_id}
                </Text>
                <Spacer x={0.5} />
                <Text h3 color="white" css={{ mt: 0 }}>
                    {details.username}
                </Text>
            </div>
            <p>{dictionary.member_since[language]}: {details.created_on?.slice(0, 10)}</p>
        </Link>

    </Card>);
}

function Results({ data = [], error = '' }) {
    const { language } = useContext(LanguageContext);
    if (error) {
        return (<div>
            <h3 style={{ color: 'red' }} >Something went wrong while fetching the users
            </h3>
            <div dangerouslySetInnerHTML={{ __html: error }} />
        </div>);
    }

    if (data.length === 0) {
        return (<div>
            <h3>{dictionary.page_3_no_match[language]}</h3>
            <p>{dictionary.page_3_update[language]} </p>
        </div>);
    }

    if (data.length === 1) {
        return (<div>
            <h3>{dictionary.page_3_one_match[language]}</h3>
            <UserCard details={data[0]} />
        </div>);
    }

    return (<div>
        <h3>{dictionary.page_3_many_match[language]}</h3>
        {data.map((res, ix) => <UserCard key={ix} details={res} />)}
    </div>);
}