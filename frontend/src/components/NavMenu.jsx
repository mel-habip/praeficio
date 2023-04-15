import React, { useState, useContext } from 'react';
import { CustomButton } from '../fields/CustomButton';
import { Link } from 'react-router-dom';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import { Badge, Row, Text } from '@nextui-org/react';

import praeficio_pronunciation from  '../praeficio_pronunciation.mp3';

import './NavMenu.css';

const permissionsMap = {
    basic_client: 'Free User',
    pro_client: 'Paid User (thank you!)',
    total: 'Total',
    dev: 'Developer',
    dev_junior: 'Junior Dev',
    dev_senior: 'Senior Dev',
    dev_lead: 'Lead Dev',
};

function NavMenu() {

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const [NavMenuOpen, setNavMenuOpen] = useState(false);

    const toggleNavMenu = () => setNavMenuOpen(!NavMenuOpen);
    const closeNavMenu = () => setNavMenuOpen(false);

    document.addEventListener("mousedown", (event) => {
        if (!NavMenuOpen) return;
        const concernedElement = document.querySelector(".nav-menu");
        if (!concernedElement?.contains(event.target)) {
            closeNavMenu();
        }
    });

    const Toggle = () => <div className='nav-menu-toggle'><CustomButton onClick={toggleNavMenu}><i className={NavMenuOpen ? 'fas fa-times' : 'fas fa-bars'} /></CustomButton> </div>

    return (
        <>
            <Toggle></Toggle>
            <nav className={NavMenuOpen ? 'nav-menu active' : 'nav-menu'}>

                <Row
                    justify='space-evenly'
                    align="center"
                    gap={1}
                >

                    <div style={{ width: '40px' }}></div>

                    <CustomButton onClick={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></CustomButton>

                    <CustomButton
                        tooltip="log out"
                        onClick={() => localStorage.removeItem('access_token') || setIsLoggedIn(false)}><i className="fa-solid fa-person-through-window"></i></CustomButton>

                </Row>

                <Link to='/' className='nav-menu-logo' onClick={closeNavMenu}> Præficiō for {user?.first_name || 'You'} &nbsp;
                    <i className="fa-solid fa-user-secret"></i>
                </Link>


                <ul className="nav-list">
                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={closeNavMenu}>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/positions'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Positions&nbsp; <i className="fa-solid fa-money-bill-trend-up" style={{ color: 'green' }}></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/workspaces/my_workspaces'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Workspaces&nbsp; <i className="fa-regular fa-building" ></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/alerts'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Alerts&nbsp; <i className="fa-regular fa-bell"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/todos'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            To-Do's&nbsp; <i className="fa-solid fa-list-check"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/calculator'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Financial Calculator&nbsp; <i className="fa-solid fa-square-root-variable"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/settings'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Settings&nbsp; <i className="fa-solid fa-wrench"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/feedback_logs'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Feedback Logs&nbsp; <i className="fa-solid fa-bars-staggered"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/service_desk'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Service Desk&nbsp; <i className="fa-solid fa-headset"></i>
                        </Link>
                    </li>
                </ul>
                <div style={{ position: 'absolute', bottom: '3%', display: 'flex', flexDirection: 'column', width: '100%', padding: '10%' }} >
                    <Text css={{ 'white-space': 'pre-wrap', textAlign: 'left' }} blockquote >
                        <strong>præ·ficiō{'\n'}</strong>
                        <div style={{ display: 'flex', fontSize: '12px', flexWrap: 'wrap' }}>
                            <p style={{ }} >pɹˈe͡ɪ-fˈɪsɪˌo͡ʊ · </p>
                            <p style={{ }}>verb · </p>
                            <p style={{ fontStyle: 'italic' }}>Latin · </p>
                            <p> 
                                <i onClick={PraeficioPronunciation} className="fa-solid fa-volume-high"></i>
                            </p>
                        </div>
                        <p style={{ fontSize: '12px' }} >I - to place in command, put in charge.</p>
                        <p style={{ fontSize: '12px' }} >II - to set over any thing (as officer, superintendent, leader, etc.), to place in authority over, place at the head, appoint to the command of</p>
                    </Text>
                    <Text >Your Tier: &nbsp;<Badge color={user?.permissions === 'basic_client' ? 'primary' : 'success'}>{permissionsMap[user?.permissions]}</Badge></Text>

                    <Text css={{ 'white-space': 'pre-wrap', fontSize: '15px' }} blockquote em >
                        Made with&nbsp; <i className="fa fa-heart fa-1x fa-beat"></i>&nbsp; <i className="fa fa-heart fa-1x fa-beat"></i>&nbsp; {"\n by "} <Link to={'https://github.com/mel-habip'}>{"Mel Habip :) "} <i className="fa-brands fa-github"></i>{" \n "}</Link>
                        {user?.permissions === 'basic_client' && <>Please consider purchasing the <Link to={'/settings/purchases'}>Pro version</Link> 🙏</>}
                    </Text>
                </div>
            </nav>
        </>
    );


    function PraeficioPronunciation() {
        const sound = new Audio(praeficio_pronunciation);
        sound.play();
    }
}

export default NavMenu;