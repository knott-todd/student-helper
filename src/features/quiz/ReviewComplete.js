import { useQuizContext } from "./QuizContext";
import ShareButton from "../../components/ShareButton";
import QuizProgressBar from "./components/QuizProgressBar";

const ReviewComplete = () => {

    const { exitQuiz } = useQuizContext();

    return (
        <div>
            <QuizProgressBar />
            <h1>Review Complete</h1>
            <p>You’ve reviewed all your mistakes — great work! Most students skip this step. You didn’t.</p>
            <p className="body-sm blurb" style={{marginTop: "2rem"}}>Perfect next time?</p>            
            
            <ShareButton />
            <button type="button" className="secondary-btn full-width-btn" onClick={() => exitQuiz()} >
                Home
            </button>
        </div>
    )}

export default ReviewComplete;