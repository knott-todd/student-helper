import { useContext } from "react";
import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { getFamiliarities, updateUserQuestion } from "./services/SQLService";

const FamiliarityDropdown = props => {
    const [fams, setFams] = useState([]);

    const global = useContext(AppContext);

    useEffect(() => {

        console.log(props.question)

        getFamiliarities().then(result => {
            setFams(result);
        })

    }, []);

    const globalOnChange = e => {
        if(e.target.value !== ""){
            const newValue = parseInt(e.target.value);

            props.question.is_complete = true;
            console.log("PHAT", props.question)

            let tempQuests = [...props.questions.quests];
            let tempQuest = {...tempQuests.find(quest => quest.id === props.question.id), familiarity: newValue}
            tempQuests[tempQuests.findIndex(quest => quest.id === props.question.id)] = tempQuest;

            console.log(tempQuests[tempQuests.findIndex(quest => quest.id === props.question.id)])
    
            props.questions.setQuests(tempQuests);
            updateUserQuestion(tempQuests.find(quest => quest.id === props.question.id), global.userID)
            .then(result => {
                console.log("Question updated: ", result)
            })

        }

        props.onChange(e, props.id)
    }

    return (
        <label style={{padding: 10}}>
            Familiarity  
            <select value={props.question.familiarity} /* disabled={!props.question.is_complete} */ style={{margin: "10px 10px 10px 5px"}} onChange={e => globalOnChange(e)}>
                {fams.map(fam => (
                    <option key={fam.id} value={fam.id}>{fam.name}</option>
                ))}
            </select> 
        </label>
    )
}

export default FamiliarityDropdown;