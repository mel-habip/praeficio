import React, { useState, useContext, useEffect, useRef } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import LoadingPage from './LoadingPage';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

export default function ToDos({ archive }) {
    document.title = "Praeficio.com | ToDo's";

    const [toDoList, setToDoList] = useState(null);
    const [filteredToDoList, setFilteredToDoList] = useState(null);
    const [toDoMap, setToDoMap] = useState({});
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [content, setContent] = useState({
        text: '',
        due_on: null,
        category: new Set(),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [previousUpdate, setPreviousUpdate] = useState(null); //meant for an "undo" functionality

    const selectedCategoryValue = React.useMemo(
        () => Array.from(content.category).join(", ").replaceAll("_", " "),
        [content.category]
    );

    const { setIsLoggedIn, accessToken, firstName, user } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


    // search Debounce mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = React.useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {

        if (!keyword || !searchText) {
            setFilteredToDoList(toDoList);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);
            setFilteredToDoList(toDoList.filter(item => Object.values(item).join(' ').toLowerCase().includes(keyword)));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    useEffect(() => setFilteredToDoList(toDoList), [toDoList]);


    function updateToDoStatus(to_do_id, status) {
        axios.put(`/todos/${to_do_id}`, { completed: status }).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setToDoList(toDoList.map(to_do => {
                    if (to_do.to_do_id === to_do_id) {
                        return { ...to_do, completed: status };
                    } else {
                        return to_do;
                    }
                }));
            } else {
                console.log('fetch', response);
            }
        });
    }

    const updateCachedToDoList = (to_do_id, updated_details) => {
        setToDoList(toDoList.map(to_do => {
            if (to_do.to_do_id === to_do_id) {
                return updated_details;
            } else {
                return to_do;
            }
        }));
    }

    useEffect(() => { //main fetcher on load
        axios.get(`/todos/my_todos${archive ? '?archived=true' : ''}`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setToDoList(response.data.data ?? []);
            } else {
                console.log('fetch', response);
            }
        });
    }, [archive]);

    useEffect(() => {
        const ToDoMapTemp = {};

        console.log('the map', ToDoMapTemp);
        console.log('the array', filteredToDoList);

        filteredToDoList?.forEach(to_do => {
            if (!ToDoMapTemp[to_do.category || 'General']) {
                ToDoMapTemp[to_do.category || 'General'] = [];
            }
            ToDoMapTemp[to_do.category || 'General'].push(to_do);
        });
        setToDoMap(ToDoMapTemp);
    }, [filteredToDoList]);

    if (!filteredToDoList) { return (<LoadingPage />); }

    return (<>
        <NavMenu />
        {!toDoList.length && <> <h2>{archive ? "No items in the archive yet" : "No To-Do's Yet! Let's create one now!"} 😄 </h2> </>}
        {archive ? <CustomButton to="/todos/"> <i className="fa-solid fa-angles-left"></i> Back to current To-Do's</CustomButton> : <CustomButton disabled={isEditMode} to="/todos/archive"> Archived To-Do's <i className="fa-solid fa-angles-right"></i></CustomButton>}


        <div style={{ position: "absolute", top: '5%', right: '5%' }}>
            <Tooltip content="Edit Mode" enterDelay={500} placement='bottom' >
                <CustomButton disabled={archive} onClick={() => setIsEditMode(!isEditMode)} ><i className="fa-regular fa-pen-to-square"></i></CustomButton>
            </Tooltip>

        </div>


        <Input
            bordered
            value={searchText}
            labelPlaceholder="Search my ToDo's"
            helperText={searchText ? 'a small delay is normal' : ''}
            css={{ margin: '15px' }}
            width="300px"
            clearable
            onChange={(e) => setSearchText(e.target.value)}
        />

        <Grid.Container gap={1} justify="center" >
            {Object.entries(toDoMap).map(([category, items]) =>
                <Grid key={category}>
                    <ToDoCategoryCard
                        archive={archive}
                        text={category}
                        key={`${category}-card`}
                        children={items.map(item =>
                            <ToDoItem archive={archive}
                                edit_mode={isEditMode}
                                is_initially_checked={item.completed}
                                key={item.to_do_id}
                                details={item}
                                details_updater={updateCachedToDoList}
                                status_updater={updateToDoStatus} />
                        )} />
                </Grid>
            )}
        </Grid.Container>

        <Spacer y={2} />
        {!archive && <Button
            onClick={() => setCreationModalOpen(true)}
            shadow
        > Let's Create a To-Do! </Button>}
        <Spacer y={2} />

        {!archive && <Button
            color="success"
            shadow
            disabled={toDoList.every(item => !item.completed)}
            onClick={() => {

                axios.post(`/todos/archive_all_completed`).then(response => {
                    if (response.status === 401) {
                        setIsLoggedIn(false);
                    } else if (response.status === 201) {
                        setToDoList(toDoList.filter(item => !item.completed));
                    } else {
                        console.log('fetch', response);
                    }
                });
            }}
        > Move Completed to Archive </Button>}

        <Modal closeButton blur aria-labelledby="modal-title" open={creationModalOpen} onClose={() => setCreationModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <Input labelPlaceholder="What do you need to do?" color="primary" rounded bordered clearable onChange={(e) => setContent({ ...content, text: e.target.value })} ></Input>
                <Input label="When is this due?" color="primary" type="date" rounded bordered clearable onChange={(e) => setContent({ ...content, due_on: e.target.value })} ></Input>

                <Dropdown>
                    <Dropdown.Button shadow>{selectedCategoryValue || 'Category'}</Dropdown.Button>
                    <Dropdown.Menu
                        aria-label="Category Dropdown"
                        selectionMode="single"
                        selectedKeys={content.category}
                        onSelectionChange={v => setContent({ ...content, category: v })}
                        items={user.to_do_categories.map((cat, ix) => { return { id: ix, name: cat } })}>
                        {(item) => (
                            <Dropdown.Item
                                key={item.name}
                            >
                                {item.name}
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
                <em>Note: You can create custom categories in the <a href="/settings">"Settings"</a>  page.</em>
                <Button
                    disabled={!content.text || !content.category}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating to-do', selectedCategoryValue, content.text);
                        await axios.post(`/todos/`, {
                            content: content.text,
                            category: selectedCategoryValue,
                            due_on: content.due_on || undefined,
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201].includes(response.status)) {
                                console.log('successful');
                                setCreationModalOpen(false);
                                setToDoList(toDoList.concat(response.data));
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> {<>Create To-Do&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
            </Modal.Body>
        </Modal>
    </>);

};

function ToDoItem({ is_initially_checked = false, status_updater, details_updater, details, archive, edit_mode = false }) {
    const [itemChecked, setItemChecked] = useState(is_initially_checked);
    const [editSelected, setEditSelected] = useState(false);
    const todoTextRef = useRef();

    const due_date_details = {
        due_date: details.due_on,
        days_away: details.due_on ? ((new Date(details.due_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(0) : '',
    };

    due_date_details.past = due_date_details.days_away < 0;

    if (details.due_on) {
        due_date_details.sentence = due_date_details.past ? `The due date passed ${Math.abs(due_date_details.days_away)} days ago` : `The due date is in ${Math.abs(due_date_details.days_away)} days`;
        if (due_date_details.past) {
            due_date_details.status = 'error';
        } else if (due_date_details.days_away < 10) {
            due_date_details.status = 'warning';
        }
    }
    switch (due_date_details.status) {
        case 'error': {
            due_date_details.color = 'red';
            due_date_details.logo = '🔴';
            break;
        }
        case 'warning': {
            due_date_details.color = 'orange';
            due_date_details.logo = '⚠️';
            break;
        }
        default: {
            due_date_details.color = 'lightgrey';
            due_date_details.logo = details.due_on ? '🟢' : '';
        }
    }


    return (<Row justify="flex-start">
        {editSelected ? <Input css={{ mt: '15px' }} ref={todoTextRef} onKeyDown={e => { if (e.key === 'Enter') { details_updater(details.to_do_id, { ...details, content: todoTextRef.current.value }); setEditSelected(false) } }} labelPlaceholder="Hit 'Enter' to save" initialValue={details.content} /> :
            <Checkbox
                isDisabled={archive || edit_mode}
                key={details.to_do_id}
                color="success"
                onChange={(val) => { setItemChecked(val); console.log(details.to_do_id, val); status_updater(details.to_do_id, val) }}
                isSelected={itemChecked} >
                <Text h4
                    color="white"
                    className={itemChecked ? 'strike' : ''} >{details.content}
                </Text>
                {archive && <Text h7 color="lightgrey" >{details.completed_on?.substring(0, 10)} </Text>}
            </Checkbox>
        }

        {!archive && !!details.due_on &&
            <Tooltip content={due_date_details.sentence} shadow>
                <Text h7 color={due_date_details.color} > &nbsp; {due_date_details.logo} </Text>
            </Tooltip>}
        {edit_mode && <CustomButton buttonSize="btn--small" buttonStyle="btn--transparent" onClick={() => setEditSelected(!editSelected)}><i style={{ margin: 'auto' }} className={editSelected ? "fa-solid fa-circle-xmark" : "fa-solid fa-pencil"} /></CustomButton>}
        {edit_mode && <CustomButton buttonSize="btn--small" buttonStyle="btn--transparent"><i style={{ margin: 'auto' }} className="fa-solid fa-trash-can" /></CustomButton>}
        <br />
    </Row>);
};

function ToDoCategoryCard({ text, children, archive }) {
    return (
        <Card css={{ $$cardColor: archive ? 'grey' : '$colors$primary' }}>
            <Card.Body>
                <Text h3 color="white" css={{ mt: 0 }}>
                    {text}
                </Text>
                <Card.Divider />
                {children}
            </Card.Body>
        </Card>
    );
};