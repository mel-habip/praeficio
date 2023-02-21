import React, { useState } from 'react';
import AnimatedButtonBox from '../fields/AnimatedButtonBox';
import Portal from './Portal';

export default function LoginPage() {
    const [loginClicked, SetLoginClicked] = useState(false);
    const [signupClicked, SetSignupClicked] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(null);
    const [first_name, setFirstName] = useState(null);
    const [last_name, setLastName] = useState(null);
    const [accessToken, setAccessToken] = useState('');


    if (logged_in) {
        return (
            <Portal is_logged_in={true}/>
        )
    }

    if (loginClicked) {
        return (
            <div className="LoginPage">
                <div className="app-login_form">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input name="password" type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
                    <button className="login_button" onClick={async () => {
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
                    }}>Log-In</button>
                    <button className="back_button" onClick={() => SetLoginClicked(false)}>Back</button>
                </div>
            </div>
        );
    } else if (signupClicked) {
        

        return (
            <div className="LoginPage">
                <div className="app-signup_form">
                    <input type="text" placeholder='Username' onChange={(e) => setUserName(e.target.value)} />
                    <br />
                    <input type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
                    <br />
                    <input type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
                    <br />
                    <input type="text" placeholder='First Name' onChange={(e) => setFirstName(e.target.value)} />
                    <br />
                    <input type="text" placeholder='Last Name' onChange={(e) => setLastName(e.target.value)} />
                    <br />
                    <button className="sign_up_button" onClick={async () => {
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
                                })
                            }
                        })
                    }}>Sign-Up</button>
                    <button className="back_button" onClick={() => SetSignupClicked(false)}>Back</button>
                </div>
            </div>
        );
    } else {
        console.log('neither clicked1');
        return (
            <div className="LoginPage">
                <div className="app-initial-buttons">
                    <AnimatedButtonBox title="New here?" button_text="Sign-Up Here" subtitle="you'll be prompted to enter your deets" onClick={() => SetSignupClicked(true)} />
                    <AnimatedButtonBox title="Coming Back?" button_text="Log-In Here" subtitle="you'll be prompted to enter your creds" onClick={() => SetLoginClicked(true)} />
                </div>
            </div>
        );
    }

}