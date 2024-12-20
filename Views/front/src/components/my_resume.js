import React, {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resume.css"
import axios from "axios";
import ShowEditInfo from "./show_edit_info";

function MyResume() {
    const { id } = useParams();
    const [error, setError] = useState("");
    const [info, setInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [generalInfo, setGeneralInfo] = useState({
        "Посада:": "",
        "Готовий працювати:": "",
        "Категорія:": "",
        "Вид зайнятості:": "",
    });
    const [userInfoData, setUserInfoData] = useState({
        "Вік:": "",
        "Телефон:": "",
        "Місце проживання:": "",
        "Email:": "",
    });
    const [experienceInfo, setExperienceInfo] = useState({
        "Посада:": "",
        "Назва компанії:": "",
        "Період роботи:": "",
    });
    const [eduInfo, setEduInfo] = useState({
        "Ступінь освіти": "",
        "Заклад освіти:": "",
        "Факультет:": "",
        "Спеціальність:": "",
        "Період навчання:": "",
    });
    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState("");
    const [skillOptions, setSkillOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (info) {
            const { title, city, category, employment, position, companyName, workTime } = info;

            setGeneralInfo({
                "Посада:": title || "",
                "Готовий працювати:": city || "",
                "Категорія:": category || "",
                "Вид зайнятості:": employment || "",
            });

            setExperienceInfo({
                "Посада:": position || "",
                "Назва компанії:": companyName || "",
                "Період роботи:": workTime || "",
            });

            setEduInfo({
                "Ступінь освіти": info.education || "",
                "Заклад освіти:": info.educationalInstitution || "",
                "Факультет:": info.faculty || "",
                "Спеціальність:": info.specialty || "",
                "Період навчання:": `${info.educationYears.startYear} - ${info.educationYears.endYear}`,
            })

        }
    }, [info]);

    useEffect(() => {
        if (userInfo) {
            const { age, number, residence, email } = userInfo;
            setUserInfoData({
                "Вік:": age || "",
                "Телефон:": number || "",
                "Місце проживання:": residence || "",
                "Email:": email || "",
            });
        }
    }, [userInfo]);

    useEffect(() => {
        if (info && info.skills) {
            setSkills(info.skills);
        }
    }, [info]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/user-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setUserInfo(res.data))
            .catch((error) => {
                setError("Сталась помилка, спробуйте пізніше");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні даних:", error);
            });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios
            .get(`http://localhost:3000/my-resume/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                const parsedSkills = JSON.parse(res.data.skills || '[]');
                const parsedEducationYears = JSON.parse(res.data.educationYears || '[]');
                setInfo({
                    ...res.data,
                    skills: parsedSkills,
                    educationYears: parsedEducationYears,
                });
                setSkills(parsedSkills);
                fetchSkillsByCategory(res.data.category);
            })
            .catch((error) => {
                setError("Сталась помилка, спробуйте пізніше");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні даних:", error);
            });
    }, [id]);

    const handleSave = (updatedValues, type) => {
        const token = localStorage.getItem("token");
        let formattedValues = { type };

        if (type === "general") {
            formattedValues = {
                ...formattedValues,
                title: updatedValues["Посада:"],
                city: updatedValues["Готовий працювати:"],
                category: updatedValues["Категорія:"],
                employment: updatedValues["Вид зайнятості:"],
            };
        } else if (type === "experience") {
            formattedValues = {
                ...formattedValues,
                position: updatedValues["Посада:"],
                companyName: updatedValues["Назва компанії:"],
                workTime: updatedValues["Період роботи:"],
            };
        } else if (type === "education") {
            formattedValues = {
                ...formattedValues,
                education: updatedValues["Ступінь освіти"],
                educationalInstitution: updatedValues["Заклад освіти:"],
                faculty: updatedValues["Факультет:"],
                specialty: updatedValues["Спеціальність:"],
                educationYears: {
                    startYear: updatedValues["Період навчання:"].split("-")[0],
                    endYear: updatedValues["Період навчання:"].split("-")[1],
                },
            };
        }

        axios
            .put(`http://localhost:3000/my-resume/${id}`, formattedValues, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                if (type === "general") {
                    setGeneralInfo((prev) => ({
                        ...prev,
                        "Посада:": formattedValues.title,
                        "Готовий працювати:": formattedValues.city,
                        "Категорія:": formattedValues.category,
                        "Вид зайнятості:": formattedValues.employment,
                    }));
                } else if (type === "experience") {
                    setExperienceInfo((prev) => ({
                        ...prev,
                        "Посада:": formattedValues.position,
                        "Назва компанії:": formattedValues.companyName,
                        "Період роботи:": formattedValues.workTime,
                    }))
                } else if (type === "education") {
                    setEduInfo((prev) => ({
                        ...prev,
                        "Ступінь освіти": formattedValues.education,
                        "Заклад освіти:": formattedValues.educationalInstitution,
                        "Факультет:": formattedValues.faculty,
                        "Спеціальність:": formattedValues.specialty,
                        "Період навчання:": `${formattedValues.educationYears.startYear} - ${formattedValues.educationYears.endYear}`,
                    }));
                }
            })
            .catch((error) => {
                console.error("Помилка при збереженні даних:", error);
            });
    };

    const updateUser = (updatedValues, type) => {
        const token = localStorage.getItem("token");
        let formattedValues = { type }

        formattedValues = {
            ...formattedValues,
            age: updatedValues["Вік:"],
            number: updatedValues["Телефон:"],
            residence: updatedValues["Місце проживання:"],
            email: updatedValues["Email:"],
        };

        axios
            .put(`http://localhost:3000/user-profile`, formattedValues, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                if (type === "user") {
                    setUserInfoData((prev) => ({
                         ...prev,
                        "Вік:": formattedValues.age,
                        "Телефон:": formattedValues.number,
                        "Місце проживання:": formattedValues.residence,
                        "Email:": formattedValues.email,
                    }))
                }
                console.log("Дані користувача успішно оновлено");
            })
            .catch((error) => {
                console.error("Помилка при оновленні даних користувача:", error);
            });
    };



    const fetchSkillsByCategory = (category) => {
        axios
            .get(`http://localhost:3000/create-resume?category=${category}`)
            .then((res) => {
                setSkillOptions(res.data);
            })
            .catch((error) => {
                setError("Сталась помилка при завантаженні навичок");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні навичок:", error);
            });
    };

    const toggleEditMode = () => {
        setIsEditing((prev) => !prev); // Перемикаємо режим редагування
    };

    const handleAddSkill = () => {
        if (currentSkill && !skills.includes(currentSkill)) {
            setSkills((prevSkills) => [...prevSkills, currentSkill]);
            setCurrentSkill(""); // Очищаємо поле
        }
    };

    const handleDeleteSkill = (skill) => {
        setSkills((prevSkills) => prevSkills.filter((s) => s !== skill));
    };

    const handleSkillClick = (skill) => {
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setSkills(info.skills);  // Відновлюємо навички з info
    };

    const handleSaveSkills = () => {
        const token = localStorage.getItem("token");
        console.log("Дані для збереження:", { type: "skills", skills });
        const skillsJson = JSON.stringify(skills);
        console.log(skillsJson);

        axios
            .put(`http://localhost:3000/my-resume/${id}`, {type: "skills", skillsJson }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setSkills(skills);
                setIsEditing(false);
                console.log("Навички успішно збережено");
            })
            .catch((error) => {
                console.error("Помилка при збереженні навичок", error);
            });
    };

    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    if (!info) {
        return <div className="loading">Завантаження...</div>;
    }

    const subtitle = userInfo ? `${userInfo.name} ${userInfo.surname}` : "Ім'я не вказано";

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="container__content">
                    <div className="card">
                        {info && (
                            <ShowEditInfo
                                subtitle="Загальна інформація"
                                labels={Object.keys(generalInfo)}
                                values={generalInfo}
                                onSave={(fields) => handleSave(fields, "general")}
                                id={info.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {userInfoData && (
                            <ShowEditInfo
                                title="Особисті дані"
                                subtitle={subtitle}
                                labels={Object.keys(userInfoData)}
                                values={userInfoData}
                                onSave={(fields) => updateUser(fields, "user")}
                                id={userInfoData.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {info && (
                            <ShowEditInfo
                                subtitle="Загальна інформація"
                                labels={Object.keys(experienceInfo)}
                                values={experienceInfo}
                                onSave={(fields) => handleSave(fields, "experience")}
                                id={info.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {info && (
                            <ShowEditInfo
                                subtitle="Освіта"
                                labels={Object.keys(eduInfo)}
                                values={eduInfo}
                                onSave={(fields) => handleSave(fields, "education")}
                                id={info.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        <h2>Знання і навички</h2>
                        {isEditing ? (
                            <>
                                <ul className="skills__list">
                                    {skills.map((skill, index) => (
                                        <li className="skills__list__item" key={index}>
                                            {skill}
                                            <button
                                                className="btn__delete_item"
                                                onClick={() => handleDeleteSkill(skill)}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <input
                                    className="l__input skill__input"
                                    type="text"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddSkill();
                                        }
                                    }}
                                    placeholder="Введіть нову навичку"
                                />
                                <h4>Пропоновані навички:</h4>
                                <ul className="skills__list">
                                    {Array.isArray(skillOptions) &&
                                        skillOptions
                                            .filter((skill) =>
                                                skill.name.toLowerCase().includes(currentSkill.toLowerCase())
                                            )
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
                                <div className="edit__block">
                                    <button className="edit__btn" onClick={handleSaveSkills}>
                                        Зберегти навички
                                    </button>
                                    <button className="edit__btn" onClick={handleCancelEdit}>
                                        Скасувати
                                    </button>
                                </div>
                            </>
                        ) : (
                            <ul className="skills__list">
                                {skills && skills.map((skill, index) => (
                                    <li className="skills__list__item" key={index}>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {!isEditing && (
                            <div className="edit__block">
                                <button
                                    className="edit__btn"
                                    onClick={toggleEditMode}
                                >
                                    Редагувати
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(MyResume);