import React from "react";

const SocialButton = ({icon, text, onClick, className}) => {
    return (
        <button type="button" onClick={onClick} className={`signin-social-button ${className}`}>
            <span className="icon">{icon}</span>
            <span className="text">{text}</span>
        </button>
    );
};

export default SocialButton;
