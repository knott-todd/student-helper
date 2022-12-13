import { useState, useEffect, useContext } from "react";
import { getPaperQuestions, getPastpapers } from "./services/SQLService";
import { Route, Routes, Router, Link } from "react-router-dom";
import './CSS/global.css';
import './CSS/Test.css';
import {AppContext} from "./AppContext";
import Questions from "./Questions";


const Test = () => {
    const [papers, setPapers] = useState([]);

    const sqlUrl = "http://localhost:3080";

    const global = useContext(AppContext);


    useEffect(() => {
        console.log(typeof global.currSub)
        
        if(global.currSub && global.currSub.id) {

            getPastpapers(global.currSub.id, global.currUnit, global.userID)
            .then(result => {
                for (const [i, paper] of result.entries()) {
                    getPaperQuestions(paper.id, global.userID)
                    .then(res2 => {
                        paper.areTopicsLinked = res2.length > 0 && res2.every(quest => quest.topic !== null)
                    })
                }

                setPapers(result)
            })
        }

    }, [global.currSub, global.currUnit]);

    
    useEffect(() => {
        
        if(global.currSub && global.currSub.id) {

            getPastpapers(global.currSub.id, global.currUnit, global.userID)
            .then(result => {
                for (const [i, paper] of result.entries()) {
                    getPaperQuestions(paper.id, global.userID)
                    .then(res2 => {
                        paper.areTopicsLinked = res2.length > 0 && res2.every(quest => quest.topic !== null)
                        paper.areAnyTopicsLinked = res2.length > 0 && res2.find(quest => quest.topic !== null)

                        if(i === result.length-1){
                            setPapers(result)
                        }
                    })
                }
            })
        }

    }, [global.currSub, global.currUnit]);

    return (
        <div className="Test">

            <h1 className="page-title">Test</h1>
            <div className="pastpapers list-container body-div">
                {papers.sort((a, b) => a.year.substring(0, 4) - b.year.substring(0, 4)).reverse().sort((a, b) => Number(a.is_complete) - Number(b.is_complete)).map(paper => (
                    <Link to={`pastpaper/${paper.id}`} className={`list-link test-paper ${paper.is_complete ? "complete" : ""}`} key={paper.id} >
                        
                        <div style={{display: "block"}}>
                            <h2 className="paper-year-head" style={{display: "inline-block", paddingTop: 10, margin: 0}}>{paper.year}</h2>
                            <div className="badges-wrapper">
                                <p className={`badge topic-badge ${paper.areTopicsLinked ? "badge-enabled" : (paper.areAnyTopicsLinked ? "badge-semi" : "badge-disabled")}`}>T</p>
                            </div>
                        </div>
                        
                        <p style={{display: "block", paddingBottom: 10, margin: 0}}>{paper.is_complete ? "Completed" : "Not Completed"}</p>
                        <div className="whats-inside">
                            <p style={{fontWeight: "bold", margin: 0}}>What's inside:</p>
                            <div className="topic-preview-wrapper">
                                {paper.topics.map((topic, i) => (
                                    <p className="paper-topic-preview" style={{paddingBottom: (i === paper.topics.length - 1 ? "20px" : "0px")}}>
                                        {topic.name}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Test;