const connection = require("../Modal/mysql_connection");

function insertResume(resumeData, res) {
    const { fullname, title, city, category, birthday, position, companyName, workTime, education, educationalInstitution, faculty, specialty, educationYears, skills } = resumeData;

    const insertQuery = "INSERT INTO resume (fullname, title, city, category, birthday, position, companyName, workTime, education, educationalInstitution, faculty, specialty, educationYears, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    connection.query(insertQuery, [
        fullname,
        title,
        city,
        category,
        birthday,
        position,
        companyName,
        workTime,
        education,
        educationalInstitution,
        faculty,
        specialty,
        JSON.stringify(educationYears),
        JSON.stringify(skills),
    ], (err, result) => {
        if (err) {
            console.error("Помилка при вставленні даних у таблицю:", err.stack);
            res.status(500).json({ message: "Помилка на сервері" });
            return;
        }
        res.status(201).send({ message: "Резюме створено", insertId: result.insertId });
    });
}

module.exports = { insertResume };
