import React from 'react';
import './CustomButton.css';
import { Link } from 'react-router-dom';

const STYLES = ['btn--primary', 'btn--outline', 'btn--transparent'];

const SIZES = ['btn--medium', 'btn--large'];

export const CustomButton = ({
    children,
    type,
    onClick,
    buttonStyle,
    buttonSize,
    style={},
    to,
    disabled = false,
    rounded = false,
    shadow = false,
}) => {
    const checkButtonStyle = STYLES.includes(buttonStyle)
        ? buttonStyle
        : STYLES[0];

    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    const btnClassList = ['btn', checkButtonStyle, checkButtonSize, disabled ? 'disabled' : false, rounded ? 'rounded' : false, shadow ? 'shadow' : false,].filter(Boolean).join(' ');

    if (to) {
        return (
            <Link to={to} className='btn-mobile'>
                <button
                    className={btnClassList}
                    onClick={onClick}
                    onDoubleClick={onClick}
                    type={type}
                    style={style}
                >
                    {children}
                </button>
            </Link>
        );
    } else {
        return (
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
    }
};