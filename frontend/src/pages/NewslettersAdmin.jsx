import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

import NavMenu from '../components/NavMenu';

import './stylesheets/NewslettersAdmin.css';

import { CustomButton } from '../fields/CustomButton';

import { $getRoot, $getSelection } from 'lexical';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'editor-placeholder',
    paragraph: 'editor-paragraph',
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState) {
    editorState.read(() => {
        // Read the contents of the EditorState here.
        const root = $getRoot();
        const selection = $getSelection();

        console.log(root, selection);
    });
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Focus the editor when the effect fires!
        editor.focus();
    }, [editor]);

    return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
    console.error(error);
}

function Editor() {
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
    };

    return (
        <div className="editor-wrapper">
            <LexicalComposer initialConfig={initialConfig} >
                <PlainTextPlugin
                    contentEditable={<ContentEditable className='editor-screen' />}
                    placeholder={<div className="editor-placeholder" >Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <OnChangePlugin onChange={onChange} />
                <HistoryPlugin />
                <MyCustomAutoFocusPlugin />
            </LexicalComposer>
        </div>
    );
}


export default function NewslettersAdmin() {
    document.title = "Newsletters | Admin";

    return (
        <>
            <NavMenu />
            <h1>Newsletters Admin Portal {process.env.REACT_APP_BUILD_ENV} </h1>
            {
                process.env.REACT_APP_BUILD_ENV === 'beta' ? <>
                    <CustomButton to="/newsletters"> To public view <i className="fa-solid fa-angles-right" /></CustomButton>
                    <h2>
                        <i className="fa-solid fa-user-tie" />
                        <i className="fa-solid fa-user-tie" />
                        <i className="fa-solid fa-user-tie" />
                    </h2>
                    <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
                </> : <>
                    <Editor />
                </>
            }
        </>
    )
};
