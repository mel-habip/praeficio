import React, { useState } from 'react';
import ButtonBox from './ButtonBox';

export default function LoginPage() {
    const [loginClicked, SetLoginClicked] = useState(false);
    const [signupClicked, SetSignupClicked] = useState(false);

    if (loginClicked) {
        console.log('login clicked1 ');
        return (
            <div className="LoginPage">
                <div className="app-login_form">
                    <input type="Username" placeholder='Username' />
                    <input type="Password" placeholder='Password' />
                    <br />
                    <button className="login_button" onClick={() => console.log('logging in')}>Log-In</button>
                    <button className="back_button" onClick={() => SetLoginClicked(false)}>Back</button>
                </div>
            </div>
        );
    } else if (signupClicked) {
        console.log('signup clicked1');
        return (
            <div className="LoginPage">
                <div className="app-signup_form">
                    <input type="username" placeholder='Username' />
                    <br />
                    <input type="password" placeholder='Password' />
                    <br />
                    <input type="email" placeholder='Email' />
                    <br />
                    <input type="text" placeholder='First Name' />
                    <br />
                    <input type="text" placeholder='Last Name' />
                    <br />
                    <button className="sign_up_button" onClick={() => console.log('signing up')}>Sign-Up</button>
                    <button className="back_button" onClick={() => SetSignupClicked(false)}>Back</button>
                </div>
            </div>
        );
    } else {
        console.log('neither clicked1');
        return (
            <div className="LoginPage">
                <div className="app-initial-buttons">
                    <ButtonBox title="New here?" button_text="Sign-Up Here" subtitle="you'll be prompted to enter your deets" onClick={() => SetSignupClicked(true)} />
                    <ButtonBox title="Coming Back?" button_text="Log-In Here" subtitle="you'll be prompted to enter your creds" onClick={() => SetLoginClicked(true)} />
                </div>
            </div>
        );
    }

}