const connection = require("../Modal/mysql_connection");
const crypto = require("crypto");

function validateuserData(userData) {
    const cleanedData = {
        name: userData.name.replace(/\s+/g, ""),
        surname: userData.surname.replace(/\s+/g, ""),
        age: userData.age.replace(/\s+/g, ""),
        number: userData.number.replace(/\s+/g, ""),
        residence: userData.residence.replace(/\s+/g, ""),
        email: userData.email.replace(/\s+/g, ""),
        password: userData.password.replace(/\s+/g, "")
    };

    const parseNumber = +cleanedData.number;
    const splitNumber = cleanedData.number.split("");


    if (isNaN(parseNumber) || splitNumber.length !== 13) {
        console.log(splitNumber);
        console.log(typeof(splitNumber));
        console.log(cleanedData.number);
        return { isValid: false, message: "Номер телефону введений не коректно." };
    }

    if (!cleanedData.name || !cleanedData.surname || !cleanedData.residence || !cleanedData.email) {
        return { isValid: false, message: "Поля заповнені не коректно, перевірте введені дані." };
    }

    if (+cleanedData.age < 18) {
        return { isValid: false, message: "Вам не досягається повнолітнього віку для реєстрації." };
    }

    if (cleanedData.password.length < 6) {
        return { isValid: false, message: "Пароль повинен містити щонайменше 6 символів." };
    }

    return { isValid: true, data: cleanedData };
}
function checkUserExists (email, callback) {
    const registrationValid = "SELECT * FROM users WHERE email = ?";

    connection.query(registrationValid, [email], (err, result) => {
        if (err) {
            console.error("Помилка при виборі даних з users:", err.stack);
            return callback(err);
        }
        callback(null, result.length > 0);
    });
}

function registerUser (userDataRegistration, callback) {
    const insertUserQuery = "INSERT INTO users (name, surname, age, number, residence, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)";

    connection.query(
        insertUserQuery,
        [userDataRegistration.name, userDataRegistration.surname, userDataRegistration.age, userDataRegistration.number, userDataRegistration.residence ,userDataRegistration.email, userDataRegistration.password],
        (err, result) => {
        if (err) {
            console.error("Помилка при вставленні даних у users:", err.stack);
            return callback(err);
        }
            callback(null, result.insertId);
    });
}

function registerNewUser(userData, res) {
    const validation = validateuserData(userData);

    if (!validation.isValid) {
        return res.status(400).send(validation.message);
    }

    const cleanedUser = validation.data;

    cleanedUser.password = crypto.createHash('md5').update(cleanedUser.password).digest('hex');

    checkUserExists(userData.email, (err, exists) => {
        if (err) {
            console.error("Сталася помилка при виборі даних з users:", err.stack);
            return res.status(500).send("Сталася помилка при виборі даних з users");
        }

        if (exists) {
            return res.status(409).send("Такий користувач вже зареєстрований");
        }

        registerUser(cleanedUser, (err, userId) => {
            if (err) {
                console.error("Сталася помилка при вставленні даних у users:", err.stack);
                return res.status(500).send("Сталася помилка при вставленні даних у users");
            }
            console.log("Користувач успішно доданий у таблицю users, id:", userId);
            res.status(201).send("Користувач успішно зареєстрований. Тепер ви можете увійти.");
        });
    });
}
module.exports = { registerNewUser };


