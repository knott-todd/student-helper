// Central runtime configuration. CRA inlines REACT_APP_* vars at build time,
// so changing them requires a rebuild/redeploy.

// Base URL for backend calls, no trailing slash.
// Production: "/api" — vercel.json rewrites /api/* to the backend so the
// browser sees a single origin (needed for first-party session cookies).
// Local dev against a local backend: REACT_APP_API_URL=http://localhost:3080
export const API_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

// Admin/content tools and dev-only pages. Off in production builds unless
// REACT_APP_ENABLE_ADMIN=true. Hiding them is not access control: the backend
// must still enforce admin checks on its write endpoints.
export const ENABLE_ADMIN =
  process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ADMIN === 'true';

// Google OAuth Client ID for "Sign in with Google". Public by design (it is
// sent to every browser). The default keeps preview builds working without
// env setup; REACT_APP_GOOGLE_CLIENT_ID overrides it.
export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '995518297301-i1oc3sr8173t9gsc9s5br70jl7gj5h8u.apps.googleusercontent.com';

// Quiz is out of scope for the Phase 1 launch; its entry point is hidden in
// production unless REACT_APP_ENABLE_QUIZ=true.
export const ENABLE_QUIZ =
  process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_QUIZ === 'true';
