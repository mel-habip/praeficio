import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom';

import './Workspaces.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import { Button, Navbar, Card, Modal, Spacer, Text, Input, Grid, Row, Table, Textarea, useAsyncList, useCollator, Loading, Badge, Dropdown, Tooltip } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import UserSearchModal from '../components/UserSearchModal';
import InlineLoader from '../components/InlineLoader';

import timestampFormatter from '../utils/timestampFormatter';

import useHandleError from '../utils/handleError';

export default function Workspaces({ subSection }) {


    console.log("subSection", subSection);

    const { workspace_id } = useParams();

    console.log('params', workspace_id);

    const [selectedSubSection, setSelectedSubSection] = useState({});

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const selectedIsOther = React.useMemo(() => {
        return !['my_favourites', 'discover', 'my_workspaces', null, undefined].includes(subSection) || !!workspace_id;
    }, [workspace_id, subSection]);

    useEffect(() => {
        setSelectedSubSection({ name: workspace_id ? selectedSubSection.name : undefined, id: workspace_id, subSection });
    }, [workspace_id, subSection]);


    if (!user.use_beta_features) return (
        <>
            <NavMenu ></NavMenu>
            <h1>WORKSPACES PAGE HERE</h1>
            <h2>
                <i className="fa-regular fa-building"></i>&nbsp;
                <i className="fa-regular fa-building"></i>&nbsp;
                <i className="fa-regular fa-building"></i>
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    );

    return (
        <>
            <NavMenu ></NavMenu>
            <Navbar isBordered variant="static" css={{position: 'relative', top: '2%'}}>
                <Navbar.Content hideIn="xs" variant="underline-rounded">
                    <div className="empty spacer" style={{ 'width': '50px' }}></div>
                    <Link style={{ height: '100%' }} to='/workspaces/my_workspaces'>
                        <Navbar.Item isActive={selectedSubSection.subSection === 'my_workspaces'}
                        >My Workpaces</Navbar.Item>
                    </Link>
                    <Link style={{ height: '100%' }} to='/workspaces/discover'>
                        <Navbar.Item isActive={selectedSubSection.subSection === 'discover'}
                        >Find Workpaces</Navbar.Item>
                    </Link>
                    <Link style={{ height: '100%' }} to='/workspaces/my_favourites'>
                        <Navbar.Item isActive={selectedSubSection.subSection === 'my_favourites'}
                        >Faves</Navbar.Item>
                    </Link>
                    {/* <p>{JSON.stringify([selectedSubSection, selectedIsOther])}</p> */}

                    {selectedIsOther &&

                        <Dropdown isBordered>
                            <Navbar.Item isActive >
                                <Dropdown.Button
                                    auto
                                    light
                                    css={{
                                        px: 0,
                                        dflex: "center",
                                        svg: { pe: "none" },
                                    }}
                                    ripple={false}
                                >
                                    {selectedSubSection?.name || `#${selectedSubSection?.id}`}
                                </Dropdown.Button>
                            </Navbar.Item>
                            <Dropdown.Menu aria-label="specific workspace section" >
                                <Dropdown.Item key="chat_thread">
                                    <Link to={`/workspaces/${selectedSubSection?.id}/messages`}
                                        style={{ height: 'auto', width: 'auto', display: 'block' }}>
                                        Chat Threads
                                    </Link>
                                </Dropdown.Item>

                                <Dropdown.Item key="positions" >
                                    <Link to={`/workspaces/${selectedSubSection?.id}/positions`}
                                        style={{ height: 'auto', width: 'auto', display: 'block' }}>
                                        Positions
                                    </Link>
                                </Dropdown.Item>
                                <Dropdown.Item key="members">
                                    <Link to={`/workspaces/${selectedSubSection?.id}/members`}
                                        style={{ height: 'auto', width: 'auto', display: 'block' }}>
                                        Members
                                    </Link>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    key="settings"
                                >
                                    <Link to={`/workspaces/${selectedSubSection?.id}/settings`}
                                        style={{ height: 'auto', width: 'auto', display: 'block' }}>
                                        Settings
                                    </Link>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    }

                </Navbar.Content>

            </Navbar>
            {selectedSubSection.subSection === 'my_workspaces' && <MyWorkspacesSection {...{ setSelectedSubSection }} />}
            {selectedSubSection.subSection === 'my_favourites' && <MyWorkspacesSection favesOnly {...{ setSelectedSubSection }} />}
            {selectedIsOther && selectedSubSection.subSection === 'messages' && <SpecificWorkspaceMessagesPanel {...{ user, setSelectedSubSection, selectedSubSection }} />}
            {selectedIsOther && selectedSubSection.subSection === 'settings' && <p> Settings coming soon</p>}
            {selectedIsOther && selectedSubSection.subSection === 'members' && <p> Members Menu coming soon</p>}
            {selectedIsOther && selectedSubSection.subSection === 'positions' && <p> WS Positions coming soon</p>}
        </>
    );
}


export function MyWorkspacesSection({ setSelectedSubSection, favesOnly = false }) {

    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [invitationModalOpen, setInvitationModalOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState({});

    const { user, setIsLoggedIn } = useContext(IsLoggedInContext);
    const handleError = useHandleError();

    const [userWorkspaces, setUserWorkspaces] = useState([
    ]);

    useEffect(() => {
        axios.get(`http://localhost:8000/workspaces`).then(response => {
            if (response.status === 200) {
                let { data: items, ...rest } = response.data;
                setUserWorkspaces((items ?? []).filter(item => item.starred || !favesOnly));
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);

    }, []); //fetch user's workspaces

    return (<>
        <Grid.Container gap={2} justify="center" >
            {userWorkspaces.map(ws =>
                <Grid key={`${ws.workspace_id}-subpart1`} >
                    <WorkspaceCard details={ws} invitationModalOpen={setInvitationModalOpen} setSelectedDetails={setSelectedWorkspace} />
                </Grid>
            )}
            <Grid >
                <Button className="gradient-anim" color="gradient" css={{ height: '150px' }} shadow onPress={() => setCreationModalOpen(true)} > New Workspace </Button>
            </Grid>
        </Grid.Container>
        <WorkspaceCreationModal {...{ modalOpen: creationModalOpen, setModalOpen: setCreationModalOpen, userWorkspaces, setUserWorkspaces, setIsLoggedIn, isFave: favesOnly }} />
        <InvitationAcceptConfirmModal {...{ modalOpen: invitationModalOpen, setModalOpen: setInvitationModalOpen, userWorkspaces, setUserWorkspaces, setIsLoggedIn, user, selectedWorkspace }} />
    </>);

}


function WorkspaceCard({ details, invitationModalOpen, setSelectedDetails }) {
    const [innerDetails, setInnerDetails] = useState(details);
    const { user, setIsLoggedIn } = useContext(IsLoggedInContext);
    const handleError = useHandleError();
    return (
        <Card css={{ $$cardColor: '$colors$primary', width: '300px', height: '150px' }} key={innerDetails.workspace_id + '-card-inner'} isHoverable isPressable>
            <i
                onClick={(ev) => {
                    axios.put(`http://localhost:8000/workspaces/${innerDetails.workspace_id}/user/${user.id}`, { starred: true }).then(response => {
                        if (response.status === 200) {
                            console.log('successful?')
                        } else {
                            console.warn('fetch', response);
                        }
                    }).catch(handleError);
                    setInnerDetails({ ...innerDetails, starred: !innerDetails.starred })
                }}
                style={{ zIndex: 1000, position: 'absolute', left: '91%', bottom: '85%', color: innerDetails.starred ? 'yellow' : '' }} className="fa-solid fa-star" />
            {!innerDetails.joined && innerDetails.method === 'invitation' &&
                <i
                    style={{ zIndex: 1000, position: 'absolute', left: '4%', bottom: '16%', borderBottom: 'thick double red', padding: '5px' }}
                    onClick={() => setSelectedDetails(details) || invitationModalOpen(true)}
                    className="fa-regular fa-envelope">&nbsp;<i className="fa-solid fa-exclamation"></i></i>

            }

            <Link to={`/workspaces/${innerDetails.workspace_id}`}>
                <Card.Body >
                    <div style={{ width: '100%', height: '100$', display: 'flex', 'justifyContent': 'flex-start', }}>
                        <Text size={21} color="darkgray" css={{ ml: 0 }}>
                            #{innerDetails.workspace_id}
                        </Text>
                        <Spacer x={0.5} />
                        <Text h3 color="white" css={{ mt: 0 }}>
                            {innerDetails.name}
                        </Text>
                    </div>
                    <div className="workspace-card-metadata" style={{ textAlign: 'left', width: '100%', paddingLeft: '45px' }} >
                        <Text h6 color="white" css={{ mt: 15, mb: 0 }}>
                            Created On: {timestampFormatter(innerDetails.created_on)}
                        </Text>
                        <Text h6 color="white" css={{ mb: 0 }}>
                            Member Since: {timestampFormatter(innerDetails.member_since)}
                        </Text>
                        <Text h6 color="white" css={{ mb: 0 }}>
                            Role: {innerDetails.role}
                        </Text>
                    </div>
                    <i
                        style={{ position: 'absolute', left: '91%', bottom: '15%' }}
                        className={innerDetails.publicity === 'public' ? "fa-solid fa-people-group" : 'fa-solid fa-lock'}></i>
                    <Tooltip
                        style={{ position: 'absolute', left: '91%', bottom: '50%' }}
                        content={!innerDetails.topics?.length ? <p>No topics yet!</p> : innerDetails.topics.map(({ name }, x) => <p key={name + x}>{name}</p>)}
                    >
                        <i className="fa-solid fa-hashtag"></i>
                    </Tooltip>
                </Card.Body>
            </Link>
        </Card >
    );
};

function SpecificWorkspaceMessagesPanel({ user, setSelectedSubSection, selectedSubSection }) {
    const { workspace_id } = useParams();
    const handleError = useHandleError();

    const [messages, setMessages] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/workspaces/${workspace_id}`).then(response => {
            if (response.status === 200) {
                let { users, messages, ...rest } = response.data;
                setMessages(messages ?? []);
                setSelectedSubSection({ ...selectedSubSection, name: rest.name });
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
    }, [workspace_id]);

    const role = React.useMemo(() => user.workspaces.find(workspace => workspace.workspace_id.toString() === workspace_id)?.role);

    if (!messages) return <Loading />

    return (
        <>
            <h3>Chat Thread </h3>


            <CommentsList {...{ role, messages, user, setMessages, workspace_id }} />

        </>
    );
}

function Comment({ message, level = 0, sectionLength = 1, role, user, handleError, workspace_id }) {
    const [showChildren, setShowChildren] = useState(level < 4 && sectionLength < 5);
    const [innerDetails, setInnerDetails] = useState(message);
    const [showReplyMode, setShowReplyMode] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');
    let {
        format
    } = new Intl.DateTimeFormat('en-US', {
        dateStyle: "full",
        hour12: true,
        timeStyle: "short"
    });
    return (
        <div className="comment-outer">
            <div className="comment-inner" style={innerDetails.starred ? { filter: `drop-shadow(0 0 0.5rem yellow)` } : {}}>
                <div className="comment-header">
                    <span className="sent_by">Sent by: {innerDetails.sent_by_username || innerDetails.sent_by}</span>
                    {innerDetails.starred && <p>🌟🌟</p>}
                    <span className="date">{format(new Date(innerDetails.created_on))}</span>
                </div>
                <div className="comment-content">
                    {innerDetails.deleted && <em>This comment has been deleted</em>}
                    {!innerDetails.deleted && <p>{innerDetails.content}</p>}
                </div>
                <div className="comment-actions">
                    <CustomButton className="likes" onClick={() => setInnerDetails({ ...innerDetails, liked: !innerDetails.liked, likes_count: innerDetails.liked ? innerDetails.likes_count - 1 : innerDetails.likes_count + 1 })}>
                        {innerDetails.likes_count} <i style={!innerDetails.liked ? { color: 'gray' } : {}} className={`fa fa-heart ${innerDetails.liked ? 'fa-1x fa-beat' : ''}`}></i>
                    </CustomButton>
                    <CustomButton onClick={() => { setShowReplyMode(!showReplyMode) }} ><i className="fa-solid fa-reply-all"></i></CustomButton>

                    {(['workspace_admin'].includes(role) || user.id === innerDetails.sent_by) && <CustomButton> <i className="fa-regular fa-pen-to-square" /> </CustomButton>}
                    <CustomButton>
                        {/* dislikes, should we have this? */}
                        <i className="fa-regular fa-face-angry" />
                    </CustomButton>
                    {['workspace_admin'].includes(role) && <CustomButton onClick={() => setInnerDetails({ ...innerDetails, starred: !innerDetails.starred })} > <i style={innerDetails.starred ? { color: 'yellow' } : {}} className="fa-regular fa-circle-up" /> </CustomButton>}
                    {(['workspace_admin'].includes(role) || user.id === innerDetails.sent_by) && !innerDetails.deleted && <CustomButton> <i className="fa-regular fa-trash-can" /> </CustomButton>}

                    {/* recycle is only for comments that have children */}
                    {(['workspace_admin'].includes(role)) && innerDetails.deleted && <CustomButton> <i className="fa-solid fa-recycle" /> </CustomButton>}

                </div>
            </div>
            {showReplyMode && <div className="comment-reply-container">
                <label>
                    Type your reply here
                </label>
                <Row justify='space-evenly' >
                    <Textarea
                        aria-label='reply field for comment'
                        placeholder='Type here'
                        width='100%'
                        value={newMessageText}
                        onChange={e => setNewMessageText(e.target.value)}
                    ></Textarea>
                    <CustomButton
                        buttonStyle="btn--transparent"
                        aria-label="send message button"
                        rounded
                        disabled={!newMessageText.length}
                        shadow
                        onClick={() => {
                            console.log('sending message', newMessageText);
                            axios.post(`http://localhost:8000/workspace_messages/${workspace_id}`, {
                                content: newMessageText,
                                parent_workspace_message_id: innerDetails.workspace_message_id,
                            }).then(response => {
                                console.log('response:', response.data);
                                if ([201, 200].includes(response.status)) {
                                    console.log('successful');
                                    setInnerDetails({ ...innerDetails, children: (innerDetails.children || []).concat(response.data) });
                                    setNewMessageText('');
                                    setShowReplyMode(false);
                                } else {
                                    console.warn(response);
                                }
                            }).catch(handleError);
                        }} ><i className="fa-solid fa-dove"></i></CustomButton>
                </Row>
            </div>}
            <div className="comment-children-container">
                {!showChildren &&
                    <div className="comment-show-children-container">
                        <button className="comment-show-children" onClick={() => setShowChildren(true)}>
                            <i className="fas fa-plus"></i>
                            <span className="button-text">Expand</span>
                        </button>
                    </div>}
                {innerDetails?.children?.length && showChildren && (
                    <>
                        <button className="comment-collapse-children" onClick={() => setShowChildren(false)} ></button>
                        <div className="comment-children">
                            {innerDetails.children.map((child) => (
                                <Comment key={child.workspace_message_id} message={child} level={level + 1} sectionLength={innerDetails.children.length} {...{ role, workspace_id, handleError }} />
                            ))}
                            <div />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

function CommentsList({ messages, role, user, workspace_id, setMessages, handleError }) {
    const [newMessageText, setNewMessageText] = useState('');
    return (
        <div className="comments-list">
            {messages.map((message) => (
                <Comment key={message.workspace_message_id} {...{ message, role, user, handleError, workspace_id }} level={0} />
            ))}
            <div className="comment-reply-container root">
                <label>
                    Type your new message here
                </label>
                <Row justify='space-evenly' >
                    <Textarea
                        aria-label='field for new root comment'
                        placeholder='Type here'
                        clearable
                        value={newMessageText}
                        onChange={e => setNewMessageText(e.target.value)}
                        width='100%'
                        css={{ mb: '10px' }}
                    ></Textarea>
                    <CustomButton
                        buttonStyle="btn--transparent"
                        aria-label="send message button"
                        rounded
                        disabled={!newMessageText.length}
                        shadow
                        onClick={() => {
                            console.log('sending message', newMessageText);
                            axios.post(`http://localhost:8000/workspace_messages/${workspace_id}`, {
                                content: newMessageText,
                            }).then(response => {
                                console.log('response:', response.data);
                                if ([201, 200].includes(response.status)) {
                                    console.log('successful');
                                    setMessages(messages.concat(response.data));
                                    setNewMessageText('');
                                } else {
                                    console.warn(response);
                                }
                            }).catch(handleError);
                        }} ><i className="fa-solid fa-dove"></i></CustomButton>
                </Row>
            </div>
        </div>
    );
};

function WorkspaceCreationModal({ modalOpen, setModalOpen, setUserWorkspaces, userWorkspaces, setIsLoggedIn, isFave = false }) {
    const [newWorkspaceDetails, setNewWorkspaceDetails] = useState({});


    const publicityOptions = [
        {
            key: 'public',
            name: 'Public',
            description: 'Visible to everyone'
        },
        {
            key: 'private',
            name: 'Hidden',
            description: `Only members can view and add new members`
        }
    ];

    return (<Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={modalOpen} onClose={() => setModalOpen(false)} >
        <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
            <Text size={14} > Please enter the information below </Text>
        </Modal.Header>
        <Modal.Body>
            <Spacer y={0.4} />
            <Input labelPlaceholder="Workspace Name"
                color="primary"
                rounded
                bordered
                clearable
                onChange={(e) => setNewWorkspaceDetails({ ...newWorkspaceDetails, name: e.target.value })} ></Input>
            <CustomizedDropdown
                optionsList={publicityOptions}
                disallowEmptySelection
                mountDirectly
                selectionMode='single'
                title='Visibility'
                outerUpdater={(v) => setNewWorkspaceDetails({ ...newWorkspaceDetails, publicity: v })}
            ></CustomizedDropdown>
            <Button
                disabled={!newWorkspaceDetails}
                shadow
                auto
                onPress={async () => {
                    console.log('creating workspace', newWorkspaceDetails);
                    await axios.post(`http://localhost:8000/workspaces/`, {
                        name: newWorkspaceDetails.name,
                        publicity: newWorkspaceDetails.publicity,
                        starred: isFave,
                    }).then(response => {
                        console.log('response:', response.data);
                        if ([201].includes(response.status)) {
                            console.log('successful');
                            setUserWorkspaces(userWorkspaces.concat(response.data));
                            setModalOpen(false);
                        } else if (response.status === 401) {
                            setIsLoggedIn(false);
                        } else {
                            console.log(response);
                        }
                    });
                }}> {<>Create workspace&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
        </Modal.Body>
    </Modal>);
};

function InvitationAcceptConfirmModal({ modalOpen, setModalOpen, setUserWorkspaces, userWorkspaces, setIsLoggedIn, user, selectedWorkspace }) {

    return (<Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={modalOpen}
        onClose={() => setModalOpen(false)} >
        <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
            <Text size={18} > <strong>{selectedWorkspace.invitation_sent_by_username}</strong> invited you to join the Workspace <strong>{selectedWorkspace.name}</strong></Text>
        </Modal.Header>
        <Modal.Body>
            <Row
                justify='space-evenly'
            >
                <Button auto
                    shadow
                    color="primary"
                    onPress={() => setModalOpen(false)}> Return&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                </Button>
                <Button auto
                    shadow
                    color="error"
                    onPress={async () => {
                        console.log(`deleting invite`);
                        await axios.delete(`http://localhost:8000/workspaces/${selectedWorkspace.id}/user/${user.id}`).then(response => {
                            if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else if (response.status === 200) {
                                setModalOpen(false);
                            } else {
                                console.log('response:', response.data);
                            }
                        });
                    }}> Reject It!&nbsp;<i className="fa-solid fa-skull-crossbones"></i>
                </Button>
                <Button auto
                    shadow
                    color="success"
                    onPress={async () => {
                        await axios.put(`http://localhost:8000/workspaces/${selectedWorkspace.id}/user/${user.id}`, { invitation_accepted: true }).then(response => {
                            if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else if (response.status === 200) {
                                setModalOpen(false);
                            } else {
                                console.log('response:', response.data);
                            }
                        });
                    }}> Accept It!&nbsp;<i className="fa-solid fa-skull-crossbones"></i>
                </Button>
            </Row>
            <Text size={12} em css={{ 'text-align': 'center' }}> Note: this action is irreversible. </Text>
        </Modal.Body>
    </Modal>);
}