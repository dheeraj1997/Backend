let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Organization = require('../models/mongo/repo/master').organization;
let User = require('../models/mongo/repo/master').user;
let Auth = require('./authAPI');
let auth = new Auth();

class OrganizationAPI {

    saveOrganization(params) {
        console.log("params.post", params.post);
        let postObj = params.post;

        if (!postObj) {
            return deferred.failure("No post param!")
        }
        if (!postObj.name) {
            return deferred.failure("No Organization name!")
        }
        if (!postObj.affiliation.board[0]) {
            return deferred.failure("No board name!")
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
                category: "organization",
                type: "admin"
            },
            createdById: postObj.createdById
        };
        let organizationObj = {
            name: postObj.name,
            establishedYear: postObj.establishedYear,
            affiliation:postObj.affiliation,
            contact: postObj.contact,
            address: postObj.address,
            createdById: postObj.createdById
        };
        return auth.signUp({post: userObj}).to(function (res) {
            organizationObj.loginId = res.data._id;
            return Organization.addOrganization(organizationObj).to(function (res) {
                return {
                    success: true,
                    message: "Organization created successfully!",
                    data: res
                }
            })
        });
    }

    getAllOrganization(params) {
        console.log("params.query", params.query);
        return Organization.getOrganization().to(function (res) {
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
                    message: "All Organization fetched.",
                    data: toSend
                }
            });

        })
    }

    deleteOrganization(params) {
        console.log("params.post", params.post);
        let organizationId = params.organizationId;
        if (!organizationId) {
            return {
                success: false,
                message: "No Organization Id!"
            }
        }
        return Organization.getOrganizationById(organizationId).to(function (res) {
            let loginId = res.loginId;
            let deactivateUser = deferred.success({});
            if (loginId) {
                deactivateUser = User.deactivateUserById(loginId);
            }
            let deleteOrganization = Organization.deleteOrganizationById(organizationId);
            return deferred.combine({
                deactivateUser: deactivateUser,
                deleteOrganization: deleteOrganization
            }).to(function (res) {
                return {
                    success: true,
                    message: "Organization Deleted!!",
                    data: res
                }
            })
        });
    }

    getByOrganizationId(params) {
        let organizationId = params.organizationId;
        if (!organizationId) {
            return deferred.failure('Organization Id not provided.');
        }
        return Organization.getOrganizationById(organizationId).to(function (res) {
            return {
                success: true,
                message: "Organization fetched!",
                data: res
            }
        })
    }

    editOrganization(params) {
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
        return Organization.updateOrganizationById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Organization Edited!!",
                data: res
            }
        })
    }

    getOrganizationsByLoginId(params) {
        let loginId = params.loginId;
        if (!loginId) {
            return deferred.failure('Login id not provided');
        }
        return Organization.getOrganizationByLoginId(loginId).to(function (res) {
            return {
                success: true,
                message: "Organization fetched!",
                data: res
            }
        })
    }

}

module.exports = OrganizationAPI;