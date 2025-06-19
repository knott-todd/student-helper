import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import FamiliarityDropdown from "./FamiliarityDropdown";
import CompleteCheckbox from "./CompleteCheckbox";

const Quiz = (props) => {
    
    const {id} = useParams();
    const location = useLocation();
    const {questions, topicIDs} = location.state || {};

    useEffect(() => {
        console.log(questions);
    }, [questions]);

    return (
        <div className="quiz-container">
            <h1>Quiz for Topic ID: {topicIDs[0]}</h1>
            {questions && questions.length > 0 ? (
                <>
                    {questions.map((q, i) => (
                        <div key={q.id} style={{display: "block", padding: 10}}>
                            {/* <Link className="paper-link list-item" to={`/pastpaper/${q.paper_id}`} style={{display: "inline", margin: 10}}>Paper: {q.year}</Link> */}

                            <p style={{display: "inline", padding: 2}}>{q.num}.</p>
                            {q.sub_letter ? (<p style={{display: "inline", padding: 2}}>{q.sub_letter})</p>) : null}
                            {q.sub_sub_roman ? (<p style={{display: "inline", padding: 2}}>{q.sub_sub_roman})</p>) : null}
                            {q.sub_sub_sub_letter ? (<p style={{display: "inline", padding: 2}}>{q.sub_sub_sub_letter})</p>) : null}

                        </div>
                    ))}
                </>
            ) : (
                <p>No questions available for this topic.</p>
            )}
        </div>
    );
}

export default Quiz;