import styles from '../css/QuestionOptions.module.css';

const QuestionOptions = ({ 
  questionOptions, 
  correctAnswer, 
  userAnswer, 
  onSelect, 
  mode = "quiz" // "quiz" or "review"
}) => {
  return (
    <div className={styles.optionsContainer}>
      {questionOptions?.map((option, index) => {
        // determine class
        let buttonClass = "secondary-btn quiz-option";

        if (mode === "quiz") {
          if (index === userAnswer) {
            buttonClass += ` ${styles.selected}`;
          }
        } else if (mode === "review") {
          if (index === correctAnswer) {
            buttonClass += ` ${styles.correct}`;
          } else if (index === userAnswer && index !== correctAnswer) {
            buttonClass += ` ${styles.incorrect}`;
          }
        }

        return (
          <button
            key={index}
            className={buttonClass}
            disabled={mode === "review" && index !== userAnswer && index !== correctAnswer}
            onClick={() => mode === "quiz" && onSelect?.(index)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};


export default QuestionOptions;