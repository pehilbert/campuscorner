import React from "react";
import {useState} from "react";
import "./forms.css";

const VerifyEmail: React.FC = () => {
    const [code, setCode] = useState("");

    const handleSubmit = () => {
        console.log(code);
    }

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <h1>Verify Email</h1>
                <p>Enter the verification code that was sent to your email.</p>
                <input 
                    type="text" 
                    placeholder="Verification Code" 
                    required
                    value={code}
                    onBlur={(e) => setCode(e.target.value.trim())}
                    onChange={(e) => setCode(e.target.value.trimStart())} 
                />
                <button className="submit-button" type="submit">Verify</button>
                <p>Didn't receive the email? <button>Resend</button></p>
            </form>
        </>
    );
};

export default VerifyEmail;
