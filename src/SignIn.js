import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
import OneSignal from 'react-onesignal';
import { setUser, getUserID, getSubjects, getUserSubjects, setUserSub, getExamSubjects, getExams, getUserExam, setUserExam } from "./services/SQLService";

const SignIn = () => {

    const [fnameVal, setFnameVal] = useState("");
    const [lnameVal, setLnameVal] = useState("");
    const [exams, setExams] = useState([]);
    const [subs, setSubs] = useState([]);
    
    const global = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(typeof global.userID, global.userID)
        getExams()
            .then(result => {
                setExams(result)
            })
    }, [])

    useEffect(() => {
        global.setPageTitle(global.userID ? "Profile" : "Sign In");
    }, [])

    useEffect(() => {
        if(global.currExam) {
            getExamSubjects(global.currExam)
                .then(result => {
                    
                    getUserSubjects(global.userID)
                        .then(res2 => {
                            
                            for (const sub of result) {
                                
                                sub.isUserSub = (typeof res2.find(sub2 => sub2.id === sub.id) !== 'undefined');
                            }

                            setSubs(result);
                        })
                })
        }
    }, [global.currExam])

    const handleSetUser = (e) => {

        e.preventDefault();

        localStorage.clear();
        global.clearCache();

        setUser(fnameVal, lnameVal)
            .then(() => {
                getUserID(fnameVal, lnameVal)
                    .then(result => {
                        global.setUserID(result[0].id);
                        global.setUser(result[0]);

                        OneSignal.setExternalUserId(result[0].id);

                        getUserExam(result[0].id)
                            .then(result => {
                                
                                global.setCurrExam(result[0].default_exam);

                                console.log("EXAM", result[0].default_exam)
                        
                                if(result[0].default_exam)
                                    navigate("/track");

                            })
                    })
            })
            .catch(err => console.log(err))
            

        setFnameVal("");
        setLnameVal("");
        
        // getUserSubjects(global.userID)
        //     .then(res => {
        //         if(res.length > 0)
        //             navigate("/track");
        //     })


    }

    const onUserSubChange = (e, subject) => {
        const tempSubs = [...subs];
        tempSubs.find(sub => sub.id === subject.id).isUserSub = e.target.checked;
        setSubs(tempSubs);

        subject.isUserSub = e.target.checked;
        setUserSub(subject, global.userID);

        getUserSubjects(global.userID)
            .then(res => {
                global.setUserSubs(res);
            })
    }

    const onUserExamChange = e => {
        global.setCurrExam(parseInt(e.target.value))
        console.log("New e")

        if(e.target.value) {
            setUserExam(e.target.value, global.userID);
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
            
            {global.userID ? (
                <form style={{display: "block", paddingTop: "40px"}}>
                    <label>
                        Select Exam 
                    </label>
                    <select className="header-dropdown" value={global.currExam} style={{margin: "10px 10px 10px 5px"}} onChange={onUserExamChange}>
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
                                <label style={{cursor: "pointer"}}>
                                    {sub.name}
                                    <input type="checkbox" style={{float: "right", height: "100%"}} checked={sub.isUserSub} onChange={e => onUserSubChange(e, sub)} />
                                </label>
                                <br />
                            </p>
                        ))}
                    </div>
                </form>
            ) : "")}
            
        </div>
    )
}

export default SignIn