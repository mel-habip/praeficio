import { useState, useContext, useEffect } from 'react';
import './stylesheets/DebtAccounts.css';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import useHandleError from '../utils/handleError';
import LoadingPage from './LoadingPage';
import timestampFormatter from '../utils/timestampFormatter';

import axios from 'axios';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import { Button, Navbar, Card, Modal, Spacer, Text, Input, Grid, Row, Textarea, Loading, Badge, Dropdown, Tooltip } from '@nextui-org/react';

export default function DebtAccounts() {
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    const handleError = useHandleError();

    const [accountsList, setAccountsList] = useState(null);

    //fetch the data
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/debt_accounts/`).then(response => {
            if (response.status === 200) {
                let { data: accounts, ...rest } = response.data;
                setAccountsList(accounts ?? []);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
    }, []);

    if (!user?.use_beta_features) {
        return ( 
            <>
                <NavMenu />
                <h1>DEBT ACCOUNTS HERE</h1>
                <h2>
                    <i className="fa-solid fa-file-invoice-dollar" /> &nbsp;
                    <i className="fa-solid fa-file-invoice-dollar" /> &nbsp;
                    <i className="fa-solid fa-file-invoice-dollar" /> &nbsp;
                </h2>
                <h3>coming soon to a theater near you! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
            </>
        );
    }
    
    if (!accountsList) { return (<LoadingPage />); }

    return (
        <>
            <NavMenu />
            <CustomButton>New Debt Account </CustomButton>
            {accountsList.map((acct, index) => {
                <DebtAccountCard key={`${index}-debt-account-card`} details={acct} />
            })}
        </>
    );

}


function DebtAccountCard({ details }) {
    const { user, setIsLoggedIn } = useContext(IsLoggedInContext);
    const handleError = useHandleError();
    return (
        <Card css={{ $$cardColor: '$colors$primary', width: '300px', height: '150px' }} key={details.debt_account_id + '-card-inner'} isHoverable isPressable>
            
            <Link to={`/debt_accounts/${details.debt_account_id}`}>
                <Card.Body >
                    <div style={{ width: '100%', height: '100$', display: 'flex', 'justifyContent': 'flex-start', }}>
                        <Text size={21} color="darkgray" css={{ ml: 0 }}>
                            #{details.header}
                        </Text>
                        <Spacer x={0.5} />
                        <Text h3 color="white" css={{ mt: 0 }}>
                            {details.borrower_username} owes {details.lender_username} the amount of {details.amount}
                        </Text>
                    </div>
                    <div className="debt-account-card-metadata" style={{ textAlign: 'left', width: '100%', paddingLeft: '45px' }} >
                        <Text h6 color="white" css={{ mt: 15, mb: 0 }}>
                            Created On: {timestampFormatter(details.created_on)}
                        </Text>
                    </div>
                </Card.Body>
            </Link>
        </Card >
    );
};