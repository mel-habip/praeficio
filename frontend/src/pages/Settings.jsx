import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';

import NavMenu from '../components/NavMenu';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'



export default function Settings() {
    const { user, accessToken } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return (
        <>
            <NavMenu ></NavMenu>
            <Text h1 >{user.first_name ? `${user.first_name}'s` : 'Your'} Settings </Text>
            <hr className="line-primary"></hr>
            <ToDoCategoriesSection />
            <hr className="line-primary"></hr>
            <h2>Purchases? go here...</h2>
        </>
    );
};


function ToDoCategoriesSection() {

    const { setIsLoggedIn, user, setUser } = useContext(IsLoggedInContext);


    const [currentCategories, setCurrentCategories] = useState([]);
    const [newCategoryText, setNewCategoryText] = useState('');
    const [differencesMade, setDifferencesMade] = useState(false);

    useEffect(() => {
        if (!currentCategories.length || deepEqual(currentCategories, user.to_do_categories)) {
            setDifferencesMade(false);
        } else {
            setDifferencesMade(true);
        }
    }, [currentCategories]);

    useEffect(() => {
        if (!currentCategories.length) {
            console.log('setting to\n', user)
            setCurrentCategories(user.to_do_categories);
        }
    }, [currentCategories]);


    const textLimit = 40;

    return (<section style={{ 'width': '35%'}} >
        <Text h3 css={{ 'margin-top': '10px', 'border-bottom': '1px solid var(--text-primary)' }}>My To-Do Categories</Text>

        <Spacer y={0.1} ></Spacer>
        {currentCategories.map((catName, index) =>
            <Row justify="space-between" css={{ 'white-space': 'pre-wrap', 'padding-left': '1rem', 'padding-right': '1rem', 'min-width': '65%' }} >
                <Text><i className="fa-regular fa-hand-point-right"></i>  &nbsp;&nbsp;&nbsp; {catName}</Text>
                <Spacer x={0.2}></Spacer>
                <CustomButton
                    buttonStyle="btn--transparent"
                    onClick={() => { setCurrentCategories(removeIndex(currentCategories, index)) }} >
                    <i className="fa-regular fa-trash-can"></i>
                </CustomButton>
            </Row>)}
        <Row css={{ 'margin-top': '15px' }}>
            <Input
                bordered
                shadow
                color={newCategoryText.length > textLimit ? 'error' : "primary"}
                helperColor={newCategoryText.length > textLimit ? 'error' : "default"}
                helperText={newCategoryText.length > textLimit ? `\tToo long ${newCategoryText.length}/${textLimit}` : `${newCategoryText.length}/${textLimit}`}
                value={newCategoryText} css={{ width: '100%' }} aria-label="new category input" labelPlaceholder="New Category Name" clearable onChange={(e) => setNewCategoryText(e.target.value)} />
            <CustomButton
                buttonStyle="btn--transparent"
                aria-label="temporary save button"
                rounded
                shadow
                disabled={!newCategoryText || newCategoryText.length > textLimit}
                onClick={() => console.log('clicked') || setCurrentCategories(currentCategories.concat(newCategoryText)) || setNewCategoryText('')} ><i className="fa-regular fa-hand-point-up"></i></CustomButton>
        </Row>
        <Spacer y={1} ></Spacer>
        <Row justify='space-evenly' >
            <Button
                auto
                disabled={!differencesMade}
                shadow color="inverse"
                onPress={() => setCurrentCategories(user.to_do_categories)}>{differencesMade} Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
            </Button>
            <Button auto
                disabled={!differencesMade}
                aria-label="permanent save button"
                shadow
                color="success"
                onPress={() => {
                    axios.put(`http://localhost:8000/users/${user.id}`, { to_do_categories: currentCategories }).then(response => {
                        if (response.status === 200) {
                            console.log('got here! :D ', setUser)
                            setUser({ ...user, to_do_categories: currentCategories });
                            setDifferencesMade(false);
                        } else {
                            console.log('response', response);
                        }
                    })
                }}> Save&nbsp;<i className="fa-solid fa-floppy-disk"></i>
            </Button>
        </Row>
        <Text size={11} em css={{ 'text-align': 'center' }}> Note: changes cannot be undone </Text>
        <Spacer y={0.5} ></Spacer>
    </section>)

}