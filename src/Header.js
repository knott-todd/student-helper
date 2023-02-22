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
        console.log(global.currSub)
    }, [])

    useEffect(() => {
        if(global.userID){
            getUserSubjects(global.userID)
                .then(result => {
                    setSubs(result);

                    console.log(result)
                    console.log(global.currSub)

                    if(!global.currSub || result.filter(sub => sub.id === global.currSub.id).length === 0){
                        global.setCurrSub(result.sort((a, b) => a.name.localeCompare(b.name))[0]);
                        console.log("Nok", global.currSub)
                    } else console.log("SOk")

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
        if(global.userSubs) {
            console.log(global.userSubs)

            console.log("changed subs")
            setSubs(global.userSubs)
    
            if(global.userSubs.length > 0 && (!global.currSub || global.userSubs.filter(sub => sub.id === global.currSub.id).length === 0)){
                console.log(">>>", global.userSubs.sort((a, b) => a.name.localeCompare(b.name))[0])
                global.setCurrSub(global.userSubs.sort((a, b) => a.name.localeCompare(b.name))[0]);
            }

        }

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