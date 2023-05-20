import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';

import NavMenu from '../components/NavMenu';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import validatePassword from '../utils/validatePassword.mjs';

export default function Settings() {
    document.title = "Praeficio.com | Settings";
    const { user, accessToken, setUser } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;



    return (
        <>
            <NavMenu ></NavMenu>
            <Text h1 css={{ 'margin-top': '4%' }} >{user.first_name ? `${user.first_name}'s` : 'Your'} Settings </Text>
            <hr className="line-primary"></hr>
            <ToDoCategoriesSection />
            <hr className="line-primary"></hr>
            <h2>Purchases? go here...</h2>
            <hr className="line-primary"></hr>


            <PersonalSettingsSection user={user} setUser={setUser} />
            <hr style={{ 'margin-bottom': '4%' }}></hr>
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

    return (<section style={{ 'width': '35%' }} >
        <Text h3 css={{ 'margin-top': '10px', 'border-bottom': '1px solid var(--text-primary)' }}>My To-Do Categories</Text>

        <Spacer y={0.1} ></Spacer>
        {currentCategories.map((catName, index) =>
            <Row key={index + '-row'} justify="space-between" css={{ 'white-space': 'pre-wrap', 'padding-left': '1rem', 'padding-right': '1rem', 'min-width': '65%' }} >
                <Text><i className="fa-regular fa-hand-point-right"></i>  &nbsp;&nbsp;&nbsp; {catName}</Text>
                <Spacer x={0.2}></Spacer>
                <CustomButton
                    buttonStyle="btn--transparent"
                    onClick={() => { setCurrentCategories(removeIndex(currentCategories, index)) }} >
                    <i className="fa-regular fa-trash-can"/>
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
                    axios.put(`${process.env.REACT_APP_API_LINK}/users/${user.id}`, { to_do_categories: currentCategories }).then(response => {
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


function PersonalSettingsSection({ user, setUser }) {
    const [useBetaFeatures, setUseBetaFeatures] = useState(false);
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(''); //this doesn't come from the BE and can only be reset, not edited
    const [email, setEmail] = useState(null);
    const [generalErrorMessage, setGeneralErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        setUseBetaFeatures(user.use_beta_features);
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setUsername(user.username);
        setEmail(user.email || '');
        setPassword('');
    }, []);

    const differencesMade = React.useMemo(() => {
        const curr = [firstName, lastName, email, username, password];
        const orig = [user.first_name || '', user.last_name || '', user.email || '', user.username || '', ''];

        return curr.some((val, ix) => val !== orig[ix]) || useBetaFeatures !== user.use_beta_features;
    }, [firstName, lastName, email, username, useBetaFeatures, password]);

    return (
        <section style={{ 'width': '35%' }}>
            <Text h3 css={{ 'margin-top': '10px', 'border-bottom': '1px solid var(--text-primary)' }}>My Profile</Text>

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
                    disabled={!differencesMade}
                    shadow color="inverse"
                    onPress={() => {
                        setUseBetaFeatures(user.use_beta_features);
                        setFirstName(user.first_name || '');
                        setLastName(user.last_name || '');
                        setUsername(user.username);
                        setEmail(user.email || '');
                        setPassword('');
                    }}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                </Button>
                <Button
                    auto
                    // enabled => differencesMade || (password && validatePassword(password))
                    disabled={!differencesMade || (password && !validatePassword(password))}
                    aria-label="user details save button"
                    shadow
                    color="success"
                    onPress={() => {
                        axios.put(`${process.env.REACT_APP_API_LINK}/users/${user.id}`, {
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

        </section>

    );
}