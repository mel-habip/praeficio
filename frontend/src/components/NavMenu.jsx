import React, { useState, useContext } from 'react';
import { CustomButton } from '../fields/CustomButton';
import { Link } from 'react-router-dom';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import { Badge, Row, Text, Button } from '@nextui-org/react';

import praeficio_pronunciation from '../media/praeficio_pronunciation.mp3';

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

function NavMenu({ show_language_button_externally = false, hide_language_button=false }) {

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { isLoggedIn, setIsLoggedIn, user } = useContext(IsLoggedInContext);

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

    const LangButton = () => <CustomButton
        onClick={toggleLanguage}
        style={{ textTransform: 'uppercase', position: 'absolute', top: '5%', right: '5%' }}
    >  {language} <i className="fa-solid fa-arrows-spin" /></CustomButton>

    if (!isLoggedIn) {
        return (
            <>
                <Button
                    className='nav-menu-toggle'
                    css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                    onPress={toggleTheme}
                > &nbsp; <i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} />
                </Button>
                {!hide_language_button && <LangButton />}
            </>
        );
    }

    const dictionary = {
        for: {
            en: 'for',
            fr: 'pour'
        },
        You: {
            en: 'You',
            fr: 'Toi'
        },
        home_page: {
            en: 'Home',
            fr: `Page d'Accueil`
        },
        voting_page: {
            en: 'Voting',
            fr: 'Séances de Vote'
        },
        debt_accounts_page: {
            en: 'Debt Accounts',
            fr: 'Comptes de Dette'
        },
        randomizer_page: {
            en: 'Randomizer',
            fr: 'Aléatoirist'
        },
        to_dos_page: {
            en: `To-Do's`,
            fr: 'Tâches'
        },
        settings_page: {
            en: 'Settings',
            fr: 'Paramètres'
        },
        theme_tooltip: {
            en: 'light/dark mode',
            fr: 'mode clair/sombre'
        },
        users_page: {
            en: 'Users',
            fr: 'Profils'
        },
        alerts_page: {
            en: 'Alerts',
            fr: 'Alertes'
        },
        workspaces_page: {
            en: 'Workspaces',
            fr: 'Espaces'
        },
        notes_page: {
            en: 'Quick Notes',
            fr: 'Notes'
        },
        service_desk_page: {
            en: 'Service Desk',
            fr: 'Comptoir de Service'
        },
        made_with: {
            en: 'Made with',
            fr: 'Fait avec'
        },
        by: {
            en: 'by',
            fr: 'par'
        },
        log_out: {
            en: 'Log Out',
            fr: 'Déconnecter'
        },
        definition_1: {
            en: 'verb',
            fr: 'verbe'
        },
        definition_2: {
            en: 'to place in command, put in charge.',
            fr: 'placer aux commandes, mettre en charge.'
        },
        definition_3: {
            en: 'to set over any thing (as officer, superintendent, leader, etc.), to place in authority over, place at the head, appoint to the command of',
            fr: 'placer sur toute chose (comme officier, surintendant, chef, etc.), placer en autorité sur, placer à la tête, nommer au commandement de'
        },
        monthly_planner: {
            en: 'Monthly Planner',
            fr: 'Planificateur Mensuel'
        },
    };

    return (
        <>
            <Toggle />

            {show_language_button_externally && !hide_language_button && <LangButton />}

            <nav className={NavMenuOpen ? 'nav-menu active' : 'nav-menu'}>

                <Row
                    justify='space-evenly'
                    align="center"
                    gap={1}
                >
                    <div style={{ width: '40px' }}></div>
                    <CustomButton tooltip={dictionary.theme_tooltip[language]} tooltip_placement='bottom' onClick={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></CustomButton>

                    <CustomButton
                        onClick={toggleLanguage}
                        style={{ textTransform: 'uppercase' }}
                    >  {language} <i className="fa-solid fa-arrows-spin" /></CustomButton>

                    <CustomButton
                        tooltip={dictionary.log_out[language]}
                        tooltip_placement='bottom'
                        onClick={() => localStorage.removeItem('access_token') || setIsLoggedIn(false)}
                    ><i className="fa-solid fa-person-through-window" />
                    </CustomButton>

                </Row>

                <Link to='/company' className='nav-menu-logo' onClick={closeNavMenu}> Præficiō {dictionary.for[language]} {user?.first_name || dictionary.You[language]} &nbsp;
                    <i className="fa-solid fa-user-secret" />
                </Link>


                <ul className="nav-list">
                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={closeNavMenu}>
                            {dictionary.home_page[language]}
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/positions'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Positions&nbsp; <i className="fa-solid fa-money-bill-trend-up" style={{ color: 'green' }} />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/users'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.users_page[language]}&nbsp; <i className="fa-solid fa-users" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/workspaces/my_workspaces'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.workspaces_page[language]}&nbsp; <i className="fa-regular fa-building" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/alerts'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.alerts_page[language]}&nbsp; <i className="fa-regular fa-bell" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/todos'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.to_dos_page[language]}&nbsp; <i className="fa-solid fa-list-check" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/calculator'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Financial Calculator&nbsp; <i className="fa-solid fa-square-root-variable" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/settings'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.settings_page[language]}&nbsp; <i className="fa-solid fa-wrench" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/feedback_logs'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Feedback Logs&nbsp; <i className="fa-solid fa-bars-staggered" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/service_desk'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.service_desk_page[language]}&nbsp; <i className="fa-solid fa-headset" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/tictactoe'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Tic-Tac-Toe&nbsp; <i className="fa-solid fa-table-cells-large" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/debt_accounts'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.debt_accounts_page[language]}&nbsp; <i className="fa-solid fa-file-invoice-dollar" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/voting_sessions'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.voting_page[language]}&nbsp; <i className="fa-solid fa-square-poll-vertical" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/randomizer'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.randomizer_page[language]}&nbsp; <i className="fa-solid fa-dice" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/notes'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.notes_page[language]}&nbsp; <i className="fa-solid fa-pencil" />
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/monthly_planner'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            {dictionary.monthly_planner[language]}&nbsp; <i className="fa-regular fa-calendar-days" />
                        </Link>
                    </li>
                </ul>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', padding: '8%', width: 'calc(100% + 2rem)' }} >
                    <Text css={{ 'white-space': 'pre-wrap', textAlign: 'left' }} blockquote >
                        <strong>præ·ficiō{'\n'}</strong>
                        <div style={{ display: 'flex', fontSize: '12px', flexWrap: 'wrap' }}>
                            <p style={{}} >pɹˈe͡ɪ-fˈɪsɪˌo͡ʊ · </p>
                            <p style={{}}>{dictionary.definition_1[language]} · </p>
                            <p style={{ fontStyle: 'italic' }}>Latin · </p>
                            <p>
                                <i onClick={PraeficioPronunciation} className="fa-solid fa-volume-high" />
                            </p>
                        </div>
                        <p style={{ fontSize: '12px' }} >I - {dictionary.definition_2[language]}</p>
                        <p style={{ fontSize: '12px' }} >II - {dictionary.definition_3[language]}</p>
                    </Text>
                    <Text >Your Tier: &nbsp;<Badge color={user?.permissions === 'basic_client' ? 'primary' : 'success'}>{permissionsMap[user?.permissions]}</Badge></Text>

                    <Text css={{ 'white-space': 'pre-wrap', fontSize: '15px' }} blockquote em >
                        {dictionary.made_with[language]}&nbsp; <i className="fa fa-heart fa-1x fa-beat" />&nbsp; <i className="fa fa-heart fa-1x fa-beat" />&nbsp; {`\n ${dictionary.by[language]} `} <Link to={'https://github.com/mel-habip'}>{"Mel Habip :) "} <i className="fa-brands fa-github" />{" \n "}</Link>
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