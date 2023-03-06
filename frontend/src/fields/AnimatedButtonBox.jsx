import React from 'react';
import { Button } from '@nextui-org/react';

export default function AnimatedButtonBox({ title, onPress, subtitle, button_text }) {
    return (
        <div className="AnimatedButtonBox">
            {(title) ? (<h1>{title}</h1>) : ''}
            <Button className="AnimatedButtonBox-subbutton" onPress={onPress} bordered auto shadow css={{color: '#fff'}}>
                {button_text}
            </Button>
            {(subtitle) ? (<p style={{ color: 'grey', fontSize: '12px', fontStyle: 'italic' }}>{subtitle}</p>) : ''}
        </div>
    )
}