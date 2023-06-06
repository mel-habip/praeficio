import { useState, useEffect, useContext, useMemo, lazy, Suspens, Suspense } from 'react';
import IsLoggedInContext from '../../contexts/IsLoggedInContext';

import { Link, useParams } from 'react-router-dom';

import axios from 'axios';

import NavMenu from '../../components/NavMenu';
import LoadingPage from '../LoadingPage';

import { CustomButton } from '../../fields/CustomButton';
import { Spacer, Text, Input, Tooltip, Row, Table, useAsyncList, useCollator, Loading, Badge } from '@nextui-org/react';
import timestampFormatter from '../../utils/timestampFormatter';

import { PieChart, Pie, ResponsiveContainer, Tooltip as ReChartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ConfirmationModal = lazy(() => import('../../components/ConfirmationModal.jsx'));
const DeletionModal = lazy(() => import('../../components/DeletionModal.jsx'));

export default function SpecificVotingSessionPage() {

    const [votingSessionDetails, setVotingSessionDetails] = useState(null);
    const { voting_session_id } = useParams();
    const { setIsLoggedIn } = useContext(IsLoggedInContext);

    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [deletionModalOpen, setDeletionModalOpen] = useState(false);
    const [voterKeyRenewModalOpen, setVoterKeyRenewModalOpen] = useState(false);

    const [refreshCounter, setRefreshCounter] = useState(0);

    const url_to_vote = useMemo(() => {
        return `https://${window.location.host}/voting_sessions/${voting_session_id}/vote/${votingSessionDetails?.voter_key || 'XYZ'}`
    }, [voting_session_id, votingSessionDetails?.voter_key]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}`).then(response => {
            if (response.status === 401) {
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setVotingSessionDetails(response.data ?? {});
            } else {
                console.log('fetch', response);
            }
        });
    }, [refreshCounter]);

    if (!votingSessionDetails) return <LoadingPage />

    return (<>
        <NavMenu />
        <h1>Voting Session: {votingSessionDetails.name} </h1>
        <CustomButton to="/voting_sessions"> Back to all voting sessions <i className="fa-solid fa-angles-right" /></CustomButton>

        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
        }} >
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.7rem', padding: '5px', margin: '5px', maxWidth: '50%' }} >
                <h3>Results</h3>
                <hr />
                <ResultGraphs distributionData={votingSessionDetails.distribution} />
                <h4>Total Votes: {votingSessionDetails.result.total_votes}</h4>
                <h4>Valid Votes: {votingSessionDetails.result.valid_votes}</h4>
                <h4>Winning option, with {votingSessionDetails.result.winner_votes} votes: {votingSessionDetails.result.winner}</h4>
                {votingSessionDetails.errors?.map((err, ind) => <p key={ind} style={{ color: 'red' }} >{err}</p>)}
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.7rem', padding: '5px', margin: '5px' }} >
                <h3>Details</h3>
                <hr />
                <h4>Voting Session ID: {votingSessionDetails.voting_session_id}</h4>
                <h4>Created On: {timestampFormatter(votingSessionDetails.created_on)}</h4>
                <h4>Voter Key:
                    <Tooltip trigger="click" content={`Copied!`} >
                        <Link>
                            <span onClick={() => navigator.clipboard.writeText(votingSessionDetails.voter_key)} >
                                {votingSessionDetails.voter_key} </span>
                        </Link>
                    </Tooltip>
                </h4>
                <h4>Status: <span style={{ color: votingSessionDetails.completed ? 'green' : 'cyan' }} > {votingSessionDetails.completed ? 'Completed' : 'In Progress'} </span> </h4>
                {!!votingSessionDetails.completed && <h4>Completed On: {timestampFormatter(votingSessionDetails.completed_on)}</h4>}
                <h4>Method: {votingSessionDetails.details.method}</h4>
                {votingSessionDetails.details.method === 'multiple_votes' && <h4>Number of selections per vote: {votingSessionDetails.details.number_of_votes}</h4>}
                <h4>Voter Limit: {votingSessionDetails.details.voter_limit || 'unlimited'}</h4>
                <div style={{
                    width: 'fit-content', marginLeft: 'auto',
                    marginRight: 'auto',
                }} >
                    <Tooltip trigger="click" content="Copied!" >
                        <Link>
                            <span onClick={() => navigator.clipboard.writeText(url_to_vote)} > Link to vote </span>
                        </Link>
                    </Tooltip>
                </div>


                <h4>Options:</h4>
                <div style={{
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }} >
                    {votingSessionDetails.details.options.map((opt, index) =>
                        <Row key={index + '-row'} justify="space-between" css={{ 'white-space': 'pre-wrap', 'padding-left': '1rem', 'padding-right': '1rem', 'min-width': '65%' }} >
                            <Text><i className="fa-regular fa-hand-point-right" />  &nbsp;&nbsp;&nbsp; {opt}</Text>
                            <Spacer x={0.2} />
                        </Row>)}
                </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.7rem', padding: '5px', margin: '5px', display: 'flex', flexDirection: 'column' }} >
                <h3>Controls</h3>
                <hr />
                <CustomButton onClick={() => setRefreshCounter(prev => prev + 1)} >Refresh the data <i className="fa-solid fa-arrows-rotate" /></CustomButton>
                <CustomButton
                    disabled={votingSessionDetails.completed}
                    onClick={() => setVoterKeyRenewModalOpen(true)} >Renew Voter Key <i className="fa-solid fa-key" /></CustomButton>
                <Suspense fallback={<Loading />} >
                    <ConfirmationModal
                        selfOpen={voterKeyRenewModalOpen}
                        setSelfOpen={setVoterKeyRenewModalOpen}
                        outerUpdater={() => {
                            axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/renew_voter_key`).then(response => {
                                if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else if (response.status === 200) {
                                    setVotingSessionDetails(prev => ({ ...prev, ...response.data }));
                                } else {
                                    console.log('fetch', response);
                                }
                            });
                        }}
                    />
                </Suspense>
                <CustomButton
                    disabled={votingSessionDetails.completed}
                    onClick={() => setCompletionModalOpen(true)}
                >Complete the voting session <i className="fa-solid fa-flag-checkered" /></CustomButton>
                <Suspense fallback={<Loading />} >
                    <ConfirmationModal
                        selfOpen={completionModalOpen}
                        setSelfOpen={setCompletionModalOpen}
                        outerUpdater={() => {
                            axios.post(`${process.env.REACT_APP_API_LINK}/voting_sessions/${voting_session_id}/complete`).then(response => {
                                if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else if (response.status === 200) {
                                    setVotingSessionDetails(prev => ({ ...prev, ...response.data }));
                                } else {
                                    console.log('fetch', response);
                                }
                            });
                        }}
                    />
                </Suspense>
                <CustomButton
                    style={{ marginTop: 'auto' }}
                    onClick={() => setDeletionModalOpen(true)}
                >Delete this voting session <i className="fa-solid fa-trash-can" /></CustomButton>
                <Suspense fallback={<Loading />} >
                    <DeletionModal
                        selfOpen={deletionModalOpen}
                        setSelfOpen={setDeletionModalOpen}
                        endPoint={`voting_sessions/${voting_session_id}`}
                        outerUpdater={() => window.location.replace('/voting_sessions')}
                        titleText="this voting session"
                    />
                </Suspense>
            </div>

        </div >


        {!!votingSessionDetails.votes.length ? <VotersTable votersList={votingSessionDetails.votes} /> : <h3>No votes received yet. A table will be shown once votes are received.</h3>
        }


    </>);
};


function VotersTable({ votersList = [] }) {
    const [selected, setSelected] = useState(null);
    const { setIsLoggedIn } = useContext(IsLoggedInContext);

    const [innerList, setInnerList] = useState(votersList);

    useEffect(() => {
        setInnerList(votersList)
    }, [votersList]);

    let load = async ({ filterText }) => ({ items: filterText ? innerList.filter(voterRow => [voterRow.voter_ip_address].join('').toLowerCase().includes(filterText.toLowerCase().trim())) : innerList }); //this can normally be an async function that fetches the data, but already we hold the whole page off while it is loading

    //This section is what supports sorting
    const collator = useCollator({ numeric: true });
    async function sort({ items, sortDescriptor }) {
        return {
            items: items.sort((a, b) => {
                let first = a[sortDescriptor.column];
                let second = b[sortDescriptor.column];
                let cmp = collator.compare(first, second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }),
        };
    };

    const list = useAsyncList({ load, sort });
    //This section is what supports sorting


    // search Debounce mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {
        if (!keyword || !searchText) {
            list.setFilterText('');
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);
            list.setFilterText(keyword);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);


    const columns = [
        {
            key: "vote_id",
            label: "ID",
            sortable: true
        },
        {
            key: "voter_ip_address",
            label: "IP address",
            sortable: true
        },
        {
            key: "deleted",
            label: "Deleted",
            sortable: true
        },
        {
            key: "created_on",
            label: "Created On",
            sortable: true
        },
        {
            key: "updated_on",
            label: "Last Update",
            sortable: true
        },
        {
            key: "actions",
            label: "Actions",
        }
    ];

    return (<>
        <Row css={{ mb: '10px', 'ml': '30%' }} >
            <Input
                bordered
                value={searchText}
                labelPlaceholder="Search the table"
                helperText={searchText ? 'a small delay is normal' : ''}
                css={{ mr: '3px' }}
                width="300px"
                clearable
                onChange={(e) => setSearchText(e.target.value)}
            />
        </Row>

        <Table
            aria-label="Example table with dynamic content"
            bordered
            lined
            selectionMode='single'
            onSelectionChange={e => setSelected(parseInt(e.currentKey))}
            compact
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            shadow
            color="primary"
            containerCss={{
                height: "auto",
                minWidth: "70%",
                maxWidth: '95%',
                'z-index': 10
            }}
        >
            <Table.Header columns={columns}>
                {(column) => (
                    <Table.Column allowsSorting={column.sortable} key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                )}
            </Table.Header>
            <Table.Body items={list.items} css={{ 'text-align': 'left' }} loadingState={list.loadingState}>
                {item => (
                    <Table.Row key={item.vote_id} className="position-table-row" css={{ padding: '0px', margin: '0px' }}>
                        {columnKey => {
                            if (columnKey === 'actions') {
                                return <Table.Cell css={{ 'padding': '0px', wordWrap: 'break-word', margin: '0px' }} >
                                    <CustomButton buttonStyle="btn--transparent" onClick={() => {
                                        axios.delete(`${process.env.REACT_APP_API_LINK}/voting_sessions/${item.voting_session_id}/vote/${item.vote_id}`).then(response => {
                                            if (response.status === 401) {
                                                setIsLoggedIn(false);
                                            } else if ([200, 204].includes(response.status)) {
                                                setInnerList(prev => prev.map(x => x.vote_id === item.vote_id ? ({ ...x, deleted: true }) : x));
                                            } else {
                                                console.log('delete', response);
                                            }
                                        });
                                    }} ><i className="fa-regular fa-trash-can"></i></CustomButton>
                                </Table.Cell>
                            } else if (['updated_on', 'created_on'].includes(columnKey)) {
                                return <Table.Cell> {item[columnKey] ? timestampFormatter(item[columnKey]) : ' - '} </Table.Cell>
                            } else if (columnKey === 'to_do_categories') {
                                return <Table.Cell> <pre style={{ padding: '0px', margin: '0px' }} > {JSON.stringify(item[columnKey], null, 2)} </pre>  </Table.Cell>
                            } else {
                                return <Table.Cell> {item[columnKey]?.toString()} </Table.Cell>
                            }
                        }}
                    </Table.Row>
                )}
            </Table.Body>

            <Table.Pagination shadow align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })} />
        </Table >
    </>);
};


function ResultGraphs({ distributionData = {} }) {

    const [data, setData] = useState([]);

    useEffect(() => {
        setData(Object.entries(distributionData).map(([name, value]) => ({ name, value })));
    }, [distributionData]);

    return (<div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <ResponsiveContainer width="100%" height={250} >
            <PieChart width="100%" height={250}>
                <Pie
                    isAnimationActive
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    fill="#8884d8"
                    label />
                <ReChartsTooltip label={"what"} />
            </PieChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                width="100%"
                height={250}
                data={data}
                margin={{
                    // top: 5,
                    // right: 30,
                    left: 0,
                    // bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReChartsTooltip />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    </div>);
}