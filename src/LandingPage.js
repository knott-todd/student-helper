import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PrimaryButton from "./components/PrimaryButton"
import styles from './CSS/LandingPage.module.css'
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    return (
        <>

        {/* Header */}
        <div className={`${styles.header}`}>
            <div className={`${styles.logo}`}>
                {/* Logo */}
                <img style={{height: 32}} alt="The Student Helper Logo" src="/logo192.png" />
                {/* Logo text */}
                <p>The Student Helper</p>
            </div>
            {/* Nav */}
            <div className={`${styles.navWrapper} ${styles.desktopOnly}`}>

                <nav className={`${styles.nav} body-sm`}>
                    <ul>
                        <li><a className="body-sm" href="/practice">Practice</a></li>
                        <li><a className="body-sm" href="/join">Join Us</a></li>
                        <li><a className="body-sm" href="/contact">Contact</a></li>
                        <li><a className="body-sm" href="/login">Log In</a></li>
                    </ul>
                </nav>

                <PrimaryButton>Sign Up</PrimaryButton>

            </div>
            <FontAwesomeIcon 
                className={`${styles.mobileOnly} ${styles.hamburger}`} 
                icon={faBars} 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
            />
        </div>

        {/* Full-screen nav menu for mobile */}
        {isMenuOpen && (
            <div className={styles.fullscreenMenu}>
                <FontAwesomeIcon
                    icon={faTimes}
                    className={styles.closeIcon}
                    onClick={() => setIsMenuOpen(false)}
                />
                <nav className="body-lg">
                    <ul>
                        <li><a href="/practice" onClick={() => setIsMenuOpen(false)}>Practice</a></li>
                        <li><a href="/join" onClick={() => setIsMenuOpen(false)}>Join Us</a></li>
                        <li><a href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
                        <li><a href="/login" onClick={() => setIsMenuOpen(false)}>Log In</a></li>
                        <li>
                            <PrimaryButton onClick={() => setIsMenuOpen(false)}>
                                Sign Up
                            </PrimaryButton>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

        
        <div className={`${styles.heroImageContainer} ${styles.mobileOnly}`}>
            <img className={`${styles.heroImage}`} src="/superhero-with-bg.png" alt="Student Helper Superhero" />

        </div>

        <div className={`${styles.landingView}`}>

            <div className={`${styles.leftContent}`}>

                {/* Fear less tag line display bold xl */}
                <h1 className="display-md display-bold">Smarter, Faster CXC Exam Prep</h1>

                {/* Sub head description body lg mt-16 */}
                {/* <p style={{maxWidth: 500}} className="body-lg mt-md">Practice that mirrors the real exam, tracks your syllabus mastery, and keeps you motivated.</p> */}

                {/* CTA button mt-64 */}
                <PrimaryButton widthAdaptive className="mt-lg" onClick={() => navigate('/quiz')} >
                    GET STARTED FOR FREE
                </PrimaryButton>

                {/* Other users body sm mt-16 */}
                <p className="body-sm mt-md">Trusted by 1,100+ students across the Caribbean to build exam confidence.</p>

            </div>
            <div className={`${styles.heroImageContainer} ${styles.desktopOnly}`}>
                <img className={`${styles.heroImage}`} src="/superhero-with-bg.png" alt="Student Helper Superhero" />

            </div>
        </div>
        </>
    )
}

export default LandingPage;