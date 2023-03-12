import React, { useState } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import AnimatedButtonBox from '../fields/AnimatedButtonBox';
import Portal from './Portal';
import { Button, Input, Spacer, Modal, Text, Row, Checkbox, Grid, Card } from '@nextui-org/react';
import ErrorModule from '../components/ErrorModule';

export default function LoginPage() {
    const [loginClicked, SetLoginClicked] = useState(false);
    const [signupClicked, SetSignupClicked] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [generalErrorMessage, setGeneralErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState(null);
    const [last_name, setLastName] = useState(null);
    const [accessToken, setAccessToken] = useState('');




    return (
        <div className="LoginPage">

            <div className="app-initial-buttons">
                <AnimatedButtonBox title="New here?" button_text="Sign-Up Here" subtitle="you'll be prompted to enter your deets" onPress={() => SetSignupClicked(true)} />

                <Modal
                    closeButton
                    blur
                    aria-labelledby="modal-title"
                    open={signupClicked || loginClicked}
                    onClose={(e) => { SetSignupClicked(false); SetLoginClicked(false); }}
                >
                    <Modal.Header>
                        <Text b id="modal-title" size={18}>
                            Welcome {loginClicked ? 'Back!' : 'to the show!'}
                            <Text size={14}>
                                Please enter the information below
                            </Text>
                        </Text>
                    </Modal.Header>
                    <Modal.Body>
                        <ErrorModule errorMessage={generalErrorMessage}></ErrorModule>
                        <Spacer y={0.4} />
                        <Input
                            rounded
                            clearable
                            type="text" 
                            required
                            bordered
                            labelPlaceholder="Username*"
                            color={usernameError ? "error" : "primary"}
                            status={usernameError ? "error" : "default"}
                            helperText={usernameError}
                            helperColor={usernameError ? "error" : "primary"}
                            onChange={(e) => setUsernameError('') && setUsername(e.target.value)} />
                        <Spacer y={0.5} />

                        <Input.Password
                            rounded
                            clearable
                            required
                            bordered
                            labelPlaceholder="Password*"
                            color="primary"
                            onChange={(e) => setPassword(e.target.value)} />


                        {(loginClicked || !email) ? <>
                            <Row justify="space-between">

                                {!email ? <Checkbox> <Text size={14}>{email}Remember me</Text> </Checkbox> : <></>}

                                {loginClicked ? <Text size={14}>Forgot password?</Text> : ''}

                            </Row>
                        </> : ''}
                        {loginClicked ? <>
                            <Button
                                auto
                                onPress={async () => {
                                    console.log('logging in');
                                    await fetch('http://localhost:8000/users/login/', {
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            username,
                                            password
                                        }),
                                        method: 'POST'
                                    }).then((res) => {
                                        console.log(res);
                                        if (res.status === 200) {
                                            setLoggedIn(true);
                                            setAccessToken(res.access_token);
                                        }
                                    })
                                }}>
                                Log-in&nbsp;&nbsp;<i className="fa-solid fa-right-to-bracket"></i>
                            </Button>
                        </> : <>
                            <Spacer y={0.01} />
                            <Grid.Container gap={0.72} justify="center" direction="row">
                                <Grid >
                                    <Input
                                        size="sm"
                                        clearable
                                        bordered
                                        labelPlaceholder="First Name"
                                        color="primary"
                                        onChange={(e) => setFirstName(e.target.value)} />
                                </Grid>
                                <Grid>
                                    <Input
                                        size="sm"
                                        clearable
                                        bordered
                                        labelPlaceholder="Last Name"
                                        color="primary"
                                        onChange={(e) => setLastName(e.target.value)} />
                                </Grid>
                            </Grid.Container>
                            <Spacer y={0.5} />
                            <Input
                                rounded
                                clearable
                                type="email"
                                bordered
                                labelPlaceholder="Email"
                                placeholder='you@domain.ca'
                                color={emailError ? "error" : "primary"}
                                status={emailError ? "error" : "default"}
                                helperText={emailError}
                                helperColor={emailError ? "error" : "primary"}
                                onChange={(e) => setEmailError('') && setEmail(e.target.value)} />
                            <Spacer y={0.1} />
                            <Button
                                auto
                                onPress={async () => {
                                    await fetch('http://localhost:8000/users/create_new_user/', {
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            username,
                                            password,
                                            email,
                                            first_name,
                                            last_name,
                                        }),
                                        method: 'POST'
                                    }).then(async (res) => {
                                        console.log('CREATION', res);
                                        if (res.status === 201) {
                                            await fetch('http://localhost:8000/users/login/', {
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    username,
                                                    password
                                                }),
                                                method: 'POST'
                                            }).then((res) => {
                                                console.log('LOG IN', res);
                                                if (res.status === 200) {
                                                    setLoggedIn(true);
                                                    setAccessToken(res.access_token);
                                                }
                                            });
                                        }
                                    }).catch(err => {
                                        setEmailError('error');
                                        setUsernameError('error');
                                        setGeneralErrorMessage(`ERROR - ${err?.data?.message || 'unknown'}`);
                                        setTimeout(() => {
                                            setGeneralErrorMessage('');
                                        }, 5000);
                                    });
                                }}
                            >
                                Sign-Up
                            </Button>
                        </>}

                    </Modal.Body>

                </Modal>

                <AnimatedButtonBox title="Coming Back?" button_text="Log-In Here" subtitle="you'll be prompted to enter your creds" onPress={() => SetLoginClicked(true)} />
            </div>
        </div>
    );

}