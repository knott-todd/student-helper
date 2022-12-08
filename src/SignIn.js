import { useState, useContext, useEffect } from "react";
import {AppContext} from "./AppContext";
import { setUser, getUserID, getSubjects, getUserSubjects, setUserSub } from "./services/SQLService";

const SignIn = () => {

    const [fnameVal, setFnameVal] = useState("");
    const [lnameVal, setLnameVal] = useState("");

    const [subs, setSubs] = useState([]);
    
    const global = useContext(AppContext);

    useEffect(() => {
        if(global.userID){
            getSubjects()
                .then(result => {
                    getUserSubjects(global.userID)
                        .then(res2 => {
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
        <div>
            <h1 className="page-title">Sign In</h1>

            <form>
                <label htmlFor="fname">First Name</label><br />
                <input type="text" id="fname" name="fname" value={fnameVal} onChange={e => setFnameVal(e.target.value)} /><br />
                <label htmlFor="fname">Last Name</label><br />
                <input type="text" id="lname" name="lname" value={lnameVal} onChange={e => setLnameVal(e.target.value)} /><br />
                <button onClick={e => handleSetUser(e)}>Submit</button>
            </form>

            <form style={{display: "block", paddingTop: "40px"}}>
                {subs.map(sub => (
                    <label>
                        {sub.name}
                        <input type="checkbox" checked={sub.isUserSub} onChange={e => onUserSubChange(e, sub)} />
                        <br />
                    </label>
                ))}
            </form>
            
        </div>
    )
}

export default SignIn