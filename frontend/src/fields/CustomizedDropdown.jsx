import React, { useState, useEffect } from 'react';

import { Dropdown } from '@nextui-org/react';


export default function CustomizedDropdown({optionsList = [], outerUpdater = () => { }, default_value = '', title = '', selectionMode = 'single', disabled = false}) {

    const optionsMap = optionsList.reduce((acc, cur) => ({ ...acc, [cur.key]: cur }), {});

    const [innerSelected, setInnerSelected] = useState(new Set([default_value]));

    //since the items are passed as a prop, it doesn't re-render the child when the parent's State is updated, this should do that
    useEffect(() => {
        setInnerSelected(new Set([default_value]));
    }, [default_value]);

    const selectedValue = React.useMemo(() => {
        let a = Array.from(innerSelected).join('');
        outerUpdater(a);
        return a;
    }, [innerSelected]);

    return (
        <Dropdown isDisabled={!!disabled}>
            <Dropdown.Button
                isDisabled={!!disabled}
                shadow
                css={optionsMap[selectedValue]?.color === 'default' ? { 'background': 'grey', 'box-shadow': '0 4px 14px grey' } : {}} //this provides the "default" option, NextUI doesn't have gray buttons
                color={optionsMap[selectedValue]?.color || 'default'}
            > {optionsMap[selectedValue]?.name || title}
            </Dropdown.Button>
            <Dropdown.Menu
                aria-label="Category Dropdown"
                selectionMode={selectionMode}
                selectedKeys={innerSelected}
                disallowEmptySelection
                onSelectionChange={(e) => setInnerSelected(e)}
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