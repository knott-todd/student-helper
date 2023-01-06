import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
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

        setUser(fnameVal, lnameVal)
            .then(() => {
                getUserID(fnameVal, lnameVal)
                    .then(result => {
                        global.setUserID(result[0].id);
                    })
            })
            .catch(err => console.log(err))
            

        setFnameVal("");
        setLnameVal("");
        
        if(global.currExam)
            navigate("/track");

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
            <h1 className="page-title">Sign In</h1>

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
                        Exam 
                    </label>
                    <select className="header-dropdown" value={global.currExam} style={{margin: "10px 10px 10px 5px"}} onChange={onUserExamChange}>
                        <option value='' />
                        {exams.map(exam => (
                            <option key={parseInt(exam.id)} value={exam.id}>{exam.short_name}</option>
                        ))} 
                    </select>
                </form>
            ) : ""}

            <form style={{display: "block"}}>
                <h3 style={{display: (subs.length !== 0 ? "block" : "none")}}>Your Subjects</h3>
                <div style={{textAlign: "left", maxWidth: "230px", margin: "auto"}}>
                    {subs.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => b.isUserSub - a.isUserSub).map(sub => (
                        <p className="subject-label" >
                            {sub.name}
                            <input type="checkbox" style={{float: "right", height: "100%"}} checked={sub.isUserSub} onChange={e => onUserSubChange(e, sub)} />
                            <br />
                        </p>
                    ))}
                </div>
            </form>
            
        </div>
    )
}

export default SignIn