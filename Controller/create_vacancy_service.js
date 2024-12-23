const connection = require("../Modal/mysql_connection");

function insertVacancy(vacancyCategoryData, res) {
    const {
        companyName,
        title,
        category,
        type,
        city,
        address,
        employment,
        salary,
        experience,
        education,
        languages,
        targetAudiences,
        description,
        user_id,
    } = vacancyCategoryData;



    console.log(vacancyCategoryData)
    const insertQuery = `
        INSERT INTO vacancy 
        (companyName, title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log("Дані, що відправляються в запит:", {
        companyName,
        title,
        category,
        type,
        city,
        address,
        employment: JSON.stringify(employment),          // Перевірка salary
        salary: JSON.stringify(salary),          // Перевірка salary
        experience,
        education: JSON.stringify(education),    // Перевірка education
        languages: JSON.stringify(languages),    // Перевірка languages
        targetAudiences: JSON.stringify(targetAudiences),  // Перевірка targetAudiences
        description: JSON.stringify(description),  // Перевірка description
        user_id
    });

    connection.query(insertQuery, [
        companyName,
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
        user_id,
    ], (err, result) => {
        if (err) {
            console.error("Помилка при вставленні даних у таблицю:", err.stack);
            res.status(500).json({ message: "Помилка на сервері" });
            return;
        }
        res.status(200).send({ message: "Вакансія створена", insertId: result.insertId });
    });
}

module.exports = { insertVacancy };
