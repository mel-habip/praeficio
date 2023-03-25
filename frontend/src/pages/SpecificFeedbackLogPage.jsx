import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'

import { Link } from 'react-router-dom';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import NavMenu from '../components/NavMenu';
import NotesModule from '../components/NotesModule';

import { Button, Modal, Spacer, Text, Input, Tooltip, Row, Table, Textarea, useAsyncList, useCollator } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import UserSearchModal from '../components/UserSearchModal';

export default function SpecificFeedbackLogPage() {

    const { feedback_log_id } = useParams();

    console.log('routeParams', feedback_log_id);

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const [feedbackLogItems, setFeedbackLogItems] = useState(null);
    const [feedbackLogOwnDetails, setFeedbackLogOwnDetails] = useState({});
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [userAdditionModalOpen, setUserAdditionModalOpen] = useState(false);


    //fetch the data
    useEffect(() => {
        axios.get(`http://localhost:8000/feedback_logs/${feedback_log_id}`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                let { data: items, ...rest } = response.data;
                setFeedbackLogOwnDetails(rest);
                setFeedbackLogItems(items ?? []);
            } else {
                console.log('fetch', response);
            }
        });
    }, []);

    if (!feedbackLogItems || !user) { return (<LoadingPage />); }

    const updateCachedItems = (item_id, updated_details) => {
        setFeedbackLogItems(feedbackLogItems.map(item => {
            if (item.feedback_log_item_id === item_id) {
                // console.log('triggy', updated_details, item_id);
                return updated_details;
            } else {
                return item;
            }
        }));
    }

    return (<>
        <NavMenu />

        <h1>{feedbackLogOwnDetails.name}</h1>
        <Link to="/feedback_logs">
            <CustomButton buttonStyle="btn--outline"><i className="fa-solid fa-angles-left"></i> Back to My Feedback Logs</CustomButton>
        </Link>


        {!feedbackLogItems.length && <><h3>No items in this log yet - Go ahead & add some! </h3><hr className="line-primary" /></>}

        {!!feedbackLogItems.length && <FeedbackLogTable feedbackLogItems={feedbackLogItems} updateCachedItems={updateCachedItems} {...{ user, setIsLoggedIn }} />}

        <Spacer y={1} />
        {/*need to handle these, TODO: */}
        <Row justify="space-evenly" >
            <Button shadow onClick={() => setCreationModalOpen(true)} > Add Items </Button>
            <Button shadow onClick={() => console.log(true)} > Bulk-Export Items </Button>

            {!user.permissions.endsWith('client') && <>
                <Button shadow onClick={() => setUserAdditionModalOpen(true)} > Add Users </Button>
                <Button shadow onClick={() => console.log(true)} > Bulk-Import Items </Button>
            </>}
        </Row>

        <UserSearchModal is_open={userAdditionModalOpen} set_is_open={setUserAdditionModalOpen} user={user} setIsLoggedIn={setIsLoggedIn} add_button_text={`Add user to ${feedbackLogOwnDetails.name}`} button_function={(user_id) => {
            axios.post(`http://localhost:8000/feedback_logs/${feedback_log_id}/add_user`, { user_id }).then(response => {
                if (response.status === 401) {
                    setIsLoggedIn(false);
                } else if (response.status === 201) {
                    setUserAdditionModalOpen(false);
                } else {
                    console.log('fetch', response);
                }
            });
        }} />

        <FeedbackItemCreationModal is_open={creationModalOpen} set_is_open={setCreationModalOpen} current_feedback_log_id={feedbackLogOwnDetails.feedback_log_id} {...{ setFeedbackLogItems, feedbackLogItems, setIsLoggedIn, user }} />
    </>);
};

function FeedbackItemCreationModal({ is_open, set_is_open, setFeedbackLogItems, feedbackLogItems, current_feedback_log_id, setIsLoggedIn, user }) {
    const [itemHeader, setItemHeader] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    const descriptionHelpers = React.useMemo(() => {
        if (description?.length < 100) {
            return {
                color: 'default',
                text: 'Please provide some more details'
            }
        }
        if (description?.length < 200) {
            return {
                color: 'secondary',
                text: 'Doing great! Keep going! 👍'
            }
        }
        if (description?.length < 300) {
            return {
                color: 'primary',
                text: 'Oh wow! This is great! 🔥🔥'
            }
        }
        if (description?.length > 750) {
            return {
                color: 'error',
                text: 'While being detailed is good, being concise can be better 👁️👄👁️'
            }
        }
        return {
            color: 'success',
            text: 'Excellent description! 🚀🚀🚀'
        }
    }, [description]);

    return (
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={is_open}
            onClose={() => set_is_open(false)}
            scroll
            width='1000px' >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the ticket information below </Text>
            </Modal.Header>
            <Modal.Body>
                <Spacer y={0.5} />
                <Input
                    labelPlaceholder="Item Header"
                    color={itemHeader.length < 50 ? 'primary' : 'error'}
                    helperColor={itemHeader.length < 50 ? 'default' : 'error'}
                    helperText={`${itemHeader.length}/50`}
                    bordered
                    clearable
                    onChange={(e) => setItemHeader(e.target.value)}
                    value={itemHeader}
                ></Input>
                <Spacer y={0.8} />
                <Textarea
                    labelPlaceholder="Detailed Description"
                    bordered
                    minRows={6}
                    rows={8}
                    maxRows={60}
                    color={descriptionHelpers.color}
                    helperColor={descriptionHelpers.color}
                    helperText={descriptionHelpers.text}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                ></Textarea>
                <Spacer y={0.5} />

                <h3>Attached upload goes here 👁️👄👁️ </h3>
                <Spacer y={0.5} />

                <StatusDropdown user={user} update_func={setStatus} default_value={status} />

                <Button
                    disabled={!description || description?.length < 50}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating feedback log item', itemHeader);
                        await axios.post(`http://localhost:8000/feedback_logs/${current_feedback_log_id}/new_item`, {
                            content: description,
                            header: itemHeader,
                            status,
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201].includes(response.status)) {
                                console.log('successful');
                                set_is_open(false);
                                setFeedbackLogItems(feedbackLogItems.concat({ ...response.data, created_by_username: user.username }));
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> Create Feedback Item&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i> </Button>
            </Modal.Body>
        </Modal>);
};


function FeedbackItemUpdateModal({ is_open, set_is_open, updateCachedItems, setIsLoggedIn, user, item_id, updateDetails }) {
    const [itemHeader, setItemHeader] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    const descriptionHelpers = React.useMemo(() => {
        if (description?.length < 100) {
            return {
                color: 'default',
                text: 'Please provide some more details'
            }
        }
        if (description?.length < 200) {
            return {
                color: 'secondary',
                text: 'Doing great! Keep going! 👍'
            }
        }
        if (description?.length < 300) {
            return {
                color: 'primary',
                text: 'Oh wow! This is great! 🔥🔥'
            }
        }
        if (description?.length > 750) {
            return {
                color: 'error',
                text: 'While being detailed is good, being concise can be better 👁️👄👁️'
            }
        }
        return {
            color: 'success',
            text: 'Excellent description! 🚀🚀🚀'
        }
    }, [description]);

    useEffect(() => {
        if (updateDetails) {
            setItemHeader(updateDetails.header);
            setDescription(updateDetails.content);
            setStatus(updateDetails.status);
        }
    }, [item_id, updateDetails]);

    return (
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={is_open}
            onClose={() => set_is_open(false)}
            scroll
            width='1000px'
        >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Updating Details of #{item_id} </Text>
            </Modal.Header>
            <Modal.Body>
                <Spacer y={0.5} />
                <Input
                    labelPlaceholder="Item Header"
                    color={itemHeader?.length < 50 ? 'primary' : 'error'}
                    helperColor={itemHeader?.length < 50 ? 'default' : 'error'}
                    helperText={`${itemHeader?.length}/50`}
                    bordered
                    clearable
                    onChange={(e) => setItemHeader(e.target.value)}
                    value={itemHeader}
                ></Input>
                <Spacer y={0.8} />
                <Textarea
                    labelPlaceholder="Detailed Description"
                    bordered
                    minRows={6}
                    rows={8}
                    maxRows={60}
                    color={descriptionHelpers.color}
                    helperColor={descriptionHelpers.color}
                    helperText={descriptionHelpers.text}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                ></Textarea>
                <Spacer y={0.5} />

                <h3>Attached upload goes here 👁️👄👁️ </h3>
                <Spacer y={0.5} />

                <StatusDropdown user={user} update_func={setStatus} default_value={status} />

                <Button
                    disabled={!description || description?.length < 50}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('updating feedback log item', itemHeader);
                        await axios.put(`http://localhost:8000/feedback_log_items/${item_id}`, {
                            content: description,
                            header: itemHeader,
                            status,
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                set_is_open(false);
                                updateCachedItems(item_id, response.data);
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> Update Feedback Item&nbsp;&nbsp;<i className="fa-regular fa-pen-to-square"></i> </Button>
            </Modal.Body>
        </Modal>);
};




function FeedbackLogTable({ user, feedbackLogItems = [], updateCachedItems, setIsLoggedIn }) {
    const [innerItems, setInnerItems] = useState([]);
    const [selected, SetSelected] = useState(null);
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [updateDetails, setUpdateDetails] = useState(null);

    //since the items are passed as a prop, it doesn't re-render the child when the parent's State is updated, this should do that
    useEffect(() => {
        setInnerItems(feedbackLogItems);
    }, [feedbackLogItems]);

    // search mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = React.useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {
        if (!keyword || !searchText) {
            setInnerItems(feedbackLogItems);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);
            setInnerItems(feedbackLogItems.filter(result => result.content.toLowerCase().includes(keyword) || result.header.toLowerCase().includes(keyword))); //consider implementing fuzzy search here
            //also consider doing some logic so that if there are a lot of items, we ask the BE to do this instead
        }, 1000);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);


    const columns = [
        {
            key: "feedback_log_item_id",
            label: "ID",
            sortable: true
        },
        {
            key: "header",
            label: "Title",
            sortable: true
        },
        {
            key: "created_by_username",
            label: "Created By",
            sortable: true
        },
        {
            key: "created_on",
            label: "Created On",
            sortable: true
        },
        {
            key: "actions",
            label: "Actions",
        }
    ];

    const delay = 500; //for tooltips

    return (
        <>
            <Input
                bordered
                value={searchText}
                labelPlaceholder="Search the log"
                helperText={searchText ? '3 second delay is normal' : ''}
                css={{ 'margin-top': '10px', 'margin-bottom': '20px', right: '25%' }}
                width="300px"
                clearable
                onChange={(e) => setSearchText(e.target.value)}
            ></Input>

            <Table
                aria-label="Example table with dynamic content"
                bordered
                lined
                selectionMode='single'
                onSelectionChange={e => SetSelected(parseInt(e.currentKey))}
                compact
                shadow
                color="primary"
                containerCss={{
                    height: "auto",
                    minWidth: "70%",
                    'z-index': 10
                }}
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={innerItems} css={{ 'text-align': 'left' }}>
                    {(item) => (
                        <Table.Row key={item.feedback_log_item_id} className="position-table-row">
                            {columnKey => {
                                if (columnKey === 'actions') {
                                    return <Table.Cell css={{ 'padding': '15px' }} >

                                        <Row align='flex-start' >
                                            <Tooltip content="Modify" placement="left" shadow enterDelay={delay}>
                                                <CustomButton buttonStyle="btn--transparent" onClick={() => { setUpdateDetails({ ...updateDetails, status: item.status, header: item.header, content: item.content }) || setUpdateModalOpen(true) }} ><i className="fa-regular fa-pen-to-square"></i></CustomButton>
                                            </Tooltip>
                                            <Tooltip content="Details" placement="top" shadow enterDelay={delay}>
                                                <CustomButton buttonStyle="btn--transparent" onClick={() => setUpdateDetails({ ...updateDetails, notes: item.notes, internal_notes: item.internal_notes || [] }) || setNotesModalOpen(true)}><i className="fa-solid fa-list-ul"></i></CustomButton>
                                            </Tooltip>
                                            <Tooltip content="Thread" placement="right" shadow enterDelay={delay}>
                                                <CustomButton buttonStyle="btn--transparent" onClick={() => { }}><i className="fa-regular fa-comments"></i></CustomButton>
                                            </Tooltip>
                                            <Spacer x={0.5} />
                                            <StatusDropdown user={user} default_value={item.status} />
                                        </Row>

                                    </Table.Cell>
                                } else if (['created_on'].includes(columnKey)) {
                                    return <Table.Cell> {item[columnKey] ? item[columnKey].substring(0, 10) : ' - '} </Table.Cell>
                                } else {
                                    return <Table.Cell> {item[columnKey]} </Table.Cell>
                                }
                            }}
                        </Table.Row>
                    )}
                </Table.Body>

                <Table.Pagination shadow align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })} />
            </Table>

            <Modal closeButton blur aria-labelledby="modal-title" open={notesModalOpen} onClose={() => setNotesModalOpen(false)} >
                <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                    <Text size={14} > Notes in relation to #{selected} </Text>
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
            </Modal>


            <FeedbackItemUpdateModal is_open={updateModalOpen} set_is_open={setUpdateModalOpen} {...{ user, setIsLoggedIn, updateCachedItems, updateDetails }} item_id={selected} />

            <Modal
                scroll
                blur
                aria-labelledby="modal-title"
                css={{'max-width': '550px'}}
                open={notesModalOpen}
                closeButton onClose={() => setNotesModalOpen(false)} >
                <Modal.Body>

                    <NotesModule notes_list={updateDetails?.notes} user={user} title_text="Notes" update_func={(notes) => {
                        console.log('updating feedback log item', selected, notes);
                        axios.put(`http://localhost:8000/feedback_log_items/${selected}`, {
                            notes
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }} />
                    {user.permissions.endsWith('client') ? undefined : <NotesModule
                        notes_list={updateDetails?.internal_notes} user={user}
                        title_text="Internal Notes"
                        update_func={(notes) => {
                            console.log('updating feedback log item', selected, notes);
                            axios.put(`http://localhost:8000/feedback_log_items/${selected}`, {
                                notes
                            }).then(response => {
                                console.log('response:', response.data);
                                if ([201, 200].includes(response.status)) {
                                    console.log('successful');
                                } else if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else {
                                    console.log(response);
                                }
                            });
                        }} />}

                </Modal.Body>
            </Modal>
        </>
    );
}








function ThreadsModal({user, feedback_log_item_id}) {
    
}













function StatusDropdown({ update_func, user, default_value }) {
    const statusList = [
        {
            key: 'submitted',
            name: 'Submitted',
            color: 'default'
        },
        {
            key: 'in_review',
            name: 'In Review',
            color: 'secondary'
        },
        {
            key: 'in_progress',
            name: 'In Progress',
            color: 'primary'
        },
        {
            key: 'awaiting_client',
            name: 'Awaiting Client Response',
            color: 'warning',
            disabled: user.permissions.endsWith('client')
        },
        {
            key: 'completed',
            name: 'Completed',
            color: 'success',
            disabled: !(user.is_total || default_value === 'awaiting_client'),
            description: "This is a final status & can't be reverted"
        },
        {
            key: 'rejected',
            name: 'Rejected',
            color: 'error',
            withDivider: true
        }
    ];

    return (
        <CustomizedDropdown default_value={default_value || 'submitted'} optionsList={statusList} outerUpdater={update_func} />
    );
}