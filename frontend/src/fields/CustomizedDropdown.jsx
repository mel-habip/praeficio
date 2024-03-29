import React, { useState, useEffect } from 'react';

import { Dropdown } from '@nextui-org/react';


/**
 * @param {Array<{key: string, name: string}>} optionsList the list of options where key is the value stored and name is the label shown in the UI
 */
export default function CustomizedDropdown({ optionsList = [], outerUpdater = () => { }, default_value, title = '', selectionMode = 'single', disabled = false, trigger, disallowEmptySelection = true, mountDirectly = false, showDisabledColor = false }) {

    const optionsMap = optionsList.reduce((acc, cur) => ({ ...acc, [cur.key]: cur }), {});

    const [innerSelected, setInnerSelected] = useState(default_value ? new Set([default_value]) : new Set());
    const [isMounted, setIsMounted] = useState(0);

    useEffect(() => {
        if (mountDirectly) setIsMounted(2);
    }, [mountDirectly]);

    const selectedValue = React.useMemo(() => {
        if (selectionMode === 'multi') {
            if (!isMounted) setIsMounted(1); // i don't think it really applies here
            let a = Array.from(innerSelected).filter(Boolean);
            outerUpdater(a);
            return a;
        }
        let [single_selected] = Array.from(innerSelected);

        if (isMounted > 1) {
            outerUpdater(single_selected);
        } else {
            setIsMounted(isMounted + 1);
        }
        return single_selected;
    }, [innerSelected]);

    //since the items are passed as a prop, it doesn't re-render the child when the parent's State is updated, this should do that
    useEffect(() => {
        if (default_value) {
            setInnerSelected(new Set([default_value]));
            if (isMounted > 1) outerUpdater(selectedValue);
        }
    }, [default_value]);


    return (
        <Dropdown isDisabled={!!disabled}>
            {!trigger ?
                <Dropdown.Button
                    isDisabled={!!disabled}
                    shadow
                    css={(optionsMap[selectedValue]?.color === 'default' || (disabled && showDisabledColor)) ? { 'background': 'grey', 'box-shadow': '0 4px 14px grey' } : {}} //this provides the "default" option, NextUI doesn't have gray buttons
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
                onSelectionChange={(e) => {if (isMounted) setInnerSelected(e); }}
                disabledKeys={optionsList.filter(a => a.disabled).map(a => a.key)}
                items={optionsList}
            >
                {({ key, name, color, disabled, description, withDivider }) => (
                    <Dropdown.Item
                        key={key}
                        color={disabled ? 'default' : color}
                        withDivider={withDivider}
                        description={description}
                        showFullDescription
                    >
                        {name}
                    </Dropdown.Item>
                )}
            </Dropdown.Menu>
        </Dropdown >
    );
}