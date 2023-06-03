import React, { useContext } from "react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { getPaperQuestions, getPastpaper } from "./services/SQLService";
import { Link } from "react-router-dom";
import ObjectiveSetter from "./ObjectiveSetter";
import StructureParser from "./StructureParser";
import {AppContext} from "./AppContext";
import './CSS/MCQUserInterface.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MCQUserInterface = (props) => {

    const [paper, setPaper] = useState({});
    
    const [quests, setQuests] = useState([]);
    const [questIndex, setQuestIndex] = useState(0);

    const [userAnswers, setUserAnswers] = useState([]);

    const [isUserDoneMCQ, setIsUserDoneMCQ] = useState(false);

    const [isEditTopics, setIsEditTopics] = useState(false);
    const [isEditStructure, setIsEditStructure] = useState(false);

    const global = useContext(AppContext);

    const navigateQues = (e, i) => {

        e.preventDefault();

        if(questIndex + i < quests.length && questIndex + i >= 0)
            setQuestIndex(questIndex + i);

        // Reset MCQ options
        const mcqs = document.getElementsByClassName("answered");


    }

    useEffect(() => {
        console.log(props.paperID)

        getPaperQuestions(props.paperID, global.userID).then(result => {
            if(typeof result[0] !== 'undefined'){
                // setQuests(result);
                setQuests(result.sort((a, b) => {
                    if (a.num !== b.num) return a.num - b.num
                    // if (a.sub_letter !== b.sub_letter) return a.sub_letter.localeCompare(b.sub_letter)
                    // if (a.sub_sub_roman !== b.sub_sub_roman) return romanToNum(a.sub_sub_roman) - romanToNum(b.sub_sub_roman)
                    // if (a.sub_sub_sub_letter !== b.sub_sub_sub_letter) return a.sub_sub_sub_letter.localeCompare(b.sub_sub_sub_letter)
                }))

                setUserAnswers(new Array(result.length))

                console.log(result)
            }
        })

    }, []);

    useEffect(() => {

        const mcqs = document.getElementsByClassName("mcq");

        // Clear styling
        for (let i = 0; i < mcqs.length; i++) {
            mcqs[i].classList.remove("answered")
            mcqs[i].classList.remove("incorrect-mcq")
            mcqs[i].classList.remove("correct-mcq")
            mcqs[i].classList.remove("selected-mcq")
            mcqs[i].classList.remove("mcq-answer")
        }

        // Change buttons css to reflect answered state
        for (let i = 0; i < mcqs.length; i++) {

            if(userAnswers[questIndex]) {
            
                // Style selected answer
                if(mcqs[i].id === `mcq${userAnswers[questIndex]}`) {
    
                    if(isUserDoneMCQ) {
    
                        // Style as correct or incorrect
                        if (quests[questIndex].answer.split("|").includes(userAnswers[questIndex])) {
        
                            mcqs[i].classList.add('correct-mcq')
    
                        } else {
    
                            mcqs[i].classList.add('incorrect-mcq')
    
                        }
    
                    } else {
    
                        // Style as selected
                        mcqs[i].classList.add('selected-mcq')
    
                    }
                    
    
    
                }

            }

            // Style correct answer
            if(isUserDoneMCQ && quests[questIndex].answer.split("|").map(ans => `mcq${ans}`).includes(mcqs[i].id)) {
                mcqs[i].classList.add('mcq-answer');
            }
        }

    }, [userAnswers[questIndex], questIndex, isUserDoneMCQ])

    const handleMCQOptionSelect = (e, userAns) => {
        e.preventDefault()

        // Update local answers
        let tempAnswers = [...userAnswers];

        // Toggle selected: if defined already then deselect, select otherwise
        if(tempAnswers[questIndex] === userAns) {

            tempAnswers[questIndex] = undefined;

        } else {

            tempAnswers[questIndex] = userAns;

        }
        setUserAnswers(tempAnswers)

        // Auto increment question
        if(questIndex < quests.length-1)
            setQuestIndex(questIndex + 1);

    }

    const handleDoneMCQ = e => {

        e.preventDefault();

        setIsUserDoneMCQ(!isUserDoneMCQ);

    }

    return (
        <div className="mcq-user-interface" style={{marginTop: "10px"}}>
            

            {quests[questIndex] && quests[questIndex].num ? (
                
                <div>

                    <select className="mcq-num-select" value={questIndex} onChange={e => setQuestIndex(parseInt(e.target.value))} >
                        {quests.map((quest, i) =>(
                            <option key={i} value={i}>{quest.num}</option>
                        ))}
                    </select>

                    <form>

                        <div style={{margin: "10px 0px", display: "grid", gridTemplateColumns: "1fr 3fr 1fr", alignItems: "center", justifyItems: "center"}}>

                            <button className={`nav-left mcq-nav ${questIndex === 0 ? "disabled" : ""}`} disabled={questIndex === 0} onClick={e => navigateQues(e, -1)}><FontAwesomeIcon icon="angle-left" /></button>
                            
                            <div style={{display: 'grid', verticalAlign: "middle", gridTemplateColumns: "1fr 1fr", gap: "6px"}}>
                                
                                <button id="mcqA" disabled={isUserDoneMCQ} className="mcq" onClick={e => handleMCQOptionSelect(e, "A")}>A</button>
                                <button id="mcqB" disabled={isUserDoneMCQ} className="mcq" onClick={e => handleMCQOptionSelect(e, "B")}>B</button>
                                <button id="mcqC" disabled={isUserDoneMCQ} className="mcq" onClick={e => handleMCQOptionSelect(e, "C")}>C</button>
                                <button id="mcqD" disabled={isUserDoneMCQ} className="mcq" onClick={e => handleMCQOptionSelect(e, "D")}>D</button>

                            </div>

                            <button className={`nav-right mcq-nav ${questIndex === quests.length - 1 ? "disabled" : ""}`} disabled={questIndex === quests.length - 1} onClick={e => navigateQues(e, 1)}><FontAwesomeIcon icon="angle-right" /></button>

                        </div>

                    </form>
                </div>

            ): ""}

            {quests.length > 0 && !quests.every(quest => quest.answer === null) ? <button style={{backgroundColor: "transparent", color: "var(--primary-text-color)", fontSize: "medium"}} onClick={handleDoneMCQ}>{!isUserDoneMCQ ? "Show Answers" : "Hide Answers"}</button> : ""}
            
            <p style={{fontSize: "smaller", opacity: "var(--faded-opacity)"}}>Note: MCQ inputs aren't saved.</p>
        </div>
    )
}

export default MCQUserInterface