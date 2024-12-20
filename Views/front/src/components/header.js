import React, { useState, useEffect } from 'react';
import "../style/header.css"
import "../style/vacancy-resume-forms.css"

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token")
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    }

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__content">
                    <div className="header__logo">
                        <a href="/">
                            <img className="header__logo" src="/icons/лолго.png" alt="logo img"></img>
                        </a>
                    </div>
                </div>

                <nav className="header__nav">
                    <ul className="nav__list">
                        <li className="nav__list__item"><a href="/" className="nav__list__link">Головна</a></li>
                        <li className="nav__list__item"><a href="/my/resumes/" className="nav__list__link">Мої резюме</a></li>
                        <li className="nav__list__item"><a href="/my/vacancies" className="nav__list__link">Мої вакансії</a></li>
                        <li className="nav__list__item"><a href="/my/profile/" className="nav__list__link">Мій профіль</a></li>
                        {isLoggedIn ? (
                            <li className="nav__list__item"><a href="/login/" className="nav__list__link" onClick={handleLogout}>Вийти</a></li>
                        ) : (
                            <li className="nav__list__item"><a href="/login/" className="nav__list__link">Увійти</a></li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header;