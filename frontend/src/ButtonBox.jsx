import React, {useState} from 'react';

export default function ButtonBox({title, onClick, subtitle, button_text}) {
    return (
        <div className="ButtonBox">
            {(title)? (<h1>{title}</h1>): ''}
            <button className="Button" onClick={onClick}>{button_text}</button>
            {(subtitle) ? (<p style={{color:'grey', fontSize:'12px', fontStyle:'italic'}}>{subtitle}</p>) : ''}
        </div>
    )
}