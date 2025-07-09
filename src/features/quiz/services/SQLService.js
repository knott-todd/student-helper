import {
  postBackend,
  patchBackend,
  fetchBackend
} from '../../../utils/apiUtils.js';

// Create a new quiz
export const createQuizAttempt = ({ userID, topicIDs, numQuestions }) =>
  postBackend(`quiz/create`, { userID, topicIDs, numQuestions });

// Start a quiz
export const startQuizAttempt = (attemptID) =>
  patchBackend(`quiz/${attemptID}/start`, {});

// Submit answer
export const submitAnswer = (attemptID, questionID, answer) =>
  patchBackend(`quiz/${attemptID}/answer`, { questionID, answer });

// Pin/unpin a question
export const setQuestionPinned = (attemptID, questionID, isPinned) =>
  patchBackend(`quiz/${attemptID}/pin`, { questionID, isPinned });

// Submit full quiz
export const submitQuizAttempt = (attemptID) =>
  postBackend(`quiz/${attemptID}/submit`);

// Mark question reviewed
export const markQuestionReviewed = (attemptID, questionID) =>
  patchBackend(`quiz/${attemptID}/review-question`, { questionID });

// Mark quiz reviewed
export const markQuizReviewed = (attemptID) =>
  patchBackend(`quiz/${attemptID}/review-complete`, {});

// Mark quiz shared
export const shareQuizAttempt = (attemptID) =>
  patchBackend(`quiz/${attemptID}/share`, {});

// TODO: Add these
export const getQuizAttempt = (attemptId) =>
  fetchBackend(`quiz/${attemptId}`, { fallback: null });

// // Questions
// export const getQuizQuestions = (quizId) =>
//   fetchBackend(`quiz/${quizId}/questions`);

// // Navigation & Metadata
// export const updateFamiliarity = (attemptId, questionId, level) =>
//   patchBackend(`quiz/${attemptId}/question/${questionId}/familiarity`, {
//     level,
//   });

// export const updateTimeSpent = (attemptId, questionId, timeSpent) =>
//   patchBackend(`quiz/${attemptId}/question/${questionId}/time`, {
//     time_spent: timeSpent,
//   });

export const markQuestionSkipped = (attemptId, questionID) =>
  patchBackend(`quiz/${attemptId}/question/skip`, {
    questionID
  });

// // Quiz Topics / Summary
// export const getQuizTopics = (quizId) =>
//   fetchBackend(`quiz/${quizId}/topics`);

// export const getQuizScoreSummary = (attemptId) =>
//   fetchBackend(`quiz/${attemptId}/summary`, { fallback: null });

export const updateQuizAttempt = (attemptId, data) =>
  patchBackend(`quiz/${attemptId}`, data);