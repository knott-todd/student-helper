// A short message in place of a list that is empty or failed to load.
const EmptyState = ({ children }) => (
    <p role="status" className="empty-state" style={{ textAlign: "center", padding: "40px 16px", opacity: 0.8 }}>
        {children}
    </p>
);

export default EmptyState;
