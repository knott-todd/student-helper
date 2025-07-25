import React, { useContext } from "react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { addMCQs, getPaperQuestions, getPastpaper } from "../../services/SQLService";
import { Link } from "react-router-dom";
import ObjectiveSetter from "../data_processing/ObjectiveSetter";
import StructureParser from "../data_processing/StructureParser";
import {AppContext} from "../../AppContext";
import MCQUserInterface from "../../MCQUserInterface";
import "../../CSS/Pastpaper.css";

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

    useEffect(() => {

        if(paper.id) {

            getPaperQuestions(id, global.userID)
            .then(result => {
                if(typeof result[0] !== 'undefined'){
                    
                    setQuests(result)
    
                } else if(paper.num === "1") {

                    addMCQs(paper.id, (global.currExam === 2 ? 60 : 45))
                        .then(() => {
                            getPaperQuestions(id, global.userID)
                            .then(res2 => {
                                if(typeof res2[0] !== 'undefined'){
                    
                                    setQuests(res2)
                    
                                }
                            })
                        })

                }
            })

        }

    }, [paper])

    return (
        <div className="pastpaper body-div">

            <div className={isEditTopics || isEditStructure || (paper.num === "1" && quests.length > 0) ? "split-paper" : ""}>
                <iframe src={paper.pdf_link} width="99%" height="100%" style={{height: "69vh"}}></iframe>

                <div className="editor-wrapper">

                    {global.userID === 150 ? (
                        <>
                            Edit Topics
                            <input type="checkbox" onChange={e => {setIsEditTopics(e.target.checked)}}/>
                
                            Edit Structure
                            <input type="checkbox" onChange={e => {setIsEditStructure(e.target.checked)}}/>
                        </>
                    ) : ""}
                    
                    {isEditTopics ? <ObjectiveSetter paperID={id} unit={paper.unit}/> : ""}
                    {isEditStructure ? <StructureParser paperID={id} /> : ""}

                    {paper.num === "1" && quests.length > 0 ? (
                        <MCQUserInterface paperID={paper.id} />
                    ) : ""}

                </div>

            </div>

            <Link style={{display: "block"}} to={paper.markscheme_link ? (`/test/markscheme/${paper.id}`) : (`/test/questions/${paper.id}`)}>
                Continue
            </Link>
        </div>
    )
}

export default Pastpaper