let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let _ = require('lodash');
let School = require('../models/mongo/repo/master').school;
let Expenses = require('../models/mongo/repo/master').expenses;
let Auth = require('./authAPI');
let auth = new Auth();

class ExpensesAPI {

    saveExpenses(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.particular ||
            !postObj.expensesDate ||
            !postObj.amount ||
            !postObj.comment ||
            !postObj.category ||
            !postObj.schoolId) {
            return deferred.failure("incorrect param!");
        }
        console.log('postObj', postObj);
        return Expenses.createExpenses(postObj).to(function (res) {

            return {
                success: true,
                message: "Expenses created!",
                data: res
            }
        })
    }

    getExpensesBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Expenses.getExpensesBySchool(schoolId).to(function (res) {
            console.log('getBooksBySchool', res);
            return {
                success: true,
                message: "Expenses fetched!",
                data: res
            }
        })
    }

    deleteExpenses(params) {
        console.log("params.post", params.post);
        let expensesId = params.expensesId;
        if (!expensesId) {
            return {
                success: false,
                message: "No Expenses id!"
            }
        }
        return Expenses.deleteExpensesById(expensesId).to(function (res) {
            return {
                success: true,
                message: "Expenses Deleted!!",
                data: res
            }
        })
    }

    editExpenses(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: true,
                message: "No post param!"
            }
        }
        if (!postObj.particular ||
            !postObj.expensesDate ||
            !postObj.amount ||
            !postObj.comment ||
            !postObj.schoolId) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return Expenses.updateExpensesById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Expenses Edited!!",
                data: res
            }
        })
    }

    getByExpensesId(params) {
        let expensesId = params.expensesId;
        if (!expensesId) {
            return deferred.failure('expensesId  not provided.');
        }
        return Expenses.getExpensesById(expensesId).to(function (res) {
            return {
                success: true,
                message: "Expenses fetched!",
                data: res
            }
        })
    }

    getTotalExpenses(params) {
        let schoolId = params.schoolId;

        return Expenses.getTotalExpenseBySchool(schoolId)
            .to(res => {
                if (res[0] && res[0].amount) {
                    return {
                        success: true,
                        message: "Expense fetched Successfully!!",
                        data: res[0].amount
                    }
                } else {
                    return {
                        success: true,
                        message: "Expense fetched Successfully!!",
                        data: 0
                    }
                }

            })
    }

    //expense category

    saveExpensesCategory(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name || 
            !postObj.createdById ||
            !postObj.schoolId) {
            return deferred.failure("incorrect param!");
        }
        console.log('postObj', postObj);
        return Expenses.createExpensesCategory(postObj).to(function (res) {

            return {
                success: true,
                message: "Expenses Category created!",
                data: res
            }
        })
    }

    getExpensesCategoryBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Expenses.getExpenseCategoryBySchool(schoolId).to(function (res) {
            console.log('getCategory', res);
            return {
                success: true,
                message: "Expenses Category fetched!",
                data: res
            }
        })
    }

    deleteExpensesCategory(params) {
        console.log("params.post", params.post);
        let expensesCategoryId = params.expensesCategoryId;
        if (!expensesCategoryId) {
            return {
                success: false,
                message: "No Expenses id!"
            }
        }
        return Expenses.deleteExpensesCategoryById(expensesCategoryId).to(function (res) {
            return {
                success: true,
                message: "Expenses Deleted!!",
                data: res
            }
        })
    }

    editedExpenseCategory(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: true,
                message: "No post param!"
            }
        }
        if (!postObj.name || 
            !postObj.createdById ||
            !postObj.schoolId) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return Expenses.updateExpensesCategoryById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Expenses category Edited!!",
                data: res
            }
        })
    }

    getCategoryByExpensesId(params) {
        let expensesCategoryId = params.expensesCategoryId;
        if (!expensesCategoryId) {
            return deferred.failure('expensesCategoryId  not provided.');
        }
        return Expenses.getExpensesCategoryById(expensesCategoryId).to(function (res) {
            return {
                success: true,
                message: "Expenses Category fetched!",
                data: res
            }
        })
    }
}

module.exports = ExpensesAPI;