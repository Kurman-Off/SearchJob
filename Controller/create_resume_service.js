const connection = require("../Modal/mysql_connection");

function insertResume(resumeData, res) {
    const {
        fullname,
        title,
        city,
        category,
        employment,
        birthday,
        position,
        companyName,
        workTime,
        education,
        educationalInstitution,
        faculty,
        specialty,
        educationYears,
        skills,
        user_id,
    } = resumeData;

    const insertQuery = `
        INSERT INTO resume 
        (fullname, title, city, category, employment, birthday, position, companyName, workTime, education, educationalInstitution, faculty, specialty, educationYears, skills, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertQuery, [
        fullname,
        title,
        city,
        category,
        employment,
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
        user_id,
    ], (err, result) => {
        if (err) {
            console.error("Помилка при вставленні даних у таблицю:", err.stack);
            res.status(500).json({ message: "Помилка на сервері" });
            return;
        }
        res.status(200).send({ message: "Резюме створено", insertId: result.insertId });
    });
}

module.exports = { insertResume };
