const connection = require("./mysql_connection");

const db_valid = () => {
    connection.connect((err) => {
        if (err) {
            console.error("Помилка при підключенні до бази даних:", err.stack);
            return;
        }
        console.log("Підключено до MySQL як id " + connection.threadId);
    });
};

module.exports = db_valid;