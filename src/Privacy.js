import { Link } from "react-router-dom";
import { PRIVACY_CONTACT_EMAIL } from "./config";

// Team-written (allowed exception to the no-AI-copy rule), shown to Olusanya
// before go-live. Keep it short and literal; it must stay true to what the
// app actually stores.
const Privacy = () => (
    <div className="body-div privacy">
        <h1>Privacy</h1>
        <p>When you sign in with Google, Student Helper stores:</p>
        <ul style={{display: "inline-block", textAlign: "left"}}>
            <li><p>your name and email address from your Google account</p></li>
            <li><p>the exam and subjects you choose</p></li>
            <li><p>your tasks</p></li>
            <li><p>your progress</p></li>
        </ul>
        <p>We don't sell this information, and we don't share it with anyone except the services that run Student Helper.</p>
        <p>
            To have your account and everything in it deleted, email{" "}
            {PRIVACY_CONTACT_EMAIL
                ? <a className="accent-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
                : "[contact email not set]"}
            {" "}from the address you sign in with.
        </p>
        <p><Link to="/" className="accent-link">Student Helper</Link></p>
    </div>
);

export default Privacy
