import React, { useState, useContext, useEffect } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import axios from 'axios';

import NotesModule from '../components/NotesModule';
import MessengerSection from '../components/Messenger';
import NavMenu from '../components/NavMenu';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';

export default function TestZone() {

    const { user, accessToken, setUser } = useContext(IsLoggedInContext);

    const [modalOpen, setModalOpen] = useState(false);

    return (<>
        <NavMenu />
        <MessengerSection user={user} />
        {/* <Button onClick={() => setModalOpen(true)} >Open it</Button>
        <Modal scroll blur aria-labelledby="modal-title" open={modalOpen} closeButton onClose={() => setModalOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>

                <NotesModule user={user} title_text="Internal Notes" />
                <NotesModule user={user} title_text="External Notes" />

            </Modal.Body>
        </Modal> */}


    </>);
};