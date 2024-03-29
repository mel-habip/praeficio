import React, { useState, useContext, useEffect } from 'react';

import CurrencyInputField from '../fields/CurrencyInputField.jsx'

import NumberField from '../fields/NumberField.jsx';

import { Checkbox, Input } from '@nextui-org/react';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfTheMonth = [];
for (let i = 1; i < 32; i++) {
    daysOfTheMonth.push(i.toString());
};

export default function TestZone() {

    let [value, setValue] = useState([]);

    const today = new Date().toLocaleDateString('en-CA');

    const [selectedDate, setSelectedDate] = useState(today);

    return <>
        <NumberField />

        <Input
            underlined
            initialValue={selectedDate}
            color="primary"
            label='Based On'
            type="date" onChange={e => setSelectedDate(e.target.value)} />


        <Checkbox.Group
            color="secondary"
            defaultValue={["buenos-aires"]}
            label="Select cities"
        >
            <Checkbox value="buenos-aires">Buenos Aires</Checkbox>
            <Checkbox value="sydney">Sydney</Checkbox>
            <Checkbox value="london">London</Checkbox>
            <Checkbox value="tokyo">Tokyo</Checkbox>
        </Checkbox.Group>
    </>
};



