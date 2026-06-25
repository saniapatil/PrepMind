import "./AuthPopup.css";
import { useNavigate } from "react-router-dom";

function AuthPopup({ onClose }) {
    const navigate = useNavigate();

    return (
        <div className="popupOverlay" onClick={onClose}>
            <div className="popupCard" onClick={(e) => e.stopPropagation()}>

                <div className="popupIcon">
                    <i className="fa-solid fa-lock"></i>
                </div>

                <h2 className="popupTitle">Sign in to chat</h2>
                <p className="popupText">
                    You need an account to use PrepMind. It is free and takes 30 seconds.
                </p>

                <button
                    className="popupBtn primary"
                    onClick={() => navigate("/auth")}
                >
                    <i className="fa-solid fa-right-to-bracket"></i> Sign In
                </button>

                <button
                    className="popupBtn secondary"
                    onClick={() => navigate("/auth")}
                >
                    <i className="fa-solid fa-user-plus"></i> Create Account
                </button>

                <button className="popupClose" onClick={onClose}>
                    Maybe later
                </button>

            </div>
        </div>
    );
}

export default AuthPopup;
