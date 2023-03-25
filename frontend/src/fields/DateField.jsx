import React, { useState, useEffect } from 'react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

import { Button, Modal, Spacer, Text, Input, Row } from '@nextui-org/react';

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const frmt = (date) => {
    if (!date) {
        return '';
    }
    if (typeof date === 'string') date = new Date(date);
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    if (mm < 10) mm = `0` + mm;
    let dd = date.getDate();
    if (dd < 10) dd = `0` + dd;
    return `${yyyy}-${mm}-${dd}`
}

export default function DateField({ title = '', selectedDate, setSelectedDate }) {


    const [pickerOpen, setPickerOpen] = useState(false);
    const [innerSelected, setInnerSelected] = useState('');
    const [errorText, setErrorText] = useState('');

    // useEffect(() => {
    //     if (selectedDate !== innerSelected) {
    //         setSelectedDate(innerSelected);
    //     }
    //     console.log('here1', innerSelected);
    // }, [innerSelected]);

    return (<>
        <Input
            rounded
            type="text"
            clearable
            bordered
            labelPlaceholder={title}
            color={errorText ? "error" : "primary"}
            status={errorText ? "error" : "default"}
            helperText={errorText}
            helperColor={errorText ? "error" : "primary"}
            onClick={() => setPickerOpen(true)}
            onClearClick={() => setInnerSelected('')}
        />
        <DatePicker
            isOpen={pickerOpen}
            title={title}
            onClose={(val) => setInnerSelected(frmt(val)) || setPickerOpen(false)}
            onChange={(val) => setInnerSelected(frmt(val)) || setPickerOpen(false)}
            closeText={<i className="fa-regular fa-circle-check"></i>}
            clearText={innerSelected ? <i className="fa-regular fa-trash-can" onClick={(e) => { console.log('clicked', e); setInnerSelected(''); }}></i> : ''}
            colorScheme="#0F52BA"
            defaultValue={new Date()}
            minDate={new Date(2000, 10, 10)}
            maxDate={new Date().addDays(1)}
            headerFormat='DD, MM dd' />
        <Spacer y={0.5} />
    </>);
}