import React from 'react';
import './CustomButton.css';
import { Link } from 'react-router-dom';

import { Tooltip } from '@nextui-org/react';

const STYLES = ['btn--primary', 'btn--outline', 'btn--transparent', 'btn--secondary'];

const SIZES = ['btn--medium', 'btn--large', 'btn--small'];

export const CustomButton = ({
    children,
    type = 'button',
    onClick,
    buttonStyle,
    buttonSize,
    style = {},
    to,
    disabled = false,
    rounded = false,
    shadow = false,
    tooltip = '',
    tooltip_placement = 'left'
}) => {
    const checkButtonStyle = STYLES.includes(buttonStyle)
        ? buttonStyle
        : STYLES[0];

    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    const btnClassList = ['btn', checkButtonStyle, checkButtonSize, disabled ? 'disabled' : false, rounded ? 'rounded' : false, shadow ? 'shadow' : false,].filter(Boolean).join(' ');

    let Inner = () => (
        <button
            className={btnClassList}
            onClick={onClick}
            onDoubleClick={onClick}
            type={type}
            style={style}
        >
            {children}
        </button>
    );

    let Inner2 = () => !!to ? (<Link to={disabled ? null : to} className='btn-mobile'> <Inner /> </Link>) : <Inner />

    if (tooltip) {
        return (
            <Tooltip
                enterDelay={500}
                content={tooltip}
                placement={tooltip_placement}
                css={{zIndex:8000}}
            >
                <Inner2 />
            </Tooltip>
        );
    } else {
        return (
            <Inner2 />
        );
    }
};