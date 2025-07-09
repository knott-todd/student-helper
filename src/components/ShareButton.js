import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PrimaryButton from "./PrimaryButton";

const ShareButton = ({ url, title, text, onClick = () => {}}) => {

  const handleShare = async () => {

    onClick();

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
    <PrimaryButton widthAdaptive onClick={handleShare}>
      <span style={{display: "flex", gap: "0.5rem", justifyContent: "center"}}>Share Awesomeness <FontAwesomeIcon icon={faArrowUpFromBracket} /> </span>
    </PrimaryButton>
  );
};

export default ShareButton;