import React, { useState, useContext, useEffect } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import removeIndex from '../utils/removeIndex';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import WordListField from '../fields/WordList';

export default function FilterCreationModal() {
    const [topOperator, setTopOperator] = useState('AND');
    const [publicity, setPublicity] = useState('user_one_log');
    const [filterCreationModalOpen, setFilterCreationModalOpen] = useState(false);
    const [data, setData] = useState([{id: 0}]);

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


    return (<div style={{ maxWidth: '90%', minWidth: '50%', background: 'grey', padding: '1rem' }}>
        <Text size={18}>Let's create a new filter</Text>
        <CustomizedDropdown title='Publicity' optionsList={publicityOptions} outerUpdater={setPublicity} default_value="user_one_log" />
        {data.length > 1 && <CustomizedDropdown title='Operator' optionsList={operatorOptions} outerUpdater={setTopOperator} default_value="AND" />}
        {data.map(({ id }, top_parts_index) => (
            <div key={`${id}-${top_parts_index}`} style={{ border: '2px solid black', background: 'var(--nextui-colors-accents0)', borderRadius: '5%', display: 'flex', 'flexWrap': 'wrap' }}>
                <CustomButton rounded onClick={() => setData(removeIndex(data, top_parts_index))} >X</CustomButton>
                <SubForm nested_level={1} key={`${id}-${top_parts_index}-subform-repeat`} outerUpdater={(val_received) => {
                    setData((prevData) => prevData.map((entry) => entry.id === id ? val_received : entry));
                }} />
            </div>
        ))}
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <CustomButton onClick={() => setData([...data, { id: Date.now() }])}>+Part</CustomButton>
        <CustomButton onClick={() => console.log('data', data)}>Create</CustomButton>
    </div>);

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

            </Modal.Header>
            <Modal.Body css={{ overflowY: 'scroll' }} >

            </Modal.Body>
            <Modal.Footer >

            </Modal.Footer>

        </Modal>
    );
};



function SubForm({ outerUpdater = () => true, nested_level = 0, self_data = {} }) {
    const [subFormData, setSubFormData] = useState(self_data);

    const showCombination = React.useMemo(() => {
        return subFormData.field === "combination";
    }, [subFormData.field]);


    useEffect(() => {
        outerUpdater(subFormData);
        // self_data = subFormData;
    }, [subFormData]);

    //allows us to use 1 single State 
    const handleFieldChange = (prop) => {
        //add additional logic here

        if (prop === 'field') return (new_value) => { setSubFormData(subFormDataCleaner({ ...subFormData, showCombination, parts: [], field: new_value })); }

        if (prop === 'parts') return (new_value, position) => { setSubFormData(subFormDataCleaner({ ...subFormData, showCombination, parts: subFormData.parts.map((part, ix) => { console.log('part: ', part); if (ix === position) return new_value; return part; }) })); }

        return (new_value) => setSubFormData(subFormDataCleaner({ ...subFormData, [prop]: new_value }));
    };

    const subFormDataCleaner = (hash) => {
        if (hash.field !== "combination") {
            delete hash.showCombination;
            delete hash.parts;
        };

        if (hash.operator === 'in' && !Array.isArray(hash.value)) {
            hash.value = [hash.value];
        } else if (hash.operator !== 'in' && Array.isArray(hash.value)) {
            hash.value = hash.value[0]
        };

        return hash;
    }

    const topOperatorOptions = [
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
            key: 'combination',
            name: 'Combination',
            disabled: nested_level > 4
        }
    ];
    const operatorOptions = [
        {
            key: '<=',
            name: '<=',
            description: 'less than or equal',
            disabled: !['created_on', 'updated_on'].includes(subFormData.field),
        },
        {
            key: '>=',
            name: '>=',
            description: 'greater than or equal',
            disabled: !['created_on', 'updated_on'].includes(subFormData.field),
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
            disabled: ['created_on', 'updated_on'].includes(subFormData.field),
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

            <CustomizedDropdown mountDirectly optionsList={fieldOptions} title="Field" default_value={subFormData.field} outerUpdater={handleFieldChange('field')} />

            {!showCombination && <CustomizedDropdown mountDirectly optionsList={operatorOptions} outerUpdater={handleFieldChange('operator')} />}

            {subFormData.field === 'created_by' && <CustomizedDropdown mountDirectly selectionMode={subFormData.operator === 'in' ? 'multi' : 'single'} optionsList={createdByOptions} outerUpdater={handleFieldChange('value')} />}

            {subFormData.field === 'status' && <CustomizedDropdown mountDirectly selectionMode={subFormData.operator === 'in' ? 'multi' : 'single'} optionsList={statusList} outerUpdater={handleFieldChange('value')} />}

            {!(subFormData.operator === 'in' || subFormData.field === 'status' || subFormData.field === 'created_by' || showCombination || !subFormData.field) && <Input hidden={subFormData.operator === 'in' || subFormData.field === 'status' || subFormData.field === 'created_by'} type={['created_on', 'updated_on'].includes(subFormData.field) ? 'date' : 'text'} fullWidth bordered css={{ mt: '30px', ml: '10px', mr: '10px', mb: '0px' }} labelPlaceholder='value' onChange={ev => handleFieldChange('value')(ev.target.value)}></Input>}


            {subFormData.operator === 'in' && subFormData.field !== 'status' && subFormData.field !== 'created_by' && <WordListField onListChange={v => setSubFormData({ ...subFormData, value: v })} />}


            {showCombination && (
                <>
                    {subFormData.parts.length > 1 && <CustomizedDropdown mountDirectly optionsList={topOperatorOptions} default_value={subFormData.operator || "AND"} outerUpdater={handleFieldChange('operator')} />}
                    <div className="nested-filter-subform" style={{ margin: "1rem", border: "3px solid gray", borderRadius: "5%", width: '100%', display: 'flex', 'flexWrap': 'wrap' }}>
                        {[...new Array(subFormData.parts.length).fill('').map((_, index) =>
                            <div style={{ display: 'flex', 'flexWrap': 'wrap', flexBasis: "100%" }}>
                                {/* TODO: we should make the removal based on index, not the last one */}
                                <CustomButton rounded onClick={() => { setSubFormData({ ...subFormData, parts: removeIndex(subFormData.parts, index) }) }} >X</CustomButton>
                                <SubForm nested_level={nested_level + 1} outerUpdater={v => handleFieldChange('parts')(v, index)} />
                            </div>
                        )]}
                        <CustomButton
                            // style={{ flexBasis: "100%" }}
                            rounded
                            onClick={() => setSubFormData({ ...subFormData, parts: subFormData.parts.concat({}) })} >+Part</CustomButton>

                    </div>
                </>

            )}
        </>
    );
}