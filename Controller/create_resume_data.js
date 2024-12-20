function ResumeData(req) {
    const { fullname, title, city, category, employment, birthday, position, companyName, workTime, education, educationalInstitution, faculty, specialty, educationYears, skills} = req.body;

    return { fullname, title, city, category, employment, birthday, position, companyName, workTime,education, educationalInstitution, faculty, specialty, educationYears, skills};
}

module.exports = { ResumeData };
