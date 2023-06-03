import { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';

import IsLoggedInContext from '../../contexts/IsLoggedInContext';
import ThemeContext from '../../contexts/ThemeContext';

import LoadingPage from '../LoadingPage';

import axios from 'axios';

import NavMenu from '../../components/NavMenu';

import { Button, Modal, Spacer, Text, Input, Checkbox, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../../fields/CustomButton';
import CustomizedDropdown from '../../fields/CustomizedDropdown'

import timestampFormatter from '../../utils/timestampFormatter';

export default function VotingSessionsPage() {
    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);

    const [votingSessions, setVotingSessions] = useState(null);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/voting_sessions`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setVotingSessions(response.data.data ?? []);
            } else {
                console.log('fetch', response);
            }
        });
    }, []);

    if (!user || !votingSessions) { return (<LoadingPage />); }

    if (!votingSessions.length) return (<>
        <NavMenu />
        <h2>You don't have any voting sessions yet! Go ahead and create one</h2>
        <VotingSessionCreationModalWithButton />
    </>);

    return (<>
        <Grid.Container gap={1} justify="center">
            {votingSessions.map((session, index) =>
                <Grid key={session.voting_session_id + '-grid'}>
                    <VotingSessionCard key={session.voting_session_id + "-card-top"} id={session.voting_session_id} name={session.name} created_on={session.created_on} completed_on={session.completed_on} />
                </Grid>
            )}
        </Grid.Container>
    </>);
};

function VotingSessionCard({ id, name, created_on, completed, completed_on, details, voter_key }) {
    return (<Card css={{ $$cardColor: '$colors$primary', width: '300px' }} key={id + '-card-inner'} isHoverable isPressable>
        <Link to={`/voting_sessions/${id}`}>
            <Card.Body >
                <div style={{ width: '100%', height: '100$', display: 'flex', 'justify-content': 'flex-start', }}>
                    <Text size={21} color="darkgray" css={{ ml: 0 }}>
                        #{id}
                    </Text>
                    <Spacer x={0.5} />
                    <Text h3 color="white" css={{ mt: 0 }}>
                        {name}
                    </Text>
                </div>
                <Text h5 color="white" css={{ mt: 15, mb: 0 }}>
                    Created On: {timestampFormatter(created_on)}
                </Text>
                <Text h5 color="white" css={{ mt: 15, mb: 0 }}>
                    Completed On: {completed ? <em>incomplete</em> : timestampFormatter(completed_on)}
                </Text>
            </Card.Body>
        </Link>
    </Card>);
};

function VotingSessionCreationModalWithButton({ setVotingSessions }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);

    const [votingSessionDetails, setVotingSessionDetails] = useState({});

    return (<>
        <Button shadow onClick={() => setModalOpen(true)} >Create a new Voting Session</Button>

        <Modal closeButton blur aria-labelledby="modal-title" open={modalOpen} onClose={() => setModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <pre>{JSON.stringify(votingSessionDetails, null, 2)}</pre>
                <Input labelPlaceholder="Election Name" color="primary" rounded bordered clearable onChange={e => setVotingSessionDetails(prev => ({ ...prev, name: e.target.value }))} ></Input>

                {/* need additional options here: method, voters limit, if "multiple" than also how many */}

                <Button
                    disabled={!votingSessionDetails?.name}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating voting session', votingSessionDetails?.name);
                        await axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/`, {
                            name: votingSessionDetails?.name
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                setModalOpen(false);
                                setVotingSessions(prev => prev.concat(response.data));
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> Create Voting Session&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i> </Button>
            </Modal.Body>
        </Modal>
    </>);
};