import Dropdown from "./Dropdown";

const ExamDropdown = ({ exams, selectedExam, onChange }) => {
  return (
    
    <Dropdown
      dataArray={exams}
      value={selectedExam}
      onChange={onChange}
      keyOn="id"
      textOn="short_name" 
    />
  );
};

export default ExamDropdown;
