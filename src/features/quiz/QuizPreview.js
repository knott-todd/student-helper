import { useQuizContext } from "../../contexts/QuizContext";

const QuizPreview = () => {
    // get topics
    const { topics } = useQuizContext();

    return (
        <div className="quiz-preview">
            {/* quiz on: */}
            <h2>Quiz On</h2>

            {/* [list of topics] */}
            <ul>
                {topics.map((topic, index) => {
                    <li key={index}>{topic.name}</li>
                })}
            </ul>

            {/* start quiz button */}
            <button type="button" onClick={() => startQuiz()}>
                Start Quiz
            </button>
        </div>
    );
}

export default QuizPreview;