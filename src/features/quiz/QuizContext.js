import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QuizContext = createContext();
export const useQuizContext = () => useContext(QuizContext);
export const useCurrentQuestion = () => {
    const { quizAttempt, currentIndex } = useQuizContext();
    return quizAttempt?.questions?.[currentIndex] || null;
};

// Utility functions
const generateReviewBlurb = (score) => {
    if (score === 100) return "Flawless victory! Keep shining.";
    if (score >= 90) return "Awesome work! So close to perfect—let's get that 100%!";
    if (score >= 80) return "Great job! You really know your stuff.";
    if (score >= 50) return "Good effort! A little more practice and you'll ace it.";
    return "Mistakes today = knowledge for tomorrow. You’ve got this!";
};

const calculateDelta = (topicScore, numQuestions) => {
    if (numQuestions === 0) return 0;
    const pct = Math.round((topicScore / numQuestions) * 100);
    if (pct >= 90) return 10;
    if (pct >= 80) return 5;
    if (pct >= 50) return 0;
    if (pct >= 30) return -5;
    return -10;
};

const finalizeQuizAttempt = (attempt) => {
    const updatedQuestions = attempt.questions.map(q => ({
        ...q,
        is_correct: q.user_answer === q.correct_answer,
    }));

    const scoreRaw = updatedQuestions.filter(q => q.is_correct).length;
    const score = Math.round((scoreRaw / updatedQuestions.length) * 100);

    const incorrectIndexes = updatedQuestions
        .map((q, i) => (!q.is_correct ? i : null))
        .filter(i => i !== null);

    const updatedTopics = attempt.topics.map(topic => {
        const topicQuestions = updatedQuestions.filter(q => q.topic === topic.id);
        const topicScore = topicQuestions.filter(q => q.is_correct).length;
        const delta = calculateDelta(topicScore, topicQuestions.length);

        return {
            ...topic,
            score: topicScore,
            delta,
            totalNumQuestions: topicQuestions.length,
        };
    });

    return {
        ...attempt,
        score,
        questions: updatedQuestions,
        completed_at: new Date(),
        review_blurb: generateReviewBlurb(score),
        topics: updatedTopics,
        incorrectIndexes,
    };
};

export const QuizProvider = ({ children, quizId, initialTopics = [], initialQuestions = [] }) => {
    const [topics, setTopics] = useState(initialTopics);
    const [questions, setQuestions] = useState(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quizAttempt, setQuizAttempt] = useState({ questions: [], topics: [] });
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { qIndex } = useParams();

    // Sync currentIndex from URL
    useEffect(() => {
        if (qIndex !== undefined) {
            const parsed = parseInt(qIndex, 10);
            if (!isNaN(parsed)) setCurrentIndex(parsed);
        }
    }, [qIndex]);

    // Initial quiz mock
    useEffect(() => {
        const idealQuizAttempt = {
            id: 1,
            user: 1,
            meta: {},
            score: null,
            started_at: new Date(),
            completed_at: new Date(),
            topics: [
                { id: 1, name: "Simple Harmonic Motion", delta: null, score: null, totalNumQuestions: 1 },
                { id: 2, name: "Thermodynamics", delta: null, score: null, totalNumQuestions: 1 },
            ],
            questions: [
                {
                    correct_answer: 0,
                    user_answer: 1,
                    is_correct: false,
                    is_pinned: false,
                    topic: 1,
                    question_text: "Sample Question",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                },
                {
                    correct_answer: 0,
                    user_answer: 1,
                    is_correct: false,
                    is_pinned: false,
                    topic: 2,
                    question_text: "Sample Question 2",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                },
            ],
        };

        setQuizAttempt(idealQuizAttempt);
        setTopics(idealQuizAttempt.topics);
        setQuestions(idealQuizAttempt.questions);
        setIsLoading(false);
    }, [quizId]);

    // Finalize score after submission
    useEffect(() => {
        if (quizAttempt.completed_at && typeof quizAttempt.score !== 'number') {
            setQuizAttempt(prev => finalizeQuizAttempt(prev));
        }
    }, [quizAttempt]);

    // Navigation actions
    const goTo = (nextIndexOrFn) => {
        setCurrentIndex(prev => {
            const next = typeof nextIndexOrFn === 'function'
                ? nextIndexOrFn(prev)
                : nextIndexOrFn;

            navigate(`/quiz/${quizId}/question/${next}`);
            return next;
        });
    };

    const startQuiz = useCallback(() => goTo(0), [goTo]);
    const nextQuestion = useCallback(() => goTo(prev => prev + 1), [goTo]);
    const prevQuestion = useCallback(() => goTo(prev => prev - 1), [goTo]);

    const reviewQuiz = useCallback(() => {
        const first = quizAttempt.incorrectIndexes?.[0] ?? 0;
        goTo(first, 'review');
    }, [goTo, quizAttempt.incorrectIndexes]);

    const nextReviewQuestion = useCallback(() => {
        goTo(prevIndex => {
            const next = quizAttempt.incorrectIndexes.find(i => i > prevIndex);
            if (next !== undefined) return next;

            navigate(`/quiz/${quizId}/review/complete`);
            return prevIndex; // fallback if already at the last one
        }, 'review');
    }, [quizAttempt.incorrectIndexes, navigate, quizId]);


    const prevReviewQuestion = useCallback(() => {
        goTo(prevIndex => {
            const reversed = [...quizAttempt.incorrectIndexes].reverse();
            const prev = reversed.find(i => i < prevIndex);
            return prev !== undefined ? prev : prevIndex;
        }, 'review');
    }, [quizAttempt.incorrectIndexes]);


    const finishQuiz = useCallback(() => {
        setIsLoading(true);
        setQuizAttempt(prev => finalizeQuizAttempt(prev));
        requestAnimationFrame(() => {
            setIsLoading(false);
            navigate(`/quiz/${quizId}/review`);
        });
    }, [quizId, navigate]);

    const finishQuizReview = useCallback(() => navigate(`/quiz/${quizId}/review/complete`), [navigate, quizId]);

    const exitQuiz = useCallback(() => navigate(`/`), [navigate]);

    const selectAnswer = useCallback((questionIndex, answerIndex) => {
        setQuizAttempt(prev => {
            const questions = prev.questions.map((q, i) => i === questionIndex
                ? { ...q, user_answer: answerIndex, is_correct: q.correct_answer === answerIndex }
                : q);
            return { ...prev, questions };
        });
    }, []);

    const toggleQuestionPin = useCallback(() => {
        setQuizAttempt(prev => {
            const questions = prev.questions.map((q, i) => i === currentIndex ? { ...q, is_pinned: !q.is_pinned } : q);
            return { ...prev, questions };
        });
    }, [currentIndex]);

    return (
        <QuizContext.Provider value={{
            quizId, topics, questions, currentIndex, quizAttempt, isLoading,
            startQuiz, nextQuestion, prevQuestion, skipQuestion: nextQuestion, finishQuiz,
            reviewQuiz, exitQuiz, finishQuizReview, nextReviewQuestion, prevReviewQuestion,
            selectAnswer, toggleQuestionPin
        }}>
            {isLoading ? <p>Loading...</p> : children}
        </QuizContext.Provider>
    );
};
