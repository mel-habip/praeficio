import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom';

import './Workspaces.css';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import { Button, Navbar, Card, Modal, Spacer, Text, Input, Grid, Row, Table, Textarea, useAsyncList, useCollator, Loading, Badge, Dropdown } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import UserSearchModal from '../components/UserSearchModal';
import InlineLoader from '../components/InlineLoader';

import timestampFormatter from '../utils/timestampFormatter';

import useHandleError from '../utils/handleError';

export default function Workspaces() {

    const { workspace_id } = useParams();

    console.log('params', workspace_id);

    const [selectedSubSection, setSelectedSubSection] = useState(workspace_id ? { id: workspace_id } : { id: 'my_workspaces' });


    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const handleError = useHandleError();

    const selectedIsOther = React.useMemo(() => {
        return !['my_favourites', 'find_workspaces', 'my_workspaces', null, undefined].includes(selectedSubSection.id);
    }, [selectedSubSection.id]);





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

            <Navbar isBordered variant="static" >
                <Navbar.Content hideIn="xs" variant="underline-rounded">
                    <div className="empty spacer" style={{ 'width': '50px' }}></div>
                    <Navbar.Link isActive={selectedSubSection.id === 'my_workspaces'} onPress={() => setSelectedSubSection({ id: 'my_workspaces' })} >My Workpaces</Navbar.Link>
                    <Navbar.Link isActive={selectedSubSection.id === 'find_workspaces'} onPress={() => setSelectedSubSection({ id: 'find_workspaces' })}>Find Workspaces</Navbar.Link>
                    <Navbar.Link isActive={selectedSubSection.id === 'my_favourites'} onPress={() => setSelectedSubSection({ id: 'my_favourites' })}>Faves</Navbar.Link>
                    {/* <Navbar.Link >{selectedSubSection}</Navbar.Link> */}
                    {selectedIsOther && <Navbar.Link isActive >{selectedSubSection?.name || `#${selectedSubSection?.id}`}</Navbar.Link>}
                    {/* this shows the current one selected, we might want to make it a separate page instead too though */}
                </Navbar.Content>

            </Navbar>
            {selectedSubSection.id === 'my_workspaces' && <MyWorkspacesSection {...{ setSelectedSubSection }} />}
            {selectedIsOther && <SpecificWorkspace {...{ user }} />}

        </>
    );
}


export function MyWorkspacesSection({ setSelectedSubSection }) {

    const { user } = useContext(IsLoggedInContext);
    const handleError = useHandleError();

    const [userWorkspaces, setUserWorkspaces] = useState([
        {
            workspace_id: 1,
            name: '1st WS',
            created_on: '2023-03-01',
            role: 'Admin'
        }
    ]);

    useEffect(() => {
        axios.get(`http://localhost:8000/workspaces`).then(response => {
            if (response.status === 200) {
                let { data: items, ...rest } = response.data;
                setUserWorkspaces(items ?? []);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);

    }, []); //fetch user's workspaces

    return (<>
        <Grid.Container gap={2} justify="center" >
            {userWorkspaces.map(ws =>
                <Grid key={`${ws.workspace_id}-subpart1`} >
                    <WorkspaceCard details={ws} {...{ setSelectedSubSection }} />
                </Grid>
            )}
            <Grid >
                <Button className="gradient-anim" color="gradient" css={{ height: '150px' }} shadow onPress={() => 'true'} > New Workspace </Button>
            </Grid>
        </Grid.Container>
    </>);

}


function WorkspaceCard({ details, setSelectedSubSection }) {
    const [innerDetails, setInnerDetails] = useState(details);
    return (
        <Card css={{ $$cardColor: '$colors$primary', width: '300px', height: '150px' }} key={innerDetails.workspace_id + '-card-inner'} isHoverable isPressable>
            <i
                onClick={(ev) => { setInnerDetails({ ...innerDetails, starred: !innerDetails.starred }) }}
                style={{ zIndex: 1000, position: 'absolute', left: '91%', bottom: '85%', color: innerDetails.starred ? 'yellow' : '' }} className="fa-solid fa-star" />
            {!innerDetails.invitation_accepted &&
                <div className="scroll-with-star" style={{ zIndex: 1000, position: 'absolute', left: '3%', bottom: '5%', width: '43px', height:'43px' }}  >
                    <i class="fa-solid fa-scroll" style={{ fontSize: '40px', color: 'white', zIndex: 1000, }} onClick={() => console.log('clicked')} />
                    <i style={{ fontSize: "11px", color: 'red', position: 'relative', bottom: '45px', left: '14px' }} class="fa-solid fa-certificate" />
                    <i style={{ fontSize: "6px", color: 'gold', position: 'relative', bottom: '47px', left: '6px' }} class="fa-solid fa-certificate" />
                    <span style={{ color: 'black', fontFamily: "Times New Roman, serif", position: 'relative', bottom: '39px', right: '13px' }} >I</span>
                </div>
            }

            <Link to={`/workspaces/${innerDetails.workspace_id}`} onClick={() => setSelectedSubSection({ id: innerDetails.workspace_id, name: innerDetails.name })}>
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
                </Card.Body>
            </Link>
        </Card >
    );
};

function SpecificWorkspace({ user }) {
    const { workspace_id } = useParams();
    const handleError = useHandleError();

    const [messages, setMessages] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/workspaces/${workspace_id}`).then(response => {
            if (response.status === 200) {
                let { users, messages, ...rest } = response.data;
                setMessages(messages ?? []);
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


            <CommentsList {...{ role, messages, user }} />

        </>
    );
}

function Comment({ message, level = 0, sectionLength = 1, role, user }) {
    const [showChildren, setShowChildren] = useState(level < 4 && sectionLength < 5);
    const [innerDetails, setInnerDetails] = useState(message);
    const [showReplyMode, setShowReplyMode] = useState(false);
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
                <Textarea
                    aria-label='reply field for comment'
                    placeholder='Type here'
                    width='100%'
                ></Textarea>
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
                                <Comment key={child.workspace_message_id} message={child} level={level + 1} sectionLength={innerDetails.children.length} role={role} />
                            ))}
                            <div />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

function CommentsList({ messages, role, user }) {
    return (
        <div className="comments-list">
            {messages.map((message) => (
                <Comment key={message.workspace_message_id} {...{ message, role, user }} level={0} />
            ))}
            <div className="comment-reply-container root">
                <label>
                    Type your new message here
                </label>
                <Textarea
                    aria-label='field for new root comment'
                    placeholder='Type here'
                    clearable
                    width='100%'
                    css={{ mb: '10px' }}
                ></Textarea>
            </div>
        </div>
    );
};
