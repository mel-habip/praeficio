import { Button } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingPage from "./LoadingPage";


export default function TemporaryFileRetrievalPage() {
    const { retrievalKey } = useParams();

    const [fileUrl, setFileUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (retrievalKey && retrievalKey !== 'undefined') {
            setIsLoading(true);
            axios.get(`/temporary-files/${retrievalKey}`).then(res => {
                setFileUrl(res.data.url);
            }).catch(() => {
                setErrorMessage(`Invalid esti. Try again later la.`);
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }, [retrievalKey]);

    if (isLoading) return <LoadingPage />

    return <>
        {!!errorMessage && <h2 style={{ color: 'red' }} >{errorMessage}</h2>}
        <Button onClick={() => window.open(fileUrl, '_blank')} href={fileUrl} disabled={!fileUrl} >Click ME</Button>
    </>
}