import { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {AppContext} from "./AppContext";
import './CSS/Navbar.css'
import './CSS/global.css'
import {TfiWrite} from 'react-icons/tfi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navbar = () => {

    const location = useLocation();
    const nav = useNavigate();

    const global = useContext(AppContext);

    const [currSection, setCurrSection] = useState(window.location.pathname);
    const [currPage, setCurrPage] = useState(window.location.pathname);
    const [prevPage, setPrevPage] = useState("");

    useEffect(() => {

        setCurrSection(location.pathname);
        
    }, [location])

    return (
        <div className="navbar">
            <nav>
                <div style={{display: (global.userID ? "inline-block" : "none")}}>
                    <a onClick={() => nav(-1)}><FontAwesomeIcon icon="arrow-left" /></a>
                    
                    <NavLink to="/test" currSection={currSection} onChange={setCurrSection} icon="file-pen" />
                    <NavLink to="/track" currSection={currSection} onChange={setCurrSection} icon="bars-progress" />
                    {global.userID === 1 ? <NavLink to="/insert_objective" currSection={currSection} onChange={setCurrSection} text="Insert" icon="folder-plus" /> : ""}
                </div>
                <div style={{display: "inline-block"}}>
                    <NavLink to="/sign_in" currSection={currSection} onChange={setCurrSection} text={global.userID ? "Profile" : "Sign In"} icon="user" />
                </div>
                
            </nav>
        </div>
    )
}

const NavLink = (props) => {

    return (
        <Link to={props.to} onClick={e => props.onChange(e.target.pathname)} className={props.currSection && props.currSection.substring(0, props.to.length) === props.to ? "current" : ""}>
            {props.icon ? <FontAwesomeIcon icon={props.icon} /> : (props.text ? props.text : props.to.substring(1).charAt(0).toUpperCase() + props.to.slice(2))}
            <br />
            <p>{props.text ? props.text : props.to.substring(1).charAt(0).toUpperCase() + props.to.slice(2)}</p>
        </Link>
    )
}

export default Navbar;