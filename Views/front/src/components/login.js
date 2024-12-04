import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "../style/authentication.css";
import "../style/main.css";

function Login() {
    const [values, setValues] = useState({
        email: "",
        password: "",
    })

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        setValues({...values, [event.target.name]: event.target.value});
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post("http://localhost:3000/login", values)
            .then(res => {
                if (res.status === 201) {
                    console.log("Login success");
                    setError("");
                    navigate("/");
                }
            })
            .catch(err => {
                setError("Не правильно введені дані");
                setTimeout(() => {
                    setError("");
                }, 3000);
                console.error(err.response.data);
            });
    };

    return (
        <div className="authentication__wrapper">
            {error && (
                <div className="error__message">{error}</div>
            )}
            <div className="authentication">

                <form className="form" onSubmit={handleSubmit}>
                <h1 className="authentication__h">Login</h1>
                <div className="input__box">
                    <input
                        className="form__input"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="input__box">
                    <input
                        className="form__input"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                        onChange={handleChange}
                    />
                </div>

                <button className="authentication__btn form__hover" type="submit">Login</button>

                <div>
                    <a href="/registration" className="link__for__authentication">
                        Don`t have an account?<strong>Registration</strong>
                    </a>
                </div>
            </form>
            </div>
        </div>
    )
}

export default Login;