import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import NavMenu from '../components/NavMenu';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';

export default function FeedbackLogsPage() {

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const { isDark } = useContext(ThemeContext);

    const [feedbackLogs, setFeedbackLogs] = useState(null);
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [newLogName, setNewLogName] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/feedback_logs/`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setFeedbackLogs(response.data.data ?? []);
            } else {
                console.log('fetch', response);
            }
        });
    }, []);

    if (!user || !feedbackLogs) { return (<LoadingPage />); }

    return (<>
        <NavMenu />

        <Grid.Container gap={1} justify="center">
            {feedbackLogs.map((log, index) =>
                <Grid key={log.feedback_log_id + '-grid'}>
                    <FeedbackLogCard key={log.feedback_log_id + "-card-top"} id={log.feedback_log_id} name={log.name} created_on={log.created_on} user={user} />
                </Grid>
            )}
        </Grid.Container>

        {!user.permissions.endsWith('client') && <Button shadow onClick={() => setCreationModalOpen(true)} > Let's create a new feedback log </Button>}



        <Modal closeButton blur aria-labelledby="modal-title" open={creationModalOpen} onClose={() => setCreationModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <Input labelPlaceholder="Project Name" color="primary" rounded bordered clearable onChange={(e) => setNewLogName(e.target.value)} ></Input>


                <Button
                    disabled={!newLogName}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating feedback log', newLogName);
                        await axios.post(`http://localhost:8000/feedback_logs/`, {
                            name: newLogName
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201].includes(response.status)) {
                                console.log('successful');
                                setCreationModalOpen(false);
                                setFeedbackLogs(feedbackLogs.concat(response.data));
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> {<>Create Feedback Log&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
            </Modal.Body>
        </Modal>


        <Spacer y={2} />
        {user.permissions.endsWith('client') && !feedbackLogs.length && <h2>You have no feedback logs at this time. Please contact your rep to be added to one.</h2>}
    </>);
}


function FeedbackLogCard({ id, name, created_on, user }) {
    return (<Card css={{ $$cardColor: '$colors$primary', width: '300px' }} key={id + '-card-inner'} isHoverable isPressable>
        <Link to={`/feedback_logs/${id}`}>
            <Card.Body >
                <Text h3 color="white" css={{ mt: 0 }}>
                    {name}
                </Text>
                <Text h5 color="white" css={{ mt: 0 }}>
                    Created On: {created_on}
                </Text>
            </Card.Body>
        </Link>
        <Card.Divider className="intentional-divider" />
        <Card.Footer css={{ justifyItems: "flex-start", height: 'auto' }}>
            <Row wrap="nowrap" justify="space-around" align="stretch">
                <CustomButton
                    disabled={user?.permissions !== 'total'}
                    onClick={e => { }}
                    style={{ width: 'inherit' }}

                ><i className="fa-regular fa-trash-can"></i></CustomButton>
                <CustomButton
                    disabled={user?.permissions.endsWith('client')}
                    onClick={e => { }}
                    style={{ width: 'inherit' }}
                >
                    <i className="fa-regular fa-pen-to-square"></i></CustomButton>

                <CustomButton
                    disabled={user?.permissions.endsWith('client')}
                    onClick={e => { }}
                    style={{ width: 'inherit' }}
                >
                    <i className="fa-solid fa-box-archive"></i></CustomButton>
                <Card.Divider />
            </Row>
        </Card.Footer>
    </Card>)
}