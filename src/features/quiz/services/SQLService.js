import { fetchBackend, putBackend, patchBackend, deleteBackend, postBackend } from '../../../services/api.js'; // adjust path as needed

// Quiz Attempt
export const createQuizAttempt = (quizId, userId) =>
  postBackend(`quiz_attempt`, { quiz_id: quizId, user_id: userId });

export const getQuizAttempt = (attemptId) =>
  fetchBackend(`quiz_attempt/${attemptId}`, { fallback: null });

export const updateQuizAttempt = (attemptId,updates) => 
  patchBackend(`quiz_attempt/${attemptId}/`, updates);

export const finalizeQuizAttempt = (attemptId) =>
  patchBackend(`quiz_attempt/${attemptId}/finalize`, {});

// Questions
export const getQuizQuestions = (quizId) =>
  fetchBackend(`quiz/${quizId}/questions`);

export const updateUserAnswer = (attemptId, questionId, userAnswer) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}`, {
    user_answer: userAnswer,
  });

export const pinQuestion = (attemptId, questionId, isPinned) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/pin`, {
    is_pinned: isPinned,
  });

// Navigation & Metadata
export const updateFamiliarity = (attemptId, questionId, level) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/familiarity`, {
    level,
  });

export const updateTimeSpent = (attemptId, questionId, timeSpent) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/time`, {
    time_spent: timeSpent,
  });

export const markQuestionSkipped = (attemptId, questionId) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/skip`, {
    was_skipped: true,
  });

export const markQuestionReviewed = (attemptId, questionId) =>
  patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/reviewed`, {
    is_reviewed: true,
  });

// Quiz Topics / Summary
export const getQuizTopics = (quizId) =>
  fetchBackend(`quiz/${quizId}/topics`);

export const getQuizScoreSummary = (attemptId) =>
  fetchBackend(`quiz_attempt/${attemptId}/summary`, { fallback: null });
