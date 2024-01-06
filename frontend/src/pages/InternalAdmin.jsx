import { useState, useEffect, useContext, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import validatePassword from '../utils/validatePassword.mjs';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import LoadingPage from './LoadingPage';

import { Button, Modal, Spacer, Text, Checkbox, Input, Tooltip, Row, Table, Textarea, useAsyncList, useCollator, Loading } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import timestampFormatter from '../utils/timestampFormatter';
import useHandleError from '../utils/handleError';

import NavMenu from '../components/NavMenu';


export default function InternalAdmin() {

    const handleError = useHandleError();

    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const [listItems, setListItems] = useState(null);

    //fetch the data
    useEffect(() => {
        axios.get(`/users/`).then(response => {
            if (response.status === 200) {
                setListItems(response.data);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
    }, []);

    if (!listItems) { return (<LoadingPage />); }

    return (<>
        <NavMenu />
        <UsersTable usersList={listItems} />

    </>);
}


function UsersTable({ usersList = [] }) {
    const [selected, setSelected] = useState(null);
    const [editModal, setEditModal] = useState(null);

    let load = async ({ filterText }) => ({ items: filterText ? usersList.filter(userRow => [userRow.first_name, userRow.last_name, userRow.created_on, userRow.updated_on, userRow.username, userRow.email, userRow.to_do_categories.join(',')].join('').toLowerCase().includes(filterText.toLowerCase().trim())) : usersList }); //this can normally be an async function that fetches the data, but already we hold the whole page off while it is loading

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
    const keyword = useMemo(() => searchText.trim().toLowerCase(), [searchText]);

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
            key: "user_id",
            label: "ID",
            sortable: true
        },
        {
            key: "username",
            label: "Username",
            sortable: true
        },
        {
            key: "first_name",
            label: "First Name",
            sortable: true
        },
        {
            key: "last_name",
            label: "Last Name",
            sortable: true
        },
        {
            key: "email",
            label: "Email",
            sortable: true
        },
        {
            key: "permissions",
            label: "Permissions",
            sortable: true
        },
        {
            key: 'discovery_token',
            label: 'Discovery Token',
            sortable: true
        },
        {
            key: "to_do_categories",
            label: "To-Do Categories"
        },
        {
            key: "active",
            label: "Active",
            sortable: true
        },
        {
            key: "deleted",
            label: "Deleted",
            sortable: true
        },
        {
            key: "use_beta_features",
            label: "Uses Beta features",
            sortable: true
        },
        {
            key: "workspaces",
            label: "workspaces"
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

    const delay = 500; //half a second

    return (<>
        {!!editModal &&
            <UserModifyModal
                isOpen={true}
                setIsOpen={setEditModal}
                user={editModal}
                setUser={user => { }} />}
        <Row css={{ mb: '10px', 'ml': '30%' }} >
            <Input
                bordered
                value={searchText}
                labelPlaceholder="Search the table"
                helperText={searchText ? 'a small delay is normal' : ''}
                css={{ mr: '3px' }}
                width="300px"
                clearable
                onChange={(e) => setSearchText(e.target.value)}
            />
        </Row>

        <Table
            aria-label="Example table with dynamic content"
            bordered
            lined
            selectionMode='single'
            onSelectionChange={e => setSelected(parseInt(e.currentKey))}
            compact
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            shadow
            color="primary"
            containerCss={{
                height: "auto",
                minWidth: "70%",
                maxWidth: '95%',
                'z-index': 10
            }}
        >
            <Table.Header columns={columns}>
                {(column) => (
                    <Table.Column allowsSorting={column.sortable} key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                )}
            </Table.Header>
            <Table.Body items={list.items} css={{ 'text-align': 'left' }} loadingState={list.loadingState}>
                {item => (
                    <Table.Row key={item.user_id} className="position-table-row" css={{ padding: '0px', margin: '0px' }}>
                        {columnKey => {
                            if (columnKey === 'actions') {
                                return <Table.Cell css={{ 'padding': '0px', wordWrap: 'break-word', margin: '0px' }} >

                                    <Row align='flex-start' >
                                        {item.active ? <Tooltip content="Deactivate" placement="left" shadow enterDelay={delay}> <CustomButton disabled={item.deleted} buttonStyle="btn--transparent" onClick={false} ><i className="fa-regular fa-hand" /></CustomButton> </Tooltip> : <Tooltip content="Reactivate" placement="left" shadow enterDelay={delay}> <CustomButton disabled={item.deleted} buttonStyle="btn--transparent" onClick={false} ><i className="fa-solid fa-heart-pulse" /></CustomButton> </Tooltip>}
                                        <Tooltip content={item.deleted ? 'Restore' : 'Delete'} placement="left" shadow enterDelay={delay}>
                                            {item.deleted ? <CustomButton buttonStyle="btn--transparent" onClick={false}><i className="fa-solid fa-recycle"></i></CustomButton> : <CustomButton buttonStyle="btn--transparent" onClick={false} ><i className="fa-regular fa-trash-can"></i></CustomButton>}
                                        </Tooltip>
                                        <Tooltip content="Bust Server Cache" placement="top" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" onClick={false}><i className="fa-solid fa-server" /></CustomButton>
                                        </Tooltip>
                                        <Tooltip content="Modify" placement="top" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" onClick={() => setEditModal(item)}><i className="fa-regular fa-pen-to-square" /></CustomButton>
                                        </Tooltip>
                                        <Tooltip content="Regenerate Recovery Codes" placement="top" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" onClick={false}><i className="fa-solid fa-key" /></CustomButton>
                                        </Tooltip>
                                        <Tooltip content="Regenerate Last Resort Passphrase" placement="right" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" onClick={false}><i className="fa-solid fa-book-atlas" /></CustomButton>
                                        </Tooltip>
                                    </Row>
                                </Table.Cell>
                            } else if (['created_on'].includes(columnKey)) {
                                return <Table.Cell> {item[columnKey] ? item[columnKey].substring(0, 10) : ' - '} </Table.Cell>
                            } else if (['updated_on'].includes(columnKey)) {
                                return <Table.Cell> {item[columnKey] ? timestampFormatter(item[columnKey]) : ' - '} </Table.Cell>
                            } else if (columnKey === 'to_do_categories') {
                                return <Table.Cell> <pre style={{ padding: '0px', margin: '0px' }} > {JSON.stringify(item[columnKey], null, 2)} </pre>  </Table.Cell>
                            } else {
                                return <Table.Cell> {item[columnKey]?.toString()} </Table.Cell>
                            }
                        }}
                    </Table.Row>
                )}
            </Table.Body>

            <Table.Pagination shadow align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })} />
        </Table>
    </>);
}


function UserModifyModal({ isOpen, setIsOpen, user, setUser }) {
    const [useBetaFeatures, setUseBetaFeatures] = useState(user.use_beta_features || false);
    const [firstName, setFirstName] = useState(user.first_name || '');
    const [lastName, setLastName] = useState(user.last_name || '');
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState(''); //this doesn't come from the BE and can only be reset, not edited
    const [email, setEmail] = useState(user.email || '');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    return (
        <Modal open={isOpen} onClose={() => setIsOpen(false)}>
            <Modal.Header>
                <Text h3 css={{ 'margin-top': '10px', 'border-bottom': '1px solid var(--text-primary)' }}>User Profile</Text>
            </Modal.Header>
            <Modal.Body>
                <Spacer y={2} />
                <Input
                    rounded
                    value={username}
                    clearable
                    css={{ 'width': '75%' }}
                    type="text"
                    bordered
                    labelPlaceholder="Username*"
                    color={usernameError ? "error" : "primary"}
                    status={usernameError ? "error" : "default"}
                    helperText={usernameError}
                    helperColor={usernameError ? "error" : "primary"}
                    onChange={(e) => setUsernameError('') || setUsername(e.target.value)} />
                <Spacer y={2} />

                <Input.Password
                    rounded
                    initialValue=""
                    value={password}
                    clearable
                    css={{ 'width': '75%' }}
                    required
                    bordered
                    labelPlaceholder="Password*"
                    color={passwordError ? "error" : "primary"}
                    status={passwordError ? "error" : "default"}
                    helperText={passwordError}
                    helperColor={passwordError ? "error" : "primary"}
                    onChange={(e) => setPasswordError('') || setPassword(e.target.value)} />
                <Spacer y={2} />
                <Input
                    clearable
                    bordered
                    value={firstName}
                    css={{ 'width': '33%', 'margin-right': '10px' }}
                    rounded
                    labelPlaceholder="First Name"
                    color="primary"
                    onChange={(e) => setFirstName(e.target.value)} />
                <Input
                    clearable
                    bordered
                    value={lastName}
                    css={{ 'width': '33%' }}
                    rounded
                    labelPlaceholder="Last Name"
                    color="primary"
                    onChange={(e) => setLastName(e.target.value)} />
                <Spacer y={2} />
                <Input
                    rounded
                    clearable
                    value={email}
                    type="email"
                    css={{ 'width': '75%' }}
                    bordered
                    labelPlaceholder="Email"
                    placeholder='you@domain.ca'
                    color={emailError ? "error" : "primary"}
                    status={emailError ? "error" : "default"}
                    helperText={emailError}
                    helperColor={emailError ? "error" : "primary"}
                    onChange={(e) => setEmailError('') || setEmail(e.target.value)} />
                <Spacer y={1} />

                <Checkbox isSelected={useBetaFeatures} onChange={(e) => setUseBetaFeatures(e)}><Text>Use Beta Features &nbsp; <i className="fa-solid fa-flask"></i></Text></Checkbox>
                <Spacer y={1} ></Spacer>
                <Row justify='space-evenly' >
                    <Button
                        auto
                        shadow color="inverse"
                        onPress={() => {
                            setUseBetaFeatures(user.use_beta_features);
                            setFirstName(user.first_name || '');
                            setLastName(user.last_name || '');
                            setUsername(user.username);
                            setEmail(user.email || '');
                            setPassword('');
                            setIsOpen(false);
                        }}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                    </Button>
                    <Button
                        auto
                        disabled={(password && !validatePassword(password))}
                        aria-label="user details save button"
                        shadow
                        color="success"
                        onPress={() => {
                            axios.put(`/users/${user.user_id}`, {
                                first_name: firstName,
                                last_name: lastName,
                                email,
                                username,
                                use_beta_features: useBetaFeatures,
                                password,
                            }).then(response => {
                                if (response.status === 200) {
                                    setUser({
                                        ...user,
                                        first_name: firstName,
                                        last_name: lastName,
                                        email,
                                        username,
                                        use_beta_features: useBetaFeatures,
                                    });
                                } else {
                                    console.log('response', response);
                                }
                            })
                        }}> Save&nbsp;<i className="fa-solid fa-floppy-disk"></i>
                    </Button>
                </Row>
            </Modal.Body>
        </Modal>
    );
}