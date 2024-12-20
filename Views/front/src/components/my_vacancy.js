import React, {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resume.css"
import axios from "axios";
import ShowEditInfo from "./show_edit_info";

function MyVacancy() {
    const { id } = useParams();
    const [error, setError] = useState("");
    const [vacancy, setVacancy] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios
            .get(`http://localhost:3000/my-vacancy/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setVacancy({
                    ...res.data,
                    education: JSON.parse(res.data.education || '[]'),
                    languages: Array.isArray(res.data.languages)
                        ? res.data.languages
                        : JSON.parse(res.data.languages || '[]'),
                    targetAudiences: JSON.parse(res.data.targetAudiences || '[]'),
                    description: JSON.parse(res.data.description || '[]'),
                });
            })
            .catch((error) => {
                setError("Сталась помилка, спробуйте пізніше");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні даних:", error);
            });
    }, [id]);

    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    if (!vacancy) {
        return <div className="loading">Завантаження...</div>;
    }

    const formatSalary = (salary) => {
        if (salary && typeof salary === 'object' && salary.max !== undefined && salary.min !== undefined) {
            return `${salary.min} - ${salary.max}`;
        }

        if (salary && (typeof salary === 'number' || typeof salary === 'string')) {
            return salary.toString();
        }

        return "Не вказано";
    };


    const positionCategory = {
        labels: ["Посада:", "Категорія розміщення вакансії"],
        values: [vacancy.title, vacancy.category]
    }

    const workingConditionsFormat = vacancy.city && vacancy.address
        ? `${vacancy.city}, ${vacancy.address}, ${vacancy.type}`
        : vacancy.type;

    const workingConditions = {
        labels: ["Робочі умови:", "Вид зайнятності:"],
        values: [workingConditionsFormat, vacancy.employment]
    }

    const salaryDisplay = formatSalary(vacancy.salary);

    const salary = {
        labels: [salaryDisplay],
    }

    const requirements = {
        labels: ["Досвід:", "Освіта:", "Знання мов:", "Вакансія підходить для:"],
        values: [vacancy.experience, vacancy.education, vacancy.languages.join(","), vacancy.targetAudiences.join(",")]
    }

    const description = {
        labels: [vacancy.description]
    }

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="container__content">
                    <div className="card">
                        <ShowEditInfo subtitle={vacancy.companyName} labels={positionCategory.labels}
                                  values={positionCategory.values}/>
                    </div>

                    <div className="card">
                        <ShowEditInfo subtitle="Умови роботи" labels={workingConditions.labels}
                                  values={workingConditions.values}/>
                    </div>

                    <div className="card">
                        <ShowEditInfo subtitle={"Зарплата:"} labels={salary.labels}/>
                    </div>

                    <div className="card">
                        <ShowEditInfo subtitle={"Вимоги до шукача"} labels={requirements.labels}
                                  values={requirements.values}/>
                    </div>

                    <div className="card">
                        <ShowEditInfo subtitle={"Опис вакансії"} labels={description.labels} values={description.values}/>
                    </div>

                </div>
            </div>

            <button className="btn" type="send">dsad</button>
        </div>
    );
}

export default withAuth(MyVacancy);