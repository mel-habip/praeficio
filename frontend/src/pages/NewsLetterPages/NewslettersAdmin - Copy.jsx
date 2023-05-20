import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import './stylesheets/NewslettersAdmin.css';

import { CustomButton } from '../fields/CustomButton';

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { Card } from '@nextui-org/react';







export default function NewslettersAdmin() {
    document.title = "Newsletters | Admin";

    // const [changed, setChanged] = useState(true);

    // // The effect where we show an exit prompt, but only if the formState is NOT
    // // unchanged. When the form is being saved, or is already modified by the user,
    // // sudden page exit could be a destructive action. Our goal is to prevent that.
    // useEffect(() => {
    //     // the handler for actually showing the prompt
    //     // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    //     const handler = (event) => {
    //         alert('hello?');
    //         event.preventDefault();
    //         event.returnValue = "";
    //     };

    //     // if the form is NOT unchanged, then set the onbeforeunload
    //     if (changed) {
    //         window.addEventListener("beforeunload", handler);
    //         // clean it up, if the dirty state changes
    //         return () => {
    //             window.removeEventListener("beforeunload", handler);
    //         };
    //     }
    //     // since this is not dirty, don't do anything
    //     return () => { };
    // }, [changed]);

    document.querySelector("#rdw-wrapper-7079 > div.rdw-editor-toolbar > div.rdw-fontfamily-wrapper > div > ul")


    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const htmlState = useMemo(() => {
        const rawContentState = convertToRaw(editorState.getCurrentContent());

        const markup = draftToHtml(
            rawContentState
        );
        // console.log(markup);
        return markup;

    }, [editorState]);

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
                    <div>
                        <h1>React Editors</h1>
                        <h2>Start editing to see some magic happen!</h2>
                        <div style={{ border: "1px solid var(--text-primary)", padding: '2px', minHeight: '400px' }}>
                            <Editor
                                editorState={editorState}
                                onEditorStateChange={setEditorState}
                                toolbarClassName='editor-toolbar-classname'
                                editorClassName='editor-self-classname'
                                wrapperClassName='editor-wrapper-classname'
                            />
                        </div>
                    </div>
                    <CustomButton >Preview</CustomButton>
                    <CustomButton >Save & Publish</CustomButton>
                    <CustomButton to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
                    <div>
                        <h1>Result</h1>
                        <Card style={{ boxShadow: '3px 8px 16px 9px #28CDFF', padding: '15px' }} >
                            <div dangerouslySetInnerHTML={{ __html: htmlState }} />
                        </Card>
                    </div>
                </>
            }
        </>
    )
};
