const QuizSummary = ({ id }) => {
    const quiz = {
        score: 90,
        reviewBlurb: "Great job — almost there. Let’s aim for that perfect 10!",
        topics: [
            { name: "Simple Harmonic Motion", delta: 15, score: 5, totalNumQuestions: 5 },
            { name: "Thermodynamics", delta: -10, score: 1, totalNumQuestions: 5 }
        ],
    };

    return (
        <div className="quiz-summary">
            <QuizProgressBar />
            <h3>Your Score</h3>
            <h1>{quiz.score}%</h1>
            <p>{quiz.reviewBlurb}</p>

            <h3>Your Progress</h3>
            {quiz.topics.map((topic, index) => (
                <div key={index} className="topic-progress">
                    <FontAwesomeIcon icon="fa-solid fa-caret-up" />
                    <h4>{topic.name}</h4>
                    <p>{topic.delta >= 0 && "+"}{topic.delta}%</p>

                    <div className="branch"></div>
                    <p>{topic.score}/{topic.totalNumQuestions} correct</p>
                </div>
            ))}

            {/* Review mistakes button */}
            <button type="button" className="review-mistakes-button">
                Review Mistakes
            </button>

            {/* Leave now button */}
            <button type="button" className="leave-now-button">
                Leave Now
            </button>
        </div>
    );
}

export default QuizSummary;