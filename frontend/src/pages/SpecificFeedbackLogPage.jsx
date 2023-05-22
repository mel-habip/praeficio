import React, { useState, useEffect, useContext, lazy } from 'react';
import { useParams } from 'react-router-dom'

import { Link } from 'react-router-dom';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';

import LoadingPage from './LoadingPage';

import axios from 'axios';

import { Button, Modal, Spacer, Text, Input, Tooltip, Row, Table, Textarea, useAsyncList, useCollator, Loading, Badge } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import UserSearchModal from '../components/UserSearchModal';
import timestampFormatter from '../utils/timestampFormatter';
import useHandleError from '../utils/handleError';

const MessengerSection = lazy(() => import('../components/Messenger'));
const NotesModule = lazy(() => import('../components/NotesModule'));
const NavMenu = lazy(() => import('../components/NavMenu'));
const FilterCreationModal = lazy(() => import('../components/FilterCreationModal'));

export default function SpecificFeedbackLogPage() {

    const { feedback_log_id } = useParams();
    const handleError = useHandleError();

    console.log('routeParams', feedback_log_id);

    const { setIsLoggedIn, accessToken, user } = useContext(IsLoggedInContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const [feedbackLogItems, setFeedbackLogItems] = useState(null);
    const [feedbackLogFilters, setFeedbackLogFilters] = useState(null);
    const [feedbackLogOwnDetails, setFeedbackLogOwnDetails] = useState({});
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [userAdditionModalOpen, setUserAdditionModalOpen] = useState(false);


    //fetch the data
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/feedback_logs/${feedback_log_id}`).then(response => {
            if (response.status === 200) {
                let { data: items, ...rest } = response.data;
                setFeedbackLogOwnDetails(rest);
                setFeedbackLogItems(items ?? []);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
        axios.get(`${process.env.REACT_APP_API_LINK}/feedback_log_filters/${feedback_log_id}`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setFeedbackLogFilters(response.data.data);
            } else {
                console.warn('fetch', response);
            }
        });
    }, []);

    if (!feedbackLogItems || !user || !feedbackLogFilters) { return (<LoadingPage />); }

    const updateCachedItems = (item_id, updated_details) => {
        setFeedbackLogItems(feedbackLogItems.map(item => {
            if (item.feedback_log_item_id === item_id) {
                return updated_details;
            } else {
                return item;
            }
        }));
    }

    return (<>
        <NavMenu />

        <h1>{feedbackLogOwnDetails.name}</h1>
        <CustomButton to="/feedback_logs" buttonStyle="btn--outline"><i className="fa-solid fa-angles-left"></i> Back to My Feedback Logs</CustomButton>


        {(!feedbackLogItems.length && !feedbackLogOwnDetails.archived) && <><h3>No items in this log yet - Go ahead & add some! </h3><hr className="line-primary" /></>}
        {feedbackLogOwnDetails.archived && <><h3> This log has been locked and archived. </h3><hr className="line-primary" /></>}

        {!!feedbackLogItems.length && <FeedbackLogTable archived={feedbackLogOwnDetails.archived} {...{ feedbackLogOwnDetails, feedbackLogFilters, updateCachedItems, feedbackLogItems, user, setIsLoggedIn }} />}

        <Spacer y={1} />
        {/*need to handle these, TODO: */}
        <Row justify="space-evenly" >
            <Button disabled={feedbackLogOwnDetails.archived} shadow onClick={() => setCreationModalOpen(true)} > Add Items </Button>
            <Button shadow onClick={() => console.log(true)} > Bulk-Export Items </Button>

            {!user.permissions.endsWith('client') && <>
                <Button shadow onClick={() => setUserAdditionModalOpen(true)} > Add Users </Button>
                <Button disabled={feedbackLogOwnDetails.archived} shadow onClick={() => console.log(true)} > Bulk-Import Items </Button>
            </>}
        </Row>

        <UserSearchModal is_open={userAdditionModalOpen} set_is_open={setUserAdditionModalOpen} user={user} setIsLoggedIn={setIsLoggedIn} add_button_text={`Add user to ${feedbackLogOwnDetails.name}`} button_function={(user_id) => {
            axios.post(`${process.env.REACT_APP_API_LINK}/feedback_logs/${feedback_log_id}/add_user`, { user_id }).then(response => {
                if (response.status === 401) {
                    setIsLoggedIn(false);
                } else if (response.status === 201) {
                    setUserAdditionModalOpen(false);
                } else {
                    console.warn('fetch', response);
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
                        await axios.post(`${process.env.REACT_APP_API_LINK}/feedback_logs/${current_feedback_log_id}/new_item`, {
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


function FeedbackItemUpdateModal({ is_open, set_is_open, updateCachedItems, setIsLoggedIn, user, item_id, updateDetails, archived }) {
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
                    disabled={archived}
                    clearable
                    onChange={(e) => setItemHeader(e.target.value)}
                    value={itemHeader}
                ></Input>
                <Spacer y={0.8} />
                <Textarea
                    labelPlaceholder="Detailed Description"
                    bordered
                    disabled={archived}
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

                <StatusDropdown disabled={archived} user={user} update_func={setStatus} default_value={status} />

                <Button
                    disabled={!description || description?.length < 50 || archived}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('updating feedback log item', itemHeader);
                        await axios.put(`${process.env.REACT_APP_API_LINK}/feedback_log_items/${item_id}`, {
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


function FeedbackLogTable({ user, feedbackLogItems = [], updateCachedItems, setIsLoggedIn, feedbackLogOwnDetails, archived, feedbackLogFilters }) {

    const [selected, SetSelected] = useState(null);
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [threadsModalOpen, setThreadsModalOpen] = useState(false);
    const [updateDetails, setUpdateDetails] = useState(null);



    let load = async ({ filterText }) => ({ items: filterText ? feedbackLogItems.filter(result => [result.content.toLowerCase(), result.header.toLowerCase(), result.created_on, result.updated_on, result.created_by_username].join('').includes(filterText)) : feedbackLogItems }); //this can normally be an async function that fetches the data, but already we hold the whole page off while it is loading


    //This section is what supports sorting
    const collator = useCollator({ numeric: true });
    async function sort({ items, sortDescriptor }) {
        return {
            items: items.sort((a, b) => {
                let first = a[sortDescriptor.column];
                let second = b[sortDescriptor.column];
                let cmp = collator.compare(first, second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }),
        };
    };

    const list = useAsyncList({ load, sort });
    //This section is what supports sorting


    // search Debounce mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = React.useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {
        if (!keyword || !searchText) {
            list.setFilterText('');
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);
            list.setFilterText(keyword);
        }, 300);
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
            key: "updated_on",
            label: "Last Update",
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
            <Row css={{ mb: '10px', 'ml': '30%' }} >
                <Input
                    bordered
                    value={searchText}
                    labelPlaceholder="Search the log"
                    helperText={searchText ? 'a small delay is normal' : ''}
                    css={{ mr: '3px' }}
                    width="300px"
                    clearable
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <FiltersDropdown {...{ feedbackLogFilters, feedbackLogOwnDetails }} />
            </Row>

            <Table
                aria-label="Example table with dynamic content"
                bordered
                lined
                selectionMode='single'
                onSelectionChange={e => SetSelected(parseInt(e.currentKey))}
                compact
                sortDescriptor={list.sortDescriptor}
                onSortChange={list.sort}
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
                        <Table.Column allowsSorting={column.sortable} key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={list.items} css={{ 'text-align': 'left' }} loadingState={list.loadingState}>
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
                                            <Tooltip content="Threads" placement="right" shadow enterDelay={delay}>
                                                <Badge isInvisible={!item.last_message_sent_by || item.last_message_sent_by === user.id} color="warning" content="!" shape="circle" >
                                                    <CustomButton buttonStyle="btn--transparent" onClick={() => { setThreadsModalOpen(true) }}><i className="fa-regular fa-comments"></i></CustomButton>
                                                </Badge>
                                            </Tooltip>
                                            <Spacer x={0.5} />
                                            <StatusDropdown disabled={archived} user={user} default_value={item.status} update_func={(stat => {
                                                axios.put(`${process.env.REACT_APP_API_LINK}/feedback_log_items/${item.feedback_log_item_id}`, {
                                                    status: stat
                                                }).then(response => {
                                                    console.log('response:', response.data);
                                                    if ([201].includes(response.status)) {
                                                        console.log('successful');
                                                        setUpdateDetails({ ...updateDetails, status: stat });
                                                    } else if (response.status === 401) {
                                                        setIsLoggedIn(false);
                                                    } else {
                                                        console.warn(response);
                                                    }
                                                });
                                            })} />
                                        </Row>
                                    </Table.Cell>
                                } else if (['created_on'].includes(columnKey)) {
                                    return <Table.Cell> {item[columnKey] ? item[columnKey].substring(0, 10) : ' - '} </Table.Cell>
                                } else if (['updated_on'].includes(columnKey)) {
                                    return <Table.Cell> {item[columnKey] ? timestampFormatter(item[columnKey]) : ' - '} </Table.Cell>
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


            <FeedbackItemUpdateModal is_open={updateModalOpen} set_is_open={setUpdateModalOpen} {...{ archived, user, setIsLoggedIn, updateCachedItems, updateDetails }} item_id={selected} />

            <ThreadsModal disabled={archived} is_open={threadsModalOpen} set_is_open={setThreadsModalOpen} {...{ archived, user, setIsLoggedIn }} item_id={selected} />


            <Modal
                scroll
                blur
                aria-labelledby="log item notes modal"
                css={{ 'max-width': '550px' }}
                open={notesModalOpen}
                closeButton onClose={() => setNotesModalOpen(false)} >
                <Modal.Body>

                    <NotesModule disabled={archived} notes_list={updateDetails?.notes} user={user} title_text="Notes" update_func={(notes) => {
                        console.log('updating feedback log item', selected, notes);
                        axios.put(`${process.env.REACT_APP_API_LINK}/feedback_log_items/${selected}`, {
                            notes
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                setUpdateDetails({ ...updateDetails, notes });
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.warn(response);
                            }
                        });
                    }} />
                    {user.permissions.endsWith('client') ? undefined : <NotesModule
                        notes_list={updateDetails?.internal_notes} user={user}
                        disabled={archived}
                        title_text="Internal Notes"
                        update_func={(notes) => {
                            console.log('updating feedback log item', selected, notes);
                            axios.put(`${process.env.REACT_APP_API_LINK}/feedback_log_items/${selected}`, {
                                notes
                            }).then(response => {
                                console.log('response:', response.data);
                                if ([201, 200].includes(response.status)) {
                                    console.log('successful');
                                } else if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else {
                                    console.warn(response);
                                }
                            });
                        }} />}

                </Modal.Body>
            </Modal>
        </>
    );
}


function ThreadsModal({ user, item_id, is_open, set_is_open, setIsLoggedIn, disabled }) {
    const [messageList, setMessageList] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');

    const textLimit = 300;

    useEffect(() => {
        if (!item_id || !is_open) return;
        setMessageList(null);
        axios.get(`${process.env.REACT_APP_API_LINK}/feedback_log_item_messages/${item_id}`).then(response => {
            console.log('response:', response.data);
            setNewMessageText('');
            if ([200].includes(response.status)) {
                console.log('successful');
                setMessageList(response.data.data);
            } else if (response.status === 401) {
                setIsLoggedIn(false);
            } else {
                console.warn(response);
            }
        });
    }, [item_id, is_open]);


    if (!messageList) return (<Modal
        closeButton
        blur
        aria-labelledby="chat modal"
        open={is_open}
        onClose={() => set_is_open(false)}
        scroll
        width='700px'
    >
        <Modal.Body>

            <Loading size="lg" />

        </Modal.Body>
    </Modal>);

    return (<Modal
        closeButton
        blur
        aria-labelledby="chat modal"
        open={is_open}
        onClose={() => set_is_open(false)}
        width='700px'
        css={{maxHeight: '700px'}}
    >
        <Modal.Body>
            <CustomButton
                buttonStyle="btn--transparent"
                rounded
                onClick={() => {
                    axios.get(`${process.env.REACT_APP_API_LINK}/feedback_log_item_messages/${item_id}`).then(response => {
                        console.log('response:', response.data);
                        setNewMessageText('');
                        if ([200].includes(response.status)) {
                            console.log('successful');
                            setMessageList(response.data.data);
                        } else if (response.status === 401) {
                            setIsLoggedIn(false);
                        } else {
                            console.warn(response);
                        }
                    });
                }}
                style={{ 'align-self': 'flex-start' }}
            ><i className="fa-solid fa-rotate"></i> </CustomButton>

            <MessengerSection messageList={messageList} user={user} />
            <Row css={{ 'margin-top': '15px' }} justify='space-evenly' >
                <Textarea
                    bordered
                    disabled={disabled}
                    minRows={3}
                    maxRows={10}
                    value={newMessageText}
                    labelPlaceholder="New message"
                    color={newMessageText.length > textLimit ? 'error' : 'default'}
                    width="100%"
                    onChange={(e) => setNewMessageText(e.target.value)}
                />
                <CustomButton
                    buttonStyle="btn--transparent"
                    aria-label="send message button"
                    rounded
                    disabled={disabled}
                    shadow
                    onClick={() => {
                        console.log('sending message', newMessageText);
                        axios.post(`${process.env.REACT_APP_API_LINK}/feedback_log_item_messages/${item_id}`, {
                            content: newMessageText,
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                setMessageList(messageList.concat({ id: 1231, sent_by: user.id, sent_by_name: user.first_name || user.username, content: newMessageText, created_on: new Date() }));
                                setNewMessageText('');
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.warn(response);
                            }
                        });
                    }} ><i className="fa-solid fa-dove"></i></CustomButton>
            </Row>
        </Modal.Body>
    </Modal>);
}


function StatusDropdown({ disabled, update_func, user, default_value }) {
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
        <CustomizedDropdown disabled={disabled} default_value={default_value || 'submitted'} optionsList={statusList} outerUpdater={update_func} />
    );
}

function FiltersDropdown({ feedbackLogFilters, feedbackLogOwnDetails, }) {
    const [filterApplied, setFilterApplied] = useState(feedbackLogOwnDetails?.default_filter_id);
    const [filterCreationModalOpen, setFilterCreationModalOpen] = useState(false);

    const formattedList = feedbackLogFilters.map(entry => ({ key: entry.feedback_log_filter_id, name: entry.name, description: entry.description }));

    if (!formattedList.length) formattedList.unshift({ key: 'empty_note', name: 'Nothing yet, create one!', disabled: true });

    formattedList.push({ key: 'create_new', name: 'create new', withDivider: true });

    return (
        <>
            <CustomizedDropdown mountDirectly disallowEmptySelection={false} trigger={<Button auto color={filterApplied ? 'success' : 'default'} ><i className="fa-solid fa-filter fa-lg"></i></Button>} optionsList={formattedList} outerUpdater={e => { console.log('e', e); if (e === 'create_new') { setFilterCreationModalOpen(true); } else { setFilterApplied(e) } }} />
            <FilterCreationModal {...{ filterCreationModalOpen, setFilterCreationModalOpen, }} createdByOptions={feedbackLogOwnDetails.users} />
        </>
    );
}