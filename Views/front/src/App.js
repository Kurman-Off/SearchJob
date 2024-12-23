import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/registration";
import Login from "./components/login";
import Home from "./components/home";
import CreateVacancy from "./components/create_vacancy";
import CreateResume from "./components/create_resume";
import UserProfile from "./components/user_profile";
import MyResumes from "./components/my_resumes";
import MyResume from "./components/my_resume";
import MyVacancies from "./components/my_vacancies";
import MyVacancy from "./components/my_vacancy";
import Vacancies from "./components/show_vacanies";
import Resumes from "./components/show_resumes";
import Resume from "./components/show_resume";
import Vacancy from "./components/show_vacancy";

function App () {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/registration/" element={<Registration />}></Route>
                <Route path="/login/" element={<Login />}></Route>
                <Route path="/create/vacancy/" element={<CreateVacancy />}></Route>
                <Route path="/create/resume/" element={<CreateResume />}></Route>
                <Route path="/my/profile/" element={<UserProfile />}></Route>
                <Route path="/my/resumes/" element={<MyResumes />}></Route>
                <Route path="/my/resume/:id" element={<MyResume />}></Route>
                <Route path="/my/vacancies/" element={<MyVacancies />}></Route>
                <Route path="/my/vacancy/:id" element={<MyVacancy />}></Route>
                <Route path="/show/vacancies/" element={<Vacancies />}></Route>
                <Route path="/show/resumes/" element={<Resumes />}></Route>
                <Route path="/show/resume/:id" element={<Resume />}></Route>
                <Route path="/show/vacancy/:id" element={<Vacancy />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;