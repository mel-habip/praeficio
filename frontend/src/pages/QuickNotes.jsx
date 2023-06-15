import { useState } from 'react';

import { Button, Textarea } from '@nextui-org/react';

import NavMenu from '../components/NavMenu';

export default function QuickNotes() {

    const [numOfSections, setNumOfSections] = useState(() => 1);

    return (
        <>
            <NavMenu />

            {Array.from({ length: numOfSections }).map((x, i) => <OneQuestionOneAnswer key={i} numOfSections={numOfSections} setNumOfSections={setNumOfSections} iteration={i} />)}
        </>
    )
};

function OneQuestionOneAnswer({ numOfSections, setNumOfSections, iteration }) {
    const [noteValue, setNoteValue] = useState('');
    return (
        <div style={{ width: '85%', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'center' }} >
            {!!iteration && <Button onPress={() => { localStorage.removeItem(`praeficio-note-q${iteration}`); localStorage.removeItem(`praeficio-note-a${iteration}`); setNumOfSections(x => x - 1); }} auto shadow bordered color="error" css={{ margin: '15px', alignSelf: 'end' }} > &nbsp; <i className="fa-solid fa-trash-can" /> &nbsp; <i className="fa-solid fa-angles-down"/> &nbsp;</Button>}
            <Textarea
                labelPlaceholder={`Your question #${iteration+1}`}
                bordered
                width="90%"
                color='primary'
                initialValue={localStorage.getItem(`praeficio-note-q${iteration}`)}
                onChange={e => setNoteValue(e.target.value) || localStorage.setItem(`praeficio-note-q${iteration}`, e.target.value)}
                minRows={1} maxRows={1} />
            <br />
            <br />
            <Textarea
                labelPlaceholder='Your Notes'
                bordered
                width="90%"
                helperText='values you enter are only saved on your local device'
                color='primary'
                helperColor='primary'
                initialValue={localStorage.getItem(`praeficio-note-a${iteration}`)}
                onChange={e => setNoteValue(e.target.value) || localStorage.setItem(`praeficio-note-a${iteration}`, e.target.value)}
                minRows={15} />
            {numOfSections-1 === iteration && <Button onPress={() => setNumOfSections(x => x + 1)} auto shadow bordered css={{ margin: '15px', alignSelf: 'end' }} > &nbsp; <i className="fa-regular fa-square-plus" /> &nbsp; </Button>}
            
        </div>
    )
}