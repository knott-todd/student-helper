import { API_URL } from '../config';
import { notifyUnauthorized } from './session';

const backendURL = API_URL;

// API v2 (docs/api-v2-map.md): the backend takes the user from the session
// cookie, so no call here sends a user id. Every call sends the cookie
// (credentials: 'include', needed when REACT_APP_API_URL is another origin in
// local dev) and reports a 401 so the app can route to /sign_in.

// TODO(reminders): task reminder notifications are created/updated/cancelled
// server-side in the backend "OneSignal server-side" PR (backend audit §6, PR6).
// The OneSignal REST API key must never be shipped to the browser again.

async function send(path, { method = 'GET', body } = {}) {
    const headers = { "Bypass-Tunnel-Reminder": "true" };
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    const response = await fetch(`${backendURL}${path}`, {
        method,
        credentials: 'include',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401) notifyUnauthorized();
    return response;
}

// Reads resolve to [] on any failure, as before. That now includes an error
// status (401/403/404/5xx), whose {error, requestId} body callers would
// otherwise treat as data (e.g. result.filter on an object).
async function get(path) {
    try {
        const response = await send(path);
        if (!response.ok) return [];
        return await response.json();
    } catch(error) {
        return [];
    }
}

// Writes keep their old contract: resolve to the JSON body, reject on network errors.
async function write(method, path, body) {
    const response = await send(path, { method, body });
    return await response.json();
}

export const getPastpapers = (subID, examID) => get(`/userpapers/${subID}/${examID}`);

export const getPastpaper = id => get(`/pastpaper/${id}`);

export const getMarkscheme = id => get(`/markscheme/${id}`);

export const getPaperQuestions = id => get(`/questions/${id}`);

export const getFamiliarities = () => get(`/familiarities`);

export const getUserExam = () => get(`/user_exam`);

export const getTaskInfo = taskID => get(`/task_info/${taskID}`);

export const getUserTasks = () => get(`/user_tasks`);

export const setUserExam = examID => write('PUT', `/set_user_exam`, {examID});

export const setSubExam = (examID, subID) => write('PUT', `/set_sub_exam`, {examID, subID});

export const updateUserQuestion = data => write('PUT', `/update_user_question`, {question: data});

export const updateTask = (taskID, taskText, subject, deadline) =>
    write('PUT', `/update_task`, {taskID, taskText, subject, deadline});

export const updateTaskComplete = (taskID, isCompleted) =>
    write('PATCH', `/update_task_complete`, {taskID, is_completed: isCompleted});

// Resolves to the Response (callers check it themselves).
// Reminder cancellation moves server-side (see TODO(reminders) at top).
export const deleteTask = taskID => send(`/delete_task/${taskID}`, { method: 'DELETE' });

// Admin. Resolves to the Response.
export const deletePaperQuestions = paperID => send(`/del_paper_questions/${paperID}`, { method: 'DELETE' });

// Admin
export const setQuestObjective = data => write('PUT', `/set_objective`, data);

// Admin
export const setQuestTopic = data => write('PUT', `/set_topic`, data);

export const setUserSub = subject => write('PUT', `/set_user_subject`, {subject});

// Admin
export const getQuestTopic = questID => get(`/question_topic/${questID}`);

// Modules of a subject with the user's familiarity
export const getModules = (subID, examID) => get(`/familiarity/${subID}/${examID}`);

// Get user topics
export const getTopics = moduleID => get(`/topics_familiarity/${moduleID}`);

export const getModule = moduleID => get(`/module_info/${moduleID}`);

// Admin
export const getUnitModules = unitID => get(`/unit_modules/${unitID}`);

// Admin
export const getModuleTopics = moduleID => get(`/module_topics/${moduleID}`);

export const getObjectiveQuestions = id => get(`/objective_questions/${id}`);

export const getTopicQuestions = id => get(`/topic_questions/${id}`);

export const getObjective = id => get(`/objective/${id}`);

export const getTopic = id => get(`/topic/${id}`);

export const getModuleObjectives = id => get(`/module_objectives/${id}`);

export const getTopicObjectives = id => get(`/topic_objectives/${id}`);

export const getSubjects = () => get(`/subjects`);

export const getUserSubjects = () => get(`/user_subjects`);

export const getExams = () => get(`/exams`);

export const getBuildVersion = () => get(`/build_version`);

export const getExamSubjects = examID => get(`/exam_subjects/${examID}`);

// Admin
export const getSubjectUnits = (examID, subjectID) => get(`/subject_units/${examID}/${subjectID}`);

// Admin
export const addObjective = objective => write('POST', `/add_objective`, objective);

// Admin
export const addMCQs = (paperID, qAmount) => write('POST', `/add_mcqs`, {paperID, qAmount});

// Admin
export const addQuestion = question => write('POST', `/add_question`, question);

// Quiz (hidden in production; out of Phase 1 scope).
export const addQuizAttempt = selectedTopics => write('POST', `/create_quiz_attempt`, {selectedTopics});

// Reminder scheduling moves server-side (see TODO(reminders) at top).
// notificationID is sent as null until the backend creates reminders.
export const addTask = task => write('POST', `/add_task`, {...task, notificationID: null});

// setUser (PUT /set_user) and getUserID (GET /get_userID/:fname/:lname)
// were removed with name-only sign-in; see services/auth.js.
// saveInteraction (GET /save_interaction/:userID) was removed: the backend never
// had that route and nothing called it.
