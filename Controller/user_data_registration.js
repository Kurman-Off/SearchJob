function extractUserDataRegistration (req) {
    const { name, surname, age, number, residence, email, password } = req.body;

    return { name, surname, age, number ,residence, email, password };
}

module.exports = { extractUserDataRegistration };