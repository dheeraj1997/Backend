let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let School = require('../models/mongo/repo/master').school;
let Student = require('../models/mongo/repo/master').student;
let Cls = require('../models/mongo/repo/master').cls;
let Attendance = require('../models/mongo/repo/master').attendance;
let sms = require('../services/smsService').getInstance();
let Auth = require('./authAPI');
let auth = new Auth();

class AttendanceAPI {
    saveAttendance(params) {
        console.log("params.post", params.post);
        // sms.sendSingleSms('8103412499', 'Your child is absent!');
        // sms.sendSingleSms('8130114711', 'Test Msg!');
        let postObj = params.post;
        let error = '';
        let dateHere, timeTableIdHere;
        let teacherTimetableId = '';
        if (!postObj) {
            return deferred.failure("no post param!");
        }
        let allStudents = [];
        let schoolId = "";
        if (!postObj.length) {
            return deferred.failure("no attendance data!");
        }
        let isErr = postObj.some(function (p) {
            if (!p.schoolId) {
                error = 'School id not present!';
                return true;
            } else {
                schoolId = p.schoolId;
            }

            if (!p.teacherTimetableId) {
                error = 'teacher timetable id not present!';
                return true;
            } else {
                teacherTimetableId = p.teacherTimetableId;
            }
            if (!p.classId) {
                error = 'Class id not present!';
                return true;
            }
            if (!p.subjectId) {
                error = 'Subject id not present!';
                return true;
            }
            if (!p.createdById) {
                error = 'Created By id not present!';
                return true;
            }
            if (!p.studentId) {
                error = 'Student Id not present!';
                return true;
            }
            allStudents.push(p.studentId);
            if (!p.date) {
                error = 'Date not present!';
                return true;
            }
            dateHere = p.date;
            timeTableIdHere = p.timetableId;
            return false;
        });
        if (isErr) {
            return deferred.failure(error);
        }
        let studentData = Student.getStudentNameNumberByIds(allStudents);
        let schoolData = School.getSchoolById(schoolId);
        return deferred.combine({
            studentData: studentData,
            schoolData: schoolData
        }).to(function (c) {
            let studentList = c.studentData;
            let schoolObj = c.schoolData;
            console.log('comb schoolData', c);
            console.log('studentList', studentList);
            console.log('allStudents', allStudents);
            console.log('schoolObj', schoolObj);
            let studentDataMap = postObj.reduce(function (a, p) {
                if (!a[p.studentId]) {
                    a[p.studentId] = p;
                }
                return a;
            }, {});
            console.log('studentDataMap', studentDataMap);
            let studentIdNameNoMap = studentList.reduce(function (a, p) {
                console.log('p', p);
                a.push({
                    name: p.name,
                    schoolName: schoolObj.name,
                    contact: p.emergencyContactNo,
                    status: studentDataMap[p._id].status,
                    schoolId: studentDataMap[p._id].schoolId,
                    createdById: studentDataMap[p._id].createdById,
                    sessionId: studentDataMap[p._id].sessionId,
                    isSms: studentDataMap[p._id].isSms
                });
                return a;
            }, []);
            console.log('studentIdNameNoMap', studentIdNameNoMap);
            return Attendance.createAttendance(postObj)
                .to(function (res) {
                    studentIdNameNoMap.forEach(function (val) {
                        if (val.status === 'absent' && val.isSms) {
                            let msg = "Dear Parent,\n Your ward " +
                                val.name +
                                " has not attended " +
                                val.schoolName +
                                " on " +
                                moment().tz('Asia/Calcutta').format('DD/MM/YYYY') +
                                ".\nRegards\n" +
                                "Inforida";
                            let data = {
                                schoolId: val.schoolId,
                                sessionId: val.sessionId,
                                createdById: val.createdById
                            };
                            sms.sendSingleSms(val.contact, msg, data);
                        }
                    });
                    if (teacherTimetableId) {
                        return Attendance.setTeacherAttendanceTaken(teacherTimetableId).to(function (alphaRes) {
                            return {
                                success: true,
                                message: "Attendance completed",
                                data: res
                            }
                        })
                    } else {
                        return {
                            success: true,
                            message: "Attendance completed",
                            data: res
                        }
                    }
                });
        });

    }


    getAttendanceByTimetableId(params) {
        let timetableId = params.timetableId;
        if (!timetableId) {
            return deferred.failure('Timetable id not provided');
        }
        return Attendance
            .getByTimetableId(timetableId)
            .to(function (res) {
                return {
                    success: true,
                    message: "Attendance fetched!",
                    data: res
                }
            })
    }

    getAttendanceByClassId(params) {
        let classId = params.classId;
        let subjectId = params.subjectId;
        let dateHere = params.dateHere;
        let teacherTimetableId = params.query.teacherTimetableId;
        if (!classId) {
            return deferred.failure('Class id not provided!');
        }
        if (!subjectId) {
            return deferred.failure('Subject id not provided!');
        }
        if (!dateHere) {
            return deferred.failure('Date not provided!');
        }
        return Attendance
            .getByClassSubIdAndDate(classId, subjectId, dateHere, teacherTimetableId)
            .to(function (res) {
                if (res.length) {
                    return {
                        success: true,
                        message: "Attendance fetched!",
                        data: res.sort(function (a, b) {
                            return a.rollNo - b.rollNo;
                        })
                    }
                } else {
                    return {
                        success: false,
                        error: "No Records Found!"
                    }
                }

            })
    }

    getAttendanceBySchoolId(params) {
        let schoolId = params.timetableId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Attendance
            .getBySchoolId(schoolId)
            .to(function (res) {
                return {
                    success: true,
                    message: "Attendance fetched!",
                    data: res
                }
            })
    }

}

module.exports = AttendanceAPI;
