import NavMenu from '../../components/NavMenu';
import { useState } from 'react';
import { Modal, Text, Button } from '@nextui-org/react';
import axios from 'axios';

export default function TiddlesPage() {
    document.title = `Praeficio | Mr. Tiddles`;

    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    return (
        <>
            <NavMenu />
            <h1>Hi! I'm Tiddles 👋👋 </h1>
            <h3>This page is still being built ...&nbsp;<i className="fa-solid fa-cat"></i> </h3>

            <h3>This will soon be a gallery page with lots of photos & videos</h3>
            <Button onPress={() => setUploadModalOpen(true)} >Upload</Button>
            <Button onPress={() => axios.get(`${process.env.REACT_APP_API_LINK}/tiddles/random`).then(res => console.log(res))} > Fetch a Random photo</Button>
            <UploadModal setSelfOpen={setUploadModalOpen} selfOpen={uploadModalOpen} />
        </>
    )
};


function UploadModal({ setSelfOpen, selfOpen }) {
    const [file, setFile] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    const submit = async event => {
        event.preventDefault()

        const formData = new FormData();
        formData.append("image", file);
        formData.append("description", description);
        formData.append("tags", tags);
        await axios.post(`${process.env.REACT_APP_API_LINK}/tiddles/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => setSelfOpen(false))
    }

    return (
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={selfOpen}
            onClose={() => setSelfOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please enter the information below </Text> </Modal.Header>
            <Modal.Body>
                <form onSubmit={submit} >
                    <input onChange={e => setFile(e.target.files[0])} type="file" accept="image/*"></input>
                    <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder='Description'></input>
                    <Button
                        disabled={!file || !description}
                        shadow
                        auto
                        type="submit"> Add Media &nbsp;<i className="fa-regular fa-square-plus"></i> </Button>
                </form>
            </Modal.Body>
        </Modal>
    )
}
