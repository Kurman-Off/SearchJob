const connection = require("./Modal/mysql_connection");
const db_valid = require("./Modal/db_validation");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const authenticate = require("./Views/front/src/middlewares/authenticate");
const nodemailer = require("nodemailer");
const router = express.Router();
const dayjs = require("dayjs");
require('dotenv').config();


const { extractUserDataRegistration } = require("./Controller/user_data_registration");
const { registerNewUser } = require("./Controller/user_service_registration");
const { extractUserDataLogin } = require("./Controller/user_data_login")
const { loginUser } = require("./Controller/user_service_login")
const { VacancyData } = require("./Controller/create_vacancy_data")
const { insertVacancy } = require("./Controller/create_vacancy_service")
const { insertResume } = require("./Controller/create_resume_service")
const { ResumeData } = require("./Controller/create_resume_data")

const app = express();
const viewsPath = path.join(__dirname, "Views");

app.use(router);
app.use(express.json());
app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://localhost:3001', // Дозволяємо доступ тільки з цього домену
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Дозволяємо певні HTTP методи
    allowedHeaders: ['Content-Type', 'Authorization'], // Дозволяємо заголовки Content-Type та Authorization
};
router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );
});
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(viewsPath, "front/build")));
app.use('/static', express.static(path.join(__dirname, 'front/build/static')));
app.use('/styles', express.static(path.join(__dirname, 'front/src/style')));

db_valid();

/* Registration start */
app.post("/registration", (req, res) => {
    registerNewUser(extractUserDataRegistration(req), res);
});
/*Registration end*/

/* Login start */
app.post("/login", (req, res) => {
    loginUser(extractUserDataLogin(req), res)
});
/*Login end*/

/* create vacancy start */
app.post("/create-vacancy", authenticate, (req, res) => {
    const vacancyData = VacancyData(req);
    vacancyData.user_id = req.user.id;
    insertVacancy(vacancyData, res);
});
/* create vacancy end */

/* create resume start */
app.post("/create-resume", authenticate, (req, res) => {
    const resumeData = ResumeData(req);
    resumeData.user_id = req.user.id;
    insertResume(resumeData, res);
});

app.get("/create-resume", (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }

    connection.query(
        "SELECT name FROM skills WHERE category = ?",
        [category],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Server error" });
            }
            res.json(results.map((row) => ({ name: row.name })));
        }
    );
});
/* create resume end */

/* UserProfile start */
app.get("/user-profile", authenticate, (req, res) => {
    console.log('req.user:', req.user);
    const userId = req.user.id;
    const query = 'SELECT name, surname, age, number, residence, email FROM users WHERE id = ?';

    console.log(req.age)
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні профілю користувача:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Користувача не знайдено');
        }

        res.status(200).json(results[0]);
    });
});

app.put("/user-profile", authenticate, (req, res) => {
    console.log('req.user:', req.user);
    const userId = req.user.id;
    const { type, ...updatedValues } = req.body;

    console.log("Type:", type);

    console.log("Received data:", req.body); // Перевірте, чи приходить age

    if (type === "user") {
        const { age, number, residence, email } = updatedValues;
        console.log("Age:", age);

        const query = `
            UPDATE users 
            SET age = ?, number = ?, residence = ?, email = ?
            WHERE id = ?
        `;
        const values = [age, number, residence, email, userId];

        console.log("Query:", query);
        console.log("Values:", values);

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error("Помилка при оновленні резюме:", err);
                return res.status(500).send("Помилка сервера");
            }

            if (results.affectedRows === 0) {
                return res.status(404).send("Резюме не знайдено або у вас немає прав доступу");
            }

            res.status(200).send("Резюме успішно оновлено");
        });
    }
});
/* UserProfile end */

/* MyResumes start */
app.get("/my-resumes", authenticate, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, fullname, title, city, employment, birthday FROM resume WHERE user_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Резюме не знайдено');
        }

        res.status(200).json(results);
    });
});
/* MyResumes end */

/* MyResume start */
app.get("/my-resume/:id", authenticate, (req, res) => {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const query = 'SELECT * FROM resume WHERE id = ? AND user_id = ?';

    connection.query(query, [resumeId ,userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні профілю користувача:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Резюме не знайдено');
        }

        res.status(200).json(results[0]);
    });
});

app.put("/my-resume/:id", authenticate, (req, res) => {
    const resumeId = req.params.id;
    const userId = req.user.id;
    const { type, ...updatedValues } = req.body;

    let query = "";
    let values = [];

    switch (type) {
        case "general":
            const { title, city, category, employment } = updatedValues;

            query = `
                UPDATE resume 
                SET title = ?, city = ?, category = ?, employment = ?
                WHERE id = ?
            `;
            values = [title, city, category, employment, resumeId, userId];
            break;

        case "experience":
            const { position, companyName, workTime } = updatedValues;

            query = `
            UPDATE resume
            SET position = ?, companyName = ?, workTime = ?
            WHERE id = ?
            `;
            values = [position, companyName, workTime, resumeId, userId];
            break;

        case "education":
            const { education, educationalInstitution, faculty, specialty } = updatedValues;

            query = `
            UPDATE resume
            SET education = ?, educationalInstitution = ?, faculty = ?, specialty = ?
            WHERE id = ?
        `;
            values = [education, educationalInstitution, faculty, specialty, resumeId, userId];
            break;

        case "skills":
            const { skillsJson } = updatedValues;
            if (!skillsJson || !Array.isArray(JSON.parse(skillsJson))) {
                return res.status(400).send("Невірний формат даних навичок");
            }

            query = `
            UPDATE resume
            SET skills = ?
            WHERE id = ?
            `;
            values = [skillsJson, resumeId, userId];
            break;

        default:
            return res.status(400).send("Невірний тип оновлення");
    }

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error("Помилка при оновленні резюме:", err);
            return res.status(500).send("Помилка сервера");
        }

        if (results.affectedRows === 0) {
            return res.status(404).send("Резюме не знайдено або у вас немає прав доступу");
        }

        res.status(200).send("Резюме успішно оновлено");
    });
});

app.put("/my-resume/:id", authenticate, (req, res) => {
    const resumeId = req.params.id;
    const userId = req.user.id;
    const { skills } = req.body;

    console.log(req.body);
    if (!skills || !Array.isArray(skills)) {
        return res.status(400).send("Невірний формат даних навичок");
    }

    // Оновлення навичок в базі даних
    const query = `
        UPDATE resume 
        SET skills = ? 
        WHERE id = ? AND user_id = ?
    `;
    const values = [JSON.stringify(skills), resumeId, userId];  // перетворюємо масив навичок на рядок JSON
    console.log(query , values);

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error("Помилка при оновленні навичок:", err);
            return res.status(500).send("Помилка сервера");
        }

        if (results.affectedRows === 0) {
            return res.status(404).send("Резюме не знайдено або у вас немає прав доступу");
        }

        res.status(200).send("Навички успішно оновлені");
    });
});


/* MyResume end */

/* MyVacancies start */
app.get("/my-vacancies", authenticate, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, companyName, title, type, city, address, salary, description FROM vacancy WHERE user_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Вакансію не знайдено');
        }

        res.status(200).json(results);
    });
});
/* MyVacancies end */

/* MyVacancy start */
app.get("/my-vacancy/:id", authenticate, (req, res) => {
    const vacancyId = req.params.id;
    const userId = req.user.id;

    const query = 'SELECT * FROM vacancy WHERE id = ? AND user_id = ?';

    connection.query(query, [vacancyId ,userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні профілю користувача:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Вакансію не знайдено');
        }

        res.status(200).json(results[0]);
    });
});

app.put("/my-vacancy/:id", authenticate, (req, res) => {
    console.log("Received PUT request:", req.body); // Логування самого запиту
    const vacancyId = req.params.id;
    const userId = req.user.id;
    const { typeOfBlock, ...updatedValues } = req.body;

    console.log(typeOfBlock)
    if (!typeOfBlock) {
        console.error("Error: 'type' is missing");
        return res.status(400).send("Error: 'type' is required");
    }

    let query = "";
    let values = [];

    switch (typeOfBlock) {
        case "general":
            const {companyName, title, category} = updatedValues;

            query = `
                UPDATE vacancy
                SET companyName = ?, title = ?, category = ?
                WHERE id = ? AND user_id = ?
            `;
            values = [companyName, title, category, vacancyId, userId];
            console.log("Query:", query, "Values:", values);

            break;

        case "workingConditions":
            const {city, address, type, employment} = updatedValues;

           query = `
                UPDATE vacancy
                SET city = ?, address = ?, type = ?, employment = ?
                WHERE id = ? AND user_id = ?
            `;
            values = [city, address, type, employment, vacancyId, userId];
            console.log("query:", query, "values:", values);
            break;


        case "salary":
            const { salary } = updatedValues;

            // Якщо salary - це рядок
            if (typeof salary === "string") {
                console.log("Одне значення:", salary);
            }
            // Якщо salary - це об'єкт з min та max
            else if (typeof salary === "object" && salary.min && salary.max) {
                // Перевірка, чи є min та max числами
                if (typeof salary.min === "number" && typeof salary.max === "number") {
                    console.log("Діапазон:", salary.min, "-", salary.max);
                } else {
                    return res.status(400).send("Некоректний формат salary (min і max повинні бути числами)");
                }
            } else {
                return res.status(400).send("Некоректний формат salary");
            }

            // Запит для оновлення вакансії
            query = `
        UPDATE vacancy
        SET salary = ?  -- Можна зберігати лише одне значення або обидва значення min та max
        WHERE id = ? AND user_id = ?
    `;

            // Оновіть значення в залежності від того, чи це одиночне значення чи діапазон
            if (typeof salary === "string") {
                values = [salary, vacancyId, userId];
            } else if (typeof salary === "object" && salary.min && salary.max) {
                // Якщо salary - це діапазон, можна зберігати як JSON або окремі поля для min/max
                values = [JSON.stringify(salary), vacancyId, userId];  // Зберігаємо як JSON
            }

            break;


        case "requirements":
            const { experience, education, languages, targetAudiences } = updatedValues;

            query = `
                UPDATE vacancy
                SET experience = ?, education = ?, languages = ?, targetAudiences = ?
                WHERE id = ? AND user_id = ?
            `;
            values = [experience, education, languages, targetAudiences, vacancyId, userId];
            console.log("query:", query, "values:", values);
            break;

        case "description":
            const { description } = updatedValues;

            query = `
                UPDATE vacancy
                SET description = ?
                WHERE id = ? AND user_id = ?
            `;
            values = [description, vacancyId, userId];
            break;

        default:
            return res.status(400).send("Невірний тип оновлення");
    }

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error("Помилка при оновленні вакансії:", err);
            return res.status(500).send("Помилка сервера");
        }

        if (results.affectedRows === 0) {
            return res.status(404).send("Вакансія не знайдена або у вас немає прав доступу");
        }

        res.status(200).send("Вакансію успішно оновлено");
        console.log("Вакансію успішно оновлено");
    });
});
/* MyVacancy end */

/* Show resumes start */
app.get('/show-resumes', authenticate, (req, res) => {
    const userId = req.user.id; // Отримуємо ID поточного користувача

    // Запит для отримання всіх резюме, де user_id не дорівнює поточному користувачу
    const query = 'SELECT id, fullname, title, city, employment, birthday FROM resume WHERE user_id != ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error retrieving resumes');
        }
        res.json(results); // Відправляємо резюме на фронтенд
    });
});
/* Show resumes end */

/* Show vacancies start */
app.get("/show-vacancies", authenticate, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, companyName, title, type, city, address, salary, description FROM vacancy WHERE user_id != ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Вакансію не знайдено');
        }

        res.status(200).json(results);
    });
});
/* Show vacancies end */

/* Show resume start */
app.get('/show/resume/:id', (req, res) => {
    const resumeId = req.params.id;

    console.log(resumeId);
    const query = `
        SELECT * FROM resume WHERE id = ?
    `;

    connection.query(query, [resumeId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Резюме не знайдено');
        }

        res.status(200).json(results[0]);
    });
});
/* Show resume end */

/* Show Vacancy start */
app.get('/show/vacancy/:id', (req, res) => {
    const vacancyId = req.params.id;

    console.log(vacancyId);
    const query = `
        SELECT * FROM vacancy WHERE id = ?
    `;

    connection.query(query, [vacancyId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Резюме не знайдено');
        }

        res.status(200).json(results[0]);
    });
});
/* Show Vacancy end */

/* Select resumes start */
app.get('/select-resumes', authenticate, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, fullname, title, city, employment, birthday FROM resume WHERE user_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error retrieving resumes');
        }
        res.json(results);
    });
});
/* Select resumes end */

/* Select vacancies start */
app.get('/select-vacancies', authenticate, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, companyName, title, type, city, address, salary, description FROM vacancy WHERE user_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Помилка при отриманні резюме:', err);
            return res.status(500).send('Помилка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Вакансію не знайдено');
        }

        res.status(200).json(results);
    });
});
/* Select vacancies end */

/* Send resume end */
const transporter = nodemailer.createTransport({
    service: 'gmail', // Використовуємо Gmail для надсилання пошти
    auth: {
        user: process.env.EMAIL_USER, // Ваш email з .env
        pass: process.env.EMAIL_PASS, // Ваш пароль або App Password з .env
    },
});

// Функція для отримання вакансії за id
const getVacancyById = (vacancyId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM vacancy WHERE id = ?`;
        connection.execute(query, [vacancyId], (err, results) => {
            if (err) {
                reject('Помилка при отриманні вакансії: ' + err);
                return;
            }
            if (results.length === 0) {
                reject('Вакансія не знайдена');
                return;
            }
            resolve(results[0]); // Повертаємо перший результат
        });
    });
};

// Функція для отримання резюме за id
const getResumeById = (resumeId) => {
    console.log("resumeID", resumeId)
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM resume WHERE id = ?`;
        connection.execute(query, [resumeId], (err, results) => {
            if (err) {
                reject('Помилка при отриманні резюме: ' + err);
                return;
            }
            if (results.length === 0) {
                reject('Резюме не знайдено');
                return;
            }
            resolve(results[0]); // Повертаємо перший результат
        });
    });
};

// Функція для отримання пошти користувача за його user_id
function getUserEmailById(userId) {
    if (userId === undefined || userId === null) {
        throw new Error('userId не може бути undefined або null');
    }

    return new Promise((resolve, reject) => {
        const query = 'SELECT email FROM users WHERE id = ?';
        connection.execute(query, [userId], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                reject(new Error('Користувача не знайдено'));
            } else {
                resolve(results[0].email);
            }
        });
    });
}

// Обробник для відправки резюме на пошту
app.post('/send/resume', async (req, res) => {
    console.log("res", req.body)
    const {vacancyId, resumeId} = req.body;

    if (vacancyId === undefined || resumeId === undefined) {
        return res.status(400).json({error: 'Невірні дані'});
    }

    try {
        const vacancy = await getVacancyById(vacancyId);
        const resume = await getResumeById(resumeId);
        const userEmail = vacancy.user_id ? await getUserEmailById(vacancy.user_id) : null;
        const birthday = dayjs(resume.birthday).format("MMMM D, YYYY");
        const resumeLink = `http://localhost:3001/show/resume/${resume.id}`;

        const resumeInfo = {
            labels: ["Прізвище та Ім'я:", "Дата народження:", "Готовий працювати:", "Вид зайнятості:"],
            values: [
                resume.fullname,
                birthday,
                resume.city,
                Array.isArray(resume.employment) ? resume.employment.join(", ") : resume.employment,
            ],
        };
        const resumeDetails = resumeInfo.labels.map((label, index) => `${label} ${resumeInfo.values[index] || "Не вказано"}`).join("\n");


        if (!vacancy || !resume) {
            return res.status(404).json({error: 'Вакансія або резюме не знайдено'});
        }

        const mailOptions = {
            from: userEmail,
            to: process.env.EMAIL_USER,
            subject: `Нове резюме на вакансію: ${vacancy.title}`,
            text: `
            Привіт!

            Користувач надіслав своє резюме на вашу вакансію "${vacancy.title}".

            Інформація про резюме:
            ${resumeDetails}
            
            Ви можете переглянути резюме за посиланням:
            ${resumeLink}

            З повагою,
            Ваша платформа для вакансій.
        `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({error: 'Помилка при надсиланні пошти'});
            }
            console.log('Message sent: %s', info.messageId);
            res.status(200).json({message: 'Резюме надіслано на пошту користувача вакансії!'});
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Помилка сервера'});
    }
});
/* Send resume end */

/* Send vacancy start */
// Обробник для відправки резюме на пошту
app.post('/send/vacancy', async (req, res) => {
    console.log("res", req.body);
    const { resumeId, vacancyId } = req.body;

    if (resumeId === undefined || vacancyId === undefined) {
        return res.status(400).json({ error: 'Невірні дані' });
    }

    try {
        const vacancy = await getVacancyById(vacancyId);
        const resume = await getResumeById(resumeId);
        const userEmail = vacancy.user_id ? await getUserEmailById(vacancy.user_id) : null;

        if (!vacancy || !resume) {
            return res.status(404).json({ error: 'Вакансія або резюме не знайдено' });
        }
        const formatSalary = (salary) => {
            if (!salary) return "Не вказано"; // Якщо salary пусте
            if (typeof salary === 'object' && salary.max !== undefined && salary.min !== undefined) {
                return `${salary.min} - ${salary.max}`;
            }
            if (typeof salary === 'number' || typeof salary === 'string') {
                return salary.toString();
            }
            return "Не вказано";
        };


        const salaryDisplay = formatSalary(vacancy.salary);
        const companyInfo = vacancy.city && vacancy.address
            ? `${vacancy.companyName}, (${vacancy.city}, ${vacancy.address})`
            : vacancy.companyName;

        const vacancyInfo = {
            labels: ["Зарплата:", "Компанія:", "Тип роботи:", "Опис:"],
            values: [salaryDisplay, companyInfo, vacancy.type, vacancy.description],
        };

        const vacancyDetails = vacancyInfo.labels.map((label, index) => `${label} ${vacancyInfo.values[index] || "Не вказано"}`).join("\n");
        const vacancyLink = `http://localhost:3001/show/vacancy/${vacancy.id}`;


        const mailOptions = {
            from: userEmail,
            to: process.env.EMAIL_USER,
            subject: `Нова вакансія на резюме: ${resume.title}`,
            text: `
            Привіт!

            Користувач надіслав свою вакансію на ваше резюме "${resume.title}".

            Інформація про вакансію:
            ${vacancyDetails}
            
            Ви можете переглянути вакансію за посиланням:
            ${vacancyLink}

            З повагою,
            Ваша платформа для вакансій.
        `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: 'Помилка при надсиланні пошти' });
            }
            console.log('Message sent: %s', info.messageId);
            res.status(200).json({ message: 'Резюме надіслано на пошту користувача вакансії!' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
/* Send vacancy end */

/* Обробка GET запитів start */
app.get('*', (req, res) => {
    res.sendFile(path.join(viewsPath + "/front/build/index.html"));
});
/* Обробка GET запитів end */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});

