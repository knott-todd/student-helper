import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OneSignal from 'react-onesignal';
import { AppContext } from "./AppContext";
import { ENABLE_PUSH, POST_SIGN_IN_PATH, PRIVACY_CONTACT_EMAIL } from "./config";
import { signInWithGoogle } from "./services/auth";
import { openGoogleSignIn, GoogleSignInCancelled } from "./services/googlePopup";
import ServerUnreachable from "./components/ServerUnreachable";
import './CSS/Landing.css';

// Page copy is Olusanya's, verbatim (landing draft v1). Do not edit or add to it here.
export const LANDING_COPY = {
    headline: "Your whole CAPE Pure Maths syllabus, and a plan to get through it.",
    subline: "Too much to study and don't know where to start? The easiest time is now.",
    detail: "Unit 1 or Unit 2. Every objective, laid out, so you can plan when you'll cover each one.",
    button: "GET STARTED FOR FREE",
    csec: "CSEC subjects coming soon.",
    featuresTitle: "Two things you can do today",
    // `screenshot`: set { src, alt } to show a screenshot under the text.
    features: [
        {
            title: "See the whole syllabus",
            text: "Track lays out Pure Maths module by module, then topic by topic, down to each objective. You can see everything you need to cover.",
            screenshot: null,
        },
        {
            title: "Plan your study",
            text: "Add a task, give it a due date, and tick it off when it's done.",
            screenshot: null,
        },
    ],
    stepsTitle: "How it starts",
    steps: [
        "1. Sign in with Google.",
        "2. Choose CAPE, then Pure Mathematics, then your unit.",
        "3. Open Track to see your syllabus, or add your first task.",
    ],
    next: "Next on the list: original Pure Maths papers with mark schemes, written by Caribbean teachers. No date yet.",
    faq: [
        { q: "Is it free?", a: "Yes." },
        { q: "Which exams and subjects?", a: "Right now, CAPE Pure Mathematics, Unit 1 and Unit 2. You pick your unit on your Profile. CSEC subjects are coming soon." },
        { q: "Where are the past papers?", a: "Not here yet. We're getting original Pure Maths papers written by Caribbean teachers, with mark schemes. No date yet." },
        { q: "Does it work on my phone?", a: "Yes. It runs in your phone's browser, so there's nothing to download." },
    ],
    dataQuestion: "What happens to my data?",
    dataAnswerBefore: "We keep your name and email from Google, the exam and subjects you choose, and your tasks. We don't sell it. To have your account and everything in it deleted, email",
    dataAnswerAfter: "from the address you sign in with.",
    privacyLink: "Read the privacy page",
    closing: "Your Pure Maths syllabus is one sign-in away.",
    footerLink: "Privacy",
};

// Team-written (allowed exception), shown to Olusanya before go-live.
export const SIGN_IN_ERROR_MESSAGE = "We couldn't sign you in right now. Please try again.";

// Link this browser's push subscription to the user. react-onesignal 2.x
// wraps the v15 SDK, whose API is setExternalUserId (v16 renamed it login).
// Push is best-effort: a failure here must never block sign-in. Off for
// launch (ENABLE_PUSH).
const linkPushToUser = userID => {
    if (!ENABLE_PUSH) return;
    try {
        Promise.resolve(OneSignal.setExternalUserId(String(userID))).catch(() => {});
    } catch (error) {
        // SDK not loaded (blocked by the browser or an extension).
    }
}

// Front door for signed-out visitors (App routes signed-in students past it).
const Landing = () => {
    // Which button the sign-in error belongs under ("hero" | "closing").
    const [errorAt, setErrorAt] = useState("");
    const [showOutage, setShowOutage] = useState(false);
    const global = useContext(AppContext);
    const navigate = useNavigate();

    // Must stay synchronous up to openGoogleSignIn so the popup isn't blocked.
    const handleGetStarted = where => {
        setErrorAt("");
        // Server known to be down (GET /me failed): don't send the student to
        // Google for a sign-in that can't finish; show the outage screen.
        if (global.authStatus === "unreachable") {
            setShowOutage(true);
            return;
        }
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
                setErrorAt(where);
            });
    }

    // Retry re-runs GET /me; App remounts this page once it answers.
    if (showOutage) return <ServerUnreachable onRetry={global.restoreSession} />;

    const cta = where => (
        <div className="landing-cta">
            <button type="button" className="primary-btn full-width-btn" onClick={() => handleGetStarted(where)}>
                {LANDING_COPY.button}
            </button>
            {errorAt === where ? <p role="alert">{SIGN_IN_ERROR_MESSAGE}</p> : ""}
        </div>
    );

    return (
        <div className="landing">
            <main>
                <section className="landing-hero">
                    <h1 className="landing-headline">{LANDING_COPY.headline}</h1>
                    <p className="landing-subline">{LANDING_COPY.subline}</p>
                    <p className="landing-subline">{LANDING_COPY.detail}</p>
                    {cta("hero")}
                    <p className="landing-small body-sm">{LANDING_COPY.csec}</p>
                </section>

                <section className="landing-section">
                    <h2>{LANDING_COPY.featuresTitle}</h2>
                    <div className="landing-features">
                        {LANDING_COPY.features.map(feature => (
                            <div className="landing-feature" key={feature.title}>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                                {feature.screenshot ? (
                                    <img className="landing-screenshot" src={feature.screenshot.src} alt={feature.screenshot.alt} />
                                ) : ""}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="landing-section">
                    <h2>{LANDING_COPY.stepsTitle}</h2>
                    {LANDING_COPY.steps.map(step => <p key={step}>{step}</p>)}
                </section>

                <section className="landing-section">
                    <p>{LANDING_COPY.next}</p>
                </section>

                <section className="landing-section landing-faq">
                    {LANDING_COPY.faq.map(item => (
                        <div className="landing-faq-item" key={item.q}>
                            <h3>{item.q}</h3>
                            <p>{item.a}</p>
                        </div>
                    ))}
                    <div className="landing-faq-item">
                        <h3>{LANDING_COPY.dataQuestion}</h3>
                        <p>
                            {LANDING_COPY.dataAnswerBefore}{" "}
                            <a className="accent-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
                            {" "}{LANDING_COPY.dataAnswerAfter}
                        </p>
                        <p><Link to="/privacy" className="accent-link">{LANDING_COPY.privacyLink}</Link></p>
                    </div>
                </section>

                <section className="landing-section landing-closing">
                    <h2>{LANDING_COPY.closing}</h2>
                    {cta("closing")}
                </section>
            </main>
            <footer className="landing-footer">
                <Link to="/privacy" className="accent-link body-sm">{LANDING_COPY.footerLink}</Link>
            </footer>
        </div>
    )
}

export default Landing
