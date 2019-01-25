let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Teacher = require('../models/models').teacher;
let Staff = require('../models/models').staff;
let StudentFees = require('../models/models').studentFees;
let AccountantFees = require('../models/models').accountantFees;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;

class StudentRepo {

    createStudent(data) {
        return fn.defer(Student.create, Student)(data);
    }

    createStudentFees(data) {
        return fn.defer(StudentFees.create, StudentFees)(data);
    }

    getStudentFees(studentId, sessionId) {
        return fn.defer(StudentFees.find, StudentFees)({
            studentId: studentId,
            sessionId: sessionId,
            isDeleted: false
        });
    }

    getStudentFeesBySchoolClassSession(schoolId, classId, sessionId) {
        return fn.defer(StudentFees.find, StudentFees)({
            schoolId: schoolId,
            classId: classId,
            sessionId: sessionId,
            isDeleted: false
        });
    }

    getStudentByTransportFees(sId) {
        let query = {
            "_id": sId,
            isDeleted: false,
            isTransport: true
        };
        let proj = {
            rollNo: 1,
            name: 1,
            emergencyContactNo: 1,
            guardianInfo: 1,
            transportData: 1,
        };
        console.log('query', query);
        let leanObj = Student.findOne(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchool(schoolId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            isDeleted: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            srnNo: 1,
            classId: 1,
            admissionType: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.find(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentByStudentId(sId) {
        let leanObj = Student.findOne({
            _id: sId,
            isDeleted: false
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentTransportFeesByStudentId(sId, sessId) {
        let leanObj = StudentFees.find({
            studentId: sId,
            sessionId: sessId,
            "feeData.type": 'transport',
            isDeleted: false
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    updateStudentTransportFees(id, months) {
        let leanObj = StudentFees.update({
            _id: id
        }, {$set: {"feeData.months": months}});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentNameByStudentIdArr(sIdArr) {
        let leanObj = Student.find({
            _id: {$in: sIdArr},
            isDeleted: false
        }, {name: 1});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentByAdmissionNoArr(idArr, schoolId) {
        let leanObj = Student.find({
            "schoolDetail.admissionNumber": {$in: idArr},
            "schoolDetail.schoolId": schoolId,
            isDeleted: false
        }, {
            schoolDetail: 1,
            name: 1
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySrNoArr(idArr, schoolId) {
        let leanObj = Student.find({
            "schoolDetail.srnNo": {$in: idArr},
            "schoolDetail.schoolId": schoolId,
            isDeleted: false
        }, {
            schoolDetail: 1,
            name: 1
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentByAdIdArr(idArr, schoolId) {
        let leanObj = Student.find({
            "aadhaarId": {$in: idArr},
            "schoolDetail.schoolId": schoolId,
            isDeleted: false
        }, {
            aadhaarId: 1,
            name: 1
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    updateStudentById(id, data) {
        if (data.updatedAt) {
            delete data.updatedAt;
        }
        console.log('id', id);
        console.log('data', data);
        if (data.guardianInfo && data.guardianInfo.contactNo) {
            data.emergencyContactNo = data.guardianInfo.contactNo;
            data.primaryContactNo = data.guardianInfo.contactNo;
        }
        data = JSON.parse(JSON.stringify(data));
        delete data.feesData;
        return fn.defer(Student.update, Student)({
            _id: id
        }, {
            $set: data,
            $push: {updatedAt: new Date()}
        }).to(function (res) {
            console.log('repo res', res);
            return res;
        }).toFailure(err => {
            console.log('repo err', err);
            return err;
        })
    }

    deleteStudentById(id) {
        return fn.defer(Student.update, Student)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    deleteStudentFeesArr(idArr) {
        console.log('deleteStudentFeesArr idArr', idArr);
        return fn.defer(StudentFees.remove, StudentFees)({_id: {$in: idArr}});
    }

    getStudentByAadhaarId(aId) {
        return fn.defer(Student.find, Student)({
            "aadhaarId": aId,
            isDeleted: false
        });
    }

    getStudentByGuardianAadhaarId(aId) {
        return fn.defer(Student.findOne, Student)({
            "guardianInfo.aadhaarId": aId
        });
    }

    getStudentBySchoolClass(schoolId, classId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.classId": classId,
            isDeleted: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.find(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolAdmissionNumber(schoolId, adNo) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.admissionNumber": adNo,
            isDeleted: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.findOne(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolSrNumber(schoolId, srnNo) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.srnNo": srnNo,
            isDeleted: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.findOne(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolClassRollNumber(schoolId, sessionId, classId, rollNo) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.sessionId": sessionId,
            "schoolDetail.classId": classId,
            "schoolDetail.rollNo": rollNo,
            isDeleted: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.findOne(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolClassSession(schoolId, classId, sessionId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.classId": classId,
            "schoolDetail.sessionId": sessionId,
            isDeleted: false
        };
        let proj = {
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1,
            guardianInfo: 1
        };
        console.log('query', query);
        let leanObj = Student.find(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolClassSessionByTransport(schoolId, classId, sessionId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.classId": classId,
            "schoolDetail.sessionId": sessionId,
            isDeleted: false,
            isTransport: false
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1,
            guardianInfo: 1
        };
        console.log('query', query);
        let leanObj = Student.find(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentBySchoolClassSessionByTransportFee(schoolId, classId, sessionId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            "schoolDetail.classId": classId,
            "schoolDetail.sessionId": sessionId,
            isDeleted: false,
            isTransport: true
        };
        let proj = {
            rollNo: 1,
            name: 1,
            schoolDetail: 1,
            admissionType: 1,
            emergencyContactNo: 1,
            guardianInfo: 1
        };
        console.log('query', query);
        let leanObj = Student.find(query, proj).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentNumberByIds(studentIdArr) {
        let query = {
            _id: {$in: studentIdArr},
            isDeleted: false
        };
        let proj = {
            emergencyContactNo: 1
        };
        let leanObj = Student.find(query, proj).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getTeacherNumberByIds(teacherIdArr) {
        let query = {
            _id: {$in: teacherIdArr},
            isDeleted: false
        };
        let proj = {
            emergencyContactNo: 1
        };
        let leanObj = Teacher.find(query, proj).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStaffNumberByIds(teacherIdArr) {
        let query = {
            _id: {$in: teacherIdArr},
            isDeleted: false
        };
        let proj = {
            emergencyContactNo: 1
        };
        let leanObj = Staff.find(query, proj).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentNameNumberByIds(studentIdArr) {
        let query = {
            _id: {$in: studentIdArr},
            isDeleted: false
        };
        let proj = {
            emergencyContactNo: 1,
            name: 1
        };
        let leanObj = Student.find(query, proj).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentByClass(classId) {
        let query = {
            "schoolDetail.classId": classId,
            isDeleted: false
        };
        let proj = {
            "schoolDetail.rollNo": 1,
            "schoolDetail.admissionNumber": 1,
            name: 1,
            emergencyContactNo: 1
        };
        let leanObj = Student.find(query, proj).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getStudentByClassSession(classId, sessionId) {
        let query = {
            "schoolDetail.classId": classId,
            "schoolDetail.sessionId": sessionId,
            isDeleted: false
        };
        let leanObj = Student.find(query).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getTotalStudentByClassIds(classIdArr, sessionId) {
        let query = [
            {
                $match: {
                    "schoolDetail.classId": {$in: classIdArr},
                    "schoolDetail.sessionId": sessionId,
                    isDeleted: false
                }
            },
            {$group: {_id: "$schoolDetail.classId", total: {$sum: 1}}}
        ];
        return fn.defer(Student.aggregate, Student)(query);
    }

    getStudentsCountFromSchoolId(schoolId) {
        let query = {
            "schoolDetail.schoolId": schoolId,
            isDeleted: false
        };
        return fn.defer(Student.count, Student)(query);
    }

    addStudentTransportFeeById(studentId, data) {
        return fn.defer(Student.update, Student)({
            _id: studentId
        }, {
            $set: {
                transportData: data,
                isTransport: true,
            }
        });
    }

    discontinueStudentTransportById(studentId) {
        return fn.defer(Student.update, Student)({
            _id: studentId
        }, {
            $set: {
                isTransport: false,
            }
        });
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new StudentRepo();
    return instance;
};