import { mod, sub } from '@tensorflow/tfjs';
import { use } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QuizContext = createContext();

export const useQuizContext = () => useContext(QuizContext);

export const useCurrentQuestion = () => {
  const { quizAttempt, currentIndex } = useQuizContext();
  return quizAttempt?.questions?.[currentIndex] || null;
};

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
    const [quizAttempt, setQuizAttempt] = useState({questions: [], topics: []});
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const { qIndex } = useParams();

    useEffect(() => {
    if (qIndex !== undefined) {
        const parsed = parseInt(qIndex, 10);
        if (!isNaN(parsed)) {
        setCurrentIndex(parsed);
        }
    }
    }, [qIndex]);

    // Ideally, you can get a single quiz attempt object with all related data
    const idealQuizAttempt = {
        id: 1,
        user: 1,
        meta: {},
        score: 0,
        started_at: new Date(),
        completed_at: null,
        topics: [
            {
                id: 1,
                name: "Sample Topic",
                module: 1,
            }],
        questions: [
            {
                correct_answer: 0,
                is_correct: false,
                time_spent: 100,
                num_focus_blurs: 0,
                familiarity: 1,
                was_skipped: false,
                was_pinned: false,
                is_pinned: false,
                is_reviewed: false,
                id: 1,
                num: 1,
                sub_letter: null,
                sub_sub_roman: null,
                sub_sub_sub_letter: null,
                user_answer: 1,
                pastpaper: 1,
                objective: 1,
                topic: 1,
                question_text: "Sample Question",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        motivationalBlurb: "Don’t worry, this one trips a lot of students up."
            },
            {
                correct_answer: 0,
                is_correct: false,
                time_spent: 100,
                num_focus_blurs: 0,
                familiarity: 1,
                was_skipped: false,
                was_pinned: false,
                is_pinned: false,
                is_reviewed: false,
                id: 1,
                num: 1,
                sub_letter: null,
                sub_sub_roman: null,
                sub_sub_sub_letter: null,
                user_answer: 1,
                pastpaper: 1,
                objective: 1,
                topic: 1,
                question_text: "Sample Question 2",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            }
        ]
    };

    useEffect(() => {
        // if (topics.length && questions.length) return; // Data already present, skip fetch

        // // getQuizData(quizId).then(data => {
        // //     setTopics(data.topics || []);
        // //     setQuestions(data.questions || []);
        // // });
        //     setTopics( []);
        //     setQuestions([]);

        // Set isFinalQuestion flag for the last question
        const lastIndex = idealQuizAttempt.questions.length - 1;
        idealQuizAttempt.questions[lastIndex].isLastQuestion = true;

        setQuizAttempt(idealQuizAttempt);
        setTopics(idealQuizAttempt.topics || []);
        setQuestions(idealQuizAttempt.questions || []);
        setIsLoading(false);

        console.log(quizAttempt);
        console.log(idealQuizAttempt);

    }, [quizId]);

    useEffect(() => {
        console.log(currentIndex);
    }, [currentIndex]);

    const nextQuestion = useCallback(() => {
        setCurrentIndex(current => {
            const next = current + 1;
            navigate(`/quiz/${quizId}/question/${next}`);
            return next;
        });
    }, [navigate, quizId]);

    const nextReviewQuestion = useCallback(() => {
        setCurrentIndex(current => {
            const next = current + 1;
            navigate(`/quiz/${quizId}/review/${next}`);
            return next;
        });
    }, [navigate, quizId]);

    const prevQuestion = useCallback(() => {
        if (currentIndex <= 0) return;

        setCurrentIndex(current => {
            const prev = current - 1;
            navigate(`/quiz/${quizId}/question/${prev}`);
            return prev;
        });
    }, [navigate, quizId]);

    const prevReviewQuestion = useCallback(() => {
        if (currentIndex <= 0) return;
        
        setCurrentIndex(current => {
            const prev = current - 1;
            navigate(`/quiz/${quizId}/review/${prev}`);
            return prev;
        });
    }, [navigate, quizId]);

    const skipQuestion = useCallback(() => {
        setCurrentIndex(current => {
            const next = current + 1;
            navigate(`/quiz/${quizId}/question/${next}`);
            return next;
        });
    }, [navigate, quizId]);

    const startQuiz = useCallback(() => {
        navigate(`/quiz/${quizId}/question/0`);
        setCurrentIndex(0);
    }, [quizId, navigate]);

    const finishQuiz = useCallback(() => {
        navigate(`/quiz/${quizId}/review`);
    }, [quizId, navigate]);

    const reviewQuiz = useCallback(() => {
        navigate(`/quiz/${quizId}/review/0`);
        setCurrentIndex(0);
    }, [quizId, navigate]);

    const exitQuiz = useCallback(() => {
        navigate(`/`);
    }, [quizId, navigate]);

    const selectAnswer = useCallback((questionIndex, answerIndex) => {

        setQuizAttempt(prevAttempt => {
            const updatedQuestions = [...prevAttempt.questions];
            const question = updatedQuestions[questionIndex] || {};
            question.user_answer = answerIndex;
            question.is_correct = (question.correct_answer === answerIndex);
            updatedQuestions[questionIndex] = question;

            return {
                ...prevAttempt,
                questions: updatedQuestions,
            };
        });
    }, []);

    // TODO: Auto generated, review later
    const questionCount = questions?.length ?? 0;
    const reviewNextQuestion = useCallback(() => {
        if (currentIndex < questions?.length - 1) {
            navigate(`/quiz/${quizId}/review/question/${currentIndex + 1}`);
            setCurrentIndex(currentIndex + 1);
        } else {
            finishQuizReview();
        }
    }, [currentIndex, questionCount, nextQuestion, finishQuiz, quizId]);

    const finishQuizReview = useCallback(() => {
        navigate(`/quiz/${quizId}/review/complete`);
    }, [quizId]);
        

    return (
        <QuizContext.Provider value={{
            quizId, questions, setQuestions,
            topics, setTopics,
            answers, setAnswers,
            currentIndex, setCurrentIndex, 
            quizAttempt, nextQuestion, prevQuestion, 
            skipQuestion, startQuiz, finishQuiz,
            reviewQuiz, exitQuiz, reviewNextQuestion,
            finishQuizReview, selectAnswer,
            nextReviewQuestion, prevReviewQuestion,

        }}>
            {isLoading ? <p>Loading...</p> : children}
        </QuizContext.Provider>
    );
};
