import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
import OneSignal from 'react-onesignal';
import { getUserSubjects, setUserSub, getExamSubjects, getExams, setUserExam, setSubExam } from "./services/SQLService";
import { signOut, ServerUnreachableError } from "./services/auth";
import { SERVER_UNREACHABLE_MESSAGE } from "./components/ServerUnreachable";
import EmptyState from "./components/EmptyState";
import { ENABLE_PUSH } from "./config";
import { UNITS, hasUnits, subjectUnit } from "./curriculum";

const SIGN_OUT_FAILED_MESSAGE = "Couldn't sign you out. Please try again.";
const SAVE_FAILED_MESSAGE = "Couldn't save that change. Please try again.";

const unlinkPush = () => {
    if (!ENABLE_PUSH) return;
    try {
        Promise.resolve(OneSignal.removeExternalUserId()).catch(() => {});
    } catch (error) {
        // SDK not loaded.
    }
}

const SignIn = () => {

    const [exams, setExams] = useState([]);
    const [subs, setSubs] = useState([]);
    const [subsLoaded, setSubsLoaded] = useState(false);
    const [saveError, setSaveError] = useState("");
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
        global.setPageTitle("Profile");
    }, [global.userID])

    useEffect(() => {
        if(global.currExam && global.userID) {
            setSubsLoaded(false);
            getExamSubjects(global.currExam)
                .then(result => {
                    result = Array.isArray(result) ? result : [];

                    global.setExamSubs(result)

                    getUserSubjects()
                        .then(res2 => {
                            res2 = Array.isArray(res2) ? res2 : [];

                            for (const sub of result) {
                                const userSub = res2.find(sub2 => sub2.id === sub.id);

                                sub.isUserSub = (typeof userSub !== 'undefined');

                                if (sub.isUserSub) {
                                    sub.exam = userSub.exam;
                                    sub.unit = subjectUnit(userSub);
                                }

                            }

                            setSubs(result);
                            setSubsLoaded(true);
                        })
                })
        }
    }, [global.currExam, global.userID])

    const handleSignOut = () => {
        setError("");
        setBusy(true);

        signOut()
            .then(() => {
                unlinkPush();
                global.signOutLocally();
                setSubs([]);
                navigate("/");
            })
            .catch(err => {
                // The session cookie is still valid, so don't pretend the
                // user is signed out (matters on shared computers).
                setError(err instanceof ServerUnreachableError ? SERVER_UNREACHABLE_MESSAGE : SIGN_OUT_FAILED_MESSAGE);
            })
            .finally(() => setBusy(false));
    }

    // Saves one subject row and refreshes the user's subjects (header
    // switcher, Track). A failed save puts the row back as it was.
    const saveUserSub = (subject, changes) => {
        const before = { isUserSub: subject.isUserSub, unit: subject.unit };
        const updateRow = values => setSubs(current => current.map(sub => sub.id === subject.id ? Object.assign(sub, values) : sub));

        setSaveError("");
        updateRow(changes);

        setUserSub({ ...subject, ...changes })
        .then(result => {
            if (result && result.error) throw new Error(result.error);

            return getUserSubjects()
            .then(res => {
                res = Array.isArray(res) ? res : [];
                global.setUserSubs(res);
                // Show what the server saved.
                const saved = res.find(sub => sub.id === subject.id);
                if (saved) updateRow({ unit: subjectUnit(saved) });
            })
        })
        .catch(() => {
            updateRow(before);
            setSaveError(SAVE_FAILED_MESSAGE);
        })
    }

    // New subjects start on Unit 1.
    const onUserSubChange = (e, subject) =>
        saveUserSub(subject, e.target.checked ? { isUserSub: true, unit: subjectUnit(subject) } : { isUserSub: false });

    const onUnitChange = (e, subject) =>
        saveUserSub(subject, { isUserSub: true, unit: parseInt(e.target.value, 10) });

    const examName = examID => {
        const exam = exams.find(exam => String(exam.id) === String(examID));
        return exam ? exam.short_name : "";
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

            {global.userID ? (
                <form style={{display: "block", paddingTop: "40px"}}>
                    <label>
                        Select Default Exam 
                    </label>
                    <select className="header-dropdown dropdown" aria-label="Default exam" value={global.currExam} style={{margin: "10px 10px 10px 5px", borderBottomColor: "var(--accent)"}} onChange={onUserExamChange}>
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
                                {sub.isUserSub && hasUnits(examName(sub.exam || global.currExam)) ? (
                                    <select className="dropdown unit-select" aria-label={`${sub.name} unit`} value={subjectUnit(sub)} style={{margin: "10px 5px 10px 10px"}} onChange={e => onUnitChange(e, sub)}>
                                        {UNITS.map(unit => (
                                            <option key={unit} value={unit}>Unit {unit}</option>
                                        ))}
                                    </select>
                                ) : ""}
                                <br />
                            </p>
                        ))}
                    </div>
                    {subsLoaded && subs.length === 0 ? (
                        <EmptyState>{`${examName(global.currExam) || "These"} subjects coming soon`}</EmptyState>
                    ) : ""}
                    {saveError ? <p role="alert">{saveError}</p> : ""}
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