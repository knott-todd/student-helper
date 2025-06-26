import { div } from "@tensorflow/tfjs"
import QuizProgressBar from "./QuizProgressBar";
import { useQuizContext } from "./QuizContext";

const ReviewComplete = () => {

    const { exitQuiz } = useQuizContext();

    return (
        <div>
            <QuizProgressBar />
            <h1>Review Complete</h1>
            <p>You’ve reviewed all your mistakes — great work! Most students skip this step. You didn’t.</p>
            <p className="body-sm blurb" style={{marginTop: "2rem"}}>Perfect next time?</p>
            <button type="button" className="primary-btn full-width-btn" >
                Share
            </button>
            <button type="button" className="secondary-btn full-width-btn" onClick={() => exitQuiz()} >
                Home
            </button>
        </div>
    )}

export default ReviewComplete;