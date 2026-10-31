import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import {AppContext} from "./AppContext";
import OneSignal from 'react-onesignal';
import { getUserSubjects, setUserSub, getExamSubjects, getExams, setUserExam, setSubExam } from "./services/SQLService";
import { signInWithGoogle, signOut, ServerUnreachableError } from "./services/auth";
import { SERVER_UNREACHABLE_MESSAGE } from "./components/ServerUnreachable";

const SIGN_IN_FAILED_MESSAGE = "Google sign-in didn't work. Please try again.";
const SIGN_OUT_FAILED_MESSAGE = "Couldn't sign you out. Please try again.";

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

const unlinkPush = () => {
    try {
        Promise.resolve(OneSignal.removeExternalUserId()).catch(() => {});
    } catch (error) {
        // SDK not loaded.
    }
}

const SignIn = () => {

    const [exams, setExams] = useState([]);
    const [subs, setSubs] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    
    const global = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        getExams()
            .then(result => {
                setExams(result)
            })
    }, [])

    useEffect(() => {
        global.setPageTitle(global.userID ? "Profile" : "Sign In");
    }, [global.userID])

    useEffect(() => {
        if(global.currExam && global.userID) {
            getExamSubjects(global.currExam)
                .then(result => {

                    global.setExamSubs(result)
                    
                    getUserSubjects()
                        .then(res2 => {
                            
                            for (const sub of result) {
                                
                                sub.isUserSub = (typeof res2.find(sub2 => sub2.id === sub.id) !== 'undefined');

                                if (sub.isUserSub) sub.exam = res2.find(sub2 => sub2.id === sub.id).exam

                            }

                            setSubs(result);
                        })
                })
        }
    }, [global.currExam, global.userID])

    const handleGoogleCredential = ({ credential }) => {
        setError("");
        setBusy(true);

        signInWithGoogle(credential)
            .then(user => {
                global.signIn(user);
                linkPushToUser(user.id);

                // New users and anyone without a default exam stay here to
                // finish profile setup (exam, then subjects).
                if (!user.is_new && user.default_exam)
                    navigate("/test");
            })
            .catch(err => {
                setError(err instanceof ServerUnreachableError ? SERVER_UNREACHABLE_MESSAGE : SIGN_IN_FAILED_MESSAGE);
            })
            .finally(() => setBusy(false));
    }

    const handleSignOut = () => {
        setError("");
        setBusy(true);

        signOut()
            .then(() => {
                googleLogout();
                unlinkPush();
                global.signOutLocally();
                setSubs([]);
                navigate("/sign_in");
            })
            .catch(err => {
                // The session cookie is still valid, so don't pretend the
                // user is signed out (matters on shared computers).
                setError(err instanceof ServerUnreachableError ? SERVER_UNREACHABLE_MESSAGE : SIGN_OUT_FAILED_MESSAGE);
            })
            .finally(() => setBusy(false));
    }

    const onUserSubChange = (e, subject) => {
        const tempSubs = [...subs];
        tempSubs.find(sub => sub.id === subject.id).isUserSub = e.target.checked;
        setSubs(tempSubs);

        subject.isUserSub = e.target.checked;
        setUserSub(subject)
        .then(() => {

            getUserSubjects()
            .then(res => {
                
                global.setUserSubs(res);
    
            })

        })
    }

    const onUserExamChange = e => {
        global.setCurrExam(parseInt(e.target.value))

        if(e.target.value) {
            setUserExam(e.target.value);
        }
    }

    const onSubExamChange = (e, subID) => {

        if(e.target.value) {
            setSubExam(e.target.value, subID)
            .then(() => {
                getUserSubjects()
                .then(res => {
                    global.setUserSubs(res);
                    console.log(res)
                })    
            })

            let tempSubs = [...subs];

            tempSubs.find(sub => sub.id === subID).exam = e.target.value;

            setSubs(tempSubs);

        }

    }
    

    return (
        <div className="body-div">
            {/* <h1 className="page-title">Sign In</h1> */}

            {!global.userID ? (
                <div className="default-form">
                    <div style={{display: "flex", justifyContent: "center"}} aria-busy={busy}>
                        <GoogleLogin
                            onSuccess={handleGoogleCredential}
                            onError={() => setError(SIGN_IN_FAILED_MESSAGE)}
                        />
                    </div>
                    {error ? <p role="alert">{error}</p> : ""}
                </div>
            ) : ""}
            
            {global.userID ? (
                <form style={{display: "block", paddingTop: "40px"}}>
                    <label>
                        Select Default Exam 
                    </label>
                    <select className="header-dropdown dropdown" value={global.currExam} style={{margin: "10px 10px 10px 5px", borderBottomColor: "var(--accent)"}} onChange={onUserExamChange}>
                        <option value='' />
                        {exams.map(exam => (
                            <option key={parseInt(exam.id)} value={exam.id}>{exam.short_name}</option>
                        ))} 
                    </select>
                </form>
            ) : ""}
            {(global.currExam ? (
                <form style={{display: "block"}}>
                    <h3 style={{display: (subs.length !== 0 ? "block" : "none")}}>Your Subjects</h3>
                    <div style={{textAlign: "left", maxWidth: "230px", margin: "auto"}}>
                        {subs.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => b.isUserSub - a.isUserSub).map(sub => (
                            <p className={`subject-label ${sub.isUserSub ? "" : "notUserSub"}`} >
                                {sub.isUserSub ? (
                                    <select className="dropdown" value={sub.exam ? sub.exam : "NULL"} style={{margin: "10px 10px 10px 5px", opacity: (sub.exam ? 1 : "var(--faded-opacity)")}} onChange={e => onSubExamChange(e, sub.id)}>
                                        <option key="null" value={"NULL"}>Default</option>
                                        {exams.map(exam => (
                                            <option key={parseInt(exam.id)} value={exam.id}>{exam.short_name}</option>
                                        ))}
                                    </select>
                                ) : ""}
                                <label style={{cursor: "pointer", display: "inline-flex", justifyContent: "space-between", flex: 1}}>
                                    {sub.name}
                                    <input type="checkbox" style={{float: "right", height: "100%"}} checked={sub.isUserSub} onChange={e => onUserSubChange(e, sub)} />
                                </label>
                                <br />
                            </p>
                        ))}
                    </div>
                </form>
            ) : "")}

            {global.userID ? (
                <div className="default-form" style={{paddingTop: "40px"}}>
                    <button type="button" onClick={handleSignOut} disabled={busy}>Sign out</button>
                    {error ? <p role="alert">{error}</p> : ""}
                </div>
            ) : ""}
            
        </div>
    )
}

export default SignIn