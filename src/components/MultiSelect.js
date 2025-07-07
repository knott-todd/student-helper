const MultiSelect = ({dataArray, selectedIDs, keyOn='id', labelOn='name', onChange}) => {
    return (
        <div style={{ textAlign: "left", maxWidth: "230px", margin: "auto" }}>
            {dataArray.map(item => (
            <p key={item[keyOn]} className={`subject-label ${selectedIDs.includes(item[keyOn]) ? "" : "notUserSub"}`}>
                
                <label
                style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    justifyContent: "space-between",
                    flex: 1,
                }}
                >
                {item[labelOn]}
                <input
                    type="checkbox"
                    data-id={item[keyOn]} 
                    style={{ float: "right", height: "100%" }}
                    checked={selectedIDs.includes(item[keyOn])}
                    onChange={onChange}
                />
                </label>
                <br />
            </p>
            ))}
        </div>
    )
}

export default MultiSelect;