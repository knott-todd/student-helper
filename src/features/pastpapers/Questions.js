import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom"
import { getPaperQuestions, updateUserQuestion } from "../../services/SQLService";
import FamiliarityDropdown from "../../FamiliarityDropdown";
import CompleteCheckbox from "../../CompleteCheckbox";
import {AppContext} from "../../AppContext";
import './CSS/Questions.css';
import './CSS/global.css'

const Questions = () => {
    const {id} = useParams();
    const [quests, setQuests] = useState([]);
    const [ordered, setOrdered] = useState([]);

    const global = useContext(AppContext);

    useEffect(() => {

        getPaperQuestions(id, global.userID).then(result => {
            setQuests(result);

        })

    }, []);

    function romanToNum(roman) {
        if (roman === "")           return 0;
        if (roman.startsWith("x"))  return 10 + romanToNum(roman.substr(1));
        if (roman.startsWith("ix")) return 9  + romanToNum(roman.substr(2));
        if (roman.startsWith("v"))  return 5  + romanToNum(roman.substr(1));
        if (roman.startsWith("iv")) return 4  + romanToNum(roman.substr(2));
        if (roman.startsWith("i"))  return 1  + romanToNum(roman.substr(1));
        return 0;
    }

    useEffect(() => {
        const restructured = [];

            const nums = [...new Set(quests.map(q => q.num))];
            nums.sort((a,b) => a - b).forEach(num => {

                const letters = [...new Set(quests.filter(q => q.num === num).map(q => q.sub_letter))];

                restructured.push({num, letters: []})

                letters.sort((a,b) => a.localeCompare(b)).forEach(letter => {

                    restructured.find(q => q.num === num).letters.push({letter, romans:[]})

                    const romans = [...new Set(quests.filter(q => q.num === num && q.sub_letter === letter).map(q => q.sub_sub_roman))]

                    romans.sort((a,b) => romanToNum(a) - romanToNum(b)).forEach(roman => {

                        restructured.find(q => q.num === num).letters.find(l => l.letter === letter).romans.push({roman, subLetters:[]})

                        const subLetters = [...new Set(quests.filter(q => q.num === num && q.sub_letter === letter && q.sub_sub_roman === roman).map(q => q.sub_sub_sub_letter))]

                        subLetters.sort((a,b) => a.localeCompare(b)).forEach(subLetter => {
                            
                            const row = quests.find(q => q.num === num && q.sub_letter === letter && q.sub_sub_roman === roman && q.sub_sub_sub_letter === subLetter);
                            restructured.find(q => q.num === num).letters.find(l => l.letter === letter).romans.find(r => r.roman === roman).subLetters.push({subLetter, info: row.info, is_complete: row.is_complete, id: row.id, i: quests.indexOf(row), objectiveID: row.objective_id, familiarity: row.familiarity});

                        })

                    })

                })

            })

            for (const q of restructured) {

                for (const letter of q.letters){
                    
                    for (const roman of letter.romans) {
                        roman.is_complete = roman.subLetters.every(subLetter => subLetter.is_complete);
                    }

                    letter.is_complete = letter.romans.every(roman => roman.is_complete);
                }

                q.is_complete = q.letters.every(letter => letter.is_complete);

            }

            setOrdered(restructured);
            console.log(quests, restructured);
    }, [quests]);

    const onDropdownChange = (e, id) => {
        // const newValue = parseInt(e.target.value);

        // let tempQuests = [...quests];
        // let tempQuest = {...tempQuests.find(quest => quest.id === id), familiarity: newValue}
        // tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        // setQuests(tempQuests);
        // updateUserQuestion(tempQuests.find(quest => quest.id === id), global.userID)
        // .then(result => {
        //     console.log("Question updated: ", result)
        // })
    }

    const onCheckboxChange = (e, id) => {
        const newValue = e.target.checked;
        console.log(newValue)

        let tempQuests = [...quests];
        let tempQuest = {...tempQuests.find(quest => quest.id === id), is_complete: newValue}
        tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        setQuests(tempQuests);
        updateUserQuestion(tempQuests.find(quest => quest.id === id), global.userID);
    }

    const onParentCheckboxChange = (e, id) => {
        const newValue = e.target.checked;

        let tempQuests = [...quests];
        let tempOrdered = [...ordered];
        
        if(id.subLetter) {

            tempQuests.filter(quest => quest.num === id.num && quest.sub_letter === id.letter && quest.sub_sub_roman === id.roman && quest.sub_sub_sub_letter === id.subLetter).forEach(quest => {
                quest.is_complete = newValue;

                updateUserQuestion(quest, global.userID)
            })

            setQuests(tempQuests);

        } else if(id.roman) {

            tempQuests.filter(quest => quest.num === id.num && quest.sub_letter === id.letter && quest.sub_sub_roman === id.roman).forEach(quest => {
                quest.is_complete = newValue;

                updateUserQuestion(quest, global.userID)
            })

            setQuests(tempQuests);
            
        } else if(id.letter) {

            tempQuests.filter(quest => quest.num === id.num && quest.sub_letter === id.letter).forEach(quest => {
                quest.is_complete = newValue;

                updateUserQuestion(quest, global.userID)
            })

            setQuests(tempQuests);

        } else if(id.num) {

            tempQuests.filter(quest => quest.num === id.num).forEach(quest => {
                quest.is_complete = newValue;

                updateUserQuestion(quest, global.userID)
            })

            setQuests(tempQuests);
        }

    }

    return (
        <div className="body-div">
            <div className="questions">
                {ordered.map((q, qi) => (
                    q.letters.map((l, li) => (
                        l.romans.map((r, ri) => (
                            r.subLetters.map((s, si) => (
                                <div key={s.id} className="list-item question">
                                    
                                    {(li === 0 && ri === 0 && si === 0) ? (
                                        <p style={{display: "inline", padding: 2, fontWeight: "bold"}}>
                                            <CompleteCheckbox question={q} id={{num: q.num}} onChange={onParentCheckboxChange} />
                                            {q.num}.
                                        </p>
                                    ) : null}
                                    {(l.letter && ri === 0 && si === 0) ? (
                                        <p style={{display: "inline", padding: 2, fontWeight: "bold"}}>
                                            <CompleteCheckbox question={l} id={{num: q.num, letter: l.letter}} onChange={onParentCheckboxChange} />
                                            {l.letter})
                                        </p>
                                    ) : null}
                                    {(r.roman && si === 0) ? (
                                        <p style={{display: "inline", padding: 2, fontWeight: "bold"}}>
                                            <CompleteCheckbox question={r} id={{num: q.num, letter: l.letter, roman: r.roman}} onChange={onParentCheckboxChange} />
                                            {r.roman})
                                        </p>
                                    ) : null}
                                    {s.subLetter ? (
                                        <p style={{display: "inline", padding: 2, fontWeight: "bold"}}>
                                            <CompleteCheckbox question={s} id={{num: q.num, letter: l.letter, roman: r.roman, subLetter: s.subLetter}} onChange={onParentCheckboxChange} />
                                            {s.subLetter})
                                        </p>
                                    ) : null}

                                    {/* <Link to={`/objective_questions/${s.objectiveID}`} style={{display: "inline-block"}}>
                                        {s.info}
                                    </Link> */}

                                    {/* <br /> */}

                                    {/* <CompleteCheckbox question={s} id={s.id} onChange={onCheckboxChange} /> */}

                                    <FamiliarityDropdown question={s} questions={{quests, setQuests}} id={s.id} onChange = {onDropdownChange} />
                                </div>
                            ))
                                
                        ))
                            
                    ))
                ))}

            </div>
            


            {/* {quests.map((question, i) => (
                <div key={question.id} style={{padding: 10, margin: 3}}>

                    <p style={{display: "inline", padding: 2}}>{question.num}.</p>
                    {question.sub_letter ? (<p style={{display: "inline", padding: 2}}>{question.sub_letter})</p>) : null}
                    {question.sub_sub_roman ? (<p style={{display: "inline", padding: 2}}>{question.sub_sub_roman})</p>) : null}
                    {question.sub_sub_sub_letter ? (<p style={{display: "inline", padding: 2}}>{question.sub_sub_sub_letter})</p>) : null}

                    <p style={{display: "inline-block"}}>
                        {question.info}
                    </p>

                    <br />

                    <CompleteCheckbox question={question} i={i} onChange={onCheckboxChange} />

                    <FamiliarityDropdown question={question} i={i} onChange = {onDropdownChange} />

                </div>
            ))} */}

            <Link to="/test">Done</Link>
        </div>
    )
}

export default Questions