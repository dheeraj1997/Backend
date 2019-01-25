let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;

class StudentRepo {

    createGuardian(data) {
        return fn.defer(Guardian.create, Guardian)(data);
    }

    updateGuardianStudent(aadId, studentId) {
        return fn.defer(Guardian.update, Guardian)({
            aadhaarId: aadId
        }, {
            $addToSet: {studentId: studentId}
        });
    }

    getGuardianByAadhaarId(aId) {
        return fn.defer(Guardian.find, Guardian)({
            "aadhaarId": aId
        });
    }

    getGuardiansOfStudents(studentIds) {
        let query = {
            studentId: {
                $in: studentIds
            },
            isDeleted: false
        };
        return fn.defer(Guardian.find, Guardian)(query, {_id: 1});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new StudentRepo();
    return instance;
};