import { useState, useEffect, useContext, lazy, Suspense } from 'react';
import axios from 'axios';

import IsLoggedInContext from '../../contexts/IsLoggedInContext';

import NavMenu from '../../components/NavMenu';
import DeletionModal from '../../components/DeletionModal';

import LoadingPage from '../LoadingPage';

import '../stylesheets/NewslettersAdmin.css';

import timestampFormatter from '../../utils/timestampFormatter';

import { CustomButton } from '../../fields/CustomButton';
import toUniqueArray from '../../utils/toUniqueArray';

import NewsLetterCard from '../../components/NewsLetterCard.jsx';

import { Checkbox, Modal, Grid, Input, Loading, Spacer, Textarea } from '@nextui-org/react';

import ErrorBoundary from '../../ErrorBoundary.jsx';

import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { CKEditor } from "@ckeditor/ckeditor5-react";

const now = new Date(); //initializing here to avoid updating over and over again

const config = undefined;

function AdminNewsletterCardWrap({ setNewsletterArticleList, ...card_details }) {

    function handleDelete() {
        // axios.delete(`/newsletters/${card_details.newsletter_id}`).then(response => {
        // if (response.status === 200) {
        setNewsletterArticleList(prev => prev.filter(post => post.newsletter_id !== card_details.newsletter_id))
        // } else {
        // console.log('deletion', response);
        // }
        // });
    }

    const [deletionModalOpen, setDeletionModalOpen] = useState(false);

    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    return (
        <div style={{
            paddingTop: '5px',
            paddingLeft: '15px',
            paddingRight: '15px',
            border: '1px solid white',
            borderRadius: '0.7rem',
            boxShadow: 'rgb(175 175 175) 3px 3px 16px 5px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
        }} >
            <NewsLetterCard {...{ ...card_details }} />
            <div style={{ flexBasis: '100%', margin: '15px', marginBottom: '0' }} >
                <CustomButton
                    disabled={!!card_details?.handled_externally}
                    onClick={() => setUpdateModalOpen(true)}
                ><i className="fa-regular fa-pen-to-square" /></CustomButton>
                <CustomButton
                    onClick={() => setDeletionModalOpen(true)}
                ><i className="fa-regular fa-trash-can" /></CustomButton>
            </div>
            <DeletionModal endPoint={`newsletters/${card_details.newsletter_id}`} selfOpen={deletionModalOpen} setSelfOpen={setDeletionModalOpen} titleText={`this Newsletter?`} bodyText={`Title: \t\t${card_details.title} \nDescription: \t${card_details.description} \nWritten By: \t${card_details.written_by_username} \nWritten On: \t${timestampFormatter(card_details.created_on)} \nLast Updated: \t${timestampFormatter(card_details.updated_on) || 'null'}`} outerUpdater={handleDelete} />
            <NewsletterCreationModal selfOpen={updateModalOpen} setSelfOpen={setUpdateModalOpen} isEdit={true} startingValue={card_details} setNewsletterArticleList={setNewsletterArticleList} />
        </div>
    );

}


export default function NewslettersAdmin() {
    document.title = "Newsletters | Admin";

    const [newsletterArticleList, setNewsletterArticleList] = useState(null);

    const [creationModalOpen, setCreationModalOpen] = useState(false);

    useEffect(() => { //main fetcher on load
        console.log(`fetching all NewsletterArticles`);
        axios.get(`/newsletters`).then(response => {
            setNewsletterArticleList(prevList => toUniqueArray([...(prevList || []), ...response.data.data], 'newsletter_id'));
        }).catch(e => { console.error(e); });
    }, []);


    if (!newsletterArticleList) { return (<LoadingPage />); }

    return (
        <>
            <NavMenu />
            <h1>Newsletters Admin Portal</h1>
            <CustomButton style={{ position: 'absolute', right: '15px', top: '15px' }} to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
            <CustomButton style={{ position: 'absolute', right: '15px', bottom: '15px' }} onClick={() => setCreationModalOpen(true)} > Post a new Newsletter <i className="fa-regular fa-square-plus" /></CustomButton>
            <NewsletterCreationModal selfOpen={creationModalOpen} setSelfOpen={setCreationModalOpen} setNewsletterArticleList={setNewsletterArticleList} isEdit={false} />
            <Grid.Container justify="center" gap={2}>
                {newsletterArticleList.map(({ newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content, handled_externally, pinned }, index) =>
                    <Grid key={index + '-card'}>
                        <AdminNewsletterCardWrap  {...{ setNewsletterArticleList, newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content, index, handled_externally, pinned }} />
                    </Grid>
                )}
            </Grid.Container>
        </>
    )
};



function NewsletterCreationModal({ selfOpen, setSelfOpen, isEdit = false, startingValue = {}, setNewsletterArticleList = () => { } }) {

    function handleEdit() {
        console.log('updating');
        axios.put(`/newsletters/${formData.newsletter_id}`, formData).then(response => {
            if (response.status === 200) {
                setNewsletterArticleList(prev => prev.map(post => post.newsletter_id === startingValue.newsletter_id ? formData : post));
                setSelfOpen(false);
            } else {
                console.log('edit request', response);
            }
        });
    }

    function handleCreate() {
        console.log('creating');
        axios.post(`/newsletters/`, formData).then(response => {
            if (response.status === 201) {
                setNewsletterArticleList(prev => prev.concat({ ...response.data }));
                setSelfOpen(false);
            } else {
                console.log('creation', response);
            }
        });
    }

    const [formData, setFormData] = useState({ content: '' });

    useEffect(() => {
        console.log('startingValue', startingValue)
        setFormData(startingValue);
    }, []);

    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    return (
        <Modal
            fullScreen
            open={selfOpen}
            onClose={() => setSelfOpen(false)}
            closeButton
            blur
            aria-labelledby="modal-title"
        >
            <Modal.Header> <p>Let's post a new Newsletter! </p> </Modal.Header>
            <Modal.Body>
                <Spacer y={1} />
                <Input value={formData.title} underlined clearable color="primary" labelPlaceholder='Title' onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                <Input value={formData.description} css={{ mt: '15px' }} underlined clearable color="primary" labelPlaceholder='Description' onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                <Input value={formData.read_length} css={{ mt: '15px' }} type="number" underlined clearable color="primary" labelPlaceholder='How many minutes to read?' onChange={e => setFormData(prev => ({ ...prev, read_length: parseFloat(e.target.value) }))} />

                {formData.handled_externally ? <>
                    <Textarea
                        css={{ mt: '15px' }}
                        value={formData.content}
                        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        bordered
                        minRows={10}
                        maxRows={20}
                        color="default"
                        labelPlaceholder='Type here' ></Textarea>
                    <em>Note: Avoid using the line break characters (\n \r \f \b) as they will be removed when saved. </em>
                </> :
                    <div className="editor">
                        <ErrorBoundary fallback={<h1>ERROR!</h1>} >
                            {/* <Suspense fallback={<Loading />} > */}
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.content || ''}
                                config={config}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setFormData(prev => ({ ...prev, content: data }));
                                }}
                            />
                            {/* </Suspense> */}
                        </ErrorBoundary>
                    </div>
                }
                <div>
                    <h1>Result</h1>
                    <NewsLetterCard
                        title={formData.title}
                        content={formData.content || ''}
                        created_on={now}
                        description={formData.description}
                        likes_count={0}
                        read_length={formData.read_length}
                        newsletter_id={999999}
                        index={0}
                        written_by_username={user?.username}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <CustomButton
                    onClick={() => {
                        if (isEdit) {
                            handleEdit()
                        } else {
                            handleCreate()
                        }
                    }
                    }
                >Save & Publish</CustomButton>
                <Checkbox isDisabled onChange={send_email => setFormData(prev => ({ ...prev, send_email }))}>Send as email</Checkbox>
                <Checkbox isSelected={!!formData.pinned} onChange={pinned => setFormData(prev => ({ ...prev, pinned }))}>Pinned</Checkbox>
                <Checkbox isSelected={!!formData.handled_externally} onChange={handled_externally => setFormData(prev => ({ ...prev, handled_externally }))} >Use custom HTML</Checkbox>
            </Modal.Footer>

        </Modal >
    );
}
