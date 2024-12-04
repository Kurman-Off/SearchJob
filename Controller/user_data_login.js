function extractUserDataLogin (req) {
    const { email, password } = req.body;

    return { email, password };
}

module.exports = { extractUserDataLogin };