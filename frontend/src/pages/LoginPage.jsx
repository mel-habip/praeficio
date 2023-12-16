import { useState, useContext, useMemo } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import AnimatedButtonBox from '../fields/AnimatedButtonBox';
import { Button, Input, Spacer, Modal, Text, Row, Checkbox, Tooltip } from '@nextui-org/react';
import ErrorModule from '../components/ErrorModule';

import validatePassword from '../utils/validatePassword.mjs';

import axios from 'axios';

export default function LoginPage() {
    document.title = "Praeficio.com | Log-In";

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { setIsLoggedIn, setAccessToken } = useContext(IsLoggedInContext);

    const [clickedType, setClickedType] = useState('');
    const [forgotPassModalOpen, setForgotPassModalOpen] = useState(false);

    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});

    function catchError(response) {
        const data = response?.data || response?.response?.data;
        console.log('inside the function: ', data);

        if (['username', 'email', 'password'].includes(data?.error_part)) {
            setErrors(prev => ({ ...prev, [data?.error_part]: data?.message }));
        } else {
            setErrors(prev => ({ ...prev, general: `ERROR - ${data?.message || 'unknown'}` }));
            setTimeout(() => {
                setErrors(prev => ({ ...prev, general: undefined }));
            }, 5000);
        }
    }

    const passwordGood = useMemo(() => {
        return validatePassword(formValues.password, true);
    }, [formValues.password]);

    return (
        <div className="LoginPage">
            <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>

            <div className="app-initial-buttons">
                <AnimatedButtonBox title="New here?" button_text="Sign-Up Here" subtitle="you'll be prompted to enter your deets" onPress={() => setClickedType('signup')} />

                <Modal
                    closeButton
                    blur
                    aria-labelledby="modal-title"
                    open={!!clickedType}
                    onClose={() => { setErrors({}); setClickedType(null) }}
                >
                    <Modal.Header>
                        <Text b id="modal-title" size={18}>
                            Welcome {clickedType === 'login' ? 'Back!' : 'to the show!'}
                            <Text size={14}>
                                Please enter the information below
                            </Text>
                        </Text>
                    </Modal.Header>
                    <Modal.Body>
                        <ErrorModule errorMessage={errors.general}></ErrorModule>
                        <Spacer y={0.4} />
                        <Input
                            rounded
                            initialValue=""
                            clearable
                            type="text"
                            required
                            bordered
                            labelPlaceholder="Username*"
                            color={errors.username ? "error" : "primary"}
                            status={errors.username ? "error" : "default"}
                            helperText={errors.username}
                            helperColor={errors.username ? "error" : "primary"}
                            onChange={e => setFormValues(prev => ({ ...prev, username: e.target.value }))} />
                        <Spacer y={0.5} />

                        <div className="nextui-modal-body" style={{ display: 'flex', justifyContent: 'space-around', flexFlow: 'nowrap', alignItems: 'center', gap: '1rem'}} >
                            <Input.Password
                                rounded
                                initialValue=""
                                clearable
                                fullWidth
                                required
                                bordered
                                labelPlaceholder="Password*"
                                color={errors.password ? "error" : "primary"}
                                status={errors.password ? "error" : "default"}
                                helperText={errors.password}
                                helperColor={errors.password ? "error" : "primary"}
                                onChange={e => setFormValues(prev => ({ ...prev, password: e.target.value }))} />
                            <Tooltip
                                trigger='click'
                                content={
                                    <p style={{ whiteSpace: 'pre'}} >{`A strong password should have: \n\t${passwordGood.hasLength ? '✔️' : '❌'} 6-15 digits \n\t${passwordGood.hasSymbol ? '✔️' : '❌'} one symbol, \n\t${passwordGood.hasNumber ? '✔️' : '❌'} one number, \n\t${passwordGood.hasUppercase ? '✔️' : '❌'} one uppercase and \n\t${passwordGood.hasLowercase ? '✔️' : '❌'} one lowercase character`}
                                    </p>}
                                css={{ zIndex: 9999 }}
                            >
                                <div>
                                    <i style={{ color: passwordGood.hasAll ? 'green' : 'red' }} className="fa-solid fa-shield-halved" />
                                </div>
                            </Tooltip>
                        </div>

                        <Row justify="space-between">

                            <Checkbox defaultSelected > <Text size={14}>Remember me</Text> </Checkbox>

                            {clickedType === 'login' ? <Text style={{ cursor: 'pointer', textDecoration: 'underline' }} aria-haspopup onClick={() => setForgotPassModalOpen(true)} size={14}>Forgot password?</Text> : ''}

                            <Modal
                                closeButton
                                blur
                                aria-labelledby="modal-title"
                                open={forgotPassModalOpen}
                                onClose={() => { setForgotPassModalOpen(false) }}
                            >
                                <Modal.Body>
                                    <Text >Please relax, take a deep breath and try to remember your password.</Text>
                                    <Button color="primary" shadow onClick={() => setForgotPassModalOpen(false)}>Okay Thanks!</Button>
                                </Modal.Body>
                            </Modal>

                        </Row>
                        {clickedType === 'login' ? <>
                            <Button
                                disabled={!validatePassword(formValues.password)}
                                auto
                                onPress={async () => {
                                    console.log('logging in');
                                    await axios.post(`/users/login`, formValues).then(async response => {
                                        console.log('response', response);
                                        if (response.status === 200) {
                                            const { access_token } = response.data;
                                            localStorage.setItem('access_token', access_token); //used for long-term storage
                                            setAccessToken(access_token);
                                            setIsLoggedIn(true);
                                            if (window.location.pathname.includes('login')) window.location.replace('/portal');
                                        } else {
                                            catchError(response)
                                        }
                                    }).catch(catchError)
                                }}>
                                Log-in&nbsp;&nbsp;<i className="fa-solid fa-right-to-bracket"></i>
                            </Button>
                        </> : <>
                            <Spacer y={0.01} />
                            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: '25px', flexFlow: 'wrap' }} >
                                <Input
                                    size="sm"
                                    clearable
                                    width="45%"
                                    bordered
                                    labelPlaceholder="First Name"
                                    color="primary"
                                    onChange={e => setFormValues(prev => ({ ...prev, first_name: e.target.value }))} />
                                <Input
                                    size="sm"
                                    clearable
                                    width="45%"
                                    bordered
                                    labelPlaceholder="Last Name"
                                    color="primary"
                                    onChange={e => setFormValues(prev => ({ ...prev, last_name: e.target.value }))} />
                            </div>
                            {!formValues.email && <p>Please note your password, it cannot be reset for accounts without emails.</p>}
                            <p>Email functionality is coming soon!</p>
                            <Input
                                rounded
                                disabled //temporary until email service is up
                                clearable
                                type="email"
                                bordered
                                labelPlaceholder="Email"
                                placeholder='you@domain.ca'
                                color={errors.email ? "error" : "primary"}
                                status={errors.email ? "error" : "default"}
                                helperText={errors.email}
                                helperColor={errors.email ? "error" : "primary"}
                                onChange={e => setFormValues(prev => ({ ...prev, email: e.target.value }))} />
                            <Spacer y={0.1} />
                            <Button
                                auto
                                onPress={async () => {
                                    await axios.post(`/users/create_new_user`, formValues)
                                        .then(async creationResponse => {
                                            console.log('CREATION', creationResponse);
                                            if (creationResponse.status === 201) {
                                                await axios.post(`/users/login`, formValues)
                                                    .then(async loginRes => {
                                                        console.log('LOG IN', loginRes);
                                                        if (loginRes.status === 200) {
                                                            const { access_token } = loginRes.data;
                                                            localStorage.setItem('access_token', access_token);
                                                            setAccessToken(access_token);
                                                            setIsLoggedIn(true);
                                                            if (window.location.pathname.includes('login')) window.location.replace('/portal');
                                                        } else {
                                                            catchError(loginRes)
                                                        }
                                                    }).catch(catchError);
                                            } else {
                                                catchError(creationResponse);
                                            }
                                        }).catch(catchError);
                                }}
                            >
                                Sign-Up
                            </Button>
                        </>}
                    </Modal.Body>
                </Modal>

                <AnimatedButtonBox title="Coming Back?" button_text="Log-In Here" subtitle="you'll be prompted to enter your creds" onPress={() => setClickedType('login')} />
            </div>
        </div>
    );
}