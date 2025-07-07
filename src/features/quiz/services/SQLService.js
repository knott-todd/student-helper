import {
  postBackend,
  patchBackend
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
export const submitQuizAttempt = (attemptID, data) =>
  postBackend(`quiz/${attemptID}/submit`, data);

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
// export const getQuizAttempt = (attemptId) =>
//   fetchBackend(`quiz_attempt/${attemptId}`, { fallback: null });



// // Questions
// export const getQuizQuestions = (quizId) =>
//   fetchBackend(`quiz/${quizId}/questions`);

// // Navigation & Metadata
// export const updateFamiliarity = (attemptId, questionId, level) =>
//   patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/familiarity`, {
//     level,
//   });

// export const updateTimeSpent = (attemptId, questionId, timeSpent) =>
//   patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/time`, {
//     time_spent: timeSpent,
//   });

// export const markQuestionSkipped = (attemptId, questionId) =>
//   patchBackend(`quiz_attempt/${attemptId}/question/${questionId}/skip`, {
//     was_skipped: true,
//   });

// // Quiz Topics / Summary
// export const getQuizTopics = (quizId) =>
//   fetchBackend(`quiz/${quizId}/topics`);

// export const getQuizScoreSummary = (attemptId) =>
//   fetchBackend(`quiz_attempt/${attemptId}/summary`, { fallback: null });
