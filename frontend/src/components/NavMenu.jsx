import React, { useState, useContext } from 'react';
import { Button } from '../fields/Button';
import { Link } from 'react-router-dom';
import ThemeContext from '../contexts/ThemeContext';
// import './NavMenu.css';

function NavMenu() {

    const { isDark, toggleTheme } = useContext(ThemeContext)

    const [NavMenuClicked, setNavMenuClicked] = useState(false);

    const openNavMenu = () => setNavMenuClicked(!NavMenuClicked);
    const closeNavMenu = () => setNavMenuClicked(false);

    return (
        <>
            <nav className='navmenu'>
                <div className='navmenu-container'>

                    <Button buttonStyle='btn--outline' onClick={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>

                    <Link to='/' className='navmenu-logo' onClick={closeNavMenu}>
                        Mel's Portfolio Tracker
                        <i className='fab fa-typo3' />
                    </Link>

                    <div className='menu-icon' onClick={openNavMenu}>
                        <i className={NavMenuClicked ? 'fas fa-times' : 'fas fa-bars'} />
                    </div>
                    <ul className={NavMenuClicked ? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <Link to='/' className='nav-links' onClick={closeNavMenu}>
                                Home
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/services'
                                className='nav-links'
                                onClick={closeNavMenu}
                            >
                                Services
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/products'
                                className='nav-links'
                                onClick={closeNavMenu}
                            >
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/sign-up'
                                className='nav-links-mobile'
                                onClick={closeNavMenu}
                            >
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default NavMenu;