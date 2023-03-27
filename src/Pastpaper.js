import React, { useContext } from "react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { getPaperQuestions, getPastpaper } from "./services/SQLService";
import { Link } from "react-router-dom";
import ObjectiveSetter from "./ObjectiveSetter";
import StructureParser from "./StructureParser";
import {AppContext} from "./AppContext";

const Pastpaper = () => {
    const {id} = useParams();

    const [paper, setPaper] = useState({});
    
    const [quests, setQuests] = useState([]);

    const [isEditTopics, setIsEditTopics] = useState(false);
    const [isEditStructure, setIsEditStructure] = useState(false);

    const global = useContext(AppContext);

    useEffect(() => {

        console.log("Ran")
        
        getPastpaper(id).then(result => {

            setPaper(result)

            console.log(result)
            
            global.setPageTitle(result.year);

        })
        
    }, []);

    return (
        <div className="pastpaper body-div" style={{height: "75vh"}}>

            <iframe src={paper.pdf_link} width="99%" height={(global.userID === 150 ? "350" : "100%")}></iframe>

            
            {global.userID === 150 ? (
                <>
                    Edit Topics
                    <input type="checkbox" onChange={e => {setIsEditTopics(e.target.checked)}}/>
        
                    Edit Structure
                    <input type="checkbox" onChange={e => {setIsEditStructure(e.target.checked)}}/>
                </>
            ) : ""}

            <Link style={{display: "block"}} to={paper.markscheme_link ? (`/test/markscheme/${paper.id}`) : (`/test/questions/${paper.id}`)}>
                Continue
            </Link>

            {isEditTopics ? <ObjectiveSetter paperID={id} unit={paper.unit}/> : null}
            {isEditStructure ? <StructureParser paperID={id} /> : null}
        </div>
    )
}

export default Pastpaper