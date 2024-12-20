function  VacancyData(req) {
    const { companyName, title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description} = req.body;

    return { companyName, title, category, type, city, address, employment, salary, experience, education, languages, targetAudiences, description};
}

module.exports = { VacancyData };