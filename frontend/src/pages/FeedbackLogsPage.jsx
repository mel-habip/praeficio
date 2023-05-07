import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import NavMenu from '../components/NavMenu';

import { Button, Modal, Spacer, Text, Input, Checkbox, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';

import timestampFormatter from '../utils/timestampFormatter';

export default function FeedbackLogsPage({ archive }) {

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    const { isDark } = useContext(ThemeContext);


    const [feedbackLogs, setFeedbackLogs] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [newLogName, setNewLogName] = useState('');

    const updateCachedItems = (log_id, updated_details) => {
        setFeedbackLogs(feedbackLogs.map(item => {
            if (item.feedback_log_id === log_id) {
                console.log('triggy', updated_details, log_id);
                return updated_details;
            } else {
                return item;
            }
        }));
    }

    useEffect(() => {
        axios.get(`https://${process.env.SELF_URL_P1}.praeficio.com/feedback_logs${archive ? '?archived=true' : ''}`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setFeedbackLogs(response.data.data ?? []);
            } else {
                console.log('fetch', response);
            }
        });
    }, [archive]);

    if (!user || !feedbackLogs) { return (<LoadingPage />); }

    return (<>
        <NavMenu />
        {archive ? <CustomButton to="/feedback_logs/" > <i className="fa-solid fa-angles-left"></i> Back to current logs</CustomButton> : <CustomButton to="/feedback_logs/archive"> Archived Logs <i className="fa-solid fa-angles-right"></i></CustomButton>}

        <Grid.Container gap={1} justify="center">
            {feedbackLogs.map((log, index) =>
                <Grid key={log.feedback_log_id + '-grid'}>
                    <FeedbackLogCard key={log.feedback_log_id + "-card-top"} id={log.feedback_log_id} name={log.name} created_on={log.created_on} {...{ setDetailModalOpen, setArchiveModalOpen, user, setSelectedLog, archive }} />
                </Grid>
            )}
        </Grid.Container>

        {!user.permissions.endsWith('client') && !archive && <Button shadow onClick={() => setSelectedLog(null) || setDetailModalOpen(true)} > Let's create a new feedback log </Button>}



        <Modal closeButton blur aria-labelledby="modal-title" open={detailModalOpen} onClose={() => setDetailModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <Input labelPlaceholder="Project Name" color="primary" rounded initialValue={selectedLog && feedbackLogs.find(log => selectedLog === log.feedback_log_id)?.name} bordered clearable onChange={(e) => setNewLogName(e.target.value)} ></Input>


                <Button
                    disabled={!newLogName}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating feedback log', newLogName);
                        await axios[selectedLog ? 'put' : 'post'](`https://${process.env.SELF_URL_P1}.praeficio.com/feedback_logs/${selectedLog || ''}`, {
                            name: newLogName
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                setDetailModalOpen(false);
                                if (selectedLog) {
                                    updateCachedItems(selectedLog, response.data.data);
                                } else {
                                    setFeedbackLogs(feedbackLogs.concat(response.data));
                                }
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> {<>{selectedLog ? `Update Log #${selectedLog}` : `Create Feedback Log`}&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
            </Modal.Body>
        </Modal>


        <Modal
            css={isDark ? { 'background-color': '#0d0d0d' } : {}}
            closeButton
            blur
            aria-labelledby="modal-title"
            open={archiveModalOpen}
            onClose={() => setArchiveModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={18} > Are you sure you want to archive log #{selectedLog}?</Text>
            </Modal.Header>
            <Modal.Body>
                <Row
                    justify='space-evenly'
                >
                    <Button auto
                        shadow
                        color="primary"
                        onPress={() => setArchiveModalOpen(false)}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                    </Button>
                    <Button auto
                        shadow
                        color="error"
                        onPress={async () => {
                            console.log(`deleting ${selectedLog}`);
                            await axios.put(`https://${process.env.SELF_URL_P1}.praeficio.com/feedback_logs/${selectedLog}`, { archived: true }).then(response => {
                                if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else if (response.status === 200) {
                                    updateCachedItems(selectedLog, response.data.data);
                                    setArchiveModalOpen(false);
                                } else {
                                    console.log('response:', response.data);
                                }
                            });
                        }}> Archive It!&nbsp;<i className="fa-solid fa-skull-crossbones"></i>
                    </Button>
                </Row>
                <Text size={12} em css={{ 'text-align': 'center' }}> Note: archived logs will be locked for edits. </Text>
            </Modal.Body>
        </Modal>


        <Spacer y={2} />
        {user.permissions.endsWith('client') && !feedbackLogs.length && <h2>You have no feedback logs at this time. Please contact your rep to be added to one.</h2>}
    </>);
}


function FeedbackLogCard({ id, name, created_on, user, archive, setArchiveModalOpen, setSelectedLog, setDetailModalOpen }) {
    return (<Card css={{ $$cardColor: '$colors$primary', width: '300px' }} key={id + '-card-inner'} isHoverable isPressable>
        <Link to={`/feedback_logs/${id}`}>
            <Card.Body >
                <div style={{ width: '100%', height: '100$', display: 'flex', 'justify-content': 'flex-start',}}>
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
            </Card.Body>
        </Link>
        <Card.Divider className="intentional-divider" />
        <Card.Footer css={{ justifyItems: "flex-start", height: 'auto' }}>
            <Row wrap="nowrap" justify="space-around" align="stretch">

                <CustomButton
                    disabled={user?.permissions.endsWith('client') || archive}
                    onClick={e => { setSelectedLog(id) || setDetailModalOpen(true) }}
                    style={{ width: 'inherit' }}
                >
                    <i className="fa-regular fa-pen-to-square"></i></CustomButton>

                <CustomButton
                    disabled={user?.permissions.endsWith('client') || archive}
                    onClick={e => { setSelectedLog(id) || setArchiveModalOpen(true) }}
                    style={{ width: 'inherit' }}
                >
                    <i className="fa-solid fa-box-archive"></i></CustomButton>
                <Card.Divider />
            </Row>
        </Card.Footer>
    </Card>);
}