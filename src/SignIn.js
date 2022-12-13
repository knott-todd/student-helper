import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
import { setUser, getUserID, getSubjects, getUserSubjects, setUserSub } from "./services/SQLService";

const SignIn = () => {

    const [fnameVal, setFnameVal] = useState("");
    const [lnameVal, setLnameVal] = useState("");

    const [subs, setSubs] = useState([]);
    
    const global = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if(global.userID){
            getSubjects()
                .then(result => {
                    console.log("Woi")
                    getUserSubjects(global.userID)
                        .then(res2 => {
                            console.log("UID: ")
                            for (const sub of result) {
                                console.log((typeof res2.find(sub2 => sub2.id === sub.id) !== 'undefined'))
                                sub.isUserSub = (typeof res2.find(sub2 => sub2.id === sub.id) !== 'undefined');
                            }

                            setSubs(result);
                        })
                })
        }
        
    }, [global.userID]);

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
    

    return (
        <div className="body-div">
            <h1 className="page-title">Sign In</h1>

            <form className="default-form">
                <label htmlFor="fname">First Name</label><br />
                <input type="text" id="fname" name="fname" value={fnameVal} onChange={e => setFnameVal(e.target.value)} /><br />
                <label htmlFor="fname">Last Name</label><br />
                <input type="text" id="lname" name="lname" value={lnameVal} onChange={e => setLnameVal(e.target.value)} /><br />
                <button onClick={e => handleSetUser(e)}>Submit</button>
            </form>

            <form style={{display: "block", paddingTop: "40px"}}>
                <h3 style={{display: (subs.length !== 0 ? "block" : "none")}}>Your Subjects</h3>
                <div style={{textAlign: "left", maxWidth: "230px", margin: "auto"}}>
                    {subs.sort((a, b) => b.isUserSub - a.isUserSub).map(sub => (
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