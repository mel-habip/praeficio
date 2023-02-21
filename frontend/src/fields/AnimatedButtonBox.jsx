import React, {useState} from 'react';

export default function AnimatedButtonBox({title, onClick, subtitle, button_text}) {
    return (
        <div className="AnimatedButtonBox">
            {(title)? (<h1>{title}</h1>): ''}
            <button className="Button" onClick={onClick}>{button_text}</button>
            {(subtitle) ? (<p style={{color:'grey', fontSize:'12px', fontStyle:'italic'}}>{subtitle}</p>) : ''}
        </div>
    )
}