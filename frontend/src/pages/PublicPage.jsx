import React, { useState, useContext, lazy, Suspense, useRef, useEffect } from 'react';
import { animateScroll, scroller, Element } from 'react-scroll';
import { Link } from "react-router-dom";
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';

import axios from 'axios';

import NavMenu from '../components/NavMenu';

import './stylesheets/PublicPage.css';

import is_valid_email from '../utils/is_valid_email';

import { CustomButton } from '../fields/CustomButton';
import CustomizedDropdown from '../fields/CustomizedDropdown';
import { Badge } from "@nextui-org/badge";
import { Button, Modal, Spacer, Text, Tooltip, Input, Textarea, Loading, Progress, Card } from '@nextui-org/react';

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

const dictionary = {
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
    },
    next: {
        en: 'Next',
        fr: 'Suivante'
    },
    submit: {
        en: 'Submit',
        fr: 'Soumettre'
    },
    previous: {
        en: 'Previous',
        fr: 'Précédente'
    },
    page_1_header: {
        en: 'Your business',
        fr: 'Votre entreprise'
    },
    page_2_header: {
        en: 'Contact Info',
        fr: 'Coordonnées'
    },
    page_3_header: {
        en: 'Your current state',
        fr: 'Votre état actuel'
    },
    page_4_header: {
        en: 'Your dream state',
        fr: 'Votre état de rêve'
    },
    page_5_header: {
        en: 'Additional business details',
        fr: "Détails supplémentaires sur l'entreprise"
    },
    business_name: {
        en: 'Business Name',
        fr: "Nom de l'entreprise"
    },
    business_type: {
        en: 'Business Type',
        fr: "Type d'entreprise"
    },
    please_describe: {
        en: 'Please describe',
        fr: "Décrivez s'il vous plait"
    }
};

export default function PublicPage() {
    document.title = "Praeficio.com";

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

    const { isLoggedIn } = useContext(IsLoggedInContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
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
            <NavMenu />

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
                            <Tooltip content={language !== 'fr' ? "Veuillez noter que notre capacité en français est limitée." : ""} placement="leftEnd" color="invert" >
                                <CustomButton onClick={toggleLanguage} style={{ textTransform: 'uppercase' }} >  {language}  <i className="fa-solid fa-arrows-spin" /></CustomButton>
                            </Tooltip>
                            <CustomButton buttonStyle="btn--transparent" to='/newsletters?show_latest=true'> {dictionary.newsletter?.[language]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/#about_us' onClick={scrollToAboutUs}> {dictionary.about_us?.[language]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/#contact_us' onClick={scrollToContactUs} > {dictionary.contact_us?.[language]} <i className="fa-solid fa-angles-right" /></CustomButton>

                            <CustomButton buttonStyle="btn--transparent" to='/login'> {dictionary.login?.[language]} <i className="fa-solid fa-angles-right" /></CustomButton>

                        </div>

                        {!!referrer && <Text em size={13} css={{ color: 'lightgreen' }} >{dictionary.referral_part_1?.[language]} {`"${referrer}"`}, {dictionary.referral_part_2?.[language]}</Text>}

                        <>
                            <h2>{dictionary.slogan3?.[language]}</h2>
                            <div>
                                <Badge color="warning" >faster</Badge>
                                <Badge color="success">safer</Badge>
                                <Badge color="secondary">better</Badge>
                            </div>
                            <br />
                            <h4>{dictionary.slogan1?.[language]}</h4>

                            <h3>{dictionary.slogan2?.[language]}</h3>
                            <CustomButton buttonStyle="btn--secondary" onClick={() => setSubscriptionModalOpen(true)} >{dictionary.subscribe_button?.[language]}</CustomButton>
                        </>

                        <SubscriptionModal isOpen={subscriptionModalOpen} setIsOpen={setSubscriptionModalOpen} language={language} />

                    </div>
                </section>
            </Element>

            <Element id="about_us" name="chapter2">
                <section style={{ backgroundColor: 'grey' }} ref={pageAboutUs} className="chapter">
                    <div className="nav-button-wrapper">
                        <CustomButton buttonStyle="btn--secondary" to='/#main_section' onClick={scrollToMainSection} > {dictionary.back_up?.[language]} <i className="fa-solid fa-angles-up" /></CustomButton>
                        <CustomButton buttonStyle="btn--secondary" to='/#contact_us' onClick={scrollToContactUs} > {dictionary.contact_us?.[language]} <i className="fa-solid fa-angles-down" /></CustomButton>
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
                        <br />
                        <h2>The Team</h2>
                        <div className="team-cards" >
                            <Card css={{ $$cardColor: '$colors$primary', width: '300px' }} isHoverable isPressable>
                                <Link to='/mel-habip'>
                                    <h3 style={{ color: 'var(--text-primary)' }}>Mel Habip</h3>
                                    <h4 style={{ color: 'var(--text-primary)' }}>Founder & Developer</h4>

                                    <Link>Add me as a friend! </Link>
                                </Link>
                            </Card>
                            <Card css={{ $$cardColor: '$colors$primary', width: '300px' }} isHoverable isPressable>
                                <Link to='/hira-qazi'>
                                    <h3 style={{ color: 'var(--text-primary)' }}>Hira Qazi</h3>
                                    <h4 style={{ color: 'var(--text-primary)' }}>Head of Sales & Operations</h4>

                                    <Link>Add me as a friend! </Link>
                                </Link>
                            </Card>
                            <Card css={{ $$cardColor: '$colors$primary', width: '300px' }} isHoverable isPressable>
                                <Link to='/tiddles'>
                                    <h3 style={{ color: 'var(--text-primary)' }}>Mr. Tiddles</h3>
                                    <h4 style={{ color: 'var(--text-primary)' }}>Chief Emotional Support Officer</h4>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </section>
            </Element>

            <Element id="contact_us" name="chapter3">
                <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} ref={pageContactUs} className="chapter">
                    <div className="nav-button-wrapper">
                        <CustomButton buttonStyle="btn--secondary" to='/#about_us' onClick={scrollToAboutUs} > {dictionary.about_us?.[language]} <i className="fa-solid fa-angle-up" /></CustomButton>
                        <CustomButton buttonStyle="btn--secondary" to='/#main_section' onClick={scrollToMainSection} > {dictionary.back_up?.[language]} <i className="fa-solid fa-angles-up" /></CustomButton>
                    </div>
                    <h1> Oh what great lengths to reach us 👉👈</h1>
                    <ContactForm />
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
                </section>
            </Element>
        </main >
    </>);
};


function SubscriptionModal({ isOpen, setIsOpen, language }) {

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
            <Text size={14} css={{ 'text-align': 'center' }}>{dictionary.join_header?.[language]}</Text>
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
                    axios.post(`subscribers/`, { email: subscriptionInfo.email, name: subscriptionInfo.name })
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
                    labelLeft={dictionary.your_name?.[language]}
                    aria-label='name for subscription'
                    placeholder={dictionary.name_example?.[language]}
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
                    labelLeft={dictionary.your_email?.[language]}
                    placeholder={dictionary.email_example?.[language]}
                    css={{ mt: '15px', mb: '10px' }}
                    helperColor='error'
                    required
                    helperText={errorTexts.email || ''}
                    clearable
                    onChange={v => setSubscriptionInfo({ ...subscriptionInfo, email: v.target.value }) || setErrorTexts({ ...errorTexts, email: '' })}
                />
                <Spacer y={0.5} />
                {language !== 'en' && <Text size={12} em css={{ 'text-align': 'center', mb: '10px' }}>Veuillez noter que notre capacité en français est limitée.</Text>}
                <Text size={12} em css={{ 'text-align': 'center' }}>{dictionary.unsubscribe_note?.[language]}</Text>
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
                    }}>{dictionary.sign_up?.[language]}</Button>
            </form>
        </Modal.Body>
    </Modal >);
};

function ContactForm() {
    const [formData, setFormData] = useState({});
    const { language } = useContext(LanguageContext);
    const [page, setPage] = useState(1);

    const [error, setError] = useState('');

    const next = () => setPage(p => p > 5 ? 6 : p + 1) || setError('');
    const previous = () => setPage(p => p === 1 ? 1 : p - 1) || setError('');
    const submit = () => { };

    const Buttons = ({ nextCondition, isSubmit = false }) => <div className="buttons-group">
        <Button auto shadow bordered color="warning" className="previous-button" onPress={previous}> {dictionary.previous?.[language]} </Button>
        {isSubmit ? <Button disabled={!nextCondition} auto shadow bordered color="primary" className="submit-button" onPress={submit}> {dictionary.submit?.[language]} </Button> : <Button disabled={!nextCondition} auto shadow bordered color="primary" className="next-button" onPress={next}> {dictionary.next?.[language]} </Button>}

    </div>

    return (<>

        <div className="wrapper" >
            <Progress color="gradient" shadow value={(18 * page) + 1} />

            <div className={`section ${page === 1 ? 'active' : ''}`} >
                <h4>{dictionary.page_1_header?.[language]}</h4>
                <Button disabled={!formData.business_name && !formData.business_type} auto shadow bordered color="primary" className="next-button" onPress={next}> {dictionary.next?.[language]} </Button>
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, business_name: e.target.value }))} className="search-field2" underlined clearable color="primary" labelPlaceholder={dictionary.business_name?.[language]} />
                <br />
                <Input width="400px" onChange={e => setFormData(prev => ({ ...prev, business_type: e.target.value }))} className="search-fiel2d" underlined clearable color="primary" labelPlaceholder={dictionary.business_type?.[language]} />
            </div>

            <div className={`section ${page === 2 ? 'active' : ''}`} >
                <Buttons nextCondition={formData.contact_name && (formData.contact_email || formData.contact_phone)} />
                <h4>{dictionary.page_2_header?.[language]}</h4>
                <Input width={"80%"} underlined clearable color="primary" onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))} labelPlaceholder="Your Name" />
                <br />
                <div style={{ width: '100%' }} >
                    <Input width={"80%"} underlined clearable color="primary" onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))} labelPlaceholder="Email" type="email" />
                    <p>either ☝️ or 👇 (or both)</p>
                    <Input width={"80%"} underlined clearable color="primary" onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} labelPlaceholder="Telephone" type="tel" />
                </div>
            </div>

            <div className={`section ${page === 3 ? 'active' : ''}`} >
                <Buttons nextCondition={formData.current_state?.length > 20} />
                <h4>{dictionary.page_3_header?.[language]}</h4>
                <Textarea width="400px" onChange={e => setFormData(prev => ({ ...prev, current_state: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder={dictionary.please_describe?.[language]} />
            </div>

            <div className={`section ${page === 4 ? 'active' : ''}`} >
                <Buttons nextCondition={formData.dream_state?.length > 30} />
                <h4>{dictionary.page_4_header?.[language]}</h4>
                <Textarea width="400px" onChange={e => setFormData(prev => ({ ...prev, dream_state: e.target.value }))} className="search-field" underlined clearable color="primary" labelPlaceholder={dictionary.please_describe?.[language]} />
            </div>

            <div className={`section ${page === 5 ? 'active' : ''}`} >
                <Buttons nextCondition={false} isSubmit />
                <h4>{dictionary.page_5_header?.[language]}</h4>
                <CustomizedDropdown mountDirectly optionsList={[{ key: '0-10', name: '0-10 daily users' }, { key: '10-100', name: '10-100 daily users' }, { key: '100-1000', name: '100-1,000 daily users' }, { key: '1000+', name: '1,000+ daily users' }]} title="Daily Users" />
                <br />
                <CustomizedDropdown mountDirectly optionsList={[{ key: 'non-essential', name: 'Non-Essential', description: `A "nice to have"` }, { key: 'supplementary', name: 'Supplementary', description: `Supplements existing system` }, { key: 'replacement', name: 'Replacement', description: `Replacing existing system` }, { key: 'critical', name: 'Critical', description: `Provides critical functionality` }]} title="System Priority" />
                <br />
            </div>
        </div>
    </>);
}