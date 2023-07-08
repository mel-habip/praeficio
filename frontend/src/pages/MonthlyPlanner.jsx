import React, { useState } from 'react';

import NavMenu from '../components/NavMenu';
import { Link } from 'react-router-dom';

export default function MonthlyPlanner() {


    return (
        <>
            <NavMenu />
            <h1>Monthly Planner by H. Qazi</h1>
            <h2>
                <i className="fa-regular fa-calendar-days" />
                &nbsp;
                <i className="fa-regular fa-calendar-days" />
                &nbsp;
                <i className="fa-regular fa-calendar-days" />
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>

            <p style={{ position: 'absolute', bottom: '4%', right: '3%' }}>
                <em>Made with <i className="fa fa-heart fa-1x fa-beat" /> by&nbsp;
                    <Link to="/hira-qazi">Ms. Hira Qazi</Link>
                </em>
            </p>
        </>
    )
};
