import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import LoadingPage from './LoadingPage';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

function ToDos({ archive }) {

    const [toDoList, setToDoList] = useState(null);
    const [toDoMap, setToDoMap] = useState({});
    const [toDoCategories, setToDoCategories] = useState(['General', 'Personal', 'Financial', 'School', 'Professional', 'Legal', 'Immigration']);
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [contentText, setContentText] = useState('');
    const [categoryText, setCategoryText] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [previousUpdate, setPreviousUpdate] = useState(null);

    const selectedValue = React.useMemo(
        () => Array.from(categoryText).join(", ").replaceAll("_", " "),
        [categoryText]
    );

    const { setIsLoggedIn, accessToken, firstName, user } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


    const kickOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
    };



    function updateToDo(to_do_id, status) {
        axios.put(`http://localhost:8000/todos/${to_do_id}`, { completed: status }).then(response => {
            if (response.status === 401) {
                kickOut();
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

    useEffect(() => {
        axios.get(`http://localhost:8000/todos/my_todos${archive ? '?archived=true' : ''}`).then(response => {
            if (response.status === 401) {
                kickOut();
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
        console.log('the array', toDoList);


        toDoList?.forEach(to_do => {
            if (!ToDoMapTemp[to_do.category || 'General']) {
                ToDoMapTemp[to_do.category || 'General'] = [];
            }
            ToDoMapTemp[to_do.category || 'General'].push(to_do);
        });
        setToDoMap(ToDoMapTemp);
    }, [toDoList]);

    if (!toDoList) { return (<LoadingPage />); }

    return (<>
        <NavMenu />
        {!toDoList.length && <> <h2>{archive ? "No items in the archive yet" : "No To-Do's Yet! Let's create one now!"} 😄 </h2> </>}
        {archive ? <CustomButton to="/todos/" buttonStyle="btn--outline"> <i className="fa-solid fa-angles-left"></i> Back to current To-Do's</CustomButton> : <CustomButton to="/todos/archive" buttonStyle="btn--outline"> Archived To-Do's <i className="fa-solid fa-angles-right"></i></CustomButton>}

        <Grid.Container gap={1} justify="center" >
            {Object.entries(toDoMap).map(([category, items]) =>
                <Grid key={category}>
                    <ToDoCategoryCard
                        archive={archive}
                        text={category}
                        key={`${category}-card`}
                        children={items.map(item =>
                            <ToDoItem archive={archive} is_initially_checked={item.completed}
                                id={item.to_do_id}
                                key={item.to_do_id}
                                completion_date={item.updated_on?.substring(0, 10)}
                                text={item.content}
                                update_function={updateToDo} />
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

                axios.post(`http://localhost:8000/todos/archive_all_completed`).then(response => {
                    if (response.status === 401) {
                        kickOut();
                    } else if (response.status === 201) {
                        setToDoList(toDoList.filter(item => !item.completed));
                    } else {
                        console.log('fetch', response);
                    }
                });
            }}
        > Move Completed to Archive </Button>}

        {
            creationModalOpen && (<Modal closeButton blur aria-labelledby="modal-title" open={true} onClose={() => setCreationModalOpen(false)} >
                <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                    <Text size={14} > Please enter the information below </Text> </Modal.Header>
                <Modal.Body>
                    <Spacer y={0.4} />
                    <Input labelPlaceholder="What do you need to do?" color="primary" rounded bordered clearable onChange={(e) => setContentText(e.target.value)} ></Input>
                    <Dropdown>
                        <Dropdown.Button shadow>{selectedValue || 'Category'}</Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Category Dropdown"
                            selectionMode="single"
                            selectedKeys={categoryText}
                            onSelectionChange={setCategoryText}
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

                    <Button
                        disabled={!contentText || !categoryText}
                        shadow
                        auto
                        onPress={async () => {
                            console.log('creating to-do', selectedValue, contentText);
                            await axios.post(`http://localhost:8000/todos/`, {
                                content: contentText,
                                category: selectedValue
                            }).then(response => {
                                console.log('response:', response.data);
                                if ([201].includes(response.status)) {
                                    console.log('successful');
                                    setCreationModalOpen(false);
                                    setToDoList(toDoList.concat(response.data));
                                } else if (response.status === 401) {
                                    kickOut();
                                } else {
                                    console.log(response);
                                }
                            });
                        }}> {<>Create To-Do&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
                </Modal.Body>
            </Modal>)
        }

    </>);

};

export default ToDos;

function ToDoItem({ is_initially_checked = false, update_function, id, text, archive, completion_date }) {
    const [itemChecked, setItemChecked] = useState(is_initially_checked);

    return (<>
        <Checkbox
            isDisabled={archive}
            key={id}
            color="success"
            onChange={(val) => { setItemChecked(val); console.log(id, val); update_function(id, val) }}
            isSelected={itemChecked} >
            <Text h4
                color="white"
                className={itemChecked ? 'strike' : ''} >{text}
            </Text>
            {archive && <Text h7 color="lightgrey" >{completion_date} </Text>}
        </Checkbox>
        <br />
    </>);
}


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