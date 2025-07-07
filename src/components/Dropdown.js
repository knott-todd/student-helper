const Dropdown = ({ dataArray, value, onChange, keyOn='id', textOn, disabled }) => {
  return (
    
    <select
      className="header-dropdown dropdown"
      value={value}
      style={{ margin: "10px 10px 10px 5px", borderBottomColor: "var(--accent)" }}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="" />
      {dataArray.map(item => (
        <option key={item[keyOn]} value={item[keyOn]}>
          {item[textOn]}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
