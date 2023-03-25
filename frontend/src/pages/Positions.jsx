import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import removeIndex from '../utils/removeIndex';

import LoadingPage from '../pages/LoadingPage';

import NavMenu from '../components/NavMenu';
import { Button, Modal, Spacer, Table, Text, Input, Checkbox, Tooltip, Row, Grid } from '@nextui-org/react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

import { CustomButton } from '../fields/CustomButton';
import DateField from '../fields/DateField';

let delay = 300; //for Tooltips

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const frmt = (date) => {
    if (!date) {
        return '';
    }
    console.log('frmt func: ', date);
    if (typeof date === 'string') date = new Date(date);
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    if (mm < 10) mm = `0` + mm;
    let dd = date.getDate();
    if (dd < 10) dd = `0` + dd;
    return `${yyyy}-${mm}-${dd}`
}

function Positions() {
    const [positions, setPositions] = useState(null);
    const [includeDeletedPositions, setIncludeDeletedPositions] = useState(false);
    const [includeInactivePositions, setIncludeInactivePositions] = useState(false);
    const [creationUpdateModalOpen, setCreationUpdateModalOpen] = useState(false);
    const [detailViewModalOpen, setDetailViewModalOpen] = useState(false);
    const [deletionModalOpen, setDeletionModalOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedPositionID, setSelectedPositionID] = useState(null);
    const [positionDetails, setPositionDetails] = useState({});
    const [ticker, setTicker] = useState('');
    const [size, setSize] = useState('');
    const [active, setActive] = useState(true);
    const [acquiredOn, setAcquiredOn] = useState('');
    const [soldOn, setSoldOn] = useState('');
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [tickerError, setTickerError] = useState('');
    const [sizeError, setSizeError] = useState('');
    const [acquiredOnPickerIsOpen, setAcquiredOnPickerIsOpen] = useState(false);
    const [soldOnPickerIsOpen, setSoldOnPickerIsOpen] = useState(false);


    const { setIsLoggedIn, user, accessToken } = useContext(IsLoggedInContext);
    const { isDark } = useContext(ThemeContext);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const kickOut = () => {
        setIsLoggedIn(false);
    }

    const updateCachedPositions = (position_id, updated_details) => {
        setPositions(positions.map(pos => {
            if (pos.position_id === position_id) {
                return updated_details;
            } else {
                return pos;
            }
        }));
    }

    useEffect(() => {
        if (detailViewModalOpen || deletionModalOpen) {

            const s_index = positions.findIndex(pos => pos.position_id === selectedPositionID);

            if (s_index === -1) {
                setPositionDetails({ text: 'Not Recognized.', position: null, index: s_index });
                return;
            }

            const s_pos = positions[s_index]; //selected position

            let text_array = [`Ticker: \t\t${s_pos.ticker}`, `Active: \t\t${s_pos.active ? 'Yes' : 'No'}`, `Size: \t\t\t${s_pos.size} shares`];

            if (s_pos.acquired_on) {
                text_array.push(`Acquired On: \t${frmt(new Date(s_pos.acquired_on))}`);
            }

            if (s_pos.sold_on) {
                text_array.push(`Sold On: \t\t${frmt(new Date(s_pos.sold_on))}`);
            }

            if (!deletionModalOpen) {
                text_array.push(`Created On: \t${frmt(new Date(s_pos.created_on))}`);
                text_array.push(`Last Updated: \t${frmt(new Date(s_pos.updated_on)) || 'Never updated'}`);
            }

            let notes = s_pos.notes;

            if (notes.length && deletionModalOpen) {
                text_array.push(`Notes: \n\t\t++ ${notes.join('\n\t\t++ ')}`)
            }

            setPositionDetails({ text: text_array.join('\n'), position: { ...s_pos, notes }, index: s_index });
        }
    }, [detailViewModalOpen, deletionModalOpen, selectedPositionID, positions]);

    useEffect(() => {
        if (isUpdate) {
            const select = positions.find(pos => pos.position_id === selectedPositionID);
            if (!select) {
                console.log(`not found`, selectedPositionID);
                return;
            }
            console.log(selectedPositionID, `selected`, select);
            setAcquiredOn(frmt(select.acquired_on) || null);
            setSoldOn(frmt(select.sold_on) || null);
            setActive(select.active);
            setTicker(select.ticker);
            setSize(select.size);
        }
    }, [isUpdate, selectedPositionID]);

    useEffect(() => {
        let query = includeDeletedPositions ? '?include_deleted=true' : '';
        if (includeInactivePositions) {
            query = query ? `${query}&include_inactive=true` : '?include_inactive=true';
        }
        axios.get(`http://localhost:8000/positions/user/${user.id}${query}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                setPositions(response.data);
            } else {
                console.log('response:', response.data);
            }
        });
    }, [includeDeletedPositions, includeInactivePositions]);

    if (!positions) return (<LoadingPage/> );

    function togglePosition(position_id, turn_on_off) {
        axios.put(`http://localhost:8000/positions/${position_id}/${turn_on_off ? 'reactivate' : 'deactivate'}`).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                updateCachedPositions(position_id, { ...response.data.data, active: !!turn_on_off });
            } else {
                console.log('response:', response.data);
            }
        });
    }

    function updateNotes(position_id, notes = []) {
        axios.put(`http://localhost:8000/positions/${position_id}`, { notes: JSON.stringify(notes) }).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                updateCachedPositions(position_id, { ...response.data.data });
                setDetailViewModalOpen(false);
            } else {
                console.log('response:', response.data);
            }
        });
    }

    function recoverPosition(position_id) {
        axios.put(`http://localhost:8000/positions/${position_id}/recover`).then(response => {
            if (response.status === 401) {
                kickOut();
            } else if (response.status === 200) {
                updateCachedPositions(position_id, { ...response.data.data, deleted: false, active: true });
            } else {
                console.log('response:', response.data);
            }
        });
    }

    const columns = [
        {
            key: "position_id",
            label: "ID",
        },
        {
            key: "ticker",
            label: "Ticker",
        },
        {
            key: "size",
            label: "Size",
        },
        {
            key: "acquired_on",
            label: "Acquired On",
        },
        {
            key: "sold_on",
            label: "Sold On",
        },
        {
            key: "actions",
            label: "Actions",
        },
    ];

    return (
        <>
            <NavMenu></NavMenu>

            <Checkbox
                color="secondary"
                onChange={selected => setIncludeDeletedPositions(selected)}
            ><Text >Include deleted positions</Text></Checkbox>

            <Checkbox
                color="secondary"
                onChange={selected => setIncludeInactivePositions(selected)}
            ><Text >Include inactive positions</Text></Checkbox>

            <Table
                aria-label="Example table with dynamic content"
                bordered
                lined
                selectionMode='single'
                onSelectionChange={e => setSelectedPositionID(parseInt(e.currentKey))}
                compact
                shadow
                color="primary"
                containerCss={{
                    height: "auto",
                    minWidth: "70%",
                    'z-index': 10
                }}
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column allowsSorting key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={positions} css={{ 'text-align': 'left' }}>

                    {(item) => (
                        <Table.Row key={item.position_id} className="position-table-row">
                            {columnKey => {
                                if (columnKey === 'actions') {

                                    return <Table.Cell >
                                        <Tooltip content="Modify" placement="left" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" disabled={item.deleted} onClick={() => { setIsUpdate(true); setCreationUpdateModalOpen(true); }} ><i className="fa-regular fa-pen-to-square"></i></CustomButton>
                                        </Tooltip>
                                        <Tooltip content={item.deleted ? 'Restore' : 'Delete'} placement="top" shadow enterDelay={delay}>
                                            {item.deleted ? <CustomButton buttonStyle="btn--transparent" onClick={() => recoverPosition(item.position_id)}><i className="fa-solid fa-recycle"></i></CustomButton> : <CustomButton buttonStyle="btn--transparent" onClick={() => setDeletionModalOpen(true)} ><i className="fa-regular fa-trash-can"></i></CustomButton>}
                                        </Tooltip>
                                        <Tooltip content="Details" placement="right" shadow enterDelay={delay}>
                                            <CustomButton buttonStyle="btn--transparent" onClick={() => setDetailViewModalOpen(true) || setNotes(item.notes)}><i className="fa-solid fa-list-ul"></i></CustomButton>
                                        </Tooltip>
                                        {item.active ? '' : <Tooltip content="Reactivate" placement="top" shadow enterDelay={delay}> <CustomButton disabled={item.deleted} buttonStyle="btn--transparent" onClick={() => togglePosition(item.position_id, true)} ><i className="fa-solid fa-heart-pulse"></i></CustomButton> </Tooltip>}


                                    </Table.Cell>
                                } else if (['acquired_on', 'sold_on'].includes(columnKey)) {
                                    return <Table.Cell> {item[columnKey] ? item[columnKey].substring(0, 10) : ' - '} </Table.Cell>
                                } else {
                                    return <Table.Cell> {item[columnKey]} </Table.Cell>
                                }
                            }}
                        </Table.Row>
                    )}
                </Table.Body>

                <Table.Pagination shadow noMargin align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })}></Table.Pagination>


            </Table>
            <Spacer y={4}></Spacer>
            <Row justify="space-evenly" >
                <Button onClick={() => setActive(true) || setIsUpdate(false) || setCreationUpdateModalOpen(true)} >Add position&nbsp;<i className="fa-regular fa-square-plus"></i></Button>
                <Button disabled={true} >Export Positions&nbsp;<i className="fa-solid fa-download"></i></Button>
                <Button disabled={true} >Import Positions&nbsp;<i className="fa-solid fa-upload"></i></Button>
            </Row>



            {creationUpdateModalOpen && (<Modal closeButton blur aria-labelledby="modal-title" open={true} onClose={() => setIsUpdate(false) || setCreationUpdateModalOpen(false)} >
                <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                    <Text size={14} > Please enter the information below </Text> </Modal.Header> <Modal.Body> <Spacer y={0.4} /> <Input rounded value={ticker} initialValue="" clearable type="text" required pattern="[A-Z.-]" bordered labelPlaceholder="Ticker*" color={tickerError ? "error" : "primary"} status={tickerError ? "error" : "default"} helperText={tickerError} helperColor={tickerError ? "error" : "primary"} onChange={(e) => setTickerError('') || setTicker(e.target.value)} /> <Spacer y={0.5} /> <Input value={size} initialValue="0.0" rounded type="number" required bordered labelPlaceholder="Size*" color={sizeError ? "error" : "primary"} status={sizeError ? "error" : "default"} helperText={sizeError} helperColor={sizeError ? "error" : "primary"} onChange={(e) => setSizeError('') || setSize(e.target.value)} /> <Spacer y={0.5} />
                    <Checkbox
                        isSelected={active}
                        onChange={setActive}
                    > <Text size={16}>Active</Text>
                    </Checkbox>
                    <Spacer y={0.5} />
                    <Input value={acquiredOn} rounded type="text" clearable bordered labelPlaceholder="Acquired On" color={sizeError ? "error" : "primary"} status={sizeError ? "error" : "default"}
                        helperText={sizeError} helperColor={sizeError ? "error" : "primary"}
                        onClick={() => setAcquiredOnPickerIsOpen(true)} onClearClick={() => setAcquiredOn('')}
                    />
                    <DatePicker isOpen={acquiredOnPickerIsOpen} title="Acquired On" onClose={(val) => setAcquiredOn(frmt(val)) || setAcquiredOnPickerIsOpen(false)}
                        onChange={(val) => setAcquiredOn(frmt(val)) || console.log(acquiredOn) || setAcquiredOnPickerIsOpen(false)}
                        closeText={<i className="fa-regular fa-circle-check"></i>} clearText={acquiredOn ? <i className="fa-regular fa-trash-can" onClick={(e) => { console.log('clicked', e) }}></i> : ''} colorScheme="#0F52BA" defaultValue={new Date()} minDate={new Date(2000, 10, 10)} maxDate={new Date().addDays(1)} headerFormat='DD, MM dd' />
                    <Spacer y={0.5} />
                    <Input value={soldOn} rounded type="text" clearable bordered labelPlaceholder="Sold On" color={sizeError ? "error" : "primary"} status={sizeError ? "error" : "default"}
                        helperText={sizeError} helperColor={sizeError ? "error" : "primary"} onClick={() => setSoldOnPickerIsOpen(true)} onClearClick={() => setSoldOn('')} />
                    <DatePicker isOpen={soldOnPickerIsOpen} title="Sold On" onClose={(val) => setSoldOn(frmt(val)) || console.log('clicked here', val) || setSoldOnPickerIsOpen(false)}
                        onChange={(val) => setSoldOn(frmt(val)) || console.log(soldOn) || setSoldOnPickerIsOpen(false)}
                        colorScheme="#0F52BA" closeText={<i className="fa-regular fa-circle-check"></i>} clearText={soldOn ? <i className="fa-regular fa-trash-can"></i> : ''} defaultValue={new Date()} minDate={new Date(2000, 10, 10)} maxDate={new Date().addDays(1)} headerFormat='DD, MM dd' />
                    <Button
                        disabled={!ticker || !size || size === '0'}
                        shadow
                        auto
                        onPress={async () => {
                            console.log('creating/updating position');
                            const options = {
                                method: isUpdate ? 'PUT' : 'POST',
                                url: `http://localhost:8000/positions/${isUpdate ? selectedPositionID : ''}`,
                                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                                data: { position_id: selectedPositionID, ticker, size: parseFloat(size), user_id: user.id, acquired_on: acquiredOn, sold_on: soldOn, active }
                            };
                            await axios.request(options).then(response => {
                                console.log('response:', response.data);
                                if ([200, 201].includes(response.status)) {
                                    console.log('successful');
                                    setCreationUpdateModalOpen(false);
                                    if (!isUpdate) {
                                        setPositions(positions.concat(response.data));
                                    } else {
                                        updateCachedPositions(selectedPositionID, response.data.data);
                                    }
                                } else if (response.status === 401) {
                                    kickOut();
                                } else {
                                    console.log(response);
                                }
                                setIsUpdate(false);
                            });
                        }}> {isUpdate ? <>Update Position&nbsp;&nbsp;<i className="fa-regular fa-pen-to-square"></i></> : <>Create Position&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i></>} </Button> </Modal.Body> </Modal>)
            }





            {
                detailViewModalOpen && (
                    <Modal css={isDark ? { 'background-color': '#0d0d0d' } : {}} closeButton blur aria-labelledby="modal-title" open={detailViewModalOpen} onClose={() => setDetailViewModalOpen(false)} > <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                        <Text size={18} > Position details are given below</Text>
                    </Modal.Header>
                        <Modal.Body>
                            {function () {
                                if (!positionDetails || positionDetails.index === -1) return 'Not Recognized';
                                return (<>
                                    <Text size={15} css={{ 'white-space': 'pre-wrap', 'padding-left': '5rem' }}> {positionDetails.text} </Text> <Spacer y={0.1} ></Spacer> <Text size={15} css={{ 'padding-left': '4rem' }}>Notes:</Text>
                                    {notes.length ? <></> : <Text size={15} css={{ 'padding-left': '5rem' }}>No notes yet! Enter one below!</Text>} {notes.map((note, index) => <Row justify="space-between" css={{ 'white-space': 'pre-wrap', 'padding-left': '1rem', 'padding-right': '1rem' }} >
                                        <Text><i className="fa-regular fa-hand-point-right"></i>  &nbsp;&nbsp;&nbsp; {note}
                                        </Text>
                                        <Spacer x={0.2}></Spacer>
                                        <CustomButton buttonStyle="btn--transparent" onClick={() => { setNotes(removeIndex(notes, index)) }} ><i
                                            className="fa-regular fa-trash-can"></i></CustomButton> </Row>)} <Row >
                                        <Input bordered shadow color="primary" value={newNote} css={{ width: '100%' }} aria-label="new note input" labelPlaceholder="New Note" clearable onChange={(e) => setNewNote(e.target.value)} />
                                        <CustomButton
                                            buttonStyle="btn--transparent"
                                            rounded
                                            shadow
                                            disabled={!newNote}
                                            onClick={() => console.log('clicked') || setNotes(notes.concat(newNote)) || setNewNote('')} ><i className="fa-regular fa-hand-point-up"></i></CustomButton> </Row>
                                </>)
                            }()}
                            <Row justify='space-evenly' > <Button auto shadow color="inverse" onPress={() => setDetailViewModalOpen(false)}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i> </Button>
                                <Button auto
                                    disabled={notes.length === positionDetails.position?.notes?.length && notes.every((note, index) => note === positionDetails.position?.notes?.[index])}
                                    shadow
                                    color="success"
                                    onPress={async () => {
                                        updateNotes(selectedPositionID, notes);
                                    }}> Save&nbsp;<i className="fa-solid fa-floppy-disk"></i>
                                </Button>
                            </Row>
                            <Text size={12} em css={{ 'text-align': 'center' }}> Note: changes cannot be undone </Text>
                        </Modal.Body>
                    </Modal >)
            }





            {
                deletionModalOpen && (
                    <Modal css={isDark ? { 'background-color': '#0d0d0d' } : {}} closeButton blur aria-labelledby="modal-title" open={deletionModalOpen} onClose={() => setDeletionModalOpen(false)} > <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                        <Text size={18} > Are you sure you want to delete this position?</Text>
                    </Modal.Header>
                        <Modal.Body>
                            <Text size={15} css={{ 'white-space': 'pre-wrap', 'padding-left': '5rem' }}> {positionDetails.text} </Text>
                            <Row
                                justify='space-evenly'
                            >
                                <Button auto
                                    shadow
                                    color="primary"
                                    onPress={() => setDeletionModalOpen(false)}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                                </Button>
                                <Button auto
                                    shadow
                                    color="error"
                                    onPress={async () => {
                                        console.log(`deleting ${selectedPositionID}`);
                                        await axios.delete(`http://localhost:8000/positions/${selectedPositionID}`).then(response => {
                                            if (response.status === 401) {
                                                kickOut();
                                            } else if (response.status === 200) {
                                                updateCachedPositions(selectedPositionID, { ...response.data.data, deleted: true, active: false });
                                                setDeletionModalOpen(false);
                                            } else {
                                                console.log('response:', response.data);
                                            }
                                        });
                                    }}> Trash It!&nbsp;<i className="fa-solid fa-skull-crossbones"></i>
                                </Button>
                            </Row>
                            <Text size={12} em css={{ 'text-align': 'center' }}> Note: deleted positions can be recovered for 1 week </Text>
                        </Modal.Body>
                    </Modal>)
            }
        </>
    );



}

export default Positions;