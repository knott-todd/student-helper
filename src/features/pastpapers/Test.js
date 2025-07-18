import { useState, useEffect, useContext } from "react";
import { getPaperQuestions, getPastpapers, getUserSubject } from "../../services/SQLService";
import { Route, Routes, Router, Link } from "react-router-dom";
import '../../CSS/global.css';
import '../../CSS/Test.css';
import {AppContext} from "../../AppContext";
import Questions from "./Questions";
import SingleProgress from "../../SingleProgress";


const Test = () => {
    const [papers, setPapers] = useState([]);

    const sqlUrl = "http://localhost:3080";

    const global = useContext(AppContext);

    useEffect(() => {
        global.setPageTitle("Test");
    }, [])

    useEffect(() => {
        console.log( global.currSub, global.currExam)
        
        if(global.currSub && global.currSub.id && global.currExam) {

            getPastpapers(global.currSub.id, (global.currSub.exam ? global.currSub.exam : global.currExam), global.userID)
            .then(result => {
                console.log(result[0])

                setPapers(result)
            })
        }

    }, [global.currSub, global.currExam]);

    const badges = [
        {
            icon: "T",
            enabledCondition: "areTopicsLinked",
            description: "All topics linked"
        },
        {
            icon: "T",
            semiCondition: "areAnyTopicsLinked",
            description: "Some topics linked"
        },
        {
            icon: "Q",
            enabledCondition: "areQuestionsOutlined",
            description: "Questions outlined"
        }
    ]

    return (
        <div className="Test">

            {/* <h1 className="page-title">Test</h1> */}
            <div className="body-div">
                <div className="test-top">

                    <div className="badge-key">
                        {badges.map(badge => (
                            <span style={{paddingRight: "10px", cursor: "default"}}>
                                <p style={{display: "inline"}} className={`badge topic-badge ${badge.enabledCondition ? "badge-enabled" : (badge.semiCondition ? "badge-semi" : "badge-disabled")}`}>
                                    {badge.icon} <span style={{fontWeight: 300, opacity: 1}}>{badge.description}</span>
                                </p>
                            </span>
                        ))}
                    </div>

                    <label>
                        Paper

                        <select className="dropdown" value={global.paperType} style={{marginLeft: "5px"}} onChange={e => global.setPaperType(e.target.value)}>
                            <option key={1} value={1}>{1}</option>
                            <option key={2} value={2}>{2}</option>
                        </select> 
                    </label>

                </div>

                {papers.filter(paper => paper.num === global.paperType.toString()).length > 0 ? (
                    <div className="pastpapers list-container">
                        {papers
                            .filter(paper => paper.num === global.paperType.toString())
                            .sort((a, b) => b.year.match(/\d{4}/)[0] - a.year.match(/\d{4}/)[0])
                            .sort((a,b) => Number(b.areTopicsLinked) - Number(a.areTopicsLinked))
                            .sort((a,b) => Number(b.areAnyTopicsLinked) - Number(a.areAnyTopicsLinked))
                            .sort((a, b) => Number(a.is_complete) - Number(b.is_complete))
                            .map(paper => (
                            <Link to={`pastpaper/${paper.id}`} className={`list-link test-paper ${paper.is_complete ? "complete" : ""}`} key={paper.id} >
                                
                                <div className="head-badge-wrapper" style={{display: "block"}}>
                                    <h2 className="paper-year-head" style={{display: "inline-block", verticalAlign: "top", margin: 0}}>{paper.year}</h2>
                                    <div className="badges-wrapper">
                                        {Array(badges.find(badge => (paper[badge.semiCondition] || paper[badge.enabledCondition]) ) || {}).map(badge => (
                                            <p className={`badge topic-badge ${paper[badge.enabledCondition] ? "badge-enabled" : (paper[badge.semiCondition] ? "badge-semi" : "badge-disabled")}`}>{badge.icon}</p>
                                        ))}
                                        {/* <p className={`badge topic-badge ${paper.areTopicsLinked ? "badge-enabled" : (paper.areAnyTopicsLinked ? "badge-semi" : "badge-disabled")}`}>T</p>
                                        <p className={`badge topic-badge ${paper.areQuestionsOutlined && !paper.areAnyTopicsLinked ? "badge-enabled" : "badge-disabled"}`}>Q</p>                                 */}
                                    </div>
                                </div>
                                
                                <SingleProgress value={paper.completeAmount} />
                                {/* <p style={{display: "block", paddingBottom: 10, margin: 0}}>{paper.is_complete ? "Completed" : "Not Completed"}</p> */}

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
                ) : (
                    global.currSub ? (<p className="no-content-text">Sorry! We don't have any {global.currSub.name} P{global.paperType}'s yet.</p>) : ""
                )}
                
                
            </div>
        </div>
    )
}

export default Test;