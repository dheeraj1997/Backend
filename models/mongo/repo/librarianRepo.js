let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Book = require('../models/models').book;
let BookIssue = require('../models/models').bookIssue;

class LibrarianRepo {

    createBook(data) {
        return fn.defer(Book.create, Book)(data);
    }

    issueBookByData(data) {
        return fn.defer(BookIssue.create, BookIssue)(data);
    }

    updateBookById(id, data) {
        return fn.defer(Book.update, Book)({
            _id: id,
            isDeleted: false
        }, {
            $set: data
        });
    }

    decreseLeftCountByBookId(bId) {
        return fn.defer(Book.update, Book)({
            _id: bId,
            isDeleted: false
        }, {
            $inc: {bookLeft: -1}
        });
    }

    increaseLeftCountByBookId(bId) {
        return fn.defer(Book.update, Book)({
            _id: bId,
            isDeleted: false
        }, {
            $inc: {bookLeft: 1}
        });
    }

    deleteBookById(id) {
        return fn.defer(Book.update, Book)({
            _id: id,
            isDeleted: false
        }, {
            $set: {isDeleted: true}
        });
    }

    returnBookByIssueId(id, data) {
        data.isIssued = false;
        let leanObj = BookIssue.findOneAndUpdate({
            _id: id,
        }, {
            $set: data
        }).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getBooksBySchool(sId) {
        let leanObj = Book.find({schoolId: sId, isDeleted: false}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getIssueBooksBySchool(sId) {

        let leanObj = BookIssue.find({schoolId: sId, isDeleted: false, isIssued: true}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getReturnedBooksBySchool(sId) {
        let leanObj = BookIssue.find({schoolId: sId, isIssued: false, isDeleted: false}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getBooksById(bId) {
        return fn.defer(Book.findOne, Book)({_id: bId, isDeleted: false});
    }

    getBookNamesByIds(bIdArr) {
        let leanObj = Book.find({
            _id: {$in: bIdArr},
            isDeleted: false
        }, {name: 1});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getBookCountFromSchoolId(schoolId) {
        return fn.defer(Book.count, Book)({schoolId: schoolId, isDeleted: false});
    }

    getIssueBookCountFromSchoolId(schoolId) {
        return fn.defer(BookIssue.count, BookIssue)({schoolId: schoolId, isIssued: true, isDeleted: false});
    }
    getReturnBookCountFromSchoolId(schoolId) {
        return fn.defer(BookIssue.count, BookIssue)({schoolId: schoolId, isReturned:true , isDeleted: false});
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new LibrarianRepo();
    return instance;
};