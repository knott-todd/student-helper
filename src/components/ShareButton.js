import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShareButton = ({ url, title, text }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Look what I scored on The Student Helper!',
          text: text || '',
          url: url || "https://student-helper-zeta.vercel.app",
        });
        console.log('Shared successfully');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      alert('Sharing is not supported in this browser');
    }
  };

  return (
    <button onClick={handleShare} className="primary-btn full-width-btn">
      <span style={{display: "flex", gap: "0.5rem", justifyContent: "center"}}>Share Awesomeness <FontAwesomeIcon icon={faArrowUpFromBracket} /> </span>
    </button>
  );
};

export default ShareButton;