let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Organization = require('../models/models').organization;

class OrganizationRepo {
	
	addOrganization(data) {
		return fn.defer(Organization.create, Organization)(data);
	}

	getOrganization() {
		let leanObj = Organization.find({isDeleted: false,}).lean();
		return fn.defer(leanObj.exec, leanObj)();
	}

	deleteOrganizationById(id) {
		return fn.defer(Organization.update, Organization)({
			_id: id,
			isDeleted: false
		}, {
			$set: {isDeleted: true}
		});
	}

	getOrganizationById(oId) {
		return fn.defer(Organization.findOne, Organization)({_id: oId, isDeleted: false});
	}

	updateOrganizationById(id, data) {
        return fn.defer(Organization.update, Organization)({
            _id: id
        }, {
            $set: data
        });
    }

    getOrganizationByLoginId(lId) {
        return fn.defer(Organization.findOne, Organization)({loginId: lId, isDeleted: false});

    }
}

let instance;

exports.getInstance = function () {
	if (!instance) instance = new OrganizationRepo();
	return instance;
};