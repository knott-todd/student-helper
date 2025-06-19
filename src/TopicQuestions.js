import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTopic, getTopicQuestions, updateUserQuestion, getPastpaper, addQuizAttempt } from "./services/SQLService";
import FamiliarityDropdown from "./FamiliarityDropdown";
import CompleteCheckbox from "./CompleteCheckbox";
import {AppContext} from "./AppContext";
import './CSS/global.css'
import './CSS/TopicQuestions.css'

const TopicQuestions = () => {
    const {id} = useParams();

    const [quests, setQuests] = useState([]);
    const [topic, setTopic] = useState({});
    const [paper, setPaper] = useState({});
    const [quizId, setQuizId] = useState({});

    const navigate = useNavigate();

    const global = useContext(AppContext);

    const onDropdownChange = (e, id) => {
        const newValue = parseInt(e.target.value);

        let tempQuests = [...quests];
        let tempQuest = {...tempQuests.find(quest => quest.id === id), familiarity: newValue}
        tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        setQuests(tempQuests);
        updateUserQuestion(tempQuests.find(quest => quest.id === id), global.userID);
    }

    const onCheckboxChange = (e, id) => {
        const newValue = e.target.checked;
        console.log(newValue)

        // let tempQuests = [...quests];
        // let tempQuest = {...tempQuests[i], is_complete: newValue}
        // tempQuests[i] = tempQuest;

        // setQuests(tempQuests);
        // updateUserQuestion(tempQuests[i]);

        

        let tempQuests = [...quests];
        let tempQuest = {...tempQuests.find(quest => quest.id === id), is_complete: newValue}
        tempQuests[tempQuests.findIndex(quest => quest.id === id)] = tempQuest;

        setQuests(tempQuests);
        updateUserQuestion(tempQuests.find(quest => quest.id === id), global.userID);
    }
    
    useEffect(() => {
        getTopicQuestions(id, global.userID).then(result => {
            console.log("He")
            console.log(id, global.userID, result)
            setQuests(result);
            
        });

        getTopic(id, global.userID).then(result => {
            setTopic(result)
            global.setProgressValue(result.familiarity);
        });
    }, []);

    useEffect(() => {
        global.setPageTitle(topic.name);
    }, [topic.name])

    useEffect(() => {
        
        getTopic(id, global.userID).then(result => {
            setTopic(result)
        });

    }, [quests]);

    const handleCreateQuiz = async (userID, topicIDs) => {
        const {quizId,questions} = await addQuizAttempt(userID, topicIDs);
        
        setQuizId(quizId);
        navigate(`/quiz/${quizId}`, {state: {questions, topicIDs}});
    }

    const handleYearCollapse = paperID => {
        const currCollapse = document.getElementById(`collapse${paperID}`);
        const display = currCollapse.style.display;

        // Collapse all other years
        let collapse = document.getElementsByClassName("collapse-content");
        
        for(let coll of collapse) {
            coll.style.display = "none";
        };

        // Toggle year
        if (display == "block") {
            
            currCollapse.style.display = "none";

        } else {
            
            currCollapse.style.display = "block";

        }

        // Load Paper
        getPastpaper(paperID).then(result => {
            setPaper(result)
        })
    }

    return (
        <div className="body-div objective-questions">
            {/* <h1 className="page-title">{topic.name}</h1> */}
            {/* <h4>Familiarity: {(topic.familiarity * 100).toFixed(2)}%</h4> */}


            <button type="button" onClick={() => handleCreateQuiz(global.userID, [topic.id])} >
                Take Quiz
            </button>

            <h2>
                Appears in:
            </h2>

            {quests.filter((quest, i) => (quests.findIndex(_quest => (_quest.year == quest.year)) == i))
            .map((question) => (
                <div key={question.id}>
                    <button type="button" className="collapse-btn" onClick={() => handleYearCollapse(question.paper_id)}>{question.year}</button>
                    <div className="collapse-content" id={`collapse${question.paper_id}`}>
                        {quests.filter(quest => (quest.year === question.year))
                        .map((q, i) => (
                            <div key={q.id} style={{display: "block", padding: 10}}>
                                {/* <Link className="paper-link list-item" to={`/pastpaper/${q.paper_id}`} style={{display: "inline", margin: 10}}>Paper: {q.year}</Link> */}

                                <p style={{display: "inline", padding: 2}}>{q.num}.</p>
                                {q.sub_letter ? (<p style={{display: "inline", padding: 2}}>{q.sub_letter})</p>) : null}
                                {q.sub_sub_roman ? (<p style={{display: "inline", padding: 2}}>{q.sub_sub_roman})</p>) : null}
                                {q.sub_sub_sub_letter ? (<p style={{display: "inline", padding: 2}}>{q.sub_sub_sub_letter})</p>) : null}

                                <FamiliarityDropdown question={q} questions={{quests, setQuests}} id={q.id} onChange = {onDropdownChange} />

                                <CompleteCheckbox question={q} id={q.id} onChange={onCheckboxChange} />
                            </div>
                        ))}
                        <iframe src={paper.pdf_link} width="70%" height="700" />
                    </div>
                </div>
            ))}

        </div>
    )
}

export default TopicQuestions;