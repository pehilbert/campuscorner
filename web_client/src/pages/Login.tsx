import React from "react";
import {useState} from "react";
import "./forms.css";

type LoginForm = {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<LoginForm>({
        username: "",
        password: "",
    });

    const changeField = (key: string, value: string) => {
        setForm({
            ...form,
            [key]: value,
        });
    }

    const handleSubmit = () => {
        console.log(form);
    }

    return (
        <>
            <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            >
                <h1>Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    required
                    onBlur={(e) => changeField("username", e.target.value.trim())}
                    onChange={(e) => changeField("username", e.target.value.trimStart())}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    required
                    onBlur={(e) => changeField("password", e.target.value.trim())}
                    onChange={(e) => changeField("password", e.target.value.trimStart())}
                />
                <button className="submit-button" type="submit">Login</button>
                <p>Don't have an account? <a href="/signup">Sign up</a></p>
            </form>
        </>
    );
};

export default Login;
