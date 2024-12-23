import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
// import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resume.css"
import axios from "axios";
import ShowInfo from "./show_info";
import Header from "./header";

function Resume() {
    const {id} = useParams();
    const [error, setError] = useState("");
    const [resume, setResume] = useState(null);
    const [generalInfo, setGeneralInfo] = useState({labels: [], values: []});
    const [userInfo, setUserInfo] = useState({labels: [], values: []});
    const [experienceInfo, setExperienceInfo] = useState({labels: [], values: []});
    const [eduInfo, setEduInfo] = useState({labels: [], values: []});
    const [skills, setSkills] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState(null);

    useEffect(() => {
        if (resume) {
            setGeneralInfo({
                labels: ["Прізвище та ім'я:", "Дата народження:", "Готовий працювати:", "Вид зайнятості:"],
                values: [resume.fullname || "", resume.birthday || "", resume.city || "", resume.employment || ""],
            });

            setExperienceInfo({
                labels: ["Посада:", "Назва компанії:", "Період роботи:"],
                values: [resume.position || "", resume.companyName || "", resume.workTime],
            });

            setEduInfo({
                labels: ["Ступінь освіти:", "Заклад освіти:", "Факультет:", "Спеціальність:", "Період навчання:"],
                values: [
                    resume.education || "",
                    resume.educationalInstitution || "",
                    resume.faculty || "",
                    resume.specialty || "",
                    resume.educationYears ? `${resume.educationYears.startYear} - ${resume.educationYears.endYear}` : "",
                ],
            });

            setSkills(resume.skills);
        }
    }, [resume]);

    useEffect(() => {
        if (userInfo && !userInfo.labels) {
            setUserInfo({
                labels: ["Вік:", "Телефон:", "Місце проживання:", "Email:"],
                values: [userInfo.age || "", userInfo.number || "", userInfo.residence || "", userInfo.email || ""],
            });
        }
    }, [userInfo]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`http://localhost:3000/user-profile`, {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((res) => {
                setUserInfo((prev) => {
                    if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
                        return res.data;
                    }
                    return prev;
                });
            })
            .catch((error) => {
                setError("Сталась помилка, спробуйте пізніше");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні даних:", error);
            });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`http://localhost:3000/show/resume/${id}`, {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((res) => {
                console.log("res", res.data)
                const parsedSkills = JSON.parse(res.data.skills || '[]');
                const parsedEducationYears = JSON.parse(res.data.educationYears || '[]');
                setResume({
                    ...res.data,
                    skills: parsedSkills,
                    educationYears: parsedEducationYears,
                });
                setSkills(parsedSkills);

                axios
                    .get('http://localhost:3000/select-vacancies', {
                        headers: {Authorization: `Bearer ${token}`},
                    })
                    .then((res) => {
                        console.log("Дані з сервера:", res.data);
                        if (Array.isArray(res.data)) {
                            const updatedVacancies = res.data.map(vacancy => ({
                                ...vacancy,
                                education: JSON.parse(vacancy.education || '[]'),
                                languages: JSON.parse(vacancy.languages || '[]'),
                                targetAudiences: JSON.parse(vacancy.targetAudiences || '[]'),
                                description: JSON.parse(vacancy.description || '[]'),
                            }));
                            setVacancies(updatedVacancies);
                        } else {
                            console.error("Отримано неправильний формат даних");
                        }
                    });
            })
            .catch((error) => {
                setError(error.response?.status === 404 ? "Резюме не знайдено" : "Не вдалося завантажити резюме");
                console.error("Помилка при отриманні резюме:", error);
            });
    }, [id]);

    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    const handleVacancySelect = (vacancy) => {
        setSelectedVacancy(vacancy);
    };

    const handleSendVacancy = async () => {
        if (!selectedVacancy) {
            alert("Оберіть вакансію перед надсиланням!");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await axios.post('http://localhost:3000/send/vacancy',
                {
                    resumeId: id,
                    vacancyId: selectedVacancy.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("res", res);
            alert("Вакансію надіслано успішно!");
            handleModalClose();
        } catch (error) {
            console.error("Помилка при відправці вакансії:", error);
            alert("Не вдалося надіслати вакансію.");
        }
    };

    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    if (!resume) {
        return <div>Завантаження...</div>;
    }

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="container__content">
                    <div className="card">
                        {generalInfo.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Загальна інформація"
                                labels={generalInfo.labels}
                                values={generalInfo.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {userInfo && (
                            <ShowInfo
                                subtitle="Особиста інформація"
                                labels={userInfo.labels}
                                values={userInfo.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {experienceInfo.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Досвід роботи"
                                labels={experienceInfo.labels}
                                values={experienceInfo.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {eduInfo.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Освіта"
                                labels={eduInfo.labels}
                                values={eduInfo.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        <h2>Знання і навички</h2>
                        {skills.length > 0 && (
                            <ul className="skills__list">
                                {skills && skills.map((skill, index) => (
                                    <li className="skills__list__item" key={index}>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="btn__respond  btn btn__submit" onClick={handleModalOpen}>Відгукнутися</button>
                </div>
            </div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal__content">
                        <h2>Оберіть вакансію для відгуку</h2>
                        <div className="resume__block">
                            {vacancies.map((vacancy) => (
                                <div className="resume__block__item resume__actions" key={vacancy.id}>
                                    <div>
                                        <label className="radio__label">
                                            <input
                                                type="radio"
                                                className="radio__btn"
                                                name="selectedVacancy"
                                                value={vacancy.id}
                                                onChange={() => handleVacancySelect(vacancy)}
                                            />
                                        </label>
                                        <h3>{vacancy.title}</h3>
                                    </div>
                                    <a className="resume__actions__link" href={`/my/vacancy/${vacancy.id}`}>
                                        <button className="btn btn__view">Переглянути вакансію</button>
                                    </a>
                                </div>
                            ))}
                            <div className="modal__actions">
                                <button onClick={handleSendVacancy} className="btn">Надіслати</button>
                                <button onClick={handleModalClose} className="btn">Закрити</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(Resume);