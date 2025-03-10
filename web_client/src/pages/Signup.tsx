import React, { useState } from "react";
import "./forms.css";

type SignupForm = {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
};

const Signup: React.FC = () => {
    const [form, setForm] = useState<SignupForm>({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const changeField = (key: keyof SignupForm, value: string) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: value,
        }));
    };

    const handleSubmit = () => {
        console.log(form);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <h1>Sign Up</h1>
            <input
                type="email"
                placeholder="Email"
                value={form.email}
                required
                onChange={(e) => changeField("email", e.target.value.trimStart())}
                onBlur={(e) => changeField("email", e.target.value.trim())}
            />
            <input
                type="text"
                placeholder="Username"
                value={form.username}
                required
                onChange={(e) => changeField("username", e.target.value.trimStart())}
                onBlur={(e) => changeField("username", e.target.value.trim())}
            />
            <input
                type="password"
                placeholder="Password"
                value={form.password}
                required
                onChange={(e) => changeField("password", e.target.value.trim())}
                onBlur={(e) => changeField("password", e.target.value.trim())}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                required
                onChange={(e) => changeField("confirmPassword", e.target.value.trim())}
                onBlur={(e) => changeField("confirmPassword", e.target.value.trim())}
            />
            <button className="submit-button" type="submit">Sign Up</button>
            <p>Already have an account? <a href="/login">Log in</a></p>
        </form>
    );
};

export default Signup;
