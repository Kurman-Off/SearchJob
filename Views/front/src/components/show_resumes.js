import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShowInfo from './show_info';
import Header from "./header";
import dateFormat from "dateformat";

const Resumes = () => {
    const [resumes, setResumes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Token is missing');
            return;
        }

        axios.get('http://localhost:3000/show-resumes', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                console.log("Дані з сервера:", res.data);
                if (Array.isArray(res.data)) {
                    const updatedResumes = res.data.map(resume => ({
                        ...resume,
                        employment: resume.employment.split(','),
                        birthday: dateFormat(new Date(resume.birthday), 'dd.mm.yyyy')
                    }));
                    setResumes(updatedResumes);
                } else {
                    console.error("Отримано неправильний формат даних");
                }
            })
            .catch((error) => {
                console.error('Error fetching resumes:', error);
                setError('Failed to load resumes');
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
            <Header />
            <div className="my__resumes">
                <div className="my__resumes__block__title">
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
                                <a href={`/show/resume/${resume.id}`}>
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

export default Resumes;
