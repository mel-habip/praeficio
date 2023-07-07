import React from 'react'
import PropTypes from 'prop-types'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

import './CurrencyInputField.css';

const defaultMaskOptions = {
    prefix: '$',
    suffix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: ',',
    requireDecimal: true,
    allowDecimal: true,
    decimalSymbol: '.',
    decimalLimit: 2, // how many digits allowed after the decimal
    integerLimit: 5, // limit length of integer numbers
    allowNegative: false,
    allowLeadingZeroes: false,
}

const cleaner = (str) => {
    if (!str || str.at(-3) === '.') return str;
    str = str.replace('_', 0).replace("$.", "$0.");

    if (str.at(-1) === '.') return str + '00';
    if (str.at(-2) === '.') return str + '0';
    return str + '.00';
};

const handleKeyPress = (e) => {
    console.log(e.keyCode);
    if (e.keyCode === 13 || e.keyCode === 9) {
        e.target.blur();
        //Write you validation logic here
    }
};

const CurrencyInputField = ({ maskOptions, ...inputProps }) => {
    const currencyMask = createNumberMask({
        ...defaultMaskOptions,
        ...maskOptions,
    })

    return <MaskedInput
        className="currency-input"
        mask={currencyMask}
        placeholder="type here"
        {...inputProps}
        onBlur={e => {
            e.target.value = cleaner(e.target.value);
            return e;
        }}
        onChange={(e) => { (inputProps.onChange || function () { })(cleaner(e.target.value)); console.log(e.target.value) }}
        onKeyDown={handleKeyPress}
    />
}

CurrencyInputField.defaultProps = {
    inputMode: 'numeric',
    maskOptions: {},
}

CurrencyInputField.propTypes = {
    inputmode: PropTypes.string,
    maskOptions: PropTypes.shape({
        prefix: PropTypes.string,
        suffix: PropTypes.string,
        includeThousandsSeparator: PropTypes.bool,
        thousandsSeparatorSymbol: PropTypes.string,
        allowDecimal: PropTypes.bool,
        decimalSymbol: PropTypes.string,
        decimalLimit: PropTypes.string,
        requireDecimal: PropTypes.bool,
        allowNegative: PropTypes.bool,
        allowLeadingZeroes: PropTypes.bool,
        integerLimit: PropTypes.number,
    }),
}

export default CurrencyInputField;
