# Student Helper API v2: endpoint map (old -> new)

Single source of truth for the backend (`student-helper-backend`, PR4 `feat/ownership` + PR5 `feat/admin-guard`)
and the frontend (`student-helper`, PR-F3 `feat/ownership-client`). A copy lives at `docs/api-v2-map.md` in each repo;
the tests in each repo parse that copy, so the code cannot drift from it:

- backend `test/contract.test.js`: the set of `New path` rows equals the set of routes the Express app registers
  (both directions), every `user`/`admin` row answers 401 without a session, `public` rows never do, and (PR5)
  every `admin` row answers 403 to a student and 200 to an admin.
- frontend `src/services/__tests__/contract.test.js`: every `SQLService` function in the last column calls exactly
  the `New path` with that method, sends cookies, and never sends a user id.

Keep the three copies identical (`diff` them); edit this one first.

**Identity.** The user is always the session user (`req.user.id` from the `sh_session` cookie). No path segment
or body field carries a user id any more; a `userID`/`userId` the client still sends is ignored.

**Access.** `public` = no session needed (pure catalogue). `user` = signed in, else 401. `admin` = signed in (401)
and `user.role = 'admin'` re-read from the DB on every request (403 otherwise). Until PR5 is deployed, `admin`
rows behave like `user` rows.

**Ownership.** Rows marked "404 if not yours" scope the query with `AND user = ?` and answer
`404 {error, requestId}` when nothing matched, the same as for an id that doesn't exist.

**Response shapes are unchanged**, except `GET /task_info/:taskID`, which answered `200` with an empty body for a
missing task and now answers `404 {error, requestId}`.

| Method | Old path | New path | Access | Request body (new) | Frontend (SQLService) | Change |
|---|---|---|---|---|---|---|
| GET | `/health` | `/health` | public | - | - | unchanged |
| GET | `/build_version` | `/build_version` | public | - | `getBuildVersion` | unchanged |
| POST | `/auth/google` | `/auth/google` | public | `{credential}` | `auth.signInWithGoogle` | unchanged (PR3) |
| GET | `/me` | `/me` | user | - | `auth.getSession` | unchanged (PR3) |
| POST | `/auth/logout` | `/auth/logout` | public | - | `auth.signOut` | unchanged (PR3) |
| GET | `/pastpaper/:id` | `/pastpaper/:id` | public | - | `getPastpaper` | unchanged |
| GET | `/markscheme/:id` | `/markscheme/:id` | public | - | `getMarkscheme` | unchanged |
| GET | `/familiarities` | `/familiarities` | public | - | `getFamiliarities` | unchanged |
| GET | `/module_info/:module_id` | `/module_info/:module_id` | public | - | `getModule` | unchanged |
| GET | `/subjects` | `/subjects` | public | - | `getSubjects` | unchanged |
| GET | `/exams` | `/exams` | public | - | `getExams` | unchanged |
| GET | `/exam_subjects/:exam_id` | `/exam_subjects/:exam_id` | public | - | `getExamSubjects` | unchanged |
| GET | `/userpapers/:sub_id/:examID/:userID` | `/userpapers/:sub_id/:examID` | user | - | `getPastpapers` | path: drop `:userID` |
| GET | `/questions/:id/:userID` | `/questions/:id` | user | - | `getPaperQuestions` | path: drop `:userID` |
| GET | `/objective_questions/:id/:userID` | `/objective_questions/:id` | user | - | `getObjectiveQuestions` | path: drop `:userID` |
| GET | `/topic_questions/:id/:userID` | `/topic_questions/:id` | user | - | `getTopicQuestions` | path: drop `:userID` |
| GET | `/familiarity/:sub_id/:examID/:userID` | `/familiarity/:sub_id/:examID` | user | - | `getModules` | path: drop `:userID` |
| GET | `/topics_familiarity/:module_id/:userID` | `/topics_familiarity/:module_id` | user | - | `getTopics` | path: drop `:userID` |
| GET | `/objective/:id/:userID` | `/objective/:id` | user | - | `getObjective` | path: drop `:userID` |
| GET | `/topic/:id/:userID` | `/topic/:id` | user | - | `getTopic` | path: drop `:userID` |
| GET | `/module_objectives/:id/:userID` | `/module_objectives/:id` | user | - | `getModuleObjectives` | path: drop `:userID` |
| GET | `/topic_objectives/:topic_id/:userID` | `/topic_objectives/:topic_id` | user | - | `getTopicObjectives` | path: drop `:userID` |
| GET | `/user_subjects/:userID` | `/user_subjects` | user | - | `getUserSubjects` | path: drop `:userID` |
| GET | `/user_exam/:userID` | `/user_exam` | user | - | `getUserExam` | path: drop `:userID` |
| GET | `/user_tasks/:userID` | `/user_tasks` | user | - | `getUserTasks` | path: drop `:userID` |
| GET | `/task_info/:taskID` | `/task_info/:taskID` | user | - | `getTaskInfo` | auth; 404 if not yours |
| POST | `/add_task` | `/add_task` | user | `{taskText, deadline, subject, notificationID}` | `addTask` | body: drop `userID` |
| PUT | `/update_task` | `/update_task` | user | `{taskID, taskText, subject, deadline}` | `updateTask` | auth; 404 if not yours |
| PATCH | `/update_task_complete` | `/update_task_complete` | user | `{taskID, is_completed}` | `updateTaskComplete` | auth; 404 if not yours |
| DELETE | `/delete_task/:taskID` | `/delete_task/:taskID` | user | - | `deleteTask` | auth; 404 if not yours |
| PUT | `/update_user_question` | `/update_user_question` | user | `{question: {id, familiarity, is_complete}}` | `updateUserQuestion` | body: drop `userID`; 404 if not yours |
| PUT | `/set_user_exam` | `/set_user_exam` | user | `{examID}` | `setUserExam` | body: drop `userID` |
| PUT | `/set_sub_exam` | `/set_sub_exam` | user | `{examID, subID}` | `setSubExam` | body: drop `userID`; 404 if not yours |
| PUT | `/set_user_subject` | `/set_user_subject` | user | `{subject: {id, isUserSub}}` | `setUserSub` | body: drop `userID`; un-tick is 404 if not yours |
| POST | `/create_quiz_attempt` | `/create_quiz_attempt` | user | `{selectedTopics}` | `addQuizAttempt` | body: drop `userId` (quiz: out of Phase 1 scope otherwise) |
| POST | `/add_objective` | `/add_objective` | admin | `{info, topic, notes}` | `addObjective` | admin guard |
| POST | `/add_question` | `/add_question` | admin | `{num, letter, roman, subLetter, paperID}` | `addQuestion` | admin guard |
| POST | `/add_mcqs` | `/add_mcqs` | admin | `{paperID, qAmount}` | `addMCQs` | admin guard |
| DELETE | `/del_paper_questions/:paperID` | `/del_paper_questions/:paperID` | admin | - | `deletePaperQuestions` | admin guard |
| PUT | `/set_objective` | `/set_objective` | admin | `{question, objective}` | `setQuestObjective` | admin guard |
| PUT | `/set_topic` | `/set_topic` | admin | `{question, topic}` | `setQuestTopic` | admin guard |
| GET | `/subject_units/:exam_id/:subject_id` | `/subject_units/:exam_id/:subject_id` | admin | - | `getSubjectUnits` | admin guard (used only by admin tools) |
| GET | `/unit_modules/:unit_id` | `/unit_modules/:unit_id` | admin | - | `getUnitModules` | admin guard (used only by admin tools) |
| GET | `/module_topics/:module_id` | `/module_topics/:module_id` | admin | - | `getModuleTopics` | admin guard (used only by admin tools) |
| GET | `/question_topic/:quest_id` | `/question_topic/:quest_id` | admin | - | `getQuestTopic` | admin guard (used only by admin tools) |

**Removed from the frontend:** `saveInteraction` (`GET /save_interaction/:userID`). The backend never had that
route (404), nothing called the function, and it was the last place a user id was sent.

**Quiz client** (`src/features/quiz/services/SQLService.js`, `quiz_attempt/*`, `quiz/:id/*`): those routes don't
exist on the backend yet and the quiz is hidden in production. Out of scope; not in this table.

**Counts.** 45 routes: 11 public, 24 user, 10 admin. 13 paths lost `:userID`; 6 bodies lost `userID`/`userId`
(19 contract changes the frontend must ship with); 7 routes gained ownership 404s (4 task routes,
`update_user_question`, `set_sub_exam`, un-ticking in `set_user_subject`; `set_user_exam` is 404 only if the
session's user row is gone); 10 routes become admin-only.
