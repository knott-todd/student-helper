// One place that hears "the backend says you're signed out" (HTTP 401) from any
// API call. AppContext registers the handler; it signs out locally, and
// RequireAuth then routes to /sign_in.

let handler = null;

// Registers the 401 handler and returns a function that removes it.
export function onUnauthorized(fn) {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function notifyUnauthorized() {
  if (handler) handler();
}
