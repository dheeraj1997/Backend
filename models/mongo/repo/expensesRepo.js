let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Expenses = require('../models/models').expenses;
let ExpensesCategory = require('../models/models').expensesCategory;

class ExpensesRepo {

	createExpenses(data) {
		return fn.defer(Expenses.create, Expenses)(data);
	}

	getExpensesBySchool(sId){
		let leanObj = Expenses.find({schoolId: sId,isDeleted:false}).sort({createdAt:-1}).lean();
      return fn.defer(leanObj.exec, leanObj)();
  }
  
  deleteExpensesById(id) {
    return fn.defer(Expenses.update, Expenses)({
        _id: id,
        isDeleted: false
    }, {
        $set: {isDeleted: true}
    });
}

getExpensesById(eId) {
    return fn.defer(Expenses.findOne, Expenses)({_id: eId, isDeleted: false});
}

updateExpensesById(id, data) {
    return fn.defer(Expenses.update, Expenses)({
        _id: id
    }, {
        $set: data
    });
}

getTotalExpenseBySchool(schoolId) {

    return fn.defer(Expenses.aggregate, Expenses)([
    {
        $match: {
            "schoolId": schoolId,
            "isDeleted": false,
        }
    },
    {
        $group: {
            _id: "$schoolId",
            amount: {$sum: "$amount"}
        }
    }
    ]);
}
createExpensesCategory(data) {
    return fn.defer(ExpensesCategory.create, ExpensesCategory)(data);
}

getExpenseCategoryBySchool(sId){
    let leanObj = ExpensesCategory.find({schoolId: sId,isDeleted:false}).sort({createdAt:-1}).lean();
    return fn.defer(leanObj.exec, leanObj)();
}

getExpensesCategoryById(eCId) {
    return fn.defer(ExpensesCategory.findOne, ExpensesCategory)({_id: eCId, isDeleted: false});
}

deleteExpensesCategoryById(id) {
    return fn.defer(ExpensesCategory.update, ExpensesCategory)({
        _id: id,
        isDeleted: false
    }, {
        $set: {isDeleted: true}
    });
}

updateExpensesCategoryById(id, data) {
    return fn.defer(ExpensesCategory.update, ExpensesCategory)({
        _id: id
    }, {
        $set: data
    });
}
}
let instance;

exports.getInstance = function () {
  if (!instance) instance = new ExpensesRepo();
  return instance;
};