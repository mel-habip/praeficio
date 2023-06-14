import React, { useState, useContext, lazy, Suspense, useRef, useEffect } from 'react';
import { animateScroll, scroller, Element } from 'react-scroll';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';

import axios from 'axios';

import NavMenu from '../components/NavMenu';

import './stylesheets/PublicPage.css';

import is_valid_email from '../utils/is_valid_email';

import { CustomButton } from '../fields/CustomButton';

import { Button, Modal, Spacer, Text, Badge, Tooltip, Input, Textarea, Loading } from '@nextui-org/react';

import videoBg1 from '../media/sparkly_world_video.mp4';

const AudioPlayer = lazy(() => import('../components/AudioPlayer'));
const ErrorModule = lazy(() => import('../components/ErrorModule'));


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
    login: {
        en: 'Login',
        fr: 'Connexion'
    },
    newsletter: {
        en: 'Newsletter',
        fr: 'Bulletin'
    },
    about_us: {
        en: 'About Us',
        fr: 'À propos de nous'
    },
    contact_us: {
        en: 'Contact Us',
        fr: 'Contactez-nous'
    },
    back_up: {
        en: 'Back Up',
        fr: 'Remonter'
    }
};

export default function PublicPage() {
    document.title = "Praeficio.com";
    const [lang, setLang] = useState('en');
    const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');

    const pageMainSection = useRef(null);
    const pageAboutUs = useRef(null);
    const pageContactUs = useRef(null);

    const scrollToMainSection = () => {
        pageMainSection.current.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAboutUs = () => {
        pageAboutUs.current.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToContactUs = () => {
        pageContactUs.current.scrollIntoView({ behavior: 'smooth' });
    };

    const showIncompletePage = process.env.REACT_APP_BUILD_ENV === 'beta';

    const { isLoggedIn } = useContext(IsLoggedInContext);
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

    const handleScroll = () => {
        const currentSection = scroller.getActiveLink();

        document.querySelectorAll('.chapter').forEach((section) => {
            section.classList.remove('active');
        });

        const currentSectionElement = document.querySelector(`[name=${currentSection}]`);
        console.log('triggerred:', currentSection);

        if (currentSectionElement != null) {
            currentSectionElement.classList.add('active');
            const currentSectionHeight = document.querySelector('.active').offsetHeight;
            const currentPosition = window.pageYOffset + currentSectionHeight;

            if (currentPosition >= document.body.offsetHeight - 100) {
                animateScroll.scrollToTop();
            } else {
                scroller.scrollTo(currentSection, {
                    duration: 500,
                    delay: 0,
                    smooth: 'easeInOutQuart',
                });
            }
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (<>

        <main className="public-site-body scroll-container" style={{ height: '300svh', scrollSnapType: 'y mandatory', width: '100vw', 'overflowBehaviorY': 'contain' }} >
            {isLoggedIn ? <NavMenu /> : <Button
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
                onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"} /></Button>}

            <div className="audio-player-wrapper" >
                <Suspense fallback={<Loading />}>
                    <AudioPlayer />
                </Suspense>
            </div>
            <Element id="main_section" name="chapter1">
                <section ref={pageMainSection} className="chapter" >
                    <video src={videoBg1} autoPlay loop className={`background-video-1 ${isDark ? '' : 'invert'}`} muted playsInline />
                    <div className="section-contents" style={{ position: 'absolute', top: '0%', left: '0%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }} >
                        <h1>Praeficio.com</h1>
                        <div style={{ position: 'absolute', top: '3%', right: '2%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '95%' }}>
                            <Tooltip content={lang !== 'fr' ? "Veuillez noter que notre capacité en français est limitée." : ""} placement="leftEnd" color="invert" >
                                <CustomButton onClick={toggleLang} style={{ textTransform: 'uppercase' }} >  {lang}  <i className="fa-solid fa-arrows-spin" /></CustomButton>
                            </Tooltip>
                            <CustomButton buttonStyle="btn--transparent" to='/newsletters?show_latest=true'> {sentences.newsletter[lang]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/#about_us' onClick={scrollToAboutUs}> {sentences.about_us[lang]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/#contact_us' onClick={scrollToContactUs} > {sentences.contact_us[lang]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/login'> {sentences.login[lang]} <i className="fa-solid fa-angles-right" /></CustomButton>

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
                </section>
            </Element>

            <Element id="about_us" name="chapter2">
                <section style={{ backgroundColor: 'grey' }} ref={pageAboutUs} className="chapter">
                    <div className="nav-button-wrapper">
                        <CustomButton buttonStyle="btn--secondary" to='/#main_section' onClick={scrollToMainSection} > {sentences.back_up[lang]} <i className="fa-solid fa-angles-up" /></CustomButton>
                        <CustomButton buttonStyle="btn--secondary" to='/#contact_us' onClick={scrollToContactUs} > {sentences.contact_us[lang]} <i className="fa-solid fa-angles-down" /></CustomButton>
                    </div>
                    <div className="section-contents" >
                        <h1>
                            <em>
                                <strong>Who on Earth are we?? 🌎🌍🌏</strong>
                            </em>
                        </h1>
                        <br />
                        <p>well, to be honest we don't know that either : | </p>
                        <br />
                        <p> shall we find that out together?</p>
                    </div>
                </section>
            </Element>

            <Element id="contact_us" name="chapter3">
                <section style={{ backgroundColor: 'lightgrey', display: 'flex', flexDirection: 'column', alignItems: 'center' }} ref={pageContactUs} className="chapter">
                    <div className="nav-button-wrapper">
                        <CustomButton buttonStyle="btn--secondary" to='/#about_us' onClick={scrollToAboutUs} > {sentences.about_us[lang]} <i className="fa-solid fa-angle-up" /></CustomButton>
                        <CustomButton buttonStyle="btn--secondary" to='/#main_section' onClick={scrollToMainSection} > {sentences.back_up[lang]} <i className="fa-solid fa-angles-up" /></CustomButton>
                    </div>
                    <div className="section-contents" >
                        <h1> Oh what great lengths to reach us 👉👈</h1>
                        <Spacer y={2} />
                        <form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '900px', minWidth: '450px', alignSelf: 'center', gap: '25px', backgroundColor: 'darkgrey', padding: '20px', borderRadius: '0.75rem' }}  >
                            <p>Just some small details please</p>
                            <Input width={"80%"} labelPlaceholder="Name" required />
                            <div style={{ width: '100%' }} >
                                <Input width={"80%"} labelPlaceholder="Email" type="email" />
                                <p>either ☝️ or 👇 </p>
                                <Input width={"80%"} labelPlaceholder="Telephone" type="tel" />
                            </div>
                            <Textarea width={"80%"} label="What are you interested in?" minRows={4} placeholder='Please describe' />
                            {/* add the same length based detection here */}
                            <Button>Send</Button>
                        </form>
                        <br />
                        <div style={{
                            borderRadius: '0.75rem', backgroundColor: 'var(--background-color)', fontWeight: 'normal', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '700px', minWidth: '450px', alignSelf: 'center', gap: '25px', padding: '20px',
                        }} >
                            <p>Public Links: </p>
                            <ul>
                                <li> <CustomButton to="/newsLetters">NewsLetters <i className="fa-regular fa-newspaper" /></CustomButton> </li>
                                <li> <CustomButton to="/tic-tac-toe">Tic-Tac-Toe <i className="fa-solid fa-table-cells-large" /></CustomButton> </li>
                                <li> <CustomButton to="/randomizer">Randomizer <i className="fa-solid fa-dice" /></CustomButton> </li>
                                <li> <CustomButton to="/notes">Quick notes <i className="fa-solid fa-pencil" /></CustomButton> </li>
                                <li> <CustomButton to="/404">An awesome 404 page 😬</CustomButton> </li>
                                <li> <CustomButton to="/403">An awesome 403 page ✋</CustomButton> </li>
                                <li> <CustomButton to="/500">An awesome error page 💀</CustomButton> </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </Element>
        </main>
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
            <Suspense fallback="1 sec" >
                <ErrorModule errorMessage={errorTexts.general}></ErrorModule>
            </Suspense>
            <form
                style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}
                onSubmit={e => {
                    e.preventDefault();
                    if (Object.values(errorTexts).filter(Boolean).length) {
                        console.log('there are errors', errorTexts);
                        return; //means there are errors}
                    }
                    console.log('submitted');
                    axios.post(`${process.env.REACT_APP_API_LINK}:8000/subscribers/`, { email: subscriptionInfo.email, name: subscriptionInfo.name })
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