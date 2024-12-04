const connection = require("../Modal/mysql_connection");
const crypto = require('crypto');

function validateLoginData(email, password) {
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
}

function authenticateUser(email, password, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';

    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Помилка при запиті до бази даних:', err.stack);
            return callback(err);
        }

        if (results.length === 0) {
            return callback(null, false);
        }

        const user = results[0];

        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        if (hashedPassword !== user.password) {
            console.log("Не вірний пароль");
            return callback(null, false);
        }

        return callback(null, true);
    });
}

function loginUser(userData, res) {
    try {
        validateLoginData(userData.email, userData.password);
    } catch (err) {
        return res.status(400).send(err.message);
    }

    authenticateUser(userData.email, userData.password, (err, isAuthenticated) => {
        if (err) {
            console.error("Сталася помилка при автентифікації:", err.stack);
            return res.status(500).send("Сталася помилка при автентифікації");
        }

        if (!isAuthenticated) {
            return res.status(401).send("Невірний логін або пароль");
        } else {
            return res.status(201).send("Логін успішний");
        }
    });
}

module.exports = { loginUser };
