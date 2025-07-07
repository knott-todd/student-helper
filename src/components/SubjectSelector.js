const SubjectSelector = ({ subs, exams, onSubjectChange, onSubExamChange }) => {
  const sortedSubs = [...subs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => b.isUserSub - a.isUserSub);

  return (
    <form style={{ display: "block" }}>
      <h3 style={{ display: subs.length ? "block" : "none" }}>Your Subjects</h3>
      <div style={{ textAlign: "left", maxWidth: "230px", margin: "auto" }}>
        {sortedSubs.map(sub => (
          <p key={sub.id} className={`subject-label ${sub.isUserSub ? "" : "notUserSub"}`}>
            {sub.isUserSub && (
              <select
                className="dropdown"
                value={sub.exam ?? "NULL"}
                style={{ margin: "10px 10px 10px 5px", opacity: sub.exam ? 1 : "var(--faded-opacity)" }}
                onChange={e => onSubExamChange(e, sub.id)}
              >
                <option value="NULL">Default</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.short_name}
                  </option>
                ))}
              </select>
            )}
            <label
              style={{
                cursor: "pointer",
                display: "inline-flex",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              {sub.name}
              <input
                type="checkbox"
                style={{ float: "right", height: "100%" }}
                checked={sub.isUserSub}
                onChange={e => onSubjectChange(e, sub)}
              />
            </label>
            <br />
          </p>
        ))}
      </div>
    </form>
  );
};

export default SubjectSelector;
