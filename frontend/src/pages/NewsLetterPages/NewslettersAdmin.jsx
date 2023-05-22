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

const config = undefined && {
    // https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html#extended-toolbar-configuration-format
    toolbar: {
        items: [
            'exportPDF', 'exportWord', '|',
            'findAndReplace', 'selectAll', '|',
            'heading', '|',
            'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'removeFormat', '|',
            'bulletedList', 'numberedList', 'todoList', '|',
            'outdent', 'indent', '|',
            'undo', 'redo',
            '-',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
            'alignment', '|',
            'link', 'blockQuote', 'insertTable', 'mediaEmbed', '|',
            'specialCharacters', 'horizontalLine', '|',
            'textPartLanguage', '|',
            'sourceEditing'
        ],
        shouldNotGroupWhenFull: true
    },
    // Changing the language of the interface requires loading the language file using the <script> tag.
    // language: 'es',
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
    placeholder: 'Welcome to CKEditor 5!',
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
    fontFamily: {
        options: [
            'default',
            'Arial, Helvetica, sans-serif',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Lucida Sans Unicode, Lucida Grande, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Times New Roman, Times, serif',
            'Trebuchet MS, Helvetica, sans-serif',
            'Verdana, Geneva, sans-serif'
        ],
        supportAllValues: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
    fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
    },
    // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
    // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
            }
        ]
    },
    // Be careful with enabling previews
    // https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
    htmlEmbed: {
        showPreviews: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
    link: {
        decorators: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file'
                }
            }
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
    mention: {
        feeds: [
            {
                marker: '@',
                feed: [
                    '@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
                    '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
                    '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
                    '@sugar', '@sweet', '@topping', '@wafer'
                ],
                minimumCharacters: 1
            }
        ]
    },
    // The "super-build" contains more premium features that require additional configuration, disable them below.
    // Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
    removePlugins: [
        // These two are commercial, but you can try them out without registering to a trial.
        // 'ExportPdf',
        // 'ExportWord',
        'CKBox',
        'CKFinder',
        'EasyImage',
        // This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
        // Storing images as Base64 is usually a very bad idea.
        // Replace it on production website with other solutions:
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
        // 'Base64UploadAdapter',
        'RealTimeCollaborativeComments',
        'RealTimeCollaborativeTrackChanges',
        'RealTimeCollaborativeRevisionHistory',
        'PresenceList',
        'Comments',
        'TrackChanges',
        'TrackChangesData',
        'RevisionHistory',
        'Pagination',
        'WProofreader',
        // Careful, with the Mathtype plugin CKEditor will not load when loading this sample
        // from a local file system (file://) - load this site via HTTP server if you enable MathType.
        'MathType',
        // The following features are part of the Productivity Pack and require additional license.
        'SlashCommand',
        'Template',
        'DocumentOutline',
        'FormatPainter',
        'TableOfContents'
    ]
};

function AdminNewsletterCardWrap({ setNewsletterArticleList, ...card_details }) {

    function handleDelete() {
        // axios.delete(`${process.env.REACT_APP_API_LINK}/newsletters/${card_details.newsletter_id}`).then(response => {
        // if (response.status === 200) {
        setNewsletterArticleList(prev => prev.filter(post => post.newsletter_id !== card_details.newsletter_id))
        // } else {
        // console.log('deletion', response);
        // }
        // });
    }

    const [deletionModalOpen, setDeletionModalOpen] = useState(false);


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
                ><i className="fa-regular fa-pen-to-square" /></CustomButton>
                <CustomButton
                    onClick={() => setDeletionModalOpen(true)}
                ><i className="fa-regular fa-trash-can" /></CustomButton>
            </div>
            <DeletionModal endPoint={`newsletters/${card_details.newsletter_id}`} selfOpen={deletionModalOpen} setSelfOpen={setDeletionModalOpen} titleText={`this Newsletter?`} bodyText={`Title: \t\t${card_details.title} \nDescription: \t${card_details.description} \nWritten By: \t${card_details.written_by_username} \nWritten On: \t${timestampFormatter(card_details.created_on)} \nLast Updated: \t${timestampFormatter(card_details.updated_on) || 'null'}`} outerUpdater={handleDelete} />
        </div>
    );

}


export default function NewslettersAdmin() {
    document.title = "Newsletters | Admin";

    const [newsletterArticleList, setNewsletterArticleList] = useState(null);

    const [creationModalOpen, setCreationModalOpen] = useState(false);

    useEffect(() => { //main fetcher on load
        console.log(`fetching all NewsletterArticles`);
        axios.get(`${process.env.REACT_APP_API_LINK}/newsletters`).then(response => {
            setNewsletterArticleList(prevList => toUniqueArray([...(prevList || []), ...response.data.data], 'newsletter_id'));
        }).catch(e => { console.error(e); });
    }, []);


    if (!newsletterArticleList) { return (<LoadingPage />); }

    return (
        <>
            <NavMenu />
            <h1>Newsletters Admin Portal</h1>
            {
                process.env.REACT_APP_BUILD_ENV === 'prod' ? <>
                    <CustomButton to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
                    <h2>
                        <i className="fa-solid fa-user-tie" />
                        <i className="fa-solid fa-user-tie" />
                        <i className="fa-solid fa-user-tie" />
                    </h2>
                    <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
                </> : <>

                    <CustomButton style={{ position: 'absolute', right: '15px', top: '15px' }} to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
                    <CustomButton style={{ position: 'absolute', right: '15px', bottom: '15px' }} onClick={() => setCreationModalOpen(true)} > Post a new Newsletter <i className="fa-regular fa-square-plus" /></CustomButton>
                    <NewsletterCreationModal selfOpen={creationModalOpen} setSelfOpen={setCreationModalOpen} setNewsletterArticleList={setNewsletterArticleList} isEdit={false} />
                    <Grid.Container justify="center" gap={2}>
                        {newsletterArticleList.map(({ newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content, handled_externally }, index) =>
                            <Grid key={index + '-card'}>
                                <AdminNewsletterCardWrap  {...{ setNewsletterArticleList, newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count, content, index, handled_externally }} />
                            </Grid>
                        )}
                    </Grid.Container>
                </>
            }
        </>
    )
};



function NewsletterCreationModal({ selfOpen, setSelfOpen, isEdit = false, startingValue = {}, setNewsletterArticleList = () => { } }) {

    function handleEdit() {
        console.log('updating');
        axios.put(`${process.env.REACT_APP_API_LINK}/newsletters/${formData.newsletter_id}`).then(response => {
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
        axios.post(`${process.env.REACT_APP_API_LINK}/newsletters/`, formData).then(response => {
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
        setFormData(startingValue);
    }, []);

    const { setIsLoggedIn, user } = useContext(IsLoggedInContext);

    return (
        <Modal
            fullScreen
            open={selfOpen}
            onClose={() => setSelfOpen(false)}
            // css={{ 'background-color': '#0d0d0d' }} 
            closeButton
            blur
            aria-labelledby="modal-title"
        >
            <Modal.Header> <p>Let's post a new Newsletter! </p> </Modal.Header>
            <Modal.Body>
                <Spacer y={1} />
                <Input underlined clearable color="primary" labelPlaceholder='Title' onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                <Input css={{ mt: '15px' }} underlined clearable color="primary" labelPlaceholder='Description' onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                <Input css={{ mt: '15px' }} type="number" underlined clearable color="primary" labelPlaceholder='How many minutes to read?' onChange={e => setFormData(prev => ({ ...prev, read_length: parseFloat(e.target.value) }))} />

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
                <Checkbox isDisabled  onChange={send_email => setFormData(prev => ({ ...prev, send_email }))}>Send as email</Checkbox>
                <Checkbox onChange={pinned => setFormData(prev => ({ ...prev, pinned }))}>Pinned</Checkbox>
                <Checkbox onChange={handled_externally => setFormData(prev => ({ ...prev, handled_externally }))} >Use custom HTML</Checkbox>
            </Modal.Footer>

        </Modal >
    );
}
