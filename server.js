const connection = require("./Modal/mysql_connection");
const db_valid = require("./Modal/db_validation");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const authenticate = require("./Views/front/src/middlewares/authenticate");

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

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
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
/* MyVacancy end */

/* Обробка GET запитів start */
app.get('*', (req, res) => {
    res.sendFile(path.join(viewsPath + "/front/build/index.html"));
});
/* Обробка GET запитів end */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});

