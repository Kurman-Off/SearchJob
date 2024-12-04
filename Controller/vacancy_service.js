const connection = require("../Modal/mysql_connection");

function insertVacancy(vacancyCategoryData, res) {
    const { title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description} = vacancyCategoryData;

    const insertQuery = "INSERT INTO vacancy (title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    connection.query(insertQuery, [
        title,
        category,
        type,
        city,
        address,
        JSON.stringify(employment),
        JSON.stringify(salary),
        experience,
        JSON.stringify(education),
        JSON.stringify(languages),
        JSON.stringify(targetAudiences),
        JSON.stringify(description),
    ], (err, result) => {
        if (err) {
            console.error("Помилка при вставленні даних у таблицю:", err.stack);
            res.status(500).json({ message: "Помилка на сервері" });
            return;
        }
        res.status(201).send({ message: "Вакансія створена", insertId: result.insertId });
    });
}

module.exports = { insertVacancy };
