import React from 'react';
import "../style/header.css"
import "../style/vacancy-resume-forms.css"

function Header() {
    return (
        <header className="header">
            <div className="header__container">
                <div className="header__content">
                    <div className="header__logo">
                        <a href="/">
                            <img alt="logo img"></img>
                            searchJob
                        </a>
                    </div>
                </div>

                <nav className="header__nav">
                    <ul className="nav__list">
                        <li className="nav__list__item"><a href="#" className="nav__list__link">Головна</a></li>
                        <li className="nav__list__item"><a href="#" className="nav__list__link">Мої резюме</a></li>
                        <li className="nav__list__item"><a href="#" className="nav__list__link">Мої вакансії</a></li>
                        <li className="nav__list__item"><a href="#" className="nav__list__link">Мій профіль</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header;