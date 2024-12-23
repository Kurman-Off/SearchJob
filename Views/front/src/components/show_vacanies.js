import React, {useEffect, useState} from "react";
import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resumes.css"
import axios from "axios";
import ShowInfo from "./show_info";
function Vacancies() {
    const [vacancies, setVacancies] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/show-vacancies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            })
            .catch((error) => {
                console.error("Помилка при завантаженні даних:", error);
            });
        }, []);

    const formatSalary = (salary) => {
        if (salary && typeof salary === 'object' && salary.max !== undefined && salary.min !== undefined) {
            return `${salary.min} - ${salary.max}`;
        }
        if (salary && (typeof salary === 'number' || typeof salary === 'string')) {
            return salary.toString();
        }
        return "Не вказано";
    };

    return (
        <div className="wrapper">
            <Header/>
            <div className="my__resumes">
                <div className="my__resumes__block__title">
                </div>
                <div className="resume__block">
                    {vacancies.map((vacancy) => {
                        const salaryDisplay = formatSalary(vacancy.salary);
                        const companyInfo = vacancy.city && vacancy.address
                            ? `${vacancy.companyName}, (${vacancy.city}, ${vacancy.address})`
                            : vacancy.companyName;
                        const userInfo = {
                            labels: ["Зарплата:", "Компанія:", "Тип роботи:", "Опис:"],
                            values: [salaryDisplay, companyInfo, vacancy.type, vacancy.description],
                        };
                        return (
                            <div className="resume__block__item" key={vacancy.id}>
                                <ShowInfo subtitle={vacancy.title} labels={userInfo.labels} values={userInfo.values}/>
                                <a href={`/show/vacancy/${vacancy.id}`}>
                                    <button className="btn btn__submit">Переглянути вакансію</button>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
export default withAuth(Vacancies);
