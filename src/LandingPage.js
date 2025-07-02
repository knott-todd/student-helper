import PrimaryButton from "./components/PrimaryButton"
import styles from './CSS/LandingPage.module.css'

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
        </div>

        <div className={`${styles.landingView}`}>

            <div className={`${styles.leftContent}`}>

                {/* Fear less tag line display bold xl */}
                <h1 className="display-xl-bold">FEAR LESS</h1>

                {/* Sub head description body lg mt-16 */}
                <p style={{maxWidth: 500}} className="body-lg mt-md">With CXC exam practice, syllabus mastery tracking, and personalized coaching to build real exam confidence.</p>

                {/* CTA button mt-64 */}
                <PrimaryButton className="mt-lg" text="Start Practicing For Free" onClick={() => {}} />

                {/* Other users body sm mt-16 */}
                <p className="body-sm mt-md">Trusted by 1,100+ students across the Caribbean to build exam confidence.</p>

            </div>

            <img className="gradient-image" style={{height: '80%' , boxShadow: '0px 0px 41px -4px rgba(253, 157, 11,0.4),0px 0px 9px -3px rgba(253, 157, 11,0.6)', borderRadius: 10}} src="/superhero-with-bg.png" alt="Student Helper Superhero" />
        </div>
        </>
    )
}

export default LandingPage;