export const SERVER_UNREACHABLE_MESSAGE = "Student Helper can't reach the server right now. Please try again in a few minutes.";

// Shown instead of the app when GET /me fails with a network error or 5xx,
// so a down backend reads as "down" rather than a blank page or a sign-in
// screen that can't work.
const ServerUnreachable = ({ onRetry }) => (
    <div className="body-div">
        <div className="default-form" role="alert">
            <p>{SERVER_UNREACHABLE_MESSAGE}</p>
            {onRetry ? <button type="button" onClick={onRetry}>Try again</button> : ""}
        </div>
    </div>
);

export default ServerUnreachable;
