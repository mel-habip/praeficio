import React, { useState, useEffect } from 'react';

import './Messenger.css';

import timestampFormatter from '../utils/timestampFormatter';

export default function MessengerSection({ messageList = [], user }) {

    if (!messageList.length) {
        messageList.push({
            id: 0,
            sent_by: 'system',
            sent_by_name: 'System',
            content: 'No messages here yet! Go ahead and send one :D '
        });
    }

    return (
        <div className="imessage" style={{ overflowY: 'auto', flexDirection: 'column-reverse' }} >
            {messageList?.map((item, index) => {
                const from = (item?.sent_by === user?.id) ? 'me' : 'them';
                const from_me = from === 'me';
                return (
                    <>
                        <div style={{ width: '100%', display: 'inline-flex', 'justify-content': from_me ? 'flex-end' : 'flex-start' }} key={index} className="message-group">
                            {from_me ? <p className={`from-${from} timestamp no-tail margin-b_none`} >{timestampFormatter(item.created_on)}</p> : ''}
                            <p
                                key={item.id}
                                className={`from-${from}`} >
                                {item.content}
                            </p>
                            {!from_me ? <p className={`from-${from} timestamp no-tail margin-b_none`} >{timestampFormatter(item.created_on)}</p> : ''}
                        </div>
                        {(item?.sent_by !== user?.id && messageList[index - 1]?.sent_by !== item.sent_by) ? <p className={`from-${from} no-tail margin-b_none from-tag`}> {`From: ${item.sent_by_name || '#' + item.sent_by}`}</p> : ''}
                    </>
                )
            })}
        </div>
    );
};