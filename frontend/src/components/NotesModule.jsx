import React, { useState, useContext, useEffect } from 'react';

import { Button, Modal, Spacer, Text, Input, Checkbox, Tooltip, Row, Grid, Dropdown, Card } from '@nextui-org/react';
import { CustomButton } from '../fields/CustomButton';

import removeIndex from '../utils/removeIndex';
import deepEqual from '../utils/deepEqual';


export default function NotesModule({ field_text = '', title_text = '', notes_list = [], update_func = () => { }, deletable = false, user = {} }) {
    const textLimit = 100;

    const [newNoteText, setNewNoteText] = useState('');
    const [notesList, setNotesList] = useState([]);
    useEffect(() => setNotesList(notes_list), []);

    const differencesMade = React.useMemo(() => !deepEqual(notesList, notes_list), [notesList]);

    return (<>

        <Text h3 css={{ 'margin-top': '10px', 'border-bottom': '1px solid var(--text-primary)' }}>{title_text}</Text>
        {notesList.map((catName, index) =>
            <Row key={index + '-row'} justify="space-between" css={{ 'white-space': 'pre-wrap', 'padding-left': '1rem', 'padding-right': '1rem', 'min-width': '65%' }} >
                <Text><i className="fa-regular fa-hand-point-right"></i>  &nbsp;&nbsp;&nbsp; {catName}</Text>
                <Spacer x={0.2}/>
                {deletable ? <CustomButton
                    buttonStyle="btn--transparent"
                    onClick={() => { setNotesList(removeIndex(notesList, index)) }} >
                    <i className="fa-regular fa-trash-can"></i>
                </CustomButton> : ''}
            </Row>)}
        {notesList.length ? '' : <Text size={15} css={{ 'padding-left': '5rem' }}>No notes yet! Enter one below!</Text>}
        <Row css={{ 'margin-top': '15px' }}>
            <Input
                bordered
                shadow
                color={newNoteText.length > textLimit ? 'error' : "primary"}
                helperColor={newNoteText.length > textLimit ? 'error' : "default"}
                helperText={newNoteText.length > textLimit ? `\tToo long ${newNoteText.length}/${textLimit}` : `${newNoteText.length}/${textLimit}`}
                value={newNoteText} css={{ width: '100%' }} aria-label="new note input" labelPlaceholder={field_text} clearable onChange={(e) => setNewNoteText(e.target.value)} />
            <CustomButton
                buttonStyle="btn--transparent"
                aria-label="temporary save button"
                rounded
                shadow
                disabled={!newNoteText || newNoteText.length > textLimit}
                onClick={() => console.log('clicked') || setNotesList(notesList.concat(newNoteText)) || setNewNoteText('')} ><i className="fa-regular fa-hand-point-up"></i></CustomButton>
        </Row>
        <Spacer y={1} />
        <Row justify='space-evenly' >
            <Button
                auto
                disabled={!differencesMade}
                shadow 
                color="inverse"
                onPress={() => setNotesList(notes_list)}>{differencesMade} Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left"></i>
            </Button>
            <Button auto
                disabled={!differencesMade}
                aria-label="permanent save button"
                shadow
                color="success"
                onPress={(e)=> update_func(notesList)}> Save&nbsp;<i className="fa-solid fa-floppy-disk"></i>
            </Button>
        </Row>
        <Text size={11} em css={{ 'text-align': 'center' }}> Note: changes cannot be undone </Text>
        <Spacer y={0.5} ></Spacer>
    </>);

}