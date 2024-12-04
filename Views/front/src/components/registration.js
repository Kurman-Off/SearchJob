import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/authentication.css";
import "../style/main.css";

function Registration() {
    const [values, setValues] = useState({
        name: "",
        surname: "",
        age: "",
        number: "+380",
        residence : "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post("http://localhost:3000/registration", values)
            .then(res => {
                if (res.status === 201) {
                    console.log("Register success");
                    setError("");
                    navigate("/login");
                }
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    setError(err.response.data);
                } else {
                    setError("Something went wrong. Please try again later.");
                }

                setTimeout(() => {
                    setError("");
                }, 3000);
                console.error(err.response ? err.response.data : err);
            });
    };


    return (
        <div className="authentication__wrapper">
                {error &&(
                        <div className="error__message">{error}</div>
                    )
                }
            <div className="authentication">
                <h1 className="authentication__h">Registration</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            value={values.name}
                        />
                    </div>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="text"
                            id="surname"
                            name="surname"
                            placeholder="Surname"
                            onChange={handleChange}
                            value={values.surname}
                        />
                    </div>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="number"
                            id="age"
                            name="age"
                            placeholder="Age"
                            onChange={handleChange}
                            value={values.age}
                        />
                    </div>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="tel"
                            id="number"
                            name="number"
                            placeholder="Number"
                            onChange={handleChange}
                            value={values.number}
                            // pattern="^\+?\d{10,15}$"
                        />
                    </div>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="text"
                            id="residence"
                            name="residence"
                            placeholder="Residence"
                            onChange={handleChange}
                            value={values.residence}
                        />
                    </div>
                    <div className="input__box">
                    <input
                            className="form__input"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            value={values.email}
                        />
                    </div>
                    <div className="input__box">
                        <input
                            className="form__input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            value={values.password}
                        />
                    </div>
                    <button className="authentication__btn" type="submit">Register</button>
                </form>
                <div>
                    <a href="/login" className="link__for__authentication">
                        Have an account?<strong>Login</strong>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Registration;
