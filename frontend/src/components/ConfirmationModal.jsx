import { Button, Modal, Text, Row } from '@nextui-org/react';

/**
 * @component
 * @param {Function} setSelfOpen setState function for the Modal itself
 * @param {Boolean} selfOpen State value for the modal itself
 * @param {String} titleText sentence displayed in the modal?
 * @param {String} bodyText additional text about the action to be done
 * @param {Function} outerUpdater the function to run if approved
 * @param {Boolean} irrecoverable warning if the action is terminal
 * @param {HTMLElement} symbol the symbol to display next to the call-to-action button 
 */
export default function ConfirmationModal({ setSelfOpen = () => { }, selfOpen, titleText = ' Are you sure you want to complete this action?', bodyText = '', outerUpdater = () => { }, irrecoverable = true, symbol = <i className="fa-regular fa-paper-plane" /> }) {

    return (
        <Modal css={{ 'background-color': '#0d0d0d' }} closeButton blur aria-labelledby="modal-title" open={selfOpen} onClose={() => setSelfOpen(false)} >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={18} > {titleText} </Text>
            </Modal.Header>
            <Modal.Body>
                {!!bodyText && <Text size={15} css={{ 'white-space': 'pre-wrap', 'padding-left': '5rem' }}> {bodyText} </Text>}
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
                        onPress={() => outerUpdater()}
                    > Do It! &nbsp;{symbol}
                    </Button>
                </Row>
                {irrecoverable && <Text size={12} em css={{ 'text-align': 'center' }}> Note: this action is irrecoverable and cannot be undone. </Text>}
            </Modal.Body>
        </Modal>);
}