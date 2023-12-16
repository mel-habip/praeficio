import axios from 'axios';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import { useContext, useState } from 'react';
import NavMenu from '../components/NavMenu';

import { Button, Card, Container, Input, Spacer } from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';


export default function TemporaryFilePage() {
    const { isLoggedIn } = useContext(IsLoggedInContext);

    const goTo = useNavigate();

    const [file, setFile] = useState();
    const [keyLength, setKeyLength] = useState(8);

    const [uploadResult, setUploadResult] = useState('');

    const [retrievalKeyEntered, setRetrievalKeyEntered] = useState('');

    const handleUpload = () => {
        const submission = new FormData();
        submission.append('file', file);
        submission.append('keyLength', keyLength);
        axios.post(`/temporary-files/${isLoggedIn ? 'logged' : 'anon'}`, submission)
            .catch(() => { })
            .then(res => {
                setFile();
                setUploadResult(res.data.retrieval_key);
            });
    }

    return <>
        <NavMenu />
        <Card isHoverable style={{ width: '50%', maxWidth: '400px', padding: '1rem' }} >
            <h3>Sending a new file?</h3>
            <h5>Upload your file below and obtain your key.</h5>
            <input onChange={e => {
                setFile(e.target.files.item(0));
            }} type="file" placeholder='File goes brrr...' />
            <Spacer y={1} />
            <Button disabled={(keyLength < 6 || keyLength > 32)} onClick={handleUpload} >Upload</Button>
            <Spacer y={1.5} />
            <Input
                rounded
                initialValue=""
                type="number"
                required
                bordered
                labelPlaceholder="Key Length"
                color={(keyLength < 6 || keyLength > 32) ? 'error' : "primary"}
                helperColor={(keyLength < 6 || keyLength > 32) ? 'error' : "primary"}
                helperText={(keyLength < 6 || keyLength > 32) ? 'Please enter a value between 6 and 32' : ''}
                status={"default"}
                value={keyLength.toString()}
                onChange={e => {
                    let val = parseInt(e.target.value);
                    console.log(typeof val);
                    setKeyLength(val);
                }} />
            {uploadResult && <>
                <h1>Your key: {uploadResult}</h1>
                <em>single-use, valid for 24 hours.</em>
            </>}
        </Card>
        <Spacer y={2} />
        <Card isHoverable style={{ width: '50%', maxWidth: '400px', padding: '1rem' }}>
            <h3>Have a file to retrieve?</h3>
            <h5>Enter your key below to retrieve your file.</h5>
            <Spacer y={1} />
            <Input
                rounded
                initialValue=""
                clearable
                type="text"
                required
                bordered
                labelPlaceholder="Retrieval"
                color={"primary"}
                status={"default"}
                value={retrievalKeyEntered}
                // helperText={errors.username}
                helperColor={"primary"}
                onChange={e => setRetrievalKeyEntered(e.target.value)} />
            <Spacer y={0.5} />
            <Button shadow onClick={() => goTo(`/temporary-files/${retrievalKeyEntered}`)} >Fetch!</Button>
        </Card>

    </>
}