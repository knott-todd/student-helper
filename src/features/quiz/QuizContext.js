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

const generateReviewBlurb = (score) => {
    if (score === 100) {
        return "Flawless victory! Keep shining.";
    } else if (score >= 90) {
        return "Awesome work! So close to perfect—let's get that 100%!";
    } else if (score >= 80) {
        return "Great job! You really know your stuff.";
    } else if (score >= 50) {
        return "Good effort! A little more practice and you'll ace it.";
    } else {
        return "Mistakes today = knowledge for tomorrow. You’ve got this!";
    }
};

const calculateDelta = (topicScore, numQuestions) => {
    if (numQuestions === 0) return 0;

    topicScore = Math.round(topicScore / numQuestions * 100);

    if (topicScore >= 90) return 10;
    if (topicScore >= 80) return 5;
    if (topicScore >= 50) return 0;
    if (topicScore >= 30) return -5;
    else return -10;
};

const finalizeQuizAttempt = (attempt) => {
    const updatedQuestions = attempt.questions.map(q => ({
        ...q,
        is_correct: q.user_answer === q.correct_answer,
    }));

    let score = updatedQuestions.reduce(
        (acc, q) => acc + (q.is_correct ? 1 : 0), 0
    );

    score = Math.round((score / updatedQuestions.length) * 100);

    const incorrectIndexes = updatedQuestions
        .map((q, index) => q.is_correct ? null : index)
        .filter(index => index !== null);

    const reviewBlurb = generateReviewBlurb(score);

    // calculate topics score
    const updatedTopics = attempt.topics.map(topic => {
        const topicQuestions = updatedQuestions.filter(q => q.topic === topic.id);
        const topicScore = topicQuestions.reduce(
            (acc, q) => acc + (q.is_correct ? 1 : 0), 0
        );
        const totalNumQuestions = topicQuestions.length;
        const delta = calculateDelta(topicScore, totalNumQuestions);

        return {
            ...topic,
            score: topicScore,
            delta,
            totalNumQuestions: totalNumQuestions
        };
    });

    return {
        ...attempt,
        questions: updatedQuestions,
        score,
        completed_at: new Date(),
        review_blurb: reviewBlurb,
        topics: updatedTopics,
        incorrectIndexes
    };
}

export const QuizProvider = ({
    children,
    quizId,
    initialTopics = [],
    initialQuestions = [],
}) => {
    const [topics, setTopics] = useState(initialTopics);
    const [questions, setQuestions] = useState(initialQuestions);
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
        score: null,
        started_at: new Date(),
        completed_at: new Date(),
        topics: [
            { id: 1, name: "Simple Harmonic Motion", delta: null, score: null, totalNumQuestions: 1 },
            { id: 2, name: "Thermodynamics", delta: null, score: null, totalNumQuestions: 1 }
        ],
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
                topic: 2,
                question_text: "Sample Question 2",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            }
        ]
    };

    useEffect(() => {
        if (
            quizAttempt.completed_at &&
            typeof quizAttempt.score !== "number"
        ) {
            setQuizAttempt(prev => finalizeQuizAttempt(prev));
        }
    }, [quizAttempt]);


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
            const next = quizAttempt.incorrectIndexes.find((val) => val > current);

            if(next) {
                navigate(`/quiz/${quizId}/review/${next}`);
                return next;

            } else {
                navigate(`/quiz/${quizId}/review/complete`);
                return current;
            }
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
            const prev = quizAttempt.incorrectIndexes.reverse().find((val) => val < current);

            if (!prev) return current;

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
        setIsLoading(true);

        // Update quizAttempt first
        setQuizAttempt(prev => finalizeQuizAttempt(prev));

        // Defer loading + navigation to after state update settles
        requestAnimationFrame(() => {
            setIsLoading(false);
            navigate(`/quiz/${quizId}/review`);
        });
    }, [quizId, navigate]);


    const reviewQuiz = useCallback(() => {
        navigate(`/quiz/${quizId}/review/${quizAttempt.incorrectIndexes[0]}`);
        setCurrentIndex(quizAttempt.incorrectIndexes[0]);
    }, [quizId, navigate, quizAttempt.incorrectIndexes]);

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

    const toggleQuestionPin = useCallback(() => {
        setQuizAttempt(current => {
            const updatedQuestions = current.questions.map((q, index) =>
            index === currentIndex
                ? { ...q, is_pinned: !q.is_pinned }
                : q
            );

            return {
                ...current,
                questions: updatedQuestions,
            };
        });
    }, [currentIndex]);


        

    return (
        <QuizContext.Provider value={{
            quizId, questions, setQuestions,
            topics, setTopics,
            currentIndex, setCurrentIndex, 
            quizAttempt, nextQuestion, prevQuestion, 
            skipQuestion, startQuiz, finishQuiz,
            reviewQuiz, exitQuiz, reviewNextQuestion,
            finishQuizReview, selectAnswer,
            nextReviewQuestion, prevReviewQuestion,
            incorrectIndexes: quizAttempt.incorrectIndexes,
            toggleQuestionPin
        }}>
            {isLoading ? <p>Loading...</p> : children}
        </QuizContext.Provider>
    );
};
