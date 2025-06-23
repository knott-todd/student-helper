import { div } from "@tensorflow/tfjs"

const ReviewComplete = () => {
    return (
        <div>
            <QuizProgressBar />
            <h1>Review Complete</h1>
            <p>You’ve reviewed all your mistakes — great work! Most students skip this step. You didn’t.</p>
            <p>Perfect next time?</p>
            <button type="button" >
                Share
            </button>
            <button type="button" >
                Home
            </button>
        </div>
    )}

export default ReviewComplete;