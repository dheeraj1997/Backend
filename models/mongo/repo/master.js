let authRepo = require('./authRepo').getInstance();
let schoolRepo = require('./schoolRepo').getInstance();
let studentRepo = require('./studentRepo').getInstance();
let guardianRepo = require('./guardianRepo').getInstance();
let classRepo = require('./classRepo').getInstance();
let noticeRepo = require('./noticeRepo').getInstance();
let teacherRepo = require('./teacherRepo').getInstance();
let subjectRepo = require('./subjectRepo').getInstance();
let userRepo = require('./userRepo').getInstance();
let sessionRepo = require('./sessionRepo').getInstance();
let schoolTimeTableRepo = require('./schoolTimeTableRepo').getInstance();
let attendanceRepo = require('./attendanceRepo').getInstance();
let staffRepo = require('./staffRepo').getInstance();
let librarianRepo = require('./librarianRepo').getInstance();
let examinationRepo = require('./examinationRepo').getInstance();
let gSettingsRepo = require('./gSettingsRepo').getInstance();
let teacherHomeworkRepo = require('./teacherHomeworkRepo').getInstance();
let resultRepo = require('./resultRepo').getInstance();
let employeeRepo = require('./employeeRepo').getInstance();
let expensesRepo = require('./expensesRepo').getInstance();
let organizationRepo = require('./organizationRepo').getInstance();

let Repos = {
    auth: authRepo,
    school: schoolRepo,
    student: studentRepo,
    guardian: guardianRepo,
    teacher: teacherRepo,
    notice: noticeRepo,
    cls: classRepo,
    subject: subjectRepo,
    session: sessionRepo,
    schoolTimeTable: schoolTimeTableRepo,
    attendance: attendanceRepo,
    user: userRepo,
    staff: staffRepo,
    librarian: librarianRepo,
    examination: examinationRepo,
    gSettings: gSettingsRepo,
    teacherHomework:teacherHomeworkRepo,
    result:resultRepo,
    employee:employeeRepo,
    expenses:expensesRepo,
    organization:organizationRepo
};

module.exports = Repos;