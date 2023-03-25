import React from 'react';

import './Messenger.css';

export default function MessengerSection({ messageList = [], user }) {

    let data = [
        {
            id: 1,
            sent_by: 3,
            sent_by_name: 'Johnnie',
            message: 'This is a test111'
        },
        {
            id: 2,
            sent_by: 6,
            message: 'This is a test2222'
        }, {
            id: 3,
            sent_by: 15,
            message: '3'
        },
        {
            id: 4,
            sent_by: 22,
            message: 'a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message a LOOOONGG looooong message '
        },
        {
            id: 5,
            sent_by: 33,
            message: 'okay another1'
        },
        {
            id: 6,
            sent_by: 33,
            message: 'okay another2'
        },
        {
            id: 8,
            sent_by: 33,
            message: 'okay another3'
        },
        {
            id: 9,
            sent_by: 38,
            message: 'okay another4'
        },
        {
            id: 10,
            sent_by: 33,
            message: 'okay anothe5r'
        },
        {
            id: 11,
            sent_by: 33,
            message: 'okay anoth6er'
        }
    ];

    return (
        <div className="imessage" >
            {data?.map((item, index) => {
                return (
                    <>
                        {(item?.sent_by !== user?.id && data[index - 1]?.sent_by !== item.sent_by) ? <p className={`from-${(item?.sent_by === user?.id) ? 'me' : 'them'} no-tail margin-b_none from-tag`}> {`From: ${item.sent_by_name || '#' + item.sent_by}`}</p> : ''}
                        <p key={item.id}
                            className={`from-${(item?.sent_by === user?.id) ? 'me' : 'them'}`} >
                            {item.message + user?.id}
                        </p>
                    </>
                )
            })}
        </div>
    );
};