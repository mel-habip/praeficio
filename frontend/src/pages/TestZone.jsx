import React, { useState, useContext, useEffect } from 'react';

import NumberField from '../fields/NumberField';

export default function TestZone() {

    return <>
        <NumberField min={40} max={500} />
    </>
};



