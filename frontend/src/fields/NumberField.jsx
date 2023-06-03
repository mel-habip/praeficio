import { useState } from "react"

import './NumberField.css';


export default function NumberField({ min = null, max = null, default_value = 1, outer_updater = () => { } }) {

    const [innerValue, setInnerValue] = useState(default_value);

    function increment() {
        setInnerValue(prev => {
            if (max != null && prev >= max) return prev;

            outer_updater(prev + 1);
            return prev + 1
        });
    }

    function decrement() {
        setInnerValue(prev => {
            if (min !=null && prev <= min) return prev;
            outer_updater(prev - 1);
            return prev - 1
        });
    }

    return (
        <div className="number-field">
            <button className="minus" onClick={decrement}>-</button>
            <input type="text" value={innerValue} onChange={e => {

                let newValue = parseInt(e.target.value);

                if (max != null && newValue > max) {
                    newValue = max;
                } else if (min != null && newValue < min) {
                    newValue = min;
                } else if (isNaN(newValue)) {
                    return;
                }

                setInnerValue(newValue);
            }} />
            <button className="plus" onClick={increment} >+</button>
        </div>
    );
}