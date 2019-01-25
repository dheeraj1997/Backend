let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Employee = require('../models/mongo/repo/master').employee;
let User = require('../models/mongo/repo/master').user;
let Auth = require('./authAPI');
let auth = new Auth();

class EmployeeAPI {

    saveEmployee(params) {
        console.log("params.post", params.post);
        let postObj = params.post;

        if (!postObj) {
            return deferred.failure("No post param!")
        }
        if (!postObj.name) {
            return deferred.failure("No employee name!")
        }
        if (!postObj.username) {
            return deferred.failure("No user name!")
        }
        if (!postObj.password) {
            return deferred.failure("No password!")
        }
        if (!postObj.contact.phone[0]) {
            return deferred.failure("No contact no!");
        }
        let userObj = {
            username: postObj.username,
            password: postObj.password,
            mobile: postObj.contact.phone[0],
            email: postObj.contact.email && postObj.contact.email[0],
            userType: {
                category: "employee",
                type: "admin"
            },
            createdById: postObj.createdById
        };
        let employeeObj = {
            name: postObj.name,
            gender: postObj.gender,
            aadhaarId: postObj.aadhaarId,
            contact: postObj.contact,
            hr: postObj.hr,
            address: postObj.address,
            createdById: postObj.createdById
        };
        return auth.signUp({post: userObj}).to(function (res) {
            employeeObj.loginId = res.data._id;
            return Employee.addEmployee(employeeObj).to(function (res) {
                return {
                    success: true,
                    message: "Employee created successfully!",
                    data: res
                }
            })
        });
    }

    getAllEmployees(params) {
        console.log("params.query", params.query);
        return Employee.getEmployee().to(function (res) {
            let allLoginIds = res.reduce(function (a, val) {
                if (val.loginId) {
                    a.push(val.loginId);
                }
                return a;
            }, []);
            console.log('allLoginIds', allLoginIds);
            return User.findUsersNameByIds(allLoginIds).to(function (userRes) {
                let userIdNameMap = userRes.reduce((a, p) => {
                    a[p._id] = p.username;
                    return a;
                }, {});
                let toSend = JSON.parse(JSON.stringify(res));
                toSend = toSend.map(x => {
                    x.userName = userIdNameMap[x.loginId];
                    return x;
                });
                return {
                    success: true,
                    message: "All Employee fetched.",
                    data: toSend
                }
            });

        })
    }

    deleteEmployee(params) {
        console.log("params.post", params.post);
        let employeeId = params.employeeId;
        if (!employeeId) {
            return {
                success: false,
                message: "No employee Id!"
            }
        }
        return Employee.getStaffById(employeeId).to(function (res) {
            let loginId = res.loginId;
            let deactivateUser = deferred.success({});
            if (loginId) {
                deactivateUser = User.deactivateUserById(loginId);
            }
            let deleteStaff = Employee.deleteEmployeeById(employeeId);
            return deferred.combine({
                deactivateUser: deactivateUser,
                deleteStaff: deleteStaff
            }).to(function (res) {
                return {
                    success: true,
                    message: "Employee Deleted!!",
                    data: res
                }
            })
        });
    }

    getByEmployeeId(params) {
        let employeeId = params.employeeId;
        if (!employeeId) {
            return deferred.failure('employee Id not provided.');
        }
        return Employee.getEmployeeById(employeeId).to(function (res) {
            return {
                success: true,
                message: "Employee fetched!",
                data: res
            }
        })
    }

    editEmployee(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj._id) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        return Employee.updateEmployeeById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Employee Edited!!",
                data: res
            }
        })
    }

}

module.exports = EmployeeAPI;