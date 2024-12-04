function  VacancyData(req) {
    const { title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description} = req.body;

    return { title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description};
}

module.exports = { VacancyData };