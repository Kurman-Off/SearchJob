import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
import withAuth from "./withAuth";
import "../style/my-resume.css"
import "../style/selection.css"
import axios from "axios";
import ShowInfo from "./show_info";
import Header from "./header";
import dateFormat from "dateformat";

function Vacancy() {
    const {id} = useParams();
    const [error, setError] = useState("");
    const [vacancy, setVacancy] = useState(null);
    const [positionCategory, setPositionCategory] = useState({labels: [], values: []});
    const [workingConditions, setWorkingConditions] = useState({labels: [], values: []});
    const [salary, setSalary] = useState({labels: [], values: []});
    const [requirements, setRequirements] = useState({labels: [], values: []});
    const [description, setDescription] = useState({labels: [], values: []});
    const [resumes, setResumes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);

    const formatSalary = (newSalary) => {
        if (typeof newSalary === "object" && newSalary.max !== undefined && newSalary.min !== undefined) {
            return `${newSalary.min} - ${newSalary.max}`;
        } else if (typeof newSalary === "number" || typeof newSalary === "string") {
            return newSalary.toString();
        } else {
            return "Не вказано";
        }
    };

    useEffect(() => {
        if (vacancy) {
            const formattedEmployment = Array.isArray(vacancy.employment) ? vacancy.employment.join(", ") : vacancy.employment;
            const formatedLanguages = Array.isArray(vacancy.languages) ? vacancy.languages.join(", ") : vacancy.languages;
            const formatedTargetAudiences = Array.isArray(vacancy.targetAudiences) ? vacancy.targetAudiences.join(", ") : vacancy.targetAudiences;
            const workingConditionsFormat = vacancy.city && vacancy.address ? `${vacancy.city}/ ${vacancy.address}/ ${vacancy.type}` :
                (vacancy.city ? `${vacancy.city}/ ${vacancy.type}` : (vacancy.address ? `${vacancy.address}/ ${vacancy.type}` : vacancy.type));
            const formattedSalary = formatSalary(vacancy.salary);

            setPositionCategory({
                labels: ["Назва компанії:", "Посада:", "Категорія розміщення вакансії:"],
                values: [vacancy.companyName || "", vacancy.title || "", vacancy.category || ""],
            });


            setWorkingConditions({
                labels: ["Робочі умови:", "Вид зайнятності:"],
                values: [workingConditionsFormat || "", formattedEmployment || ""],
            });

            setSalary({
                labels: ["Заробітна плата:"],
                values: [formattedSalary],
            });

            setRequirements({
                labels: ["Досвід:", "Освіта:", "Знання мов:", "Вакансія підходить для:"],
                values: [vacancy.experience || "", vacancy.education || "", formatedLanguages || "", formatedTargetAudiences || ""],
            });

            setDescription({
                labels: ["Опис вакансії:"],
                values: [vacancy.description || ""],
            });
        }
    }, [vacancy]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/show/vacancy/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("res", res.data);

                const parseJSONField = (field) => {
                    if (Array.isArray(field)) return field;
                    try {
                        return field ? JSON.parse(field) : [];
                    } catch (e) {
                        console.error("Error parsing JSON", e);
                        return [];
                    }
                };

                setVacancy({
                    ...res.data,
                    employment: parseJSONField(res.data.employment),
                    education: parseJSONField(res.data.education),
                    languages: parseJSONField(res.data.languages),
                    targetAudiences: parseJSONField(res.data.targetAudiences),
                });

                axios
                    .get('http://localhost:3000/select-resumes', {
                        headers: {Authorization: `Bearer ${token}`},
                    })
                    .then((res) => {
                        console.log("Дані з сервера:", res.data);
                        if (Array.isArray(res.data)) {
                            const updatedResumes = res.data.map((resume) => ({
                                ...resume,
                                employment: Array.isArray(resume.employment)
                                    ? resume.employment
                                    : resume.employment.split(','),
                                birthday: dateFormat(new Date(resume.birthday), 'dd.mm.yyyy'),
                            }));
                            setResumes(updatedResumes);
                        } else {
                            console.error("Отримано неправильний формат даних");
                        }
                    });
            })
            .catch((error) => {
                setError(error.response?.status === 404 ? "Вакансія не знайдена" : "Не вдалося завантажити вакансію");
                console.error("Помилка при отриманні вакансії:", error);
            });
    }, [id]);


    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    const handleResumeSelect = (resume) => {
        setSelectedResume(resume);
    };
    const handleSendResume = async () => {
        if (!selectedResume) {
            alert("Оберіть резюме перед надсиланням!");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await axios.post('http://localhost:3000/send/resume',
                {
                    vacancyId: id,
                    resumeId: selectedResume.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("res", res);
            alert("Резюме надіслано успішно!");
            handleModalClose();
        } catch (error) {
            console.error("Помилка при відправці резюме:", error);
            alert("Не вдалося надіслати резюме.");
        }
    };


    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    if (!vacancy) {
        return <div>Завантаження...</div>;
    }

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="container__content">
                    <div className="card">
                        {positionCategory.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Деталі вакансії"
                                labels={positionCategory.labels}
                                values={positionCategory.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {workingConditions.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Умови роботи"
                                labels={workingConditions.labels}
                                values={workingConditions.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {salary.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Зарплата"
                                labels={salary.labels}
                                values={salary.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {requirements.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Вимоги до шукача"
                                labels={requirements.labels}
                                values={requirements.values}
                            />
                        )}
                    </div>

                    <div className="card">
                        {description.labels.length > 0 && (
                            <ShowInfo
                                subtitle="Опис"
                                labels={description.labels}
                                values={description.values}
                            />
                        )}
                    </div>
                    <button className="btn__respond  btn btn__submit" onClick={handleModalOpen}>Відгукнутися</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal__content">
                        <h2>Оберіть резюме для відгуку</h2>
                        <div className="resume__block">
                            {resumes.map((resume) => (
                                <div className="resume__block__item resume__actions" key={resume.id}>
                                    <div>
                                        <label className="radio__label">
                                            <input
                                                type="radio"
                                                className="radio__btn"
                                                name="selectedResume"
                                                value={resume.id}
                                                onChange={() => handleResumeSelect(resume)}
                                            />
                                        </label>
                                        <h3>{resume.title}</h3>
                                    </div>
                                    <a className="resume__actions__link" href={`/my/resume/${resume.id}`}>
                                        <button className="btn btn__view">Переглянути резюме</button>
                                    </a>
                                </div>
                            ))}
                            <div className="modal__actions">
                                <button onClick={handleSendResume} className="btn">Надіслати</button>
                                <button onClick={handleModalClose} className="btn">Закрити</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(Vacancy);
