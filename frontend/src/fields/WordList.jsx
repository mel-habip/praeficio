import React, { useState } from 'react';

import './WordList.css';

/**
 * @param {function} onListChange 
 */
export default function WordListField({ style = {}, onListChange = (e) => console.log('got: ', e), placeholder = 'Add a word', uniqueOnly = true }) {
    const [inputValue, setInputValue] = useState('');
    const [wordList, setWordList] = useState([]);


    function handleKeyDown(event) {
        const newItem = inputValue.trim();
        if (!newItem) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.shiftKey || event.ctrlKey || event.metaKey) {
                // Add item to the beginning of the list
                setWordList(prev => {
                    const after = uniqueOnly ? Array.from(new Set([newItem, ...prev])) : [newItem, ...prev];
                    onListChange(after);
                    return after;
                });
            } else {
                // Add item to the end of the list
                setWordList(prev => {
                    const after = uniqueOnly ? Array.from(new Set([...prev, newItem])) : [...prev, newItem];
                    onListChange(after);
                    return after;
                });
            }
            setInputValue("");
        }
    }

    const handleDeleteWord = (wordToDelete) => {
        setWordList(wordList.filter((word) => word !== wordToDelete));
        onListChange(wordList.filter((word) => word !== wordToDelete));
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleBlur = () => {
        if (inputValue.trim() !== '') {
            console.log('GOT HERE');
            setWordList([...wordList, inputValue.trim()]);
            setInputValue('');
            onListChange([...wordList, inputValue.trim()]);
        }
    };

    return (
        <div className="word-list-container" style={style}>
            {wordList.map((word) => (
                <div className="word-list-bubble" key={word}>
                    {word}
                    <button
                        type="button"
                        className="word-list-bubble-delete-button"
                        onClick={() => handleDeleteWord(word)}

                    >
                        X
                    </button>
                </div>
            ))}
            <input
                type="text"
                className="word-list-input"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                // onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}