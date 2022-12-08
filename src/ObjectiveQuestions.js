import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getObjective, getObjectiveQuestions, updateUserQuestion } from "./services/SQLService";
import FamiliarityDropdown from "./FamiliarityDropdown";
import CompleteCheckbox from "./CompleteCheckbox";
import './CSS/global.css'
import './CSS/ObjectiveQuestions.css'
import { AppContext } from "./AppContext";

const ObjectiveQuestions = () => {
    const {id} = useParams();

    const [quests, setQuests] = useState([]);
    const [objective, setObjective] = useState({});

    const global = useContext(AppContext);

    const onDropdownChange = (e, id) => {
        const newValue = parseInt(e.target.value);

        let tempQuests = [...quests];
        let tempQuest = {...tempQuests.find(quest => quest.id === id), familiarity: newValue}
        tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        setQuests(tempQuests);
        updateUserQuestion(tempQuests.find(quest => quest.id === id));
    }

    const onCheckboxChange = (e, id) => {
        const newValue = e.target.checked;
        console.log(newValue)

        let tempQuests = [...quests];
        let tempQuest = {...tempQuests.find(quest => quest.id === id), is_complete: newValue}
        tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        setQuests(tempQuests);
        updateUserQuestion(tempQuests.find(quest => quest.id === id));
    }
    
    useEffect(() => {
        getObjectiveQuestions(id, global.userID).then(result => {
            console.log(result)
            setQuests(result);
        });

        getObjective(id, global.userID).then(result => {
            setObjective(result)
        });
    }, []);

    useEffect(() => {
        
        getObjective(id, global.userID).then(result => {
            setObjective(result)
        });

    }, [quests]);

    return (
        <div className="objective-questions body-div">
            <h1>{objective.info}</h1>
            <h4>Familiarity: {(objective.familiarity * 100).toFixed(2)}%</h4>

            <h2>
                Appears in:
            </h2>

            {quests.map((question, i) => (
                <div key={question.id} style={{display: "block", padding: 10}}>
                    <Link className="paper-link list-item" to={`/pastpaper/${question.paper_id}`} style={{display: "inline", margin: 10}}>Paper: {question.year}</Link>

                    <p style={{display: "inline", padding: 2}}>{question.num}.</p>
                    {question.sub_letter ? (<p style={{display: "inline", padding: 2}}>{question.sub_letter})</p>) : null}
                    {question.sub_sub_roman ? (<p style={{display: "inline", padding: 2}}>{question.sub_sub_roman})</p>) : null}
                    {question.sub_sub_sub_letter ? (<p style={{display: "inline", padding: 2}}>{question.sub_sub_sub_letter})</p>) : null}

                    <FamiliarityDropdown question={question} id={question.id} onChange = {onDropdownChange} />

                    <CompleteCheckbox question={question} id={question.id} onChange={onCheckboxChange} />
                </div>
            ))}

        </div>
    )
}

export default ObjectiveQuestions;