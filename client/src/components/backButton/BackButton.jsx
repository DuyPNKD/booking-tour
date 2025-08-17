import {useNavigate} from "react-router-dom";
import "./BackButton.css";
import {ArrowLeft} from "lucide-react";
export default function BackButton() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/"); // fallback về home
        }
    };

    return (
        <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
        </button>
    );
}
