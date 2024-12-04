import React, { useState } from "react";
import axios from "axios";
import Header from "./header";
import "../style/vacancy-resume-forms.css";
import { useNavigate } from "react-router-dom";

function CreateVacancy() {

    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [vacancyTitle, setVacancyTitle] = useState("");
    const [category, setCategory] = useState("");
    const [workConditions, setWorkConditions] = useState({
        type: "office",
        city: "",
        address: "",
        employment: [],
    });
    const [salaryType, setSalaryType] = useState("single");
    const [salaryRange, setSalaryRange] = useState({min: "", max: "" });
    const [salarySingle, setSalarySingle] = useState("");
    const [experienceRequirement , setExperienceRequirement ] = useState("");
    const [education, setEducation] = useState("");
    const [languages, setLanguages] = useState({
        languagesArray: [],
    });
    const [targetAudiences, setTargetAudiences ] = useState({
        audienceArray: [],
    });
    const [description, setDescription] = useState("");

    const handleVacancyTitleChange = (event) => {
        setVacancyTitle(event.target.value);
    }

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    }

    const handleWorkConditionsChange = (event) => {
        const { name, value, type, checked } = event.target;

        setWorkConditions((prev) => {
            switch (type) {
                case "radio":
                    return {
                        ...prev,
                        type: value,
                        city: value === "office" ? prev.city: "",
                        address: value === "office" ? prev.address: "",
                    };
                case "checkbox":return {
                    ...prev,
                    employment: checked
                        ? [...prev.employment, value]
                        : prev.employment.filter((item) => item!== value),
                    };
                default:
                    return {
                        ...prev,
                        [name]: value,
                    };
            }
        })
    }

    const handleSalaryChange = (event) => {
        const { value } = event.target;
        setSalaryType(value);
    }

    const handleSalaryRangeChange = (event) => {
        const {name, value } = event.target;

        setSalaryRange((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleSalarySingleChange = (event) => {
        setSalarySingle(event.target.value);
    };

    const handleExperienceChange = (event) => {
        setExperienceRequirement(event.target.value);
    }

    const handleEducationChange = (event) => {
        setEducation(event.target.value);
    }

    const handleLanguagesChange = (event) => {
        const { value, checked } = event.target;

        setLanguages((prev) => {
            return {
                languagesArray: checked
                   ? [...prev.languagesArray, value]
                    : prev.languagesArray.filter((item) => item!== value),
            }
        })
    }

    const handleTargetAudiences = (event) => {
        const { value, checked } = event.target

        setTargetAudiences((prev) => {
            return {
                ...prev,
                audienceArray: checked
                    ? [...prev.audienceArray, value]
                    : prev.audienceArray.filter((item) => item!== value),
            }
        })
    }

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    }


    const getSalary = () => {
        if (salaryType === 'range') {
            if (salaryRange.min && salaryRange.max && Number(salaryRange.min) < Number(salaryRange.max)) {
                return salaryRange;
            } else if (salaryRange.min && salaryRange.max && Number(salaryRange.min) > Number(salaryRange.max)) {
                setError("Invalid salary range.");
                setTimeout(() => {
                    setError("");
                }, 3000);
                return null;
            }
        } else if (salaryType === 'single') {
            return salarySingle ? Number(salarySingle) : null;
        }
        return null;
    };


    const handleSubmit = (event) => {
        event.preventDefault();

        if (!vacancyTitle ||!category) {
            setError("Please fill in all fields.");
            setTimeout(() => {
                setError("");
            }, 3000);
            return;
        }

        const salary = getSalary();

        axios.post("http://localhost:3000/create-vacancy", {
            title: vacancyTitle,
            category: category,
            type: workConditions.type,
            city: workConditions.city,
            address: workConditions.address,
            employment: workConditions.employment,
            salary: salary,
            experience: experienceRequirement,
            education: education,
            languages: languages.languagesArray,
            targetAudiences: targetAudiences.audienceArray,
            description: description,
        })
            .then((res) => {
                if (res.status === 201) {
                    navigate("/");
                }
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    setError(err.response.data);
                    setTimeout(() => {
                        setError("");
                    }, 3000);
                } else {
                    setError("Something went wrong. Please try again later.");
                    setTimeout(() => {
                        setError("");
                    }, 3000);
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
                            <section className="search__vacancy section">
                                <h2 className="search__vacancy__title">Назва посади</h2>
                                <label className="label">
                                    <input
                                        className="l__input input"
                                        type="text"
                                        placeholder="Наприклад, фронтенд розробник"
                                        value={vacancyTitle}
                                        onChange={handleVacancyTitleChange}
                                    />
                                </label>
                            </section>
                            <section className="search__category section">
                                <h3>Категорія розміщення вакансії</h3>
                                <ul className="checkbox__list">
                                    {['IT', 'Design', 'Marketing', 'Medicine', 'Hotel and restaurant business, tourism'].map((categoryItem) => (
                                        <li className="checkbox__list__item" key={categoryItem}>
                                            <label className="label">
                                                <input
                                                    className="check__icon"
                                                    type="radio"
                                                    name="category"
                                                    value={categoryItem}
                                                    checked={category === categoryItem}
                                                    onChange={handleCategoryChange}
                                                    required
                                                />
                                                {categoryItem}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            <hr/>
                            <section className="working__conditions section">
                                <h2>Умови роботи</h2>
                                <div className="working__conditions__radio">
                                    <div className="working__conditions__radio__group">
                                        <label className="label">
                                            <input
                                                className="check__icon"
                                                type="radio"
                                                name="type"
                                                value="office"
                                                checked={workConditions.type === "office"}
                                                onChange={handleWorkConditionsChange}
                                            />
                                            Місто та адреса
                                        </label>
                                    </div>
                                    {workConditions.type === "office" && (
                                        <div className="working__conditions__radio__content">
                                            <label className="working__conditions__radio__content__label cm__label label">
                                                <input
                                                    className="m__input input"
                                                    type="text"
                                                    name="city"
                                                    value={workConditions.city}
                                                    onChange={handleWorkConditionsChange}
                                                    placeholder="Місто"
                                                />
                                                <input
                                                    className="m__input input"
                                                    type="text"
                                                    name="address"
                                                    value={workConditions.address}
                                                    onChange={handleWorkConditionsChange}
                                                    placeholder="Вулиця і будинок"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <div className="working__conditions__radio__group">
                                        <label className="label">
                                            <input
                                                className="check__icon"
                                                type="radio"
                                                name="type"
                                                value="remote"
                                                checked={workConditions.type === "remote"}
                                                onChange={handleWorkConditionsChange}
                                            />
                                            Дистанційна робота
                                        </label>
                                    </div>
                                </div>
                                <div className="checkbox__block">
                                    <h3>Вид зайнятності</h3>
                                    {["full-time", "part-time"].map((employmentType) => (
                                        <label className="label" key={employmentType}>
                                            <input
                                                className="check__icon"
                                                type="checkbox"
                                                name="employment"
                                                value={employmentType}
                                                checked={workConditions.employment.includes(employmentType)}
                                                onChange={handleWorkConditionsChange}
                                            />
                                            {employmentType === "full-time" ? "повна" : "неповна"}
                                        </label>
                                    ))}
                                </div>
                            </section>
                            <hr/>
                            <section className="salary section">
                                <h2>Зарплата</h2>
                                <div className="salary__radio">
                                    <div className="salary__radio__group">
                                        <label className="label">
                                            <input
                                                className="check__icon"
                                                type="radio"
                                                name="salaryType"
                                                value="range"
                                                checked={salaryType === "range"}
                                                onChange={handleSalaryChange}
                                            />
                                            Діапазон
                                        </label>
                                    </div>
                                    {salaryType === "range" && (
                                        <div className="salary__radio__content">
                                            <label className="salary__radio__content__label label">
                                                <input
                                                    className="xs__input input"
                                                    type="text"
                                                    name="min"
                                                    value={salaryRange.min}
                                                    onChange={handleSalaryRangeChange}
                                                    placeholder="від"
                                                />
                                                <span>-</span>
                                                <input
                                                    className="xs__input input"
                                                    type="text"
                                                    name="max"
                                                    value={salaryRange.max}
                                                    onChange={handleSalaryRangeChange}
                                                    placeholder="до"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <div className="salary__radio__group">
                                        <label className="salary__radio__content__label label">
                                            <input
                                                className="check__icon"
                                                type="radio"
                                                name="salaryType"
                                                value="single"
                                                checked={salaryType === "single"}
                                                onChange={handleSalaryChange}
                                            />
                                            Одне значення
                                        </label>
                                    </div>
                                    {salaryType === "single" && (
                                        <div className="salary__radio__content">
                                            <label className="label">
                                                <input
                                                    className="s__input input"
                                                    type="text"
                                                    name="single"
                                                    value={salarySingle}
                                                    onChange={handleSalarySingleChange}
                                                    placeholder="Зарплата"/>
                                            </label>
                                        </div>
                                    )}
                                    <div className="salary__radio__group">
                                        <label className="salary__radio__content__label label">
                                            <input
                                                className="check__icon"
                                                type="radio"
                                                name="salaryType"
                                                value="none"
                                                checked={salaryType === "none"}
                                                onChange={handleSalaryChange}
                                            />
                                            Не вказувати (не рекомендується)
                                        </label>
                                    </div>
                                </div>
                            </section>
                            <hr/>
                            <section className="requirements section">
                                <h2>Вимоги до шукача</h2>
                                <div className="requirements__radio">
                                    <div className="requirements__radio__group">
                                        {["Готові взяти без досвіду", "Від 1 року", "Від 2 років", "Від 5 років"].map((expItem) => (
                                            <label className="requirements__radio__group__label label" key={expItem}>
                                                <input
                                                    className="check__icon"
                                                    type="radio"
                                                    name="experience"
                                                    value={expItem}
                                                    checked={experienceRequirement === expItem}
                                                    onChange={handleExperienceChange}
                                                />
                                                {expItem}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="requirements__education">
                                    <h3>Освіта:</h3>
                                    <label className="label">
                                        <select
                                            className="select"
                                            name="education_id"
                                            value={education}
                                            onChange={handleEducationChange}
                                        >
                                            {["не має значення", "вища", "незакінчена вища", "середня", "незакінчена середня"].map((option) => (
                                                <option className="option" key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="requirements__languages">
                                    <h3>Знання мов:</h3>
                                    <div className="checkbox__block">
                                        {["Англійська", "Українська", "Німецька", "Польська", "Іспанська"].map((languageItem) => (
                                            <label className="label" key={languageItem}>
                                                <input
                                                    className="check__icon"
                                                    type="checkbox"
                                                    name="experience"
                                                    value={languageItem}
                                                    checked={languages.languagesArray.includes(languageItem)}
                                                    onChange={handleLanguagesChange}
                                                />
                                                {languageItem}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="requirements__person">
                                    <h3>Вакансія підходить для:</h3>
                                    <div className="checkbox__block">
                                        {["Студента", "Людини з інвалідністю", "Ветирана"].map((audiencesItem) => (
                                            <label className="label" key={audiencesItem}>
                                                <input
                                                    className="check__icon"
                                                    type="checkbox"
                                                    name="experience"
                                                    value={audiencesItem}
                                                    checked={targetAudiences.audienceArray.includes(audiencesItem)}
                                                    onChange={handleTargetAudiences}
                                                />
                                                {audiencesItem}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            <hr/>
                            <section className="description section">
                                <h2>Опис ваканції</h2>
                                <textarea
                                    className="description__textarea"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                ></textarea>
                            </section>
                            <button className="btn btn__save" type="submit">Зберегти</button>
                        </form>
                </div>
            </div>
        </div>
    );
}

export default CreateVacancy;


/*
    погратися з бордером та данимим bc коли автозаповнення полів login/registration
    зробити щоб людина не могла створювати свої резюме або вакансії або профіль якщо не залогінилась або не зареєструвалась
    зробити форму реєстрації
    зробити візитку і стоірнку Мій профіль
*/