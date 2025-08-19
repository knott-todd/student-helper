import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {AppContext} from "../AppContext";
import '../CSS/Navbar.css'
import '../CSS/global.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "@/features/auth/UserContext";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const Navbar = () => {

    const location = useLocation();
    const nav = useNavigate();

    // const { currExam } = useContext(AppContext) || { currExam: 1 };
    const currExam = 1;
    const { user, loading, error } = useUser();

    const [currSection, setCurrSection] = useState(window.location.pathname);

    useEffect(() => {

        setCurrSection(location.pathname);
        
    }, [location])

    return (
        loading ? <div>Loading user data...</div> :
        <div className="navbar">
            <nav>
                <div style={{display: (user?.user_id && currExam ? "inline-flex" : "none"), alignItems: "center"}}>
                    <a className="nav-back" onClick={() => nav(-1)}><FontAwesomeIcon icon="arrow-left" /></a>
                    
                    <NavLink to='/tasks' currSection={currSection} onChange={setCurrSection} icon="list-check" />
                    <NavLink to="/test" currSection={currSection} onChange={setCurrSection} icon="file-pen" />
                    <NavLink to="/track" currSection={currSection} onChange={setCurrSection} icon="bars-progress" />
                    {user?.user_id === '150' ? <NavLink to="/insert_objective" currSection={currSection} onChange={setCurrSection} text="Insert" icon="folder-plus" /> : ""}
                </div>
                <div style={{display: "inline-block"}}>
                    <NavLink to="/sign_in" currSection={currSection} onChange={setCurrSection} text={user?.user_id ? "Profile" : "Sign In"} icon="user" />
                </div>
                
            </nav>
        </div>
    )
}

interface NavLinkProps {
    to: string;
    currSection: string;
    onChange: (pathname: string) => void;
    icon?: IconProp;
    text?: string;
}

const NavLink: React.FC<NavLinkProps> = (props) => {

    return (
        <Link to={props.to} onClick={e => props.onChange((e.target as HTMLAnchorElement).pathname)} className={props.currSection && props.currSection.substring(0, props.to.length) === props.to ? "current" : ""}>
            {props.icon ? <FontAwesomeIcon icon={props.icon} /> : (props.text ? props.text : props.to.substring(1).charAt(0).toUpperCase() + props.to.slice(2))}
            <br />
            <p>{props.text ? props.text : props.to.substring(1).charAt(0).toUpperCase() + props.to.slice(2)}</p>
        </Link>
    )
}

export default Navbar;