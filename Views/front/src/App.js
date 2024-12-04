import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/registration";
import Login from "./components/login";
import Home from "./components/home";
import CreateVacancy from "./components/create_vacancy"
import CreateResume from "./components/create_resume";


function App () {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/registration" element={<Registration />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/create-vacancy" element={<CreateVacancy />}></Route>
                <Route path="/create-resume" element={<CreateResume />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;