import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
import OneSignal from 'react-onesignal';
import { setUser, getUserID, getSubjects, getUserSubjects, setUserSub, getExamSubjects, getExams, getUserExam, setUserExam, setSubExam } from "./services/SQLService";
import SubjectSelector from "./components/SubjectSelector";
import ExamDropdown from "./components/ExamDropdown";
import React from "react";
import { useUser } from "./features/auth/UserContext";

const Profile = () => {

    const [fnameVal, setFnameVal] = useState("");
    const [lnameVal, setLnameVal] = useState("");
    const [exams, setExams] = useState([]);
    const [subs, setSubs] = useState<Subject[]>([]);

    const { user, loading } = useUser();
    
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
    }, [])

    interface User {
        id: string;
        [key: string]: any;
    }

    interface Exam {
        id: number;
        short_name?: string;
        [key: string]: any;
    }

    interface Subject {
        id: number;
        name?: string;
        isUserSub?: boolean;
        exam?: string | number;
        [key: string]: any;
    }

    interface SQLService {
        setUser: (fname: string, lname: string) => Promise<any>;
        getUserID: (fname: string, lname: string) => Promise<User[]>;
        getSubjects: () => Promise<Subject[]>;
        getUserSubjects: (userID: number) => Promise<Subject[]>;
        setUserSub: (subject: Subject, userID: number) => Promise<any>;
        getExamSubjects: (examID: number) => Promise<Subject[]>;
        getExams: () => Promise<Exam[]>;
        getUserExam: (userID: number) => Promise<{ default_exam: number }[]>;
        setUserExam: (examID: number, userID: number) => Promise<any>;
        setSubExam: (examID: number, subID: number, userID: number) => Promise<any>;
    }

    useEffect(() => {
        if(loading) return;
        if(!user?.user_id) return;
        if(global.currExam) {
            getExamSubjects(global.currExam)
                .then(result => {

                    global.setExamSubs(result)
                    
                    getUserSubjects(user?.user_id)
                        .then(res2 => {
                            
                            for (const sub of result) {
                                
                                sub.isUserSub = (typeof res2.find((sub2: Subject) => sub2.id === sub.id) !== 'undefined');

                                if (sub.isUserSub) sub.exam = res2.find((sub2: Subject) => sub2.id === sub.id).exam

                            }

                            setSubs(result);
                        })
                })
        }
    }, [global.currExam, user, loading])

    const handleSetUser = (e: React.FormEvent<HTMLButtonElement>) => {

        e.preventDefault();

        localStorage.clear();
        global.clearCache();

        setUser(fnameVal, lnameVal)
            .then(() => {
                getUserID(fnameVal, lnameVal)
                    .then((result: User[]) => {
                        global.setUserID(result[0].id);
                        global.setUser(result[0]);

                        OneSignal.setExternalUserId(result[0].id);

                        getUserExam(result[0].id)
                            .then((result: { default_exam: number }[]) => {
                                
                                global.setCurrExam(result[0].default_exam);

                                console.log("EXAM", result[0].default_exam)
                        
                                if(result[0].default_exam)
                                    navigate("/track");

                            })
                    })
            })
            .catch((err: any) => console.log(err))
            

        setFnameVal("");
        setLnameVal("");
        
        // getUserSubjects(global.userID)
        //     .then(res => {
        //         if(res.length > 0)
        //             navigate("/track");
        //     })


    }

    const onUserSubChange = (e: React.ChangeEvent<HTMLInputElement>, subject: Subject) => {
        
        setSubs(subs.map(sub =>
            sub.id === subject.id ? { ...sub, isUserSub: e.target.checked } : sub
        ));

        subject.isUserSub = e.target.checked;
        setUserSub(subject, user?.user_id)
        .then(() => {

            getUserSubjects(user?.user_id)
            .then(res => {
                
                global.setUserSubs(res);
    
            })

        })
    }

    const onUserExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        global.setCurrExam(parseInt(e.target.value))

        if(e.target.value) {
            setUserExam(e.target.value, user?.user_id);
        }
    }

    const onSubExamChange = (e: React.ChangeEvent<HTMLSelectElement>, subID: number) => {

        if(e.target.value) {
            setSubExam(e.target.value, subID, user?.user_id)
            .then(() => {
                getUserSubjects(user?.user_id)
                .then(res => {
                    global.setUserSubs(res);
                    console.log(res)
                })    
            })

            setSubs(subs.map(sub =>
                sub.id === subID ? { ...sub, exam: e.target.value } : sub
            ));

        }

    }
    

    return (
        <div className="body-div">
            {/* <h1 className="page-title">Sign In</h1> */}

            <form className="default-form">
                <label htmlFor="fname">First Name</label><br />
                <input type="text" id="fname" name="fname" value={fnameVal} onChange={e => setFnameVal(e.target.value)} required /><br />
                <label htmlFor="fname">Last Name</label><br />
                <input type="text" id="lname" name="lname" value={lnameVal} onChange={e => setLnameVal(e.target.value)} required /><br />
                <button disabled={!fnameVal || !lnameVal} onClick={e => handleSetUser(e)}>Submit</button>
            </form>
            

            {user?.user_id && (
                
                <form style={{ display: "block", paddingTop: "40px" }}>
                <label>Select Default Exam</label>
                <ExamDropdown
                    exams={exams}
                    selectedExam={global.currExam}
                    onChange={onUserExamChange}
                />
                </form>
            )}

            {global.currExam && (
            <SubjectSelector
                subs={subs}
                exams={exams}
                onSubjectChange={onUserSubChange}
                onSubExamChange={onSubExamChange}
            />
            )}
            
            {/* {global.userID ? (
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
            ) : "")} */}
            
        </div>
    )
}

export default Profile