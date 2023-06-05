import { useState, useContext, useEffect, useMemo } from 'react';
import './stylesheets/DebtAccounts.css';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import IsLoggedInContext from '../contexts/IsLoggedInContext';
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
            <DebtAccountCreationModalWithButton accountsList={accountsList} setAccountsList={setAccountsList} />
            {accountsList.map((acct, index) => {
                <DebtAccountCard key={`${index}-debt-account-card`} details={acct} />
            })}
        </>
    );
}


function DebtAccountCard({ details }) {
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


function DebtAccountCreationModalWithButton({ setAccountsList = () => { }, accountsList = [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);
    const handleError = useHandleError();

    const [debtAccountDetails, setDebtAccountDetails] = useState({});

    const [friends, setFriends] = useState(null);

    useEffect(() => {
        if (modalOpen) {
            axios.get(`${process.env.REACT_APP_API_LINK}/friendships/`).then(response => {
                if (response.status === 200) {
                    setFriends(response.data?.data ?? []);
                } else {
                    console.warn('fetch', response);
                }
            }).catch(handleError);
        }
    }, []);

    const debtorCreditorLists = useMemo(() => {
        const borrowers = [], lenders = [];

        const selfOpt = {
            key: user.id,
            name: `${user.username} (myself)`
        };

        friends?.concat(selfOpt)?.forEach(opt => {
            if (opt.debtor_id === opt.key) {
                borrowers.push(selfOpt);
            } else if (debtAccountDetails.creditor_id === opt.key) {
                lenders.push(selfOpt);
            } else {
                borrowers.push(selfOpt);
                lenders.push(selfOpt);
            }
        });

        return {
            borrowers,
            lenders
        };
    }, [friends, debtAccountDetails.borrower_id, debtAccountDetails.lender_id]);

    const whoCanAddTransactionsOptions = [
        {
            key: 'borrower',
            name: 'Borrower'
        },
        {
            key: 'lender',
            name: 'Lender'
        },
        {
            key: 'both',
            name: 'Both'
        }
    ];

    return (<>
        <CustomButton shadow onClick={() => setModalOpen(true)} >Create a new Debt Account <i className="fa-regular fa-square-plus" /></CustomButton>

        <Modal closeButton blur aria-labelledby="modal-title" open={modalOpen} onClose={() => setModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <pre>{JSON.stringify(debtAccountDetails, null, 2)}</pre>
                <Input labelPlaceholder="Account Name" color="primary" rounded bordered clearable onChange={e => setDebtAccountDetails(prev => ({ ...prev, name: e.target.value }))} />
                {(!!friends && !!debtorCreditorLists) ? <>
                    <CustomizedDropdown optionsList={debtorCreditorLists.borrowers} mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, borrower_id: v }))} />
                    <CustomizedDropdown optionsList={debtorCreditorLists.lenders} mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, lender_id: v }))} />
                </> : <Loading />}

                <CustomizedDropdown optionsList={whoCanAddTransactionsOptions} title='Who can add transactions to this account?' default_value="both" mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, who_can_add_transactions: v }))} />

                <Button
                    disabled={!debtAccountDetails?.name || !debtAccountDetails?.borrower_id || !debtAccountDetails?.lender_id}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating voting session', debtAccountDetails?.name);
                        await axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/`, {
                            name: debtAccountDetails?.name,
                        }).then(response => {
                            console.log('response:', response.data);
                            if ([201, 200].includes(response.status)) {
                                console.log('successful');
                                setAccountsList(accountsList.concat(response.data));
                                setModalOpen(false);
                            } else if (response.status === 401) {
                                setIsLoggedIn(false);
                            } else {
                                console.log(response);
                            }
                        });
                    }}> Create Debt Account&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i> </Button>
            </Modal.Body>
        </Modal>
    </>);
};