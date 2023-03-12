import React, { useState } from 'react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

import NavMenu from '../components/NavMenu';

function Alerts() {

    const [isOpen, setIsOpen] = React.useState(false);
    const [date, setDate] = React.useState('');

    const frmt = (date) => {
        console.log(date);
        if (!date) {
            setIsOpen(false); //provides the clearing function
            return '';
        }
        let yyyy = date.getFullYear();
        let mm = date.getMonth() + 1;
        if (mm < 10) mm = `0` + mm;
        let dd = date.getDate();
        return `${yyyy}-${mm}-${dd}`
    }


    return (
        <>
            <NavMenu first_name="John"></NavMenu>
            <h1>ALERTS PAGE HERE</h1>
            <h2>
            <i className="fa-regular fa-bell"></i>
            <i className="fa-regular fa-bell"></i>
            <i className="fa-regular fa-bell"></i>
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
            <div>
                <button
                    onClick={() => {
                        setIsOpen(true)
                    }}
                >
                    Open
                </button>
                <DatePicker
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onChange={(val) => setDate(frmt(val)) || console.log(date) || setIsOpen(false)}
                    closeText='close'
                    clearText='garbageicon'
                    
                    defaultValue={new Date(2022, 8, 8)}
                    minDate={new Date(2022, 10, 10)}
                    maxDate={new Date(2023, 0, 10)}
                    headerFormat='DD, MM dd'
                />
            </div>

        </>
    )
}

export default Alerts;
