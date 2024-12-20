import React, {useEffect, useState} from "react";
import Header from "./header";
import "../style/main.css";
import "../style/show-info.css";
import withAuth from "./withAuth";
import axios from "axios";
import ShowEditInfo from "./show_edit_info";

function UserProfile() {
    const [error, setError] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [userInfoData, setUserInfoData] = useState({
        "Вік:": "",
        "Телефон:": "",
        "Місце проживання:": "",
        "Email:": "",
    });

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

    const subtitle = userInfo ? `${userInfo.name} ${userInfo.surname}` : "Ім'я не вказано";

    if (error) {
        return <div className="error">Помилка: {error}</div>;
    }

    return (
        <div className="wrapper">
            <Header />

            <div className="class">
                <div className="container">
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
                </div>
            </div>
        </div>
    );
}

export default withAuth(UserProfile);
