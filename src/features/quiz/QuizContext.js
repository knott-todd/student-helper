import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizAttempt, updateQuizAttempt } from './services/SQLService';

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

export const QuizProvider = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quizAttempt, setQuizAttempt] = useState({ questions: [], topics: [] });
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { id, qIndex } = useParams();

    useEffect(() => console.log(quizAttempt), [quizAttempt])

    const setCurrentQuestion = useCallback((updates) => {
        setQuizAttempt(curr => ({
            ...curr,
            questions: curr.questions.map((question, index) => (
                index === currentIndex 
                    ? { ...question, ...updates } 
                    : question
            ))
        }));
    }, [currentIndex, setQuizAttempt]);

    const setWasShared = useCallback((wasShared) => {
        setQuizAttempt(curr => ({
            ...curr,
            was_shared: wasShared
        }))
    }, [setQuizAttempt]);

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
            started_at: null,
            completed_at: null,
            was_shared: false,
            topics: [
                { id: 1, name: "Electrical Circuits", delta: null, score: null, totalNumQuestions: 1 },
                { id: 2, name: "Electric Fields", delta: null, score: null, totalNumQuestions: 1 },
                { id: 3, name: "Alternating Currents", delta: null, score: null, totalNumQuestions: 1 },
            ],
            questions: [
                {
                    correct_answer: 2,
                    user_answer: null,
                    is_correct: false,
                    is_pinned: false,
                    was_reviewed: false,
                    topic: 1,
                    question_text: "The 'driving force' for charges through an electrical circuit is provided by the",
                    options: ["impedance", "inductance", "potential difference", "electrical resistance"],
                },
                {
                    correct_answer: 0,
                    user_answer: null,
                    is_correct: false,
                    is_pinned: false,
                    was_reviewed: false,
                    topic: 2,
                    question_text: "A beta particle passes a point 100 nm away from an alpha particle. \
                    What is the magnitude of the electrostatic force between the particles at that point?",
                    options: ["4.6 x 10^(-14) N", "4.6 x 10^(-21) N", "4.6 x 10^(-39) N", "5.7 x 10^(-59) N"],
                },
                {
                    correct_answer: 1,
                    user_answer: null,
                    is_correct: false,
                    is_pinned: false,
                    was_reveiwed: false,
                    topic: 3,
                    question_text: "A sinusoidal signal has a peak voltage of 5.0 V.\
                    What is the root mean square value of this signal?",
                    options: ["2.50 V", "3.54 V", "6.25 V", "7.07 V"],
                },
            ],
        };

        getQuizAttempt(id)
        .then(result => {

            // Set isFinalQuestion flag for the last question
            const lastIndex = idealQuizAttempt.questions.length - 1;
            idealQuizAttempt.questions[lastIndex].isLastQuestion = true;


            setQuizAttempt(idealQuizAttempt);

            setIsLoading(false);

        })
        .catch(err =>{

            // Set isFinalQuestion flag for the last question
            const lastIndex = idealQuizAttempt.questions.length - 1;
            idealQuizAttempt.questions[lastIndex].isLastQuestion = true;

            setQuizAttempt(idealQuizAttempt);

            setIsLoading(false);

        });
    }, [id]);

    // Finalize score after submission
    useEffect(() => {
        if (quizAttempt?.completed_at && typeof quizAttempt.score !== 'number') {
            setQuizAttempt(prev => finalizeQuizAttempt(prev));
        }
    }, [quizAttempt]);

    // Navigation actions
    const goTo = (nextIndexOrFn, mode = 'question') => {
        setCurrentIndex(prev => {
            const next = typeof nextIndexOrFn === 'function'
                ? nextIndexOrFn(prev)
                : nextIndexOrFn;

            navigate(`/quiz/${id}/${mode}/${next}`);
            return next;
        });
    };

    const startQuiz = useCallback(() => {
        const started_at = new Date();
        setQuizAttempt(current => ({...current, started_at}));
        updateQuizAttempt(id, {started_at})
        .catch(() => {})//TODO: Handle catch
        goTo(0);
    }, [goTo]);

    const nextQuestion = useCallback(() => {
        goTo(prev => prev + 1);
    }, [goTo]);
    const prevQuestion = useCallback(() => goTo(prev => prev - 1), [goTo]);

    const skipQuestion = useCallback(() => {
        
        setCurrentQuestion({is_pinned: true});

        goTo(prev => prev + 1);
    }, [goTo]);

    const reviewQuiz = useCallback(() => {
        const first = quizAttempt?.incorrectIndexes?.[0] ?? 0;
        goTo(first, 'review');
    }, [goTo, quizAttempt?.incorrectIndexes]);

    const nextReviewQuestion = useCallback(() => {
        setCurrentQuestion({was_reviewed: true});

        goTo(prevIndex => {
            const next = quizAttempt.incorrectIndexes.find(i => i > prevIndex);
            if (next !== undefined) return next;

            navigate(`/quiz/${id}/review/complete`);
            return prevIndex; // fallback if already at the last one
        }, 'review');
    }, [quizAttempt?.incorrectIndexes, navigate, id, currentIndex]);


    const prevReviewQuestion = useCallback(() => {
        goTo(prevIndex => {
            const reversed = [...quizAttempt.incorrectIndexes].reverse();
            const prev = reversed.find(i => i < prevIndex);
            return prev !== undefined ? prev : prevIndex;
        }, 'review');
    }, [quizAttempt?.incorrectIndexes]);


    const finishQuiz = useCallback(() => {

        setCurrentIndex(null);
        setIsLoading(true);
        setQuizAttempt(prev => finalizeQuizAttempt(prev));
        requestAnimationFrame(() => {
            setIsLoading(false);
            navigate(`/quiz/${id}/review`);
        });
    }, [id, navigate]);

    const finishQuizReview = useCallback(() => {
        
        setCurrentQuestion({was_reveiwed: true})

        requestAnimationFrame(() => {
            
            setCurrentIndex(null);
            navigate(`/quiz/${id}/review/complete`);

        })
    }, [navigate, id]);

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
            id, topics: quizAttempt?.topics, questions: quizAttempt?.questions, 
            currentIndex, quizAttempt, isLoading, currQuestion: quizAttempt?.questions[currentIndex],
            startQuiz, nextQuestion, prevQuestion, skipQuestion, finishQuiz,
            reviewQuiz, exitQuiz, finishQuizReview, nextReviewQuestion, prevReviewQuestion,
            selectAnswer, toggleQuestionPin, isReview: quizAttempt?.completed_at !== null,
            setQuizAttempt, setWasShared
        }}>
            {isLoading ? <p>Loading...</p> : children}
        </QuizContext.Provider>
    );
};
