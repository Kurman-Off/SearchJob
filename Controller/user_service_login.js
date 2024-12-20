const connection = require("../Modal/mysql_connection");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const SECRET_KEY = "secret_key";

function validateLoginData(email, password) {
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
}

function authenticateUser(email, password, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';

    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Помилка при запиті  до бази даних:', err.stack);
            return callback(err);
        }

        if (results.length === 0) return callback(null, false);

        const user = results[0];
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        if (hashedPassword !== user.password) {
            console.log("Не вірний пароль");
            return callback(null, false);
        }

        return callback(null, true, user);
    });
}

function loginUser(userData, res) {
    try {
        validateLoginData(userData.email, userData.password);
    } catch (err) {
        return res.status(400).send(err.message);
    }

    authenticateUser(userData.email, userData.password, (err, isAuthenticated, user) => {
        if (err) {
            return res.status(500).send("Сталася помилка при автентифікації");
        }

        if (!isAuthenticated) {
            return res.status(401).send("Невірний логін або пароль");
        } else {
            const token = jwt.sign({id: user.id, email: user.email}, SECRET_KEY, {
                expiresIn: "30d"
            });
            return res.status(200).json({token, message: "Логін успішний"});
        }
    });
}

module.exports = { loginUser };
