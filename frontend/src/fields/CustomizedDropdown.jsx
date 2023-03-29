import React, { useState, useEffect } from 'react';

import { Dropdown, Button, Badge } from '@nextui-org/react';
import { CustomButton } from './CustomButton';


export default function CustomizedDropdown({ optionsList = [], outerUpdater = () => { }, default_value, title = '', selectionMode = 'single', disabled = false, trigger, disallowEmptySelection = true }) {

    const optionsMap = optionsList.reduce((acc, cur) => ({ ...acc, [cur.key]: cur }), {});

    const [innerSelected, setInnerSelected] = useState(default_value ? new Set([default_value]) : new Set());
    const [isMounted, setIsMounted] = useState(0);

    const selectedValue = React.useMemo(() => {

        if (selectionMode === 'multi') {
            if (!isMounted) setIsMounted(1); // i don't think it really applies here
            let a = Array.from(innerSelected).filter(Boolean);
            outerUpdater(a);
            return a;
        }

        if (isMounted > 1) {
            let a = Array.from(innerSelected).join('');
            outerUpdater(a);
            return a;
        } else {
            setIsMounted(isMounted + 1);
            let a = Array.from(innerSelected).join('');
            return a;
        }
    }, [innerSelected]);

    //since the items are passed as a prop, it doesn't re-render the child when the parent's State is updated, this should do that
    useEffect(() => {
        if (default_value) {
            setInnerSelected(new Set([default_value]));
            if (isMounted>1) outerUpdater(selectedValue);
        }
    }, [default_value]);


    return (
        <Dropdown isDisabled={!!disabled}>
            {!trigger ?
                <Dropdown.Button
                    isDisabled={!!disabled}
                    shadow
                    css={optionsMap[selectedValue]?.color === 'default' ? { 'background': 'grey', 'box-shadow': '0 4px 14px grey' } : {}} //this provides the "default" option, NextUI doesn't have gray buttons
                    color={(optionsMap[selectedValue]?.disabled || (Array.isArray(selectedValue) && selectedValue.length && selectionMode === 'single')) ? 'error' : optionsMap[selectedValue]?.color || 'default'}
                >{(Array.isArray(selectedValue) && selectedValue.length > 1) ? `${selectedValue.length} selected` : optionsMap[selectedValue]?.name || title}
                </Dropdown.Button> : <Dropdown.Trigger>
                    {trigger}
                </Dropdown.Trigger>
            }

            <Dropdown.Menu
                aria-label="Category Dropdown"
                selectionMode={selectionMode}
                selectedKeys={innerSelected}
                disallowEmptySelection={disallowEmptySelection}
                onSelectionChange={(e) => { if (isMounted) setInnerSelected(e); }}
                disabledKeys={optionsList.filter(a => a.disabled).map(a => a.key)}
                items={optionsList}
            >
                {({ key, name, color, disabled, description, withDivider }) => (
                    <Dropdown.Item
                        key={key}
                        color={disabled ? 'default' : color}
                        withDivider={withDivider}
                        description={description}
                    >
                        {name}
                    </Dropdown.Item>
                )}
            </Dropdown.Menu>
        </Dropdown >
    );
}