
import NavMenu from '../components/NavMenu';
import { Button, Card, Modal, Spacer, Text, Input, Grid, Row, Textarea, Loading, Dropdown, Tooltip } from '@nextui-org/react';
import useHandleError from '../utils/handleError';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function MovieRatingPage() {
    const handleError = useHandleError();

    const [movies, setMovies] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        axios.get(`/movies`).then(res => {
            if (res.data.data?.length) {
                setMovies(res.data.data)
            }
        }).catch(handleError);
    }, []);

    const handleCreateDummyData = () => {
        axios.post(`/movies/dummy-data`).catch(e => { })
    };

    const handleFetchRecommendations = () => {
        axios.get(`/movies/recommendations`).then(res => {
            setRecommendations(res.data);
        }).catch(handleError)
    };

    return <>
        <NavMenu />
        <h1>Hello Danny!</h1>

        <Button onPress={handleCreateDummyData} >Create Dummy Data</Button>
        <Button onPress={handleFetchRecommendations} >Fetch Recommendations</Button>

        <p>Concept by Daniel Gallant, Powered by Praeficio</p>
    </>;
}