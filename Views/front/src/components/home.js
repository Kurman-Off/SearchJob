import React from "react";
import "../style/home.css"
import "../style/header.css"
import Header from "./header";

function Home() {
    return (
        <div className="home-container">
            <Header />
            <div className="wrapper">
                <div className="search__block">
                    <div className="search__resume search__block__content">
                        <a className="search__link" href="/show/vacancies/">Знайти вакансію</a>
                    </div>
                    <div className="search__vacancy search__block__content">
                        <a className="search__link" href="/show/resumes/">Знайти резюме</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;