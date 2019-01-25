let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let School = require('../models/mongo/repo/master').school;
let Student = require('../models/mongo/repo/master').student;
let Cls = require('../models/mongo/repo/master').cls;
let Subject = require('../models/mongo/repo/master').subject;
let Exam = require('../models/mongo/repo/master').examination;
let Result = require('../models/mongo/repo/master').result;
let reportCard = require('../services/resultService').getInstance();
let Sms = require('../services/smsService').getInstance();
let Auth = require('./authAPI');
let auth = new Auth();

class ResultAPI {

    saveResult(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        console.log('postObj', postObj);
        return Result.createResult(postObj).to(function (res) {
            return {
                success: true,
                message: "Result created!",
                data: res
            }
        })
    }

    getResult(params) {
        console.log("params.post", params.post);
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let classId = params.classId;
        let examId = params.examId;
        let subjectId = params.subjectId;
        return Result.getResultByData({
            schoolId: schoolId,
            sessionId: sessionId,
            classId: classId,
            examId: examId,
            subjectId: subjectId
        }).to(function (res) {
            return {
                success: true,
                message: "Result fetched!",
                data: res[0]
            }
        })
    }

    getResultByExam(params) {
        console.log("params.post", params.post);
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let classId = params.classId;
        let examId = params.examId;
        let resultData = Result.getResultByData({
            schoolId: schoolId,
            sessionId: sessionId,
            classId: classId,
            examId: examId
        });
        let allStudents = Student.getStudentBySchoolClassSession(schoolId, classId, sessionId);
        let examData = Exam.getExamsById(examId);
        return deferred.combine({
            resultData: resultData,
            allStudents: allStudents,
            examData: examData
        }).to(function (combRes) {
            console.log('combRes', JSON.stringify(combRes));
            let allStudents = combRes.allStudents;
            let resultData = combRes.resultData;
            let examData = combRes.examData;
            let subjectMaxMarks = examData.marks.reduce((a, p) => {
                a[p.subjectId] = p.maxMarks;
                return a;
            }, {});
            let studentSubjectMarksMap = resultData.reduce((a, p) => {
                p.markList.forEach(val => {
                    if (!a[val.studentId]) {
                        a[val.studentId] = {}
                    }
                    if (!a[val.studentId][p.subjectId]) {
                        a[val.studentId][p.subjectId] = {}
                    }
                    if (!a[val.studentId]['total']) {
                        a[val.studentId]['total'] = 0;
                    }
                    if (!a[val.studentId]['maxTotal']) {
                        a[val.studentId]['maxTotal'] = 0;
                    }
                    a[val.studentId]['total'] += val.marks;
                    a[val.studentId]['maxTotal'] += subjectMaxMarks[p.subjectId];
                    a[val.studentId][p.subjectId] = {marks: val.marks, maxMarks: subjectMaxMarks[p.subjectId]};
                });
                return a;
            }, {});
            let toSendData = allStudents.map(val => {
                let temp = {};
                temp._id = val._id;
                temp.name = val.name;
                temp.rollNo = val.schoolDetail.rollNo;
                temp.result = studentSubjectMarksMap[val._id];
                return temp;
            });
            console.log('combRes', JSON.stringify(combRes));
            return {
                success: true,
                message: "Result fetched!",
                data: toSendData
            }
        })
    }

    getReportCard(req, res) {
        let toSendData = req.body;
        let markSheetType = 'grade';
        // toSendData.date = moment().tz('Asia/Calcutta').format("DD-MMMM-YYYY");
        // toSendData.recNo = toSendData.schoolName.substring(0, 3).toUpperCase() + '-' + Date.now();
        // console.log('toSendData', toSendData);
        // // res.send(toSendData);
        // let stu = toSendData;
        // let fileName = stu.studentName + '-' + stu.studentClass + '_' + stu.recNo + '_' + stu.date + '_fees_receipt';
        let fileName = '_report_card';
        let templateUrl = '../templates/markSheetGrade.jade';
        if (markSheetType === 'division') {
            templateUrl = '../templates/markSheetDivision.jade';
        }
        res.render(templateUrl, toSendData,
            function (err, result) {
                console.log('err', err);
                console.log('result', result);
                reportCard.generateResult(result, fileName).then(fileRes => {
                    res.send({success: true, filename: fileRes});
                    // res.sendfile(fileRes, {root: './public/feereceipt'});
                })
            }
        )
    }

    getAdmitCard(req, res) {
        let toSendData = req.body;
        let markSheetType = 'grade';
        // toSendData.date = moment().tz('Asia/Calcutta').format("DD-MMMM-YYYY");
        // toSendData.recNo = toSendData.schoolName.substring(0, 3).toUpperCase() + '-' + Date.now();
        // console.log('toSendData', toSendData);
        // // res.send(toSendData);
        // let stu = toSendData;
        // let fileName = stu.studentName + '-' + stu.studentClass + '_' + stu.recNo + '_' + stu.date + '_fees_receipt';
        let fileName = '_admit_card';
        let templateUrl = '../templates/admitCard.jade';
        res.render(templateUrl, toSendData,
            function (err, result) {
                console.log('err', err);
                console.log('result', result);
                reportCard.generateAdmitCard(result, fileName).then(fileRes => {
                    res.send({success: true, filename: fileRes});
                    // res.sendfile(fileRes, {root: './public/feereceipt'});
                })
            }
        )
    }
}

module.exports = ResultAPI;