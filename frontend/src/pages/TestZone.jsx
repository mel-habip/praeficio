import React, { useState, useContext, useEffect } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import WordListField from '../fields/WordList';
import axios from 'axios';

import NotesModule from '../components/NotesModule';
import MessengerSection from '../components/Messenger';
import NavMenu from '../components/NavMenu';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';

import FilterCreationModal from '../components/FilterCreationModal'

export default function TestZone() {

    return <>
        <FilterCreationModal></FilterCreationModal>
    </>


};



