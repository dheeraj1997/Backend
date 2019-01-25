let router = require('express').Router();

let authRouter = require('./authRouter');

router.use('/school', require('./schoolRouter'));
router.use('/students', require('./studentRouter'));
router.use('/class', require('./classRouter'));
router.use('/guardian', require('./guiardianRouter'));
router.use('/session', require('./sessionRouter'));
router.use('/subject', require('./subjectRouter'));
router.use('/user', require('./userRouter'));
router.use('/teacher', require('./teacherRouter'));
router.use('/staff', require('./staffRouter'));
router.use('/schoolTimeTable', require('./schoolTimeTableRouter'));
router.use('/attendance', require('./attendanceRouter'));
router.use('/external', require('./externalRouter'));
router.use('/library', require('./libraianRouter'));
router.use('/notice', require('./noticeRouter'));
router.use('/examination', require('./examinationRouter'));
router.use('/result', require('./resultRouter'));
router.use('/gSettings', require('./gSettingsRouter'));
router.use('/homework', require('./homeworkRouter'));
router.use('/employee', require('./employeeRouter'));
router.use('/expenses', require('./expensesRouter'));
router.use('/organization', require('./organizationRouter'));
module.exports = {
    api: router,
    auth: authRouter
};
