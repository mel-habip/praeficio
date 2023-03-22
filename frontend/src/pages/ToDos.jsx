import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

function ToDos() {

    const [toDoList, setToDoList] = useState([]);
    const [toDoMap, setToDoMap] = useState({});
    const [toDoCategories, setToDoCategories] = useState(['General', 'Personal', 'Financial', 'School', 'Professional', 'Legal', 'Immigration']);
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [contentText, setContentText] = useState('');
    const [categoryText, setCategoryText] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [initiallyCompleted, SetInitiallyCompleted] = useState([]);
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

    const ToDoCategoryCard = ({ text, children }) => {
        return (
            <Card css={{ $$cardColor: '$colors$primary' }} shadow>
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

    function updateToDo(to_do_id, status) {
        if (!status && initiallyCompleted.includes(to_do_id)) SetInitiallyCompleted(initiallyCompleted.filter(i => i !== to_do_id));
        axios.put(`http://localhost:8000/todos/${to_do_id}`, { completed: status }).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                updateCachedToDoList(to_do_id, response.data.data);
                setTimeout(() => {
                    SetInitiallyCompleted(initiallyCompleted.concat(to_do_id));
                }, 1500);
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
        axios.get(`http://localhost:8000/todos/my_todos`).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                setToDoList(response.data.data ?? []);
                SetInitiallyCompleted(response.data.data.filter(todo => todo.completed).map(todo => todo.to_do_id));
            } else {
                console.log('fetch', response);
            }
        });
    }, []);

    useEffect(() => {
        const ToDoMapTemp = {};


        console.log('the map', ToDoMapTemp);
        console.log('the array', toDoList);


        toDoList.forEach(to_do => {
            if (!ToDoMapTemp[to_do.category || 'General']) {
                ToDoMapTemp[to_do.category || 'General'] = [];
            }
            ToDoMapTemp[to_do.category || 'General'].push(to_do);
        });
        setToDoMap(ToDoMapTemp);
    }, [toDoList]);



    return (<>
        <NavMenu first_name={firstName}></NavMenu>
        {!toDoList.length && <> <h2>No To-Do's Yet! Let's create one now! XD </h2> </>}

        <Grid.Container gap={1} justify="center">
            {Object.entries(toDoMap).map(([category, items]) =>
                <Grid >

                    <ToDoCategoryCard text={category} children={items.map(item => <><Checkbox color="success" onChange={(val) => { updateToDo(item.to_do_id, val); item.completed = true; console.log(item.to_do_id, val) }} isSelected={item.completed} ><Text h4 color="white" className={(initiallyCompleted.includes(item.to_do_id) && item.completed) ? 'striked' : item.completed ? 'strike' : ''} >{item.content}</Text></Checkbox><br /></>)} />

                </Grid>
            )}
        </Grid.Container>

        <Spacer y={2} />
        <Button
            onClick={() => setCreationModalOpen(true)}
        > Let's Create a To-Do! </Button>
        <Spacer y={2} />

        <Button
            color="success"
            disabled={toDoList.every(item => !item.completed)}
            onClick={() => console.log('move to archive button clicked')}
        > Move Completed to Archive </Button>


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
                        }}> {<>Create Position&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button>
                </Modal.Body>
            </Modal>)
        }

    </>);

};

export default ToDos;