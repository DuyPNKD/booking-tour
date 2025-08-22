import {useLocation} from "react-router-dom";
import SignInForm from "./signin/SignInForm";
import SignUpForm from "./signup/SignUpForm";
import VerifyCodeForm from "./verify/VerifyCodeForm";
import ForgotPasswordForm from "./forgot-password/ForgotPasswordForm";
import ForgotPasswordSuccess from "./forgot-password/ForgotPasswordSuccess";
import ResetPassword from "./reset-password/ResetPassword";

function AuthPage() {
    const {search} = useLocation();
    const params = new URLSearchParams(search);
    const step = params.get("step") || "signin";

    switch (step) {
        case "signin":
            return <SignInForm />;
        case "signup":
            return <SignUpForm />;
        case "verify":
            return <VerifyCodeForm />;
        case "forgot-password":
            return <ForgotPasswordForm />;
        case "forgot-password-success":
            return <ForgotPasswordSuccess />;
        case "reset-password":
            return <ResetPassword />;
        default:
            return <SignInForm />;
    }
}

export default AuthPage;
