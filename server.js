const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db_valid = require("./Modal/db_validation");
const cors = require("cors");
const connection = require("./Modal/mysql_connection");

const { extractUserDataRegistration } = require("./Controller/user_data_registration");
const { registerNewUser } = require("./Controller/user_service_registration");
const { extractUserDataLogin } = require("./Controller/user_data_login")
const { loginUser } = require("./Controller/user_service_login")
const { VacancyData } = require("./Controller/vacancy_data")
const { insertVacancy } = require("./Controller/vacancy_service")
const { insertResume } = require("./Controller/resume_service")
const { ResumeData } = require("./Controller/resume_data")

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

/* vacancy start */
app.post("/create-vacancy", (req, res) => {
    insertVacancy(VacancyData(req), res);
});
/* vacancy end */

/* resume start */
app.post("/create-resume", (req, res) => {
    insertResume(ResumeData(req), res);
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
/* resume end */

/* Обробка GET запитів start */
app.get('*', (req, res) => {
    res.sendFile(path.join(viewsPath + "/front/build/index.html"));
});
/* Processing of GET requests end */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});

