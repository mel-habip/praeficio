import NavMenu from '../../components/NavMenu';
import { useState, useEffect, lazy, Suspense, useContext } from 'react';
import { Modal, Text, Button } from '@nextui-org/react';

import CustomButton from '../../fields/CustomButton.jsx';
import axios from 'axios';
import IsLoggedInContext from '../../contexts/IsLoggedInContext';
import LanguageContext from '../../contexts/LanguageContext';

const ErrorModule = lazy(() => import('../../components/ErrorModule'));
const WordListField = lazy(() => import('../../fields/WordList'));

const sentences = {
    title: {
        en: "Hi! I'm Tiddles",
        fr: "Salut! Je suis Monsieur Tiddles"
    },
    fetch_another: {
        en: "Fetch another random photo",
        fr: "Récupérer une autre photo aléatoire"
    },
    enjoy_random: {
        en: "In the meantime, enjoy a random photo of me on this page!",
        fr: "En attendant, amousez vous à regardent ces photos !"
    },
    in_construction: {
        en: "This page is still being built",
        fr: "Cette page est temporairement en construction"
    },
    future_state: {
        en: "This will soon be a gallery page with lots of photos & videos",
        fr: "Ce sera bientôt une page de galerie avec de nombreuses photos et vidéos"
    }
};

export default function TiddlesPage() {
    document.title = `Praeficio | Mr. Tiddles`;

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [imageDetails, setImageDetails] = useState(null);

    const fetchRandom = () => axios.get(`/tiddles/random`).then(res => setImageDetails(res.data));

    const currentUser = useContext(IsLoggedInContext);
    const { language } = useContext(LanguageContext);

    let userId = currentUser?.user?.id;
    console.log('userId', userId);
    console.log('userId2', currentUser?.userId);
    console.log('currentUser', currentUser);

    let mediaStyling = { borderRadius: '1rem', filter: `drop-shadow(0 -10px 4.5rem blue)`, width: '85%', minWidth: '50%', maxWidth: '700px' };

    useEffect(() => {
        fetchRandom();
    }, []);

    return (
        <>
            <NavMenu />
            <h1>{sentences.title[language]} 👋👋 </h1>
            <h3>{sentences.in_construction[language]} ...&nbsp;<i className="fa-solid fa-cat"></i> </h3>
            <h3>{sentences.future_state[language]}</h3>
            {(!!imageDetails && imageDetails.mime_type?.startsWith('video/')) ? <video src={imageDetails?.url} style={mediaStyling} autoPlay controls /> : (!!imageDetails && <img src={imageDetails?.url} style={mediaStyling} />)}
            <h3>{sentences.enjoy_random[language]}</h3>

            {[1, 13].includes(userId) &&
                <CustomButton style={{ position: 'absolute', top: '10%', right: '5%' }} tooltip='Upload' onClick={() => setUploadModalOpen(true)} ><i className="fa-solid fa-cloud-arrow-up" /></CustomButton>
            }

            <Button onPress={fetchRandom} > {sentences.fetch_another[language]} <i className="fa-solid fa-rotate" /> </Button>
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
        await axios.post(`/tiddles/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => setSelfOpen(false) || setErrors('')).catch(e => console.log(e) || setErrors(e?.response?.data?.message || e?.status || e?.response?.data || e?.data))
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
                <Suspense fallback="...">
                    <ErrorModule errorMessage={errors} />
                </Suspense>
                <form onSubmit={submit} >
                    <input onChange={e => setFile(e.target.files[0]) || setErrors('')} type="file" accept="image/*"></input>
                    <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder='Description' />
                    <Suspense fallback="...">
                        <WordListField uniqueOnly placeholder="add some tags" onListChange={v => setTags(v)} />
                    </Suspense>
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
