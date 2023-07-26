
import { useEffect, useState, useContext } from "react";
import NavMenu from '../../components/NavMenu';
import ThemeContext from '../../contexts/ThemeContext';
import axios from 'axios';
import './Mel.css';

import ScrollingText from '../../components/ScrollingText';
import { Button, Tooltip } from "@nextui-org/react";

export default function MelPage() {
    document.title = `Praeficio | Mel Habip`;

    const { isDark } = useContext(ThemeContext);
    const [showHeader, setShowHeader] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [downloadSuccessful, setDownloadSuccessful] = useState(null);

    useEffect(() => {
        // Apply 'show' class after 2 seconds
        const timer = setTimeout(() => {
            setShowHeader(true);
        }, 250);

        // Clean up the timer on component unmount
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Apply 'show' class after 2 seconds
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1000);

        // Clean up the timer on component unmount
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof downloadSuccessful === 'boolean') {
            const timer = setTimeout(() => {
                setDownloadSuccessful(null);
            }, 2500);

            // Clean up the timer on component unmount
            return () => clearTimeout(timer);
        }
    }, [downloadSuccessful]);

    const handleDownload = async () => {
        try {
            const response = await axios.get('/api/mel-cv', { responseType: 'blob' });

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/octet-stream' });

            // Create a URL for the blob
            const downloadUrl = URL.createObjectURL(blob);

            // Create a link element and click it to initiate the download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'Mel Habip - Resume.pdf'; // Set the desired filename for the download
            link.click();

            // Clean up the object URL after the download is triggered
            URL.revokeObjectURL(downloadUrl);
            setDownloadSuccessful(true);
        } catch (error) {
            setDownloadSuccessful(false);
            console.error('Error downloading file:', error);
            alert('Error downloading file.');
        }
    };

    /**
     *  while it would have been more efficient and robust to create a function here that takes an input like 👇👇
     *  [
     *      {
     *          "company_name": "Starship Enterprise",
     *          "position": "Stormtrooper III",
     *          "from": "September 2018",
     *             ...
     *      }
     *  ] 
     *  I chose to do it more bare-bones as this allows for easier addition of custom bits & features.
     */

    return (
        <>
            <NavMenu hide_language_button={true} />
            <div style={{
                position: 'fixed',
                left: '0%',
                top: '0%',
                marginTop: '1rem',
                marginLeft: '6rem',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }} >
                <Tooltip content="Download CV" placement="bottom">
                    <Button
                        css={{ width: '4rem', marginRight: '1rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white' }}
                        onClick={handleDownload}
                    ><i className="fa-solid fa-file-arrow-down" /></Button>
                </Tooltip>
                {downloadSuccessful === false && <i className="fa-regular fa-thumbs-down red" />}
                {downloadSuccessful && <i className="fa-regular fa-thumbs-up green" />}

            </div>
            <div className='mel-page-container' >
                <header className={`header ${showHeader ? "show" : ""}`}>
                    <h1>
                        <ScrollingText words={['Hi!', 'Bonjour!', '¡Hola!', 'Hej!', 'مرحبا!', 'Привет!']} minWidth="180px" /> I'm Mel 👋👋 </h1>
                    <h3>Welcome to my CV! ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
                </header>
                <div className={`content ${showContent ? "show" : ""}`}>
                    <hr className="line-primary" />
                    <section>
                        <h2>
                            <em>
                                Profile
                            </em>
                        </h2>
                        <p style={{marginBottom: '1em'}} >
                            Dynamic and results-driven professional with a solid background as a
                            Customer Success Engineering Lead, adept at leveraging cutting-edge
                            tools and features to deliver innovative solutions to clients.
                            <br /><br /> Eager to embark on an exciting new journey where I may blend my technical interest with my people skills,
                            fueled by an insatiable curiosity and a <em>'mad scientist'</em> mentality. <br /><br /> Passionate
                            about crafting impactful full-stack applications, adeptly employing
                            languages like JavaScript, TypeScript, SQL, and CSS, and, frameworks like
                            Express, Node, and React to tackle complex challenges.
                            Adept at blending technical expertise with a keen eye for design and user
                            experience to create seamless, user-centric solutions that emphasize
                            versatility. <br /><br /> Always pushing the boundaries, experimenting, and devising
                            creative approaches to address real-world problems. Ready to bring an
                            inventive and problem-solving mindset to contribute to visionary software
                            projects.
                        </p>
                        <hr className="line-primary" />
                    </section>
                    <section>
                        <h2>
                            <em>
                                Experience
                            </em>
                        </h2>
                        <div >
                            <span>
                                <h3><strong>Mako Fintech</strong> &#183; <em>Engineering Lead, Customer Success</em> &#183; Montreal (remote), QC</h3>
                                <h4>April 2021 - <em>present</em></h4>
                            </span>
                            <ul>
                                <li><p>Spearheaded a high-performing team of up to 5 individuals, including 2
                                    direct reports and various cross-functional members, to investigate
                                    software bugs and deliver timely fixes, ensuring seamless functionality for
                                    financial institutions of various sizes.</p></li>
                                <li><p>Acted as the second level of escalation for Clients to resolve
                                    mismatches in solution requirements.</p></li>
                                <li><p>Reviewed colleagues' Pull Requests, ensuring adherence to high
                                    standards of code and system design quality, resulting in enhanced
                                    UI/UX, software reliability, and performance.</p></li>
                                <li><p>Designed and implemented departmental processes, proactively
                                    preventing customer complaints and technical issues, and streamlining
                                    operations for improved efficiency.</p></li>
                                <li><p>Identified and implemented comprehensive, scalable, and robust
                                    solutions to complex system architecture problems, enhancing the
                                    stability and long-term sustainability of the software.</p></li>
                                <li><p>Communicated complex technical issues and plans effectively to
                                    internal and external stakeholders, fostering collaboration and
                                    maintaining clear lines of communication.</p></li>
                                <li><p>Autonomously developed custom internal tools and NodeJS scripts,
                                    boosting departmental efficiency by over 100% and optimizing
                                    day-to-day operations.</p></li>
                                <li><p>Trained new team members and coached peers in the use
                                    of JSON, JavaScript, HTML, CSS, RESTful APIs, and Git tools to promote
                                    best practices, contributing to a skilled and knowledgeable workforce.</p></li>
                            </ul>
                        </div>
                        <br />
                        <div>
                            <span>
                                <h3><strong>Concordia University</strong> &#183; <em>Resident Assistant</em> &#183; Montreal, QC</h3>
                                <h4>August 2018 - April 2021</h4>
                            </span>
                            <ul>
                                <li><p>Completed routine rounds of the grounds, enforcing a Code of
                                    Conduct amongst 600+ students.</p></li>
                                <li><p>Coordinated 7 small and large-scale educational events every semester.</p></li>
                                <li><p>Resided in a 24-hour live-in occupation with on-duty/on-call rotation,
                                    gaining crisis prevention, team and community building, emergency
                                    management and communication skills.</p></li>
                            </ul>
                        </div>
                        <hr className="line-primary" />
                    </section>
                    <section>
                        <h2>
                            <em>
                                Professional Skills
                            </em>
                        </h2>
                        <ul className="two-column-list" data-columns="2">
                            <li><p>Project Management</p></li>
                            <li><p>Strategic Planning</p></li>
                            <li><p>Agile Methodology</p></li>
                            <li><p>Team Management & Coordination</p></li>
                            <li><p>Customer Service</p></li>
                            <li><p>Debugging & Incident Resolution</p></li>
                            <li><p>Scripting Models & Interpreters</p></li>
                            <li><p>Technical Solutions Development</p></li>
                            <li><p>SQL Database Development</p></li>
                        </ul>
                        <hr className="line-primary" />
                    </section>
                    <section>
                        <h2>
                            <em>
                                Technical Skills
                            </em>
                        </h2>
                        <div style={{
                            display: "flex",
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: '40px'
                        }} >
                            <ul>
                                <span>Frameworks</span>
                                <li><p>React <FiveStarRating rating={3.5} /></p></li>
                                <li><p>Express <FiveStarRating rating={4} /> </p></li>
                            </ul>
                            <ul>
                                <span>Languages</span>
                                <li><p>Javascript <FiveStarRating rating={4} /></p></li>
                                <li><p>TypeScript <FiveStarRating rating={4} /></p></li>
                                <li><p>CSS <FiveStarRating rating={3} /></p></li>
                                <li><p>HTML <FiveStarRating rating={3} /></p></li>
                                <li><p>SQL (MySQL) <FiveStarRating rating={2.5} /></p></li>
                            </ul>
                        </div>
                        <hr className="line-primary" />
                    </section>
                    <section>
                        <h2>
                            <em>
                                Education
                            </em>
                        </h2>
                        <span>
                            <h4>Concordia University &#183; <em>BSc, Chemistry </em><i className="fa-solid fa-flask" /></h4>

                            <h5>Montreal, Canada &#183; December 2020 <i className="fa-solid fa-graduation-cap" /></h5>
                        </span>
                        <hr className="line-primary" />
                        <br /><br /><br /><br />
                    </section>
                </div>
            </div>
        </>
    )
};


function FiveStarRating({ rating }) {
    const remainder = rating % 1;
    const whole = rating - remainder;

    const hasHalfStar = rating - whole >= 0.45;
    const emptyStars = 5 - whole - (hasHalfStar ? 1 : 0);

    const starStatuses = [];

    for (let i = 0; i < whole; i++) {
        starStatuses.push('filled');
    }

    if (hasHalfStar) starStatuses.push('half');

    for (let i = 0; i < emptyStars; i++) {
        starStatuses.push('empty');
    }

    return starStatuses.map(stat => <i className={`gold fa-${stat === 'filled' ? 'solid' : 'regular'} fa-star${stat === 'half' ? '-half-stroke' : ''}`}></i>)


}