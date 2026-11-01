import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OneSignal from 'react-onesignal';
import { AppContext } from "./AppContext";
import { POST_SIGN_IN_PATH } from "./config";
import { signInWithGoogle } from "./services/auth";
import { openGoogleSignIn, GoogleSignInCancelled } from "./services/googlePopup";
import './CSS/Landing.css';

// Page copy is Olusanya's, verbatim. Do not edit or add to it here.
export const LANDING_COPY = {
    headline: "Smarter, Faster CXC Exam Prep",
    subline: "Too much to study and don't know where to start? The easiest time is now.",
    button: "GET STARTED FOR FREE",
};

// Team-written (allowed exception), shown to Olusanya before go-live.
export const SIGN_IN_ERROR_MESSAGE = "We couldn't sign you in right now. Please try again.";

// Link this browser's push subscription to the user. react-onesignal 2.x
// wraps the v15 SDK, whose API is setExternalUserId (v16 renamed it login).
// Push is best-effort: a failure here must never block sign-in.
const linkPushToUser = userID => {
    try {
        Promise.resolve(OneSignal.setExternalUserId(String(userID))).catch(() => {});
    } catch (error) {
        // SDK not loaded (blocked by the browser or an extension).
    }
}

// Front door for signed-out visitors (App routes signed-in students past it).
const Landing = () => {
    const [error, setError] = useState("");
    const global = useContext(AppContext);
    const navigate = useNavigate();

    // Must stay synchronous up to openGoogleSignIn so the popup isn't blocked.
    const handleGetStarted = () => {
        setError("");
        openGoogleSignIn()
            .then(signInWithGoogle)
            .then(user => {
                global.signIn(user);
                linkPushToUser(user.id);
                // New students (and anyone without a default exam) set up
                // their profile first: exam, then subjects.
                navigate(!user.is_new && user.default_exam ? POST_SIGN_IN_PATH : "/sign_in", { replace: true });
            })
            .catch(err => {
                if (err instanceof GoogleSignInCancelled) return;
                setError(SIGN_IN_ERROR_MESSAGE);
            });
    }

    return (
        <div className="landing">
            <main className="landing-hero">
                <h1 className="landing-headline">{LANDING_COPY.headline}</h1>
                <p className="landing-subline">{LANDING_COPY.subline}</p>
                <div className="landing-cta">
                    <button type="button" className="primary-btn full-width-btn" onClick={handleGetStarted}>
                        {LANDING_COPY.button}
                    </button>
                    {error ? <p role="alert">{error}</p> : ""}
                </div>
            </main>
            <footer className="landing-footer">
                <Link to="/privacy" className="accent-link body-sm">Privacy</Link>
            </footer>
        </div>
    )
}

export default Landing
