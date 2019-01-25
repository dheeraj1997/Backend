let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Employee = require('../models/models').employee;

class EmployeeRepo {
	addEmployee(data) {
		return fn.defer(Employee.create, Employee)(data);
	}

	getEmployee() {
		let leanObj = Employee.find({isDeleted: false,}).lean();
		return fn.defer(leanObj.exec, leanObj)();
	}

	deleteEmployeeById(id) {
		return fn.defer(Employee.update, Employee)({
			_id: id,
			isDeleted: false
		}, {
			$set: {isDeleted: true}
		});
	}

	getEmployeeById(sId) {
		return fn.defer(Employee.findOne, Employee)({_id: sId, isDeleted: false});
	}

	updateEmployeeById(id, data) {
        return fn.defer(Employee.update, Employee)({
            _id: id
        }, {
            $set: data
        });
    }
}

let instance;

exports.getInstance = function () {
	if (!instance) instance = new EmployeeRepo();
	return instance;
};