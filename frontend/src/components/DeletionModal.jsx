import { useContext } from 'react';

import IsLoggedInContext from '../contexts/IsLoggedInContext';

import { Button, Modal, Text, Row } from '@nextui-org/react';

import axios from 'axios';


/**
 * @component
 * @param {String} endpoint like /positions/3 (assume DELETE method)
 * @param {Function} setSelfOpen setState function for the Modal itself
 * @param {Boolean} selfOpen State value for the modal itself
 * @param {String} titleText how to refer to the item, like "this Position" or "this Workspace"
 * @param {String} bodyText additional text about the item to be deleted
 * @param {Function} outerUpdater if successful, what shall we do?
 * @param {String} recoveryWindow if applicable, how long can it be recovered for
 */
export default function DeletionModal({ endPoint, setSelfOpen = () => { }, selfOpen, titleText = 'this item', bodyText = '', outerUpdater = () => { }, recoveryWindow = '' }) {
    const { setIsLoggedIn } = useContext(IsLoggedInContext);

    return (
        <Modal css={{'background-color': '#0d0d0d' }} closeButton blur aria-labelledby="modal-title" open={selfOpen} onClose={() => setSelfOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={18} > Are you sure you want to delete {titleText}?</Text>
            </Modal.Header>
            <Modal.Body>
                <Text size={15} css={{ 'white-space': 'pre-wrap', 'padding-left': '5rem' }}> {bodyText} </Text>
                <Row justify='space-evenly'>
                    <Button
                        auto
                        shadow
                        color="primary"
                        onPress={() => setSelfOpen(false)}> Cancel&nbsp;<i className="fa-solid fa-person-walking-arrow-loop-left" />
                    </Button>
                    <Button
                        auto
                        shadow
                        color="error"
                        onPress={() => {
                            console.log(`deleting ${endPoint?.split('/')?.find(i => !isNaN(parseInt(i)))}`);
                            axios.delete(`${process.env.REACT_APP_API_LINK}/${endPoint}`).then(response => {
                                if (response.status === 401) {
                                    setIsLoggedIn(false);
                                } else if ([200, 204].includes(response.status)) {
                                    outerUpdater({ ...response?.data?.data, deleted: true });
                                    setSelfOpen(false);
                                } else {
                                    console.log('response:', response.data);
                                }
                            });
                        }}> Trash It!&nbsp;<i className="fa-solid fa-skull-crossbones" />
                    </Button>
                </Row>
                {!!recoveryWindow ? <Text size={12} em css={{ 'text-align': 'center' }}> Note: this item can be recovered for {recoveryWindow} </Text> : <Text size={12} em css={{ 'text-align': 'center' }}> Note: you will not be able to recover this item. </Text>}
            </Modal.Body>
        </Modal>)
}