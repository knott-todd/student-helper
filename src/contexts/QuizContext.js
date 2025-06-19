// context/QuizContext.jsx
import { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children, quizId }) => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setAnswer = (index, answer) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = answer;
      return updated;
    });
  };

  return (
    <QuizContext.Provider value={{
      quizId, questions, setQuestions,
      topics, setTopics,
      answers, setAnswer,
      currentIndex, setCurrentIndex
    }}>
      {children}
    </QuizContext.Provider>
  );
};
