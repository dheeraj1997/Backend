let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Guardian = require('../models/mongo/repo/master').guardian;
let Student = require('../models/mongo/repo/master').student;
let Auth = require('./authAPI');
let auth = new Auth();
let lodash = require('lodash');

class GuardianAPI {

    getGuardiansCount(params) {
        let schoolAdmId = params.schoolAdmId;
        if (!schoolAdmId) {
            return deferred.failure('School Admin ID not provided');
        }
        return School.getSchoolFromSchoolAdm(schoolAdmId).to(function (res) {
            if(res==null) return {success: false, message: "You have not created any school."};

            let schoolId =res._id;

            //get all students of that school and fetch their respective guardians, display the total count
            return Student.getStudentBySchool(schoolId).to(function (students) {
                if(students==[]) return {
                    success: true,
                    message: "No students in this school yet, hence no guardians!",
                    data: 0
                };

                let studentIds= lodash.union(students.map(stu => stu._id.toString()));
                return Guardian.getGuardiansOfStudents(studentIds).to(function (data) {
                    let guardiansCountArr= lodash.union(data.map(g => g._id.toString()));
                    return {
                        success: true,
                        message: "Guardians count fetched!",
                        data: guardiansCountArr.length
                    }
                });
            });

            // return Guardian.getGuardiansCountFromSchoolId(schoolId).to(function(stu){
            //     let count=0;
            //     if(stu!=null) count= stu;
            //
            //     return {
            //         success: true,
            //         message: "Guardians count fetched!",
            //         data: stu
            //     }
            // })

        })
    }
}

module.exports = GuardianAPI;
