import React, { useState, useContext, useEffect } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import WordListField from '../fields/WordList';
import axios from 'axios';

import NotesModule from '../components/NotesModule';
import MessengerSection from '../components/Messenger';
import NavMenu from '../components/NavMenu';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';

export default function TestZone() {
    const [numParts, setNumParts] = useState(1);
    const [topOperator, setTopOperator] = useState('AND');
    const [publicity, setPublicity] = useState('user_one_log');
    const [filterCreationModalOpen, setFilterCreationModalOpen] = useState(true);

    const operatorOptions = [
        {
            key: 'AND',
            name: 'AND',
            description: 'all conditions must meet'
        },
        {
            key: 'OR',
            name: 'OR',
            description: 'one condition must meet'
        }
    ];

    const publicityOptions = [
        {
            key: 'user_one_log',
            name: 'This log only',
        },
        {
            key: 'all_users_one_log',
            name: 'All users on this Log'
        },
        {
            key: 'user_all_logs',
            name: 'All logs for me'
        },
        {
            key: 'global',
            name: 'Global',
            disabled: true
        }
    ];

    return (
        <Modal
            scroll
            blur
            aria-labelledby="modal-title"
            css={{ 'min-width': '550px', 'max-width': '750px' }}
            open={filterCreationModalOpen}
            closeButton onClose={() => setFilterCreationModalOpen(false)}
        >
            <Modal.Header>
                <Text size={18} >Let's create a new filter</Text>
            </Modal.Header>
            <Modal.Body>
                <CustomizedDropdown title='Publicity' optionsList={publicityOptions} outerUpdater={setPublicity} default_value="user_one_log" />
                <CustomizedDropdown title='Operator' optionsList={operatorOptions} outerUpdater={setTopOperator} default_value="AND" />
                {([...new Array(numParts)]).map((e, i) =>

                    <div key={i} style={{ border: '2px solid black', background: 'var(--nextui-colors-accents0)', borderRadius: '5%', display: 'flex', 'flexWrap': 'wrap' }}>
                        <CustomButton rounded onClick={() => setNumParts(numParts - 1)} >X</CustomButton>
                        <Subform key={i} />
                    </div>
                )}


            </Modal.Body>
            <Modal.Footer >
                <CustomButton
                    // style={{ width: '25%' }}
                    onClick={() => setNumParts(numParts + 1)} >+Part</CustomButton>
                <CustomButton onClick={() => console.log('data',)} >Submit</CustomButton>
            </Modal.Footer>

        </Modal>
    );
};



function Subform({ }) {

    const [subformData, setSubformData] = useState({
        field: 'updated_on',
        operator: 'is'
    });

    const fieldOptions = [
        {
            key: 'created_on',
            name: 'Created On'
        },
        {
            key: 'updated_on',
            name: 'Last Update'
        },
        {
            key: 'created_by',
            name: 'Created by'
        },
        {
            key: 'status',
            name: 'Status'
        },
        {
            key: 'title',
            name: 'Title'
        }
    ];
    const operatorOptions = [
        {
            key: '<=',
            name: '<=',
            description: 'less than or equal',
            disabled: !['created_on', 'updated_on'].includes(subformData.field),
        },
        {
            key: '>=',
            name: '>=',
            description: 'greater than or equal',
            disabled: !['created_on', 'updated_on'].includes(subformData.field),
        },
        {
            key: 'not',
            name: '!=',
            description: 'less than or equal'
        },
        {
            key: 'is',
            name: '==',
            description: 'less than or equal'
        },
        {
            key: 'in',
            name: 'in',
            description: 'array includes',
            disabled: ['created_on', 'updated_on'].includes(subformData.field),
        }
    ];


    const createdByOptions = [
        {
            key: 15,
            name: '#15 - Lord Mel',
            description: `Member since yesterday`
        }
    ];

    const statusList = [
        {
            key: 'submitted',
            name: 'Submitted',
            color: 'default'
        },
        {
            key: 'in_review',
            name: 'In Review',
            color: 'secondary'
        },
        {
            key: 'in_progress',
            name: 'In Progress',
            color: 'primary'
        },
        {
            key: 'awaiting_client',
            name: 'Awaiting Client Response',
            color: 'warning',
        },
        {
            key: 'completed',
            name: 'Completed',
            color: 'success',
        },
        {
            key: 'rejected',
            name: 'Rejected',
            color: 'error',
            withDivider: true
        }
    ];



    return (
        <>
            <CustomizedDropdown optionsList={fieldOptions} default_value={subformData.field} outerUpdater={v => setSubformData({ ...subformData, field: v })} />
            <CustomizedDropdown optionsList={operatorOptions} default_value={subformData.operator} outerUpdater={v => setSubformData({ ...subformData, operator: v, value: (typeof subformData.value === 'string' && v==='in') ? [subformData.value] : subformData.value })} />


            {subformData.field === 'created_by' && <CustomizedDropdown selectionMode={subformData.operator === 'in' ? 'multi' : 'single'} optionsList={createdByOptions} outerUpdater={v => setSubformData({ ...subformData, value: v })} />}

            {subformData.field === 'status' && <CustomizedDropdown selectionMode={subformData.operator === 'in' ? 'multi' : 'single'} optionsList={statusList} outerUpdater={v => setSubformData({ ...subformData, value: v })} />}

            {!(subformData.operator === 'in' || subformData.field === 'status' || subformData.field === 'created_by') && <Input hidden={subformData.operator === 'in' || subformData.field === 'status' || subformData.field === 'created_by'} type={['created_on', 'updated_on'].includes(subformData.field) ? 'date' : 'text'} fullWidth bordered css={{ mt: '30px', ml: '10px', mr: '10px', mb: '0px' }} labelPlaceholder='value' onChange={ev => setSubformData({ ...subformData, value: ev.target.value })}></Input>}


            {subformData.operator === 'in' && subformData.field !== 'status' && subformData.field !== 'created_by' && <WordListField onListChange={v => setSubformData({ ...subformData, value: v })} />}
            <pre>{JSON.stringify(subformData, null, 2)}</pre>
        </>
    );
}

// <pre>{JSON.stringify(data, null, 2)}</pre>


