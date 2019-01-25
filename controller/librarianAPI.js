let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Librarian = require('../models/mongo/repo/master').librarian;
let Auth = require('./authAPI');
let auth = new Auth();
let _ = require('lodash');
let Cls = require('../models/mongo/repo/master').cls;
let Student = require('../models/mongo/repo/master').student;


class LibrarianAPI {


    saveBook(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name || !postObj.code) {
            return deferred.failure("incorrect params!");
        }
        postObj.bookLeft = postObj.noOfBooks;
        console.log('postObj', postObj);
        return Librarian.createBook(postObj).to(function (res) {

            return {
                success: true,
                message: "Book created!",
                data: res
            }
        })
    }

    issueBook(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.issueDate ||
            !postObj.expectedReturnDate ||
            !postObj.bookId ||
            !postObj.studentId ||
            !postObj.schoolId ||
            !postObj.bookCode ||
            !postObj.bookName ||
            !postObj.studentName
        ) {
            return deferred.failure("incorrect params!");
        }
        console.log('postObj', postObj);
        return Librarian.issueBookByData(postObj).to(function (res) {
            return Librarian.decreseLeftCountByBookId(postObj.bookId).to(bookRes => {
                return {
                    success: true,
                    message: "Book issued!",
                    data: res
                }

            })

        })
    }

    returnBook(params) {

        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        let issueId = postObj._id;
        if (!issueId) {
            return deferred.failure("no issueId!")
        }
        if (!postObj.returnDate || !postObj.isReturned) {
            return deferred.failure("incorrect params!");
        }
        return Librarian.returnBookByIssueId(issueId, postObj).to(function (res) {
            console.log('returnBookByIssueId res', res);
            return Librarian.increaseLeftCountByBookId(res.bookId).to(bookRes => {
                return {
                    success: true,
                    message: "Book returned!",
                    data: res
                }

            })

        })
    }


    editBook(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj._id || !postObj.name) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return Librarian.updateBookById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Book Edited!!",
                data: res
            }
        })
    }

    deleteBook(params) {

        console.log("params.post", params.post);
        let bookId = params.bookId;
        if (!bookId) {
            return {
                success: false,
                message: "No Book id!"
            }
        }

        return Librarian.deleteBookById(bookId).to(function (res) {
            return {
                success: true,
                message: "Book Deleted!!",
                data: res
            }
        })
    }

    getBooksBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Librarian.getBooksBySchool(schoolId).to(function (res) {
            console.log('getBooksBySchool', res);
            return {
                success: true,
                message: "Books fetched!",
                data: res
            }
        })
    }

    getIssuedBookByBookId(params) {
        let bookId = params.bookId;
        if (!bookId) {
            return deferred.failure('School id not provided');
        }
        return Librarian.getIssuedBookByBookId(bookId).to(function (res) {
            console.log('getIssuedBookByBookId', res);
            return {
                success: true,
                message: "Issued  Books fetched!",
                data: res
            }
        })
    }

    getByBookId(params) {
        let bookId = params.bookId;
        console.log('bookId', bookId);
        if (!bookId) {
            return deferred.failure('Book id not provided.');
        }
        return Librarian.getBooksById(bookId).to(function (res) {
            return {
                success: true,
                message: "Book fetched!",
                data: res
            }
        })
    }

    getIssueBooksBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }

        return Librarian.getIssueBooksBySchool(schoolId).to(function (res) {
            let toSendData = JSON.parse(JSON.stringify(res))
            console.log('getBySchoolres', toSendData);
            let allClass = toSendData.map(function (val) {
                return val.classId.toString();
            });
            let allStudent = toSendData.map(function (val) {
                return val.studentId.toString();
            });
            let allBook = toSendData.map(function (val) {
                return val.bookId.toString();
            });
            allClass = _.union(allClass);
            allStudent = _.union(allStudent);
            allBook = _.union(allBook);
            let classNameMap = Cls.getClassesByClassIds(allClass)
                .to(function (res2) {
                    return res2.reduce(function (a, p) {
                        a[p._id] = p.name;
                        return a;
                    }, {});
                });
            let studentNameMap = Student.getStudentNameByStudentIdArr(allStudent)
                .to(function (res2) {
                    return res2.reduce(function (a, p) {
                        a[p._id] = p.name;
                        return a;
                    }, {});
                });
            let bookNameMap = Librarian.getBookNamesByIds(allBook)
                .to(function (res2) {
                    return res2.reduce(function (a, p) {
                        a[p._id] = p.name;
                        return a;
                    }, {});
                });
            return deferred.combine({
                classNameMap: classNameMap,
                studentNameMap: studentNameMap,
                bookNameMap: bookNameMap
            }).to(combRes => {
                classNameMap = combRes.classNameMap;
                studentNameMap = combRes.studentNameMap;
                bookNameMap = combRes.bookNameMap;
                let data = toSendData.map(function (x) {
                    x.className = classNameMap[x.classId.toString()];
                    x.studentName = studentNameMap[x.studentId.toString()];
                    x.bookName = bookNameMap[x.bookId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Issued Books fetched!",
                    data: data
                }
            })
        })
    }

    getBookCount(params) {

        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Librarian.getBookCountFromSchoolId(schoolId).to(function (bc) {
            let count = 0;
            if (bc != null) count = bc;

            return {
                success: true,
                message: "Book count fetched!",
                data: bc
            }
        })
    }

    getIssueBookCount(params) {

        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Librarian.getIssueBookCountFromSchoolId(schoolId).to(function (ibc) {
            if (!ibc){
                ibc = 0;
            }
            return {
                success: true,
                message: "Issue book count fetched!",
                data: ibc
            }
        })
    }
    getReturnBookCount(params) {

        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Librarian.getReturnBookCountFromSchoolId(schoolId).to(function (irc) {
            if (!irc){
                irc = 0;
            }
            return {
                success: true,
                message: "return book count fetched!",
                data: irc
            }
        })
    }
}

module.exports = LibrarianAPI;