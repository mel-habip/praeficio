
import './LoadingPage.css';

import { CustomButton } from '../fields/CustomButton';

export default function LoadingPage() {


    return (<body className="loading-page-body">
        <h1 className="loading-page-text" data-text="Loading..." >Loading...</h1>
        <CustomButton onClick={() => window.history.go(-1)} > <i className="fa-solid fa-backward"></i> &nbsp;Back</CustomButton>
    </body>);
}