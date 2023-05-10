import React, { useState, useContext, lazy, Suspense } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import axios from 'axios';

import is_valid_email from '../utils/is_valid_email';
import ErrorModule from '../components/ErrorModule';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Badge, Checkbox, Tooltip, Input, Grid, Dropdown, Loading } from '@nextui-org/react';

import videoBg1 from '../media/sparkly_world_video.mp4';

const AudioPlayer = lazy(() => import('../components/AudioPlayer'));


const referralCodes = {
    mel_secret_code: "Mel H.",
    hira_secret_code: "Hira",
    anon_secret_code: "Us",
    potato: 'potato',
    rise_of_raj: 'Raj Sangha'
};

const sentences = {
    being_built: {
        en: 'this site is being built',
        fr: 'ce site est en construction'
    },
    join_header: {
        en: 'Join our mailing list to receive exclusive updates on our latest features, releases and everything else!',
        fr: 'Rejoignez notre liste de diffusion pour recevoir des mises à jour exclusives sur nos dernières fonctionnalités, versions et tout le reste !'
    },
    sign_up: {
        en: 'Sign-Up',
        fr: `S'inscrire`
    },
    slogan1: {
        en: 'digital. reimagined.',
        fr: 'numérique. réinventé.'
    },
    slogan2: {
        en: 'Are you ready?',
        fr: ' Êtes- vous tous prêts?'
    },
    slogan3: {
        en: "We're here to make you:",
        fr: "Nous sommes là pour vous faire:"
    },
    your_email: {
        en: "Email Address",
        fr: 'Votre Courriel'
    },
    your_name: {
        en: "Your Name",
        fr: 'Votre Nom'
    },
    name_example: {
        en: 'John Doe',
        fr: 'Jean Dupont'
    },
    email_example: {
        en: 'john@company.ca',
        fr: 'jean@monentreprise.ca'
    },
    referral_part_1: {
        en: 'You were referred by',
        fr: 'Vous avez été référé par'
    },
    referral_part_2: {
        en: 'thank you for your business!',
        fr: 'merci pour votre entreprise!'
    },
    unsubscribe_note: {
        en: 'Note: You can unsubscribe at any time.',
        fr: 'Remarque : Vous pouvez vous désabonner à tout moment.'
    },
    subscribe_button: {
        en: 'Click here to subscribe & keep updated!',
        fr: 'Cliquez ici pour vous abonner et rester informé !'
    },
    show_incomplete: {
        en: 'Show Incomplete Page',
        fr: 'Afficher la page incomplète'
    },
};

export default function CompanyPublicPage() {
    document.title = "Praeficio.com";
    const [lang, setLang] = useState('en');
    const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');

    const showIncompletePage = process.env.REACT_APP_BUILD_ENV === 'beta';

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const queryParams = new URLSearchParams(window.location.search);
    const referral_code = queryParams.get("referral_code");

    const referrer = referralCodes[referral_code];

    if (referral_code && !referrer) {
        console.warn(`Your referral code "${referral_code}" is not recognized`);
    } else if (referrer) {
        console.log(`Referred by: `, referrer);
    }

    const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);


    const tracks = [
        {
            title: 'New World Symphony',
            artist: 'Antonín Dvořák',
            audioName: 'dvorak_symphony_9_movement_4',
            imageName: 'dvorak',
            color: '#f5b342'
        },
        {
            title: 'Romeo & Juliet',
            artist: 'Sergei Prokofiev',
            audioName: 'romeo_and_juliet',
            imageName: 'prokofiev',
            color: '#c334eb'
        },
        {
            title: 'Für Beethoven',
            artist: 'We Are One & Ludwig Van Beethoven',
            audioName: 'fur_beethoven',
            imageName: 'we_are_one',
            color: '#42b6f5'
        }
    ];





    return (<>
        <video src={videoBg1} autoPlay loop className={`background-video-1 ${isDark ? '' : 'invert'}`} muted playsInline />
        <div style={{ zIndex: 100 }} >
            <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>
            <h1>Praeficio.com</h1>
            <div style={{ position: 'absolute', top: '3%', right: '2%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '95%' }}>
                <Tooltip content={lang !== 'fr' ? "Veuillez noter que notre capacité en français est limitée." : ""} placement="leftEnd" color="invert" >
                    <CustomButton onClick={toggleLang} style={{ textTransform: 'uppercase' }} >  {lang}  <i className="fa-solid fa-arrows-spin" /></CustomButton>
                </Tooltip>
                <CustomButton buttonStyle="btn--transparent" to='/newsletters?show_latest=true'> Newsletter <i className="fa-solid fa-angles-right" /></CustomButton>

                <CustomButton buttonStyle="btn--transparent" to='/about_us'> About Us <i className="fa-solid fa-angles-right" /></CustomButton>

                <CustomButton buttonStyle="btn--transparent" to='/contact_us'> Contact Us <i className="fa-solid fa-angles-right" /></CustomButton>

                <div style={{ marginTop: 'auto' }} >
                    <Suspense fallback={<Loading />}>
                        <AudioPlayer tracks={tracks} />
                    </Suspense>
                </div>

            </div>

            {!!referrer && <Text em size={13} css={{ color: 'lightgreen' }} >{sentences.referral_part_1[lang]} {`"${referrer}"`}, {sentences.referral_part_2[lang]}</Text>}

            {!showIncompletePage ? <h3><i className="fa-solid fa-person-digging"></i>&nbsp;{sentences.being_built[lang]}&nbsp;<i className="fa-solid fa-screwdriver-wrench"></i></h3> : <>

                <h2>{sentences.slogan3[lang]}</h2>
                <div>
                    <Badge color="warning" >faster</Badge>
                    <Badge color="success">safer</Badge>
                    <Badge color="secondary">better</Badge>
                </div>
                <br />
                <h4>{sentences.slogan1[lang]}</h4>

                <h3>{sentences.slogan2[lang]}</h3>
                <CustomButton buttonStyle="btn--secondary" onClick={() => setSubscriptionModalOpen(true)} >{sentences.subscribe_button[lang]}</CustomButton>
            </>}

            <SubscriptionModal isOpen={subscriptionModalOpen} setIsOpen={setSubscriptionModalOpen} lang={lang} />

        </div>
    </>);
};


function SubscriptionModal({ isOpen, setIsOpen, lang }) {

    const [subscriptionInfo, setSubscriptionInfo] = useState({});
    const [errorTexts, setErrorTexts] = useState({});


    return (<Modal
        closeButton
        blur
        aria-labelledby="chat modal"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        scroll
        width='700px'
    >
        <Modal.Header>
            <Text size={14} css={{ 'text-align': 'center' }}>{sentences.join_header[lang]}</Text>
        </Modal.Header>
        <Modal.Body>
            <ErrorModule errorMessage={errorTexts.general}></ErrorModule>
            <form
                style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}
                onSubmit={e => {
                    e.preventDefault();
                    if (Object.values(errorTexts).filter(Boolean).length) {
                        console.log('there are errors', errorTexts);
                        return; //means there are errors}
                    }
                    console.log('submitted');
                    axios.post(`http://${process.env.REACT_APP_API_LINK}.praeficio.com:8000/subscribers/`, { email: subscriptionInfo.email, name: subscriptionInfo.name })
                        .then(res => {
                            if (res.status === 201) {
                                setIsOpen(false);
                            } else if (res?.data?.message) {
                                setErrorTexts({ ...errorTexts, general: res.data.message })
                                console.error(res.data.message);
                            }
                        })
                        .catch(err => {
                            if (err?.response?.data?.message) setErrorTexts({ ...errorTexts, general: err?.response?.data?.message })
                            console.error('res-data', err);
                        })
                }} >
                {/* <pre>{JSON.stringify(subscriptionInfo, null, 2)}</pre> */}
                <Input
                    labelLeft={sentences.your_name[lang]}
                    aria-label='name for subscription'
                    placeholder={sentences.name_example[lang]}
                    color="primary"
                    helperColor='error'
                    helperText={errorTexts.name || ''}
                    underlined
                    required
                    clearable
                    onChange={v => setSubscriptionInfo({ ...subscriptionInfo, name: v.target.value }) || setErrorTexts({ ...errorTexts, name: '' })}
                />
                <Input
                    type="email"
                    color="primary"
                    underlined
                    aria-label='email for subscription'
                    labelLeft={sentences.your_email[lang]}
                    placeholder={sentences.email_example[lang]}
                    css={{ mt: '15px', mb: '10px' }}
                    helperColor='error'
                    required
                    helperText={errorTexts.email || ''}
                    clearable
                    onChange={v => setSubscriptionInfo({ ...subscriptionInfo, email: v.target.value }) || setErrorTexts({ ...errorTexts, email: '' })}
                />
                <Spacer y={0.5} />
                {lang !== 'en' && <Text size={12} em css={{ 'text-align': 'center', mb: '10px' }}>Veuillez noter que notre capacité en français est limitée.</Text>}
                <Text size={12} em css={{ 'text-align': 'center' }}>{sentences.unsubscribe_note[lang]}</Text>
                <Button
                    type="submit"
                    css={{ width: '50%', alignSelf: 'center' }}
                    shadow
                    aria-label='button for subscription'
                    onPress={() => {
                        let errs = {};

                        if (!subscriptionInfo.email) {
                            errs.email = 'Required';
                        } else if (!is_valid_email(subscriptionInfo.email)) {
                            errs.email = 'Invalid Email';
                        }

                        if (!subscriptionInfo.name) {
                            errs.name = 'Required';
                        } else if (subscriptionInfo.name.length < 4) {
                            errs.name = 'Too short';
                        } else if (subscriptionInfo.name.length > 40) {
                            errs.name = 'Too long';
                        }
                        setErrorTexts(errs);
                    }}>{sentences.sign_up[lang]}</Button>
            </form>
        </Modal.Body>
    </Modal >);
};