import { useContext, useEffect, useState } from "react"
import {AppContext} from "./AppContext";
import { getSubjects, getUserExam, getUserSubjects } from "./services/SQLService";
import './CSS/Header.css'
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SingleProgress from "./SingleProgress";
import { subjectUnit } from "./curriculum";

const Header = () => {
    const [subs, setSubs] = useState([{}]);
    const [scrollTop, setScrollTop] = useState(0);

    const global = useContext(AppContext);

    const navigate = useNavigate();

    useEffect(() => {
        console.log(global.currSub)
    }, [])

    useEffect(() => {
        if(global.userID){
            getUserSubjects()
                .then(result => {
                    setSubs(result);

                    console.log(result)
                    console.log(global.currSub)

                    if(!global.currSub || result.filter(sub => sub.id === global.currSub.id).length === 0){
                        global.setCurrSub(result.sort((a, b) => a.name.localeCompare(b.name))[0]);
                        console.log("Nok", global.currSub)
                    } else {
                        // Fresh row from the server (e.g. the unit saved on Profile),
                        // not the copy kept in localStorage.
                        global.setCurrSub(result.find(sub => sub.id === global.currSub.id));
                    }

                    
                    // if(result.length !== 0)
                    //     navigate('/track')
                })
                
            getUserExam()
                .then(result => {
                    
                    if (Array.isArray(result) && result[0]) global.setCurrExam(result[0].default_exam);

                })
        }
    }, [global.userID]);

    useEffect(() => {
        if(global.userSubs) {
            console.log(global.userSubs, global.examSubs)

            console.log("changed subs")
            setSubs(global.userSubs.filter(sub => global.examSubs.some(examSub => examSub.id === sub.id)))
    
            if(global.userSubs.length > 0 && (!global.currSub || global.userSubs.filter(sub => sub.id === global.currSub.id).length === 0)){
                console.log(">>>", global.userSubs.sort((a, b) => a.name.localeCompare(b.name))[0])
                global.setCurrSub(global.userSubs.sort((a, b) => a.name.localeCompare(b.name))[0]);
            } else if(global.userSubs.length > 0 && global.currSub) {
                global.setCurrSub(global.userSubs.find(sub => sub.id === global.currSub.id))
            }

        }

    }, [global.userSubs, global.currExam, global.examSubs])

    // The unit is chosen per subject on Profile (Unit 1 by default).
    useEffect(() => {
        global.setCurrUnit(subjectUnit(global.currSub));
    }, [global.currSub])

    useEffect(() => {

        const onScroll = () => setScrollTop(window.pageYOffset);
        // clean up code
        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);

    }, [])

    const handleSubDropdownChange = e => {
        navigate(window.location.pathname.match(/\/.*?(?=\/|$)/g)[0]);
        global.setCurrSub(subs.find(sub => sub.id === parseInt(e.target.value)))
    }

    return (
        <div className={`header tooltip ${scrollTop === 0 ? "top" : ""}`} style={{visibility: (global.userID ? "visible" : "hidden")}} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
            <div className="header-content">
                
                <h1 key={global.pageTitle ? global.pageTitle : ""} className="page-title">{(global.pageTitle ? global.pageTitle : "")}</h1>
                <form style={{padding: 10, justifySelf: "end", marginRight: "7%", flex: "0 0 auto"}}>
                    <span style={{width: "30px", display: "inline-block"}}>
                        <FontAwesomeIcon style={{paddingLeft: "14px"}} icon={global.currSub && global.currSub.fa_icon ? global.currSub.fa_icon : ""} />
                    </span>
                    <select className="sub-select header-dropdown dropdown" value={global.currSub ? global.currSub.id : ""} style={{margin: "5px 0px 0px 5px"}} onChange={e => handleSubDropdownChange(e)}>
                        {subs.map(sub => (
                            <option key={parseInt(sub.id)} value={sub.id}>{sub.name}</option>
                        ))} 
                    </select> 
                </form>

            </div>
            <SingleProgress height="4px" width={(window.location.pathname.includes("/tasks") ? "100%" : "0")} position="absolute" value={global.singleProgressValue} />
                
        </div>
    )
}

export default Header