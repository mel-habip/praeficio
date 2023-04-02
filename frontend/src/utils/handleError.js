import {
    useContext
} from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';


export default function useHandleError() {

    const {
        setIsLoggedIn
    } = useContext(IsLoggedInContext);


    return (err, other_handler = () => true) => {
        const {
            status
        } = err.response;
        if (![404, 403, 401].includes(status)) return other_handler(err.response);

        let message = (typeof err.response?.data === 'string') ? err.response?.data : err.response?.data?.message;

        if (!message) message = `No message received.`

        console.error(`Request failed with code: ${status} : `, message);

        if (status === 404) {
            window.location = '/not_found';
        } else if (status === 403) {
            window.location = '/403';
        } else if (status === 401) {
            setIsLoggedIn(false);
        }
    }
}