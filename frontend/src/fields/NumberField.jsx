import { useState } from "react"

import './NumberField.css';


export default function NumberField({ min = null, max = null, default_value = 1, outer_updater = () => { } }) {

    if (min != null && default_value <= min) {
        default_value = min;
    } else if (max != null && default_value >= max) {
        default_value = max;
    }

    const [innerValue, setInnerValue] = useState(() => {
        outer_updater(default_value); //so that the function runs on initialize
        return default_value; 
    });

    function increment() {
        setInnerValue(prev => {
            if (max != null && prev >= max) return prev;

            outer_updater(prev + 1);
            return prev + 1
        });
    }

    function decrement() {
        setInnerValue(prev => {
            if (min != null && prev <= min) return prev;
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
                outer_updater(newValue);
                setInnerValue(newValue);
            }} />
            <button className="plus" onClick={increment} >+</button>
        </div>
    );
}