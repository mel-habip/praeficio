import NavMenu from '../../components/NavMenu';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Modal, Text, Button } from '@nextui-org/react';

import CustomButton from '../../fields/CustomButton.jsx';
import axios from 'axios';
const ErrorModule = lazy(() => import('../../components/ErrorModule'));

export default function TiddlesPage() {
    document.title = `Praeficio | Mr. Tiddles`;

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [imageDetails, setImageDetails] = useState(null);

    const fetchRandom = () => axios.get(`${process.env.REACT_APP_API_LINK}/tiddles/random`).then(res => setImageDetails(res.data));

    useEffect(() => {
        fetchRandom();
    }, []);

    return (
        <>
            <NavMenu />
            <h1>Hi! I'm Tiddles 👋👋 </h1>
            <h3>This page is still being built ...&nbsp;<i className="fa-solid fa-cat"></i> </h3>
            {/* <pre>{JSON.stringify(imageDetails || {}, null, 1)}</pre> */}
            <h3>This will soon be a gallery page with lots of photos & videos</h3>
            {imageDetails && <img src={imageDetails.url} style={{ borderRadius: '1rem', filter: `drop-shadow(0 -10px 4.5rem blue)`, width: '85%', minWidth: '50%', maxWidth: '700px' }} />}
            <h3>Enjoy a random photo of me on this page in the meantime!</h3>

            <CustomButton style={{ position: 'absolute', top: '10%', right: '5%' }} tooltip='Upload' onClick={() => setUploadModalOpen(true)} ><i className="fa-solid fa-cloud-arrow-up" /></CustomButton>

            <Button onPress={fetchRandom} > Fetch another random photo</Button>
            <UploadModal setSelfOpen={setUploadModalOpen} selfOpen={uploadModalOpen} />
        </>
    )
};


function UploadModal({ setSelfOpen, selfOpen }) {
    const [file, setFile] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [errors, setErrors] = useState('');

    const submit = async event => {
        event.preventDefault()

        const formData = new FormData();
        formData.append("image", file);
        formData.append("file_name", file?.name);
        formData.append("description", description);
        formData.append("tags", tags);
        await axios.post(`${process.env.REACT_APP_API_LINK}/tiddles/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => setSelfOpen(false)).catch(e => console.log(e) || setErrors(e?.response?.data?.message || e?.status || e?.response?.data || e?.data))
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
                <ErrorModule errorMessage={errors} />
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
