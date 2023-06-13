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
import { Button, Card, Modal, Spacer, Text, Input, Grid, Row, Textarea, Loading, Badge, Dropdown, Tooltip } from '@nextui-org/react';

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
            {/* <pre>{JSON.stringify(accountsList, null, 2)}</pre> */}
            {accountsList.map((acct, index) =>
                <DebtAccountCard key={`${index}-debt-account-card`} details={acct} />
            )}
        </>
    );
}


function DebtAccountCard({ details }) {
    return (
        <Card css={{ $$cardColor: '$colors$primary', width: '300px', height: '170px' }} key={details.debt_account_id + '-card-inner'} isHoverable isPressable>

            <Link to={`/debt_accounts/${details.debt_account_id}`}>
                <Card.Body >
                    <div style={{ width: '100%', height: '100$', display: 'flex', 'justifyContent': 'flex-start', }}>
                        <Text size={21} color="darkgray" css={{ ml: 0, flexBasis: '60%' }}>
                            #{details.name}
                        </Text>
                        <Spacer x={0.5} />
                        <Text h4 color="white" css={{ mt: 0 }}>
                            {details.borrower_username} owes {details.lender_username} the amount of {(details.amount || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
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
        if (user.friendships) {
            setFriends(user.friendships);
        } else if (modalOpen && !user.friendships) {
            axios.get(`${process.env.REACT_APP_API_LINK}/friendships/`).then(response => {
                if (response.status === 200) {
                    setFriends(response.data?.data ?? []);
                } else {
                    console.warn('fetch', response);
                }
            }).catch(handleError);
        }
    }, [modalOpen, user.friendships]);

    const debtorCreditorLists = useMemo(() => {
        const borrowers = [], lenders = [];

        const selfOpt = {
            key: user.id,
            name: `${user.username} (myself)`
        };

        if (debtAccountDetails.lender_id === user.id) {
            lenders.push(selfOpt);
        } else if (debtAccountDetails.borrower_id === user.id) {
            borrowers.push(selfOpt);
        } else {
            lenders.push(selfOpt);
            borrowers.push(selfOpt);
        }

        friends?.forEach(frnd => {

            let key = frnd.user_1_id === user.id ? frnd.user_2_id : frnd.user_1_id;
            let name = frnd.user_1_id === user.id ? frnd.user_2_username : frnd.user_1_username;

            //in an ideal world, push all friends to both options

            if (debtAccountDetails.lender_id === key) {
                lenders.push({ key, name });
            } else if (debtAccountDetails.borrower_id === key) {
                borrowers.push({ key, name });
            } else {
                lenders.push({ key, name });
                borrowers.push({ key, name });
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
                    <label>Please select the borrower:</label>
                    <CustomizedDropdown optionsList={debtorCreditorLists.borrowers} mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, borrower_id: parseInt(v) }))} />
                    <label>Please select the lender:</label>
                    <CustomizedDropdown optionsList={debtorCreditorLists.lenders} mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, lender_id: parseInt(v) }))} />
                </> : <Loading />}

                <label>Who can add transactions to this account?</label>
                <CustomizedDropdown optionsList={whoCanAddTransactionsOptions} title='Who can add transactions to this account?' default_value="both" mountDirectly outerUpdater={v => setDebtAccountDetails(prev => ({ ...prev, who_can_add_transactions: v }))} />

                <Button
                    disabled={!debtAccountDetails?.name || !debtAccountDetails?.borrower_id || !debtAccountDetails?.lender_id}
                    shadow
                    auto
                    onPress={async () => {
                        console.log('creating voting session', debtAccountDetails?.name);
                        await axios.post(`${process.env.REACT_APP_API_LINK}/debt_accounts/`, {
                            name: debtAccountDetails?.name,
                            lender_id: debtAccountDetails?.lender_id,
                            borrower_id: debtAccountDetails?.borrower_id,
                            who_can_add_transactions: debtAccountDetails?.who_can_add_transactions
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