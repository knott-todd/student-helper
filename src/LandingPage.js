import PrimaryButton from "./components/PrimaryButton"

const LandingPage = () => {
    return (
        <>

        {/* Header */}
        <div className="header">
            <div className="logo">
                {/* Logo */}
                {/* Logo text */}
                <p>The Student Helper</p>
            </div>
            {/* Nav */}
        </div>

        <div className="landingView">

            {/* Fear less tag line display bold xl */}
            <h1 className="display-xl-bold">FEAR LESS</h1>

            {/* Sub head description body lg mt-16 */}
            <p className="body-lg mt-md">With smart, personalized CXC practice</p>

            {/* CTA button mt-64 */}
            <PrimaryButton className="mt-lg" text="Start Practicing For Free" onClick={() => {}} />

            {/* Other users body sm mt-16 */}
            <p className="body-sm mt-md">Trusted by 1,100+ students across the Caribbean to build exam confidence.</p>

        </div>
        </>
    )
}