import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./header";
import "../style/vacancy-resume-forms.css";
import { useNavigate } from "react-router-dom";


function CreateResume() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState("");
    const [skillOptions, setSkillOptions] = useState([]);
    const [educationYears, setEducationYears] = useState({
        startYear: "",
        endYear: "",
    });
    const [value, setValue] = useState({
        fullname: "",
        title: "",
        city: "",
        category: "",
        birthday: "",
        position: "",
        companyName: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        jobStatus: "",
        education: "",
        educationalInstitution: "",
        faculty: "",
        specialty: "",
    });

    useEffect(() => {
        if (value.category) {
            axios
                .get(`http://localhost:3000/create-resume?category=${value.category}`)
                .then((res) => {
                    setSkillOptions(res.data);
                })
                .catch((error) => {
                    setError("Сталась помилка, спробуйте пізніше");
                    setTimeout(() => {
                        setError("");
                    }, 3000);
                    console.error("Помилка при завантаженні навичок:", error);
                });
        }
    }, [value.category]);


    function CalculationOfYears() {

        const startMonth = parseInt(value.startMonth, 10) || 0;
        const startYear = parseInt(value.startYear, 10) || 0;
        const endMonth = parseInt(value.endMonth, 10) || 0;
        const endYear = parseInt(value.endYear, 10) || 0;

        let year = endYear - startYear;
        let month = endMonth - startMonth;

        if (value.jobStatus === "current") {
            return "Працюю тут зараз";
        } else if (value.jobStatus === "noExperience") {
            return "Немає досвіду роботи";
        }

        if (!startMonth || !startYear || !endMonth || !endYear) {
            console.log("error1")
            setError("Заповніть коректно усі поля")
            return null;
        }

        if (endYear < startYear || (endYear === startYear && endMonth < startMonth)) {
            console.log("error2")
            setError("Кінцева дата має бути пізнішою за початкову.");
            return null;
        }

        if (month < 0) {
            year--;
            month += 12;
        }

        return `years: ${year} months: ${month}`;
    }

    const handleEducationYearsChange = (e) => {
        const { name, value } = e.target;

        setEducationYears((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddSkill = () => {
        if (currentSkill && !skills.includes(currentSkill)) {
            setSkills([...skills, currentSkill]);
        }
        setCurrentSkill("");
    };

    const handleDeleteSkill = (skill) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleSkillClick = (skill) => {
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
    };


    const handleJobStatusChange = (e) => {
        const { value, name } = e.target;
        setValue((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleResumeChange = (e) => {
        const { name, value } = e.target;

        if (name === "birthday") {
            const date = new Date(value);
            const year = date.getFullYear();
            const currentYear = new Date().getFullYear();

            if (year > currentYear - 18) {
                setError("Вам має бути мінімум 18 років");
                setTimeout(() => {
                    setError("");
                }, 3000);
            }
        }

        setValue((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const workedTimeCalculated  = CalculationOfYears();

        if (!workedTimeCalculated) {
            setTimeout(() => {
                setError("");
            }, 3000);
            return;
        }

        axios.post("http://localhost:3000/create-resume", {
                fullname: value.fullname,
                title: value.title,
                city: value.city,
                category: value.category,
                birthday: value.birthday,
                position: value.position,
                companyName: value.companyName,
                workTime: workedTimeCalculated,
                education: value.education,
                educationalInstitution: value.educationalInstitution,
                faculty: value.faculty,
                specialty: value.specialty,
                educationYears: educationYears,
                skills: skills,

        })
            .then((res) => {
                if (res.status === 201) {
                    navigate("/");
                }
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    setError(err.response.data);
                } else {
                    setError("Something went wrong. Please try again later.");
                }
                console.error(err.response ? err.response.data : err);
            });
    };

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="card">
                    {error &&
                        <div className="error__message">
                            {error}
                        </div>
                    }
                    <form className="form" onSubmit={handleSubmit}>
                        <section className="personal__data section">
                            <h2 className="resume__title">Давайте познайомимось!</h2>
                            <div className="about__user">
                                <h3>Ваше ім'я та прізвище</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="fullname"
                                    value={value.fullname}
                                    onChange={handleResumeChange}
                                />

                                <h3>Посада, на якій ви хочете працювати</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="title"
                                    value={value.title}
                                    onChange={handleResumeChange}
                                />

                                <h3>Де ви хочете працювати</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="city"
                                    value={value.city}
                                    onChange={handleResumeChange}
                                />

                                <h3>Оберіть свою галузь</h3>
                                <ul className="checkbox__list">
                                    {['IT', 'Design', 'Marketing', 'Medicine', 'Hotel and restaurant', 'business', 'tourism'].map((categoryItem) => (
                                        <li className="checkbox__list__item" key={categoryItem}>
                                            <label className="label">
                                                <input
                                                    className="check__icon"
                                                    type="radio"
                                                    name="category"
                                                    value={categoryItem}
                                                    checked={value.category === categoryItem}
                                                    onChange={handleResumeChange}
                                                    required
                                                />
                                                {categoryItem}
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                <h3>Дата Народження</h3>
                                <input
                                    className="s__input input"
                                    type="date"
                                    name="birthday"
                                    value={value.birthday}
                                    onChange={handleResumeChange}
                                />
                            </div>
                        </section>
                        <hr/>
                        <section className="expirience section">
                            <h2 className="resume__title">Досвід роботи</h2>
                            <div className="description__text">
                                <p>Додайте своє останнє місце роботи</p>
                            </div>
                            <div className="about__user">
                                <h3>Посада</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="position"
                                    value={value.position}
                                    onChange={handleResumeChange}
                                />

                                <h3>Назва компанії</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="companyName"
                                    value={value.companyName}
                                    onChange={handleResumeChange}
                                />

                                <h3>Період роботи</h3>

                                <div className="select__block">
                                    <select
                                        className="select"
                                        name="startMonth"
                                        value={value.startMonth}
                                        onChange={handleResumeChange}
                                    >
                                        <option className="option" value="" disabled>Місяць</option>
                                        <option className="option" value="1">Січень</option>
                                        <option className="option" value="2">Лютий</option>
                                        <option className="option" value="3">Березень</option>
                                        <option className="option" value="4">Квітень</option>
                                        <option className="option" value="5">Травень</option>
                                        <option className="option" value="6">Червень</option>
                                        <option className="option" value="7">Липень</option>
                                        <option className="option" value="8">Серпень</option>
                                        <option className="option" value="9">Вересень</option>
                                        <option className="option" value="10">Жовтень</option>
                                        <option className="option" value="11">Листопад</option>
                                        <option className="option" value="12">Грудень</option>
                                    </select>


                                    <select
                                        className="select"
                                        name="startYear"
                                        value={value.startYear}
                                        onChange={handleResumeChange}
                                    >
                                        <option className="option" value="" disabled>Рік</option>
                                        <option className="option" value="2020">2020</option>
                                        <option className="option" value="2021">2021</option>
                                        <option className="option" value="2022">2022</option>
                                        <option className="option" value="2023">2023</option>
                                        <option className="option" value="2024">2024</option>
                                    </select>

                                    <span>-</span>

                                    <select
                                        className="select"
                                        name="endMonth"
                                        value={value.endMonth}
                                        onChange={handleResumeChange}
                                    >
                                        <option className="option" value="" disabled>Місяць</option>
                                        <option className="option" value="1">Січень</option>
                                        <option className="option" value="2">Лютий</option>
                                        <option className="option" value="3">Березень</option>
                                        <option className="option" value="4">Квітень</option>
                                        <option className="option" value="5">Травень</option>
                                        <option className="option" value="6">Червень</option>
                                        <option className="option" value="7">Липень</option>
                                        <option className="option" value="8">Серпень</option>
                                        <option className="option" value="9">Вересень</option>
                                        <option className="option" value="10">Жовтень</option>
                                        <option className="option" value="11">Листопад</option>
                                        <option className="option" value="12">Грудень</option>
                                    </select>

                                    <select
                                        className="select"
                                        name="endYear"
                                        value={value.endYear}
                                        onChange={handleResumeChange}
                                    >
                                        <option className="option" value="" disabled>Рік</option>
                                        <option className="option" value="2020">2020</option>
                                        <option className="option" value="2021">2021</option>
                                        <option className="option" value="2022">2022</option>
                                        <option className="option" value="2023">2023</option>
                                        <option className="option" value="2024">2024</option>
                                    </select>
                                </div>

                                <label className="label">
                                    <input
                                        className="check__icon"
                                        type="radio"
                                        name="jobStatus"
                                        value="current"
                                        checked={value.jobStatus === "current"}
                                        onChange={handleJobStatusChange}
                                    />
                                    Працюю тут зараз.
                                </label>
                                <label className="label">
                                    <input
                                        className="check__icon"
                                        type="radio"
                                        name="jobStatus"
                                        value="noExperience"
                                        checked={value.jobStatus === "noExperience"}
                                        onChange={handleJobStatusChange}
                                    />
                                    Немає досвіду
                                </label>
                            </div>
                        </section>
                        <hr/>
                        <section className="education section">
                            <h2 className="resume__title">Освіта</h2>
                            <div className="description__text">
                                <p>Додайте ваш найвищий ступінь освіти</p>
                            </div>

                            <div className="about__user">
                                <h3>Рівень освіти</h3>
                                <label className="label">
                                    <select
                                        className="select"
                                        name="education"
                                        value={value.education}
                                        onChange={handleResumeChange}
                                    >
                                        <option className="option" value="" disabled>-вибрати-</option>
                                        {["вища", "незакінчена вища", "середня", "незакінчена середня"].map((option) => (
                                            <option
                                                className="option"
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <h3>Навчальний заклад</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="educationalInstitution"
                                    value={value.educationalInstitution}
                                    onChange={handleResumeChange}
                                />

                                <h3>Факультет</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="faculty"
                                    value={value.faculty}
                                    onChange={handleResumeChange}
                                />
                                <h3>Спеціальність</h3>
                                <input
                                    className="m__input input"
                                    type="text"
                                    name="specialty"
                                    value={value.specialty}
                                    onChange={handleResumeChange}
                                />

                                <h3>Роки Навчання</h3>

                                <div className="select__block">
                                    <select
                                        className="select"
                                        name="startYear"
                                        value={educationYears.startYear}
                                        onChange={handleEducationYearsChange}
                                    >
                                        <option className="option" value="" disabled>Рік</option>
                                        <option className="option" value="2015">2015</option>
                                        <option className="option" value="2016">2016</option>
                                        <option className="option" value="2017">2017</option>
                                        <option className="option" value="2018">2018</option>
                                        <option className="option" value="2019">2019</option>
                                        <option className="option" value="2020">2020</option>
                                        <option className="option" value="2021">2021</option>
                                        <option className="option" value="2022">2022</option>
                                        <option className="option" value="2023">2023</option>
                                        <option className="option" value="2024">2024</option>
                                    </select>

                                    <span>-</span>

                                    <select
                                        className="select"
                                        name="endYear"
                                        value={educationYears.endYear}
                                        onChange={handleEducationYearsChange}
                                    >
                                        <option className="option" value="" disabled>Рік</option>
                                        <option className="option" value="2015">2015</option>
                                        <option className="option" value="2016">2016</option>
                                        <option className="option" value="2017">2017</option>
                                        <option className="option" value="2018">2018</option>
                                        <option className="option" value="2019">2019</option>
                                        <option className="option" value="2020">2020</option>
                                        <option className="option" value="2021">2021</option>
                                        <option className="option" value="2022">2022</option>
                                        <option className="option" value="2023">2023</option>
                                        <option className="option" value="2024">2024</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        <hr/>
                        <section className="skills__section section">
                            <h2 className="resume__title">Знання і навички</h2>
                            <div className="description__text">
                                <p>Вкажіть навички, якими володієте та які будуть корисні вам у новій роботі. Це надасть
                                    вам перевагу перед іншими кандидатами.</p>
                            </div>

                            <h4>Вибрані навички:</h4>
                            <div className="selected__skills">
                                {skills.length > 0 && (
                                    <div>
                                        <ul className="skills__list">
                                            {skills.map(skill => (
                                                <li
                                                    className="skills__list__item"
                                                    key={skill}
                                                >

                                                    {skill}
                                                    <button
                                                        className="btn__delete_item"
                                                        onClick={() => handleDeleteSkill(skill)}>
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <input
                                    className="l__input skill__input"
                                    type="text"
                                    value={currentSkill}
                                    onChange={e => setCurrentSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddSkill();
                                        }
                                    }}
                                    placeholder="Введіть назву навички"
                                />
                            </div>

                            <h4>Пропоновані навички:</h4>
                            <div className="suggested__skills">
                                <ul className="skills__list">
                                    {Array.isArray(skillOptions) &&
                                        skillOptions
                                            .filter(skill => skill.name.toLowerCase().includes(currentSkill.toLowerCase()))
                                            .map((filteredSkill, index) => (
                                                <li
                                                    className="skills__list__item"
                                                    key={index}
                                                    onClick={() => handleSkillClick(filteredSkill.name)}
                                                >
                                                    {filteredSkill.name}
                                                </li>
                                            ))}
                                </ul>
                            </div>

                        </section>
                        <button className="btn btn__save" type="submit">Зберегти</button>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default CreateResume;
