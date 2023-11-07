import { useState, useContext, useEffect, Suspense, lazy, useCallback } from 'react';
import { useParams } from 'react-router-dom'
import './stylesheets/SpecificDebtAccountPage.css';

import NavMenu from '../components/NavMenu';
import useHandleError from '../utils/handleError';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import LanguageContext from '../contexts/LanguageContext';
import LoadingPage from './LoadingPage';
import axios from 'axios';
import { Button, Modal, Input, Tooltip, Textarea, Text, Checkbox, Spacer } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import todaysDate from '../utils/todaysDate.js';

import SearchableTable from '../components/SearchableTable';

import dollarFormatter from '../utils/dollarFormatter.js';
import DeletionModal from '../components/DeletionModal.jsx';

const CurrencyInputField = lazy(() => import('../fields/CurrencyInputField.jsx'));
const ConfirmationModal = lazy(() => import('../components/ConfirmationModal.jsx'));

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
    },
    posted_on: {
        en: 'Posted on',
        fr: 'Posté sur'
    },
    entered_by: {
        en: 'Entered by',
        fr: 'Entré par'
    },
    amount: {
        en: 'Amount',
        fr: 'Montant'
    },
    last_update: {
        en: 'Last update',
        fr: 'Dernière mise à jour'
    },
    header: {
        en: 'Vendor',
        fr: 'Fournisseur'
    },
    details: {
        en: 'Details',
        fr: 'Détails'
    },
    create_new: {
        en: 'Create new',
        fr: 'Créer un nouveau'
    }
};

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

    const addTransaction = ((newItem) => {
        setAccountDetails(p => ({ ...p, balance: p.balance + newItem.amount, transactions: p.transactions.concat(newItem) }));
    }, [accountDetails]);

    const removeTransaction = useCallback((id) => {
        setAccountDetails(p => ({ ...p, balance: p.balance - p.transactions.find(t => t.debt_account_transaction_id === id)?.amount || 0, transactions: p.transactions.filter(t => t.debt_account_transaction_id !== id) }));
    }, [accountDetails]);

    const editTransaction = useCallback((id, newData) => {
        setAccountDetails(p => {

            let old;

            let newTransactions = p.transactions.map(trans => {
                if (trans.debt_account_transaction_id === id) {
                    old = trans;
                    return newData;
                }
                return trans;
            });

            let balanceModification = 0; //if positive, balance will go up

            if (old) {
                balanceModification = newData.amount - old.amount;
            }

            return {
                ...p,
                balance: p.balance + balanceModification,
                transactions: newTransactions
            }
        });
    }, [accountDetails]);

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
                    {dictionary.current_balance[language]}: <strong style={{ color: accountDetails.balance > 0 ? 'orange' : 'green' }} >{dollarFormatter(accountDetails.balance)}</strong>
                    <br />
                    {dictionary.trans_add_by[language]}: {dictionary[accountDetails.who_can_add_transactions]?.[language] || ' - '}
                    <br />
                    Insight: A total of {accountDetails.statistics?.number_of_transactions} transactions are distributed amongst {accountDetails.statistics?.number_of_unique_headers} sources
                </p>
            </div>
            {!!accountDetails?.transactions?.length ? <TransactionsTable editTransaction={editTransaction} data={accountDetails} setData={setAccountDetails} removeTransaction={removeTransaction} /> : <h3>No transactions yet! Use the button below to add one</h3>}
            <br />
            <CreateTransactionModalWithButton addTransaction={addTransaction} />
        </>
    );
};

function TransactionsTable({ data = { transactions: [] }, removeTransaction, editTransaction }) {

    const [innerList, setInnerList] = useState(data.transactions);

    useEffect(() => {
        setInnerList(data.transactions)
    }, [data]);

    const { language } = useContext(LanguageContext);

    const [deletionModalOpen, setDeletionModalOpen] = useState(false);

    const [editDetails, setEditDetails] = useState(false);

    const shortener = val => val?.length > 25 ? val.slice(0, 25) + '...' : val || ' - ';

    const columns = [
        {
            is_key: true,
            key: "debt_account_transaction_id",
            label: "ID",
            sortable: true
        },
        {
            key: "vendor",
            label: dictionary.header[language],
            sortable: true
        },
        {
            key: "details",
            label: dictionary.details[language],
            sortable: true,
            children: self => <Tooltip content={<span dangerouslySetInnerHTML={{ __html: convertLinks(self.details) }} ></span>} enterDelay={250} > {shortener(self.details)} </Tooltip>
        },
        {
            key: "posted_on",
            label: dictionary.posted_on[language],
            sortable: true,
            formatter: v => v?.slice(0, 10) || ' - '
        },
        {
            key: 'entered_by_username',
            label: dictionary.entered_by[language],
            sortable: true,
        },
        {
            key: "updated_on",
            label: dictionary.last_update[language],
            sortable: true
        },
        {
            key: 'amount',
            label: dictionary.amount[language],
            sortable: true,
            formatter: dollarFormatter,
        },
        {
            key: "actions",
            label: "Actions",
            children: self => <>
                <CustomButton onClick={() => console.log(self) || setEditDetails(self)} > <i className="fa-regular fa-pen-to-square" /> </CustomButton>
                <CustomButton onClick={() => console.log(self) || setDeletionModalOpen(self)} > <i className="fa-regular fa-trash-can" /> </CustomButton>
            </>
        }
    ];

    return <>
        <SearchableTable columns={columns} data={innerList} />
        {!!editDetails && <TransactionModal isEdit editTransaction={editTransaction} editData={editDetails} setModalOpen={setEditDetails} />}

        <DeletionModal
            endPoint={`debt_account_transactions/${deletionModalOpen?.debt_account_transaction_id}`}
            selfOpen={!!deletionModalOpen}
            setSelfOpen={setDeletionModalOpen}
            outerUpdater={() => removeTransaction(deletionModalOpen.debt_account_transaction_id)}
        />
    </>
};

function CreateTransactionModalWithButton({ editData = {}, addTransaction }) {
    const { language } = useContext(LanguageContext);
    const [modalOpen, setModalOpen] = useState(false);

    return <>
        <Button
            shadow
            onPress={() => setModalOpen(true)}> {dictionary.create_new[language]} &nbsp; <i className="fa-regular fa-square-plus" /></Button>
        {modalOpen && <TransactionModal addTransaction={addTransaction} setModalOpen={setModalOpen} />}
    </>
};

function TransactionModal({ isEdit = false, editData = {}, addTransaction, setModalOpen, editTransaction }) {
    const { language } = useContext(LanguageContext);
    const { debt_account_id } = useParams();
    const [formData, setFormData] = useState(isEdit ? {
        posted_on: todaysDate(),
        ...editData,
    } : {
        posted_on: todaysDate(),
    });

    return <>
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={true}
            onClose={() => setModalOpen(false)}
            scroll
        >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text>
            </Modal.Header>
            <Modal.Body>
                <Spacer y={0.4} />
                <Input initialValue={formData.header} underlined clearable color="primary" labelPlaceholder='Vendor' onChange={e => setFormData(p => ({ ...p, header: e.target.value }))} />
                <Spacer y={0.4} />

                <Textarea initialValue={formData.details} underlined minRows={1.5} labelPlaceholder='Details' onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} />

                <Suspense fallback="..." >
                    <CurrencyInputField
                        value={formData.amount || undefined}
                        onChange={v => setFormData(p => ({ ...p, amount: v }))}
                        placeholder="Amount ($)" />
                </Suspense>
                <Spacer y={1} />
                <Checkbox defaultSelected={formData.is_payment || formData.amount < 0} onChange={e => setFormData(p => ({ ...p, is_payment: e }))} > <p>Is this a payment?</p></Checkbox>

                <Input underlined initialValue={formData.posted_on?.slice(0, 10)} color="primary" label='Posted On' type="date" onChange={e => setFormData(p => ({ ...p, posted_on: e.target.value }))} />

                <Button
                    shadow
                    onPress={() => {
                        if (isEdit) {
                            axios.put(`${process.env.REACT_APP_API_LINK}/debt_account_transactions/${formData.debt_account_transaction_id}`, {
                                debt_account_id: parseInt(debt_account_id),
                                ...formData,
                                amount: parseFloat(formData.amount.slice(1).replaceAll(',', '')) * (formData.is_payment ? -1 : 1),
                            }).then(response => {
                                if (response.status === 200) {
                                    // setAccountDetails(p => ({ ...p, transactions: p.transactions.concat(response.data) }));
                                    setModalOpen(false);
                                    editTransaction(response.data);
                                } else {
                                    console.warn('fetch', response);
                                }
                            }).catch(() => { });
                        } else {
                            axios.post(`${process.env.REACT_APP_API_LINK}/debt_account_transactions/`, {
                                debt_account_id: parseInt(debt_account_id),
                                ...formData,
                                amount: parseFloat(formData.amount.slice(1).replaceAll(',', '')) * (formData.is_payment ? -1 : 1),
                            }).then(response => {
                                if (response.status === 201) {
                                    // setAccountDetails(p => ({ ...p, transactions: p.transactions.concat(response.data) }));
                                    setModalOpen(false);
                                    addTransaction(response.data);
                                } else {
                                    console.warn('fetch', response);
                                }
                            }).catch(() => { });
                        }
                    }}
                > {isEdit ? <> Edit &nbsp; <i className="fa-regular fa-pen-to-square" /></> : <> Create &nbsp; <i className="fa-regular fa-square-plus" /></>}  </Button>
            </Modal.Body>
        </Modal>
    </>
}

function convertLinks(input) {

    let text = input;
    const linksFound = text.match(/(?:www|https?)[^\s]+/g);
    const aLink = [];

    if (linksFound != null) {

        for (let i = 0; i < linksFound.length; i++) {
            let replace = linksFound[i];
            if (!(linksFound[i].match(/(http(s?)):\/\//))) { replace = 'http://' + linksFound[i] }
            let linkText = replace.split('/')[2];
            if (linkText.substring(0, 3) == 'www') { linkText = linkText.replace('www.', '') }
            if (linkText.match(/youtu/)) {

                let youtubeID = replace.split('/').slice(-1)[0];
                aLink.push('<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/' + youtubeID + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>')
            }
            else if (linkText.match(/vimeo/)) {
                let vimeoID = replace.split('/').slice(-1)[0];
                aLink.push('<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/' + vimeoID + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')
            }
            else {
                aLink.push('<a href="' + replace + '" target="_blank">' + linkText + '</a>');
            }
            text = text.split(linksFound[i]).map(item => { return aLink[i].includes('iframe') ? item.trim() : item }).join(aLink[i]);
        }
        return text;

    }
    else {
        return input;
    }
}