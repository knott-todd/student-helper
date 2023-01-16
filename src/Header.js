import { useContext, useEffect, useState } from "react"
import {AppContext} from "./AppContext";
import { getSubjects, getUserExam, getUserSubjects } from "./services/SQLService";
import './CSS/Header.css'
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = () => {
    const [subs, setSubs] = useState([{}]);

    const units = [1, 2];

    const global = useContext(AppContext);

    const navigate = useNavigate();



    useEffect(() => {
        if(global.userID){
            getUserSubjects(global.userID)
                .then(result => {
                    setSubs(result);

                    global.setCurrSub(result[0]);
                    global.setCurrUnit(units[0]);
                    
                    // if(result.length !== 0)
                    //     navigate('/track')
                })
                
            getUserExam(global.userID)
                .then(result => {
                    
                    global.setCurrExam(result[0].default_exam);

                })
        }
    }, [global.userID]);

    useEffect(() => {
        console.log("changed subs")
        setSubs(global.userSubs)

        global.setCurrSub(global.userSubs[0]);

        console.log(global.currSub)
    }, [global.userSubs])

    return (
        <div className="header" style={{visibility: (global.userID ? "visible" : "hidden")}}>
            <form style={{padding: 10}}>
                <span style={{width: "30px", display: "inline-block"}}>
                    <FontAwesomeIcon style={{paddingLeft: "14px"}} icon={global.currSub && global.currSub.fa_icon ? global.currSub.fa_icon : ""} />
                </span>
                <select className="sub-select header-dropdown" value={global.currSub ? global.currSub.id : ""} style={{margin: "10px 10px 10px 5px"}} onChange={e => global.setCurrSub(subs.find(sub => sub.id === parseInt(e.target.value)))}>
                    {subs.map(sub => (
                        <option key={parseInt(sub.id)} value={sub.id}>{sub.name}</option>
                    ))} 
                </select> 
                {/* <select className="unit-select header-dropdown" value={global.currUnit} style={{margin: "10px 10px 10px 5px"}} onChange={e => global.setCurrUnit(units.find(unit => unit === parseInt(e.target.value)))}>
                    {units.map(unit => (
                        <option key={parseInt(unit)} value={unit}>Unit {unit}</option>
                    ))} 
                </select> */}
            </form>
        </div>
    )
}

export default Header