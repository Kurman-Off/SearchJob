import React, {useEffect, useState} from "react";
import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resumes.css"
import axios from "axios";
import ShowInfo from "./show_info";

function MyResumes() {

    const [error, setError] = useState("");
    const [resumes, setResumes] = useState([]);


    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/my-resumes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("Дані з сервера:", res.data);
                if (Array.isArray(res.data)) {
                    const updatedResumes = res.data.map(resume => ({
                        ...resume,
                        employment: resume.employment.split(',')
                    }));
                    setResumes(updatedResumes);
                } else {
                    console.error("Отримано неправильний формат даних");
                }
            })
            .catch((error) => {
                setError("Сталась помилка, спробуйте пізніше");
                setTimeout(() => setError(""), 3000);
                console.error("Помилка при завантаженні даних:", error);
            });
    }, []);

    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    if (resumes.length === 0) {
        return <div className="loading">Завантаження...</div>;
    }

    return (
        <div className="wrapper">
            <Header/>
            <div className="my__resumes">
                <div className="my__resumes__block__title">
                    <h1 className="my__resumes__title">Мої резюме</h1>
                    <a href="/create/resume/">
                        <button className="btn__create">
                            <span>+</span>
                            Створити
                        </button>
                    </a>
                </div>
                <div className="resume__block">
                    {resumes.map((resume) => {
                        const userInfo = {
                            labels: ["Прізвище та Ім'я:", "Дата народження:", "Готовий працювати:", "Вид зайнятості:"],
                            values: [resume.fullname, resume.birthday, resume.city, resume.employment.join(",\n")],
                        };

                        return (
                            <div className="resume__block__item" key={resume.id}>
                                <ShowInfo subtitle={resume.title} labels={userInfo.labels} values={userInfo.values}/>
                                <a href={`/my/resume/${resume.id}`}>
                                    <button className="btn btn__submit">Переглянути резюме</button>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default withAuth(MyResumes);