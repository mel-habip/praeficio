import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

import './stylesheets/UsersPage.css';

import { Button, Loading, Input, Card, Progress, Spacer, Text } from '@nextui-org/react';
import { CustomButton } from '../fields/CustomButton';

export default function UsersPage() {

    const [pageOpen, setPageOpen] = useState(1);
    const next = () => setPageOpen(p => p >= 3 ? 3 : p + 1) || setError('');
    const previous = () => setPageOpen(1) || setError('');

    const [formData, setFormData] = useState({});

    const [results, setResults] = useState([]);

    const [error, setError] = useState('');

    useEffect(() => {
        if (pageOpen === 2) {
            setTimeout(() => {
                axios.post(`${process.env.REACT_APP_API_LINK}/users/search`, {
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
            }, 600)
        }
    }, [pageOpen]);

    return (<>
        <div className="wrapper">

            <h4>page: {pageOpen}</h4>

            <Progress color="gradient" shadow value={(33 * pageOpen) + 1} />

            <div className={`section ${pageOpen === 1 ? 'active' : ''}`} >
                <h4>Use the search fields below to find a user & add them as a friend!</h4>
                <Button disabled={!formData.user} auto shadow bordered color="primary" className="next-button" onPress={next}> Next</Button>
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, user: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder="Username or User ID" />
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, discovery_token: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder="Discovery Token" />
            </div>

            <div className={`section ${pageOpen === 2 ? 'active' : ''}`} >
                <h4>Fetching users...</h4>
                <Loading />
                <p>Please hang tight!</p>
            </div>

            <div className={`section ${pageOpen === 3 ? 'active' : ''}`} >
                <Button auto shadow bordered color="warning" className="previous-button" onPress={previous}> Previous</Button>
                <Results data={results} error={error} />

            </div>

        </div>

    </>);
};

function UserCard({ details }) {
    return (<Card css={{ $$cardColor: '$colors$primary', width: '300px' }} isHoverable isPressable>
        <Link to={`/users/${details.user_id}${details.discovery_token ? `?discovery-token=${details.discovery_token}`: ''}` }>
            <div style={{ width: '100%', height: '100$', display: 'flex', 'justify-content': 'flex-start', }}>
                <Text size={21} color="darkgray" css={{ ml: 0 }}>
                    #{details.user_id}
                </Text>
                <Spacer x={0.5} />
                <Text h3 color="white" css={{ mt: 0 }}>
                    {details.username}
                </Text>
            </div>
            <p>Member Since: {details.created_on?.slice(0, 10)}</p>
        </Link>

    </Card>);
}

function Results({ data = [], error = '' }) {
    if (error) {
        return (<div>
            <h3 style={{ color: 'red' }} >Something went wrong while fetching the users
            </h3>
            <div dangerouslySetInnerHTML={{ __html: error }} />
        </div>);
    }

    if (data.length === 0) {
        return (<div>
            <h3>No Match Found</h3>
            <p>Go back & update your search </p>
        </div>);
    }

    if (data.length === 1) {
        return (<div>
            <h3>Match Found!</h3>
            <UserCard details={data[0]} />
        </div>);
    }

    return (<div>
        <h3>Multiple Matches Found!</h3>
        {data.map((res, ix) => <UserCard key={ix} details={res} />)}
    </div>);
}