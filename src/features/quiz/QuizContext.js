import { createContext, useContext, useEffect, useState } from 'react';

const QuizContext = createContext();

export const useQuizContext = () => useContext(QuizContext);

export const QuizProvider = ({
    children,
    quizId,
    initialTopics = [],
    initialQuestions = [],
}) => {
    const [topics, setTopics] = useState(initialTopics);
    const [questions, setQuestions] = useState(initialQuestions);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (topics.length && questions.length) return; // Data already present, skip fetch

        // getQuizData(quizId).then(data => {
        //     setTopics(data.topics || []);
        //     setQuestions(data.questions || []);
        // });
            setTopics( []);
            setQuestions([]);
    }, [quizId]);

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
