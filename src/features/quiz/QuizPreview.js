import { useQuizContext } from "./QuizContext";

const QuizPreview = () => {
    // get topics
    const { topics } = useQuizContext();

    // start quiz function
    const startQuiz = () => {
        // Go to the first question
    };

    return (
        <div className="quiz-preview">
            <h2>Get Ready for Your Quiz</h2>

            <p>10 questions on...</p>

            <div className="line"></div>

            {/* [list of topics] */}
            <ul>
                {topics.map((topic, index) => {
                    <li key={index}>{topic.name}</li>
                })}
            </ul>

            {/* Motivational blurb */}
            <p>You've got this — let's go!</p>

            {/* start quiz button */}
            <button type="button" onClick={() => startQuiz()}>
                Start Quiz
            </button>
        </div>
    );
}

export default QuizPreview;