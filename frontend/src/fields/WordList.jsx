import React, { useState } from 'react';

import './WordList.css';

export default function WordListField({ onListChange = (e) => console.log('got: ', e) }) {
    const [inputValue, setInputValue] = useState('');
    const [wordList, setWordList] = useState([]);


    function handleKeyDown(event) {
        const newItem = inputValue.trim();
        if (!newItem) return;
        if (event.key === 'Enter') {
            console.log(event)
            event.preventDefault();
            if (event.shiftKey || event.ctrlKey || event.metaKey) {
                // Add item to the beginning of the list
                setWordList([newItem, ...wordList]);
                setInputValue("");
                onListChange([newItem, ...wordList]);
            } else {
                // Add item to the end of the list
                setWordList([...wordList, newItem]);
                setInputValue("");
                onListChange([...wordList, newItem]);
            }
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
        <div>
            <div className="word-list-container">
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
                    placeholder="Add a word"
                    value={inputValue}
                    onChange={handleInputChange}
                    // onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
}