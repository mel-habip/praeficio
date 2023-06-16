import { useContext } from 'react';

import NavMenu from '../../components/NavMenu';

import LanguageContext from '../../contexts/LanguageContext';

export default function VotingSessionClosedPage() {

    const { language } = useContext(LanguageContext);

    const dictionary = {
        line_1: {
            en: 'This voting session is now closed.',
            fr: 'Cette séance de vote est maintenant terminée.'
        },
        line_2: {
            en: 'Thank you for visiting & have a great day!',
            fr: 'Merci de votre visite et bonne journée !'
        },
        line_3: {
            en: 'For additional support, please contact the person who gave you this link.',
            fr: 'Pour une assistance supplémentaire, veuillez contacter la personne qui vous a donné ce lien.'
        },
    };

    return (<>
        <NavMenu show_language_button_externally />

        <h1>{dictionary.line_1[language]}</h1>
        <br />
        <h1>{dictionary.line_2[language]}</h1>
        <br />
        <h3>{dictionary.line_3[language]}</h3>
    </>);
}