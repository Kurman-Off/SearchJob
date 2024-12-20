const jwt = require("jsonwebtoken");
const SECRET_KEY = "secret_key";

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send("Токен не знайдений");
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send("Токен не знайдений");
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error("Помилка верифікації токену:", err);
            return res.status(401).send("Токен не дійсний або закінчився");
        }

        req.user = decoded;
        next();
    });
}


module.exports = authenticate;
