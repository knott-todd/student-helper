import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PrimaryButton from "./components/PrimaryButton"
import styles from './CSS/LandingPage.module.css'
import { faBars } from "@fortawesome/free-solid-svg-icons";

const LandingPage = () => {
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
            <div style={{padding: '0 1.5rem'}}>
                <FontAwesomeIcon icon={faBars} />

            </div>
        </div>

        
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
                <PrimaryButton widthAdaptive className="mt-lg" text="GET STARTED FOR FREE" onClick={() => {}} />

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