import React, {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import Header from "./header";
import withAuth from "./withAuth";
import "../style/my-resume.css"
import axios from "axios";
import ShowEditInfo from "./show_edit_info";

function MyVacancy() {
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [positionCategory, setPositionCategory] = useState({
        "Назва компанії:": "",
        "Посада:": "",
        "Категорія розміщення вакансії:": "",
    });

    const [workingConditions, setWorkingConditions] = useState({
        "Робочі умови:": "",
        "Вид зайнятності:": "",
    });


    const [salary, setSalary] = useState({
        "Заробітна плата:": "",
    });

    const [requirements, setRequirements] = useState({
        "Досвід:": "",
        "Освіта:": "",
        "Знання мов:": "",
        "Вакансія підходить для:":"",
    });

    const [description, setDescription] = useState({
        "Опис вакансії:": "",
    });

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
            const { companyName, title, category, city, address, type, employment, salary, experience, education, languages, targetAudiences, description } = vacancy;
            console.log("Vacancy:", vacancy)

            setPositionCategory({
                "Назва компанії:": companyName || "",
                "Посада:": title || "",
                "Категорія розміщення вакансії:": category || "",
            });

            const workingConditionsFormat =
                city && address ? `${city}/ ${address}/ ${type}` :
                    (city ? `${city}/ ${type}` : (address ? `${address}/ ${type}` : type));
            const formattedEmployment = Array.isArray(employment) ? employment.join(", ") : employment;

            setWorkingConditions({
                "Робочі умови:": workingConditionsFormat || "",
                "Вид зайнятності:": formattedEmployment,
            });

            const formattedSalary = formatSalary(salary);  // Оформлюємо зарплату через функцію
            setSalary({
                "Заробітна плата:": formattedSalary,
            });

            const formatedLanguages = Array.isArray(languages) ? languages.join(", ") : languages;
            const formatedTargetAudiences = Array.isArray(targetAudiences) ? targetAudiences.join(", ") : targetAudiences;

            setRequirements({
                "Досвід:": experience || "",
                "Освіта:": education || "",
                "Знання мов:": formatedLanguages,
                "Вакансія підходить для:": formatedTargetAudiences,
            });

            setDescription({
                "Опис вакансії:": description || "Не вказано",
            });
        }
    }, [vacancy]);


    useEffect(() => {
        const token = localStorage.getItem('token');

        axios
            .get(`http://localhost:3000/my-vacancy/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("Дані з сервера:", res.data);
                const parseJSONField = (field) => {
                    if (Array.isArray(field)) {
                        return field;
                    }

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
                    description: parseJSONField(res.data.description),
                });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [id]);

    const parseSalaryInput = (input) => {
        const rangePattern = /^(\d+)\s*-\s*(\d+)$/;
        const match = input.match(rangePattern);

        if (match) {
            return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
        }

        return input;
    };


    const handleSave = (updatedValues, typeOfBlock) => {
        const token = localStorage.getItem("token");
        let formattedValues = { typeOfBlock };
        console.log("FormatVal1:", formattedValues)
        console.log("qwe", updatedValues)

        if (typeOfBlock === "general") {
            formattedValues = {
                ...formattedValues,
                companyName: updatedValues["Назва компанії:"],
                title: updatedValues["Посада:"],
                category: updatedValues["Категорія розміщення вакансії:"],
            };
        } if (typeOfBlock === "workingConditions") {
            formattedValues = {
                ...formattedValues,
                type: updatedValues["Робочі умови:"]
                    ? updatedValues["Робочі умови:"].split("/ ")[2]?.trim() || ""
                    : "",

                city: updatedValues["Робочі умови:"]
                    ? updatedValues["Робочі умови:"].split("/ ")[0]?.trim() || ""
                    : "",

                address: updatedValues["Робочі умови:"]
                    ? updatedValues["Робочі умови:"].split("/ ")[1]?.trim() || ""
                    : "",
                    employment: JSON.stringify(updatedValues["Вид зайнятності:"]
                    ? updatedValues["Вид зайнятності:"].split(",").map(item => item.trim())
                    : [])
            };
        } else if (typeOfBlock === "salary") {
            const parsedSalary = parseSalaryInput(updatedValues["Заробітна плата:"]);
            formattedValues = {
                ...formattedValues,
                salary: parsedSalary, // Записуємо як об'єкт або строку залежно від вводу
            };
        } else if (typeOfBlock === "requirements") {
            formattedValues = {
                ...formattedValues,
                experience: updatedValues["Досвід:"],
                education: JSON.stringify(updatedValues["Освіта:"] || []),
                languages: JSON.stringify(updatedValues["Знання мов:"]
                    ? updatedValues["Знання мов:"].split(", ")
                    : []),  // Перетворення в масив
                targetAudiences: JSON.stringify(updatedValues["Вакансія підходить для:"]
                    ? updatedValues["Вакансія підходить для:"].split(", ")
                    : []),  // Перетворення в масив
            };
        } else if (typeOfBlock === "description") {
            formattedValues = {
                ...formattedValues,
                description: JSON.stringify(updatedValues["Опис вакансії:"] || ""),
            };
        }

        console.log("FormatVal2:", formattedValues)
        axios
            .put(`http://localhost:3000/my-vacancy/${id}`, formattedValues, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                console.log("FormatVal3:", formattedValues)
                if (typeOfBlock === "general") {
                    setPositionCategory((prev) => ({
                        ...prev,
                        "Назва компанії:": formattedValues.companyName,
                        "Посада:": formattedValues.title,
                        "Категорія розміщення вакансії:": formattedValues.category,
                    }));
                } else if (typeOfBlock === "description") {
                    setDescription((prev) => ({
                        ...prev,
                        "Опис вакансії:": formattedValues.description,
                    }));
                } else if (typeOfBlock === "salary") {
                    const parsedSalary = parseSalaryInput(updatedValues["Заробітна плата:"]);
                    setSalary(() => ({
                        "Заробітна плата:": formatSalary(parsedSalary), // Використовуємо `formatSalary` для відображення
                    }));
                } else if (typeOfBlock === "requirements") {
                    setRequirements((prev) => ({
                        ...prev,
                        "Досвід:": formattedValues.experience,
                        "Освіта:": JSON.parse(formattedValues.education),
                        "Знання мов:": JSON.parse(formattedValues.languages).join(","),
                        "Вакансія підходить для:": JSON.parse(formattedValues.targetAudiences).join(","),
                    }));
                } else if (typeOfBlock === "description") {
                    setDescription((prev) => ({
                        ...prev,
                        "Опис вакансії:": JSON.parse(formattedValues.description),
                    }));
                }
            });
    };

    // if (error) {
    //     return <div className="error">Помилка: {error}</div>;
    // }

    if (!vacancy) {
        return <div className="loading">Завантаження...</div>;
    }

    return (
        <div className="wrapper">
            <Header/>
            <div className="container">
                <div className="container__content">
                    <div className="card">
                        {vacancy && (
                            <ShowEditInfo
                                subtitle="Деталі вакансії"
                                labels={Object.keys(positionCategory)}
                                values={positionCategory}
                                onSave={(fields) => handleSave(fields, "general")}
                                id={vacancy.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {vacancy && (
                            <ShowEditInfo
                                subtitle="Умови роботи"
                                labels={Object.keys(workingConditions)}
                                values={workingConditions}
                                onSave={(fields) => handleSave(fields, "workingConditions")}
                                id={vacancy.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {vacancy && (
                            <ShowEditInfo
                                subtitle={"Зарплата:"}
                                labels={["Заробітна плата:"]}
                                values={salary}
                                onSave={(fields) => handleSave(fields, "salary")}
                                id={vacancy.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {vacancy && (
                            <ShowEditInfo
                                subtitle={"Вимоги до шукача"}
                                labels={Object.keys(requirements)}
                                values={requirements}
                                onSave={(fields) => handleSave(fields, "requirements")}
                                id={vacancy.id}
                            />
                        )}
                    </div>

                    <div className="card">
                        {vacancy && (
                            <ShowEditInfo
                                subtitle={"Опис"}
                                labels={Object.keys(description)}
                                values={description}
                                onSave={(fields) => handleSave(fields, "description")}
                                id={vacancy.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(MyVacancy);