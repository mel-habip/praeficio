import { useState, useContext, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom'
import './stylesheets/SpecificDebtAccountPage.css';

import NavMenu from '../components/NavMenu';
import useHandleError from '../utils/handleError';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import LanguageContext from '../contexts/LanguageContext';
import LoadingPage from './LoadingPage';
import axios from 'axios';
import { Button, Modal, Input, Tooltip, Table, Textarea, useAsyncList, useCollator, Loading, Text, Checkbox } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';

import SearchableTable from '../components/SearchableTable';

import dollarFormatter from '../utils/dollarFormatter.js';

const CurrencyInputField = lazy(() => import('../fields/CurrencyInputField.jsx'));

const dictionary = {
    borrower: {
        en: 'Borrower',
        fr: 'Emprunteur'
    },
    lender: {
        en: 'Lender',
        fr: 'Prêteur'
    },
    created_on: {
        en: 'Created on',
        fr: 'Date de création'
    },
    current_balance: {
        en: 'Current balance',
        fr: 'Solde actuel'
    },
    trans_add_by: {
        en: 'Transactions added by',
        fr: 'Transactions ajoutées par'
    },
    both: {
        en: 'Both',
        fr: 'Les deux'
    }
}

export default function SpecificDebtAccountPage() {
    const { user } = useContext(IsLoggedInContext);
    const { language } = useContext(LanguageContext);
    const { debt_account_id } = useParams();
    document.title = `Praeficio | Debt Account #${debt_account_id}`;

    //validate that user belongs to this account or is dev_

    const [accountDetails, setAccountDetails] = useState(null);
    const handleError = useHandleError();
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/debt_accounts/${debt_account_id}`).then(response => {
            if (response.status === 200) {
                setAccountDetails(response.data);
            } else {
                console.warn('fetch', response);
            }
        }).catch(handleError);
    }, [debt_account_id]);

    if (!user.use_beta_features) return (
        <>
            <NavMenu />
            <h1>DEBT ACCOUNT PAGE HERE</h1>
            <h2>
                <i className="fa-solid fa-file-invoice-dollar" />
                <i className="fa-solid fa-file-invoice-dollar" />
                <i className="fa-solid fa-file-invoice-dollar" />
            </h2>
            <h3>coming soon to a theater near you! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    );

    if (!accountDetails) return (<LoadingPage />);

    return (
        <>
            <NavMenu />
            {/* <pre>{JSON.stringify(accountDetails, null, 2)}</pre> */}
            <div>
                <h2>{accountDetails.name}</h2>
                <p style={{ border: '1px solid white', padding: '15px', borderRadius: '0.7rem', marginBottom: '15px' }} >
                    {dictionary.borrower[language]}: {accountDetails.borrower_username}
                    <br />
                    {dictionary.lender[language]}: {accountDetails.lender_username}
                    <br />
                    {dictionary.created_on[language]}: {accountDetails.created_on?.slice(0, 10)}
                    <br />
                    {dictionary.current_balance[language]}: <strong style={{color: accountDetails.balance > 0 ? 'orange': 'green'}} >{dollarFormatter(accountDetails.balance)}</strong> 
                    <br />
                    {dictionary.trans_add_by[language]}: {dictionary[accountDetails.who_can_add_transactions]?.[language] || ' - '}
                    <br />
                    Insight: A total of {accountDetails.statistics?.number_of_transactions} transactions are distributed amongst {accountDetails.statistics?.number_of_unique_headers} sources
                </p>
            </div>
            {!!accountDetails?.transactions?.length ? <TransactionsTable data={accountDetails.transactions} /> : <h3>No transactions yet! Use the button below to add one</h3>}
            <br />
            <CreateTransactionModalWithButton setAccountDetails={setAccountDetails} />
        </>
    );
}

function TransactionsTable({ data = [] }) {

    const columns = [
        {
            is_key: true,
            key: "debt_account_transaction_id",
            label: "ID",
            sortable: true
        },
        {
            key: "header",
            label: "Header",
            sortable: true
        },
        {
            key: "posted_on",
            label: "Posted On",
            sortable: true
        },
        {
            key: 'entered_by_username',
            label: 'Entered By',
            sortable: true,
        },
        {
            key: "updated_on",
            label: "Last Update",
            sortable: true
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            formatter: dollarFormatter,
        },
        {
            key: "actions",
            label: "Actions",
            children: <></>
        }
    ];

    return <SearchableTable columns={columns} data={data} />
};

function CreateTransactionModalWithButton({ setAccountDetails }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { debt_account_id } = useParams();
    const [formData, setFormData] = useState({});

    return <>
        <Button shadow onPress={() => setModalOpen(true)}> Create new &nbsp; <i className="fa-regular fa-square-plus" /></Button>
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            scroll
        >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the ticket information below </Text>
            </Modal.Header>
            <Modal.Body>
                {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
                <br />
                <Input underlined clearable color="primary" labelPlaceholder='Transaction Name' onChange={e => setFormData(p => ({ ...p, header: e.target.value }))} />
                <br />

                <Textarea underlined minRows={1.5} labelPlaceholder='Details' onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} />

                <Suspense fallback="..." >
                    <CurrencyInputField
                        onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                        placeholder="Amount ($)" />
                </Suspense>
                <br />

                <Input underlined defaultValue={Date.now()} color="primary" label='Posted On' type="date" onChange={e => setFormData(p => ({ ...p, posted_on: e.target.value }))} />

                <Button
                    shadow
                    onPress={() => {
                        axios.post(`${process.env.REACT_APP_API_LINK}/debt_account_transactions/`, {
                            debt_account_id: parseInt(debt_account_id),
                            ...formData,
                            amount: parseFloat(formData.amount.slice(1)),
                        }).then(response => {
                            if (response.status === 201) {
                                setAccountDetails(p => ({ ...p, transactions: p.transactions.concat(response.data) }));
                                setModalOpen(false);
                            } else {
                                console.warn('fetch', response);
                            }
                        }).catch(() => { });
                    }}
                > Create &nbsp; <i className="fa-regular fa-square-plus" /> </Button>
            </Modal.Body>
        </Modal>
    </>
}