let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let School = require('../models/mongo/repo/master').school;
let timeTableService = require('../services/timetableService').getInstance();
let Subject = require('../models/mongo/repo/master').subject;
let Student = require('../models/mongo/repo/master').student;
let Cls = require('../models/mongo/repo/master').cls;
let SchoolTimeTable = require('../models/mongo/repo/master').schoolTimeTable;
let Auth = require('./authAPI');
let auth = new Auth();

class SchoolTimeTableAPI {


    saveTimeTable(params) {
        let postObj = params.post;
        let error = '';
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.schoolId) {
            error = 'School id not present!';
            return deferred.failure(error);
        }
        if (!postObj.classId) {
            error = 'Class id not present!';
            return deferred.failure(error);
        }
        if (!postObj.sessionId) {
            error = 'Session id not present!';
            return deferred.failure(error);
        }
        if (!postObj.periods || !postObj.periods.length) {
            error = 'Period not present!';
            return deferred.failure(error);
        }
        let dayPeriodArr = [];
        postObj.periods.forEach(function (p) {
            // p.days = p.days.filter(function (filVal) {
            //     return filVal.selected;
            // });
            if (p && p.days) {
                p.days.forEach(function (val) {
                    let temp = JSON.parse(JSON.stringify(val));
                    temp.endTime = p.endTime;
                    temp.startTime = p.startTime;
                    temp.number = p.number;
                    temp.classId = postObj.classId;
                    dayPeriodArr.push(temp);
                });
            }

        });
        console.log('dayPeriodArr', dayPeriodArr);
        // console.log('allTeacherIds', allTeacherIds);

        let allTeacherData = dayPeriodArr.reduce(function (acc, val) {
            if (val.selected && val.teacherId) {
                if (!acc[val.teacherId]) {
                    acc[val.teacherId] = {};
                }
                if (!acc[val.teacherId][val.day]) {
                    acc[val.teacherId][val.day] = []
                }
                acc[val.teacherId][val.day].push(val);
            }
            return acc;
        }, {});
        console.log('allTeacherData', allTeacherData);
        let teacherTimetableData = {
            sessionId: postObj.sessionId,
            schoolId: postObj.schoolId,
            createdById: postObj.createdById,
            periods: []
        };

        let allTeacherDataArr = Object.keys(allTeacherData).map(function (teacherId) {
            let temp = JSON.parse(JSON.stringify(teacherTimetableData));
            temp.teacherId = teacherId;
            temp.periods = Object.keys(allTeacherData[teacherId]).reduce(function (acc, pre) {
                let temp = JSON.parse(JSON.stringify(allTeacherData[teacherId][pre]));
                // temp.day = pre;
                console.log('period temp', temp);
                acc = acc.concat(temp);
                return acc;
            }, []);
            return temp;
        });
        console.log('allTeacherDataArr', allTeacherDataArr);

        return SchoolTimeTable.findTeacherTimetable(postObj.schoolId, postObj.sessionId)
            .to(function (allTimetable) {
                console.log('allTimetable', allTimetable);
                if (allTimetable && allTimetable.length) {
                    //arrange day wise teacher timetable start and end date
                    let dayWiseTeacherTime = allTimetable.reduce(function (a, p) {
                        if (!a[p.teacherId]) {
                            a[p.teacherId] = {};
                        }
                        p.periods.forEach(function (val) {
                            if (!a[p.teacherId][val.day]) {
                                a[p.teacherId][val.day] = [];
                            }
                            a[p.teacherId][val.day].push(val);
                        });
                        return a;
                    }, {});
                    console.log('dayWiseTeacherTime', dayWiseTeacherTime);
                    //arrange day wise teacher timetable in input data
                    console.log('allTeacherData', allTeacherData);

                    //compare timing in case of clash return error
                    let errData = {};
                    let isError = Object.keys(dayWiseTeacherTime).some(function (teacherId) {
                        return Object.keys(dayWiseTeacherTime[teacherId]).some(function (day) {
                            if (allTeacherData[teacherId] && allTeacherData[teacherId][day]) {
                                let arr1 = dayWiseTeacherTime[teacherId][day];
                                let arr2 = allTeacherData[teacherId][day];
                                console.log('arr1', arr1);
                                console.log('arr2', arr2);
                                //make start and end time arr
                                return arr2.some(function (val) {
                                    let tempErr = arr1.some(function (rec) {
                                        const totalStartMins1 = parseInt(val.startTime.hour) + parseInt(val.startTime.minute);
                                        const totalStartMins2 = parseInt(rec.startTime.hour) + parseInt(rec.startTime.minute);
                                        const totalEndMins1 = parseInt(val.endTime.hour) + parseInt(val.endTime.minute);
                                        const totalEndMins2 = parseInt(rec.endTime.hour) + parseInt(rec.endTime.minute);
                                        const isStartBetween = (totalStartMins2 >= totalStartMins1 && totalStartMins2 < totalEndMins1);
                                        const isEndBetween = (totalEndMins2 > totalStartMins1 && totalEndMins2 <= totalEndMins1);
                                        const classMismatch = rec.classId !== val.classId;
                                        if (classMismatch && (isStartBetween || isEndBetween)) {
                                            errData = {
                                                teacherId: teacherId,
                                                classId: rec.classId,
                                                day: day,
                                                startTime: rec.startTime,
                                                endTime: rec.endTime
                                            };
                                            return true;
                                        }
                                    });
                                    return tempErr;
                                })
                            }
                        });
                    });
                    if (isError) {
                        return {
                            success: false,
                            error: errData
                        };
                    } else {
                        let toPushTeacherTimeTable = JSON.parse(JSON.stringify(dayWiseTeacherTime));
                        Object.keys(allTeacherData).forEach(function (teacherId) {
                            Object.keys(allTeacherData[teacherId]).forEach(function (day) {
                                if (!toPushTeacherTimeTable[teacherId]) {
                                    toPushTeacherTimeTable[teacherId] = {};
                                }
                                if (!toPushTeacherTimeTable[teacherId][day]) {
                                    toPushTeacherTimeTable[teacherId][day] = [];
                                }
                                if (toPushTeacherTimeTable[teacherId][day] && toPushTeacherTimeTable[teacherId][day].length) {
                                    allTeacherData[teacherId][day].forEach(function (dayObj) {
                                        let isThere = toPushTeacherTimeTable[teacherId][day].find(function (findObj) {
                                            let c1 = dayObj.selected;
                                            let c2 = parseInt(dayObj.startTime.hour) === parseInt(findObj.startTime.hour);
                                            let c3 = parseInt(dayObj.startTime.minute) === parseInt(findObj.startTime.minute);
                                            return c1 && c2 && c3;
                                        });
                                        if (!isThere) {
                                            toPushTeacherTimeTable[teacherId][day].push(dayObj);
                                        }
                                    })
                                } else {
                                    toPushTeacherTimeTable[teacherId][day] = allTeacherData[teacherId][day];
                                }
                            });
                        });
                        let newPeriodData = Object.keys(toPushTeacherTimeTable).reduce(function (a, teacherId) {
                            if (!a[teacherId]) {
                                a[teacherId] = [];
                            }
                            Object.keys(toPushTeacherTimeTable[teacherId]).forEach(function (day) {
                                a[teacherId] = a[teacherId].concat(toPushTeacherTimeTable[teacherId][day]);
                            });
                            return a;
                        }, {});
                        console.log('newPeriodData', newPeriodData);
                        //remove if some class is snached or reassigned to another teacher
                        //@todo fix this asap debug below code


                        // Object.keys(newPeriodData).forEach(function (val) {
                        //         newPeriodData[val] = newPeriodData[val].filter(function (filVal) {
                        //             let isReassigned = postObj.periods.some(function (somVal) {
                        //                 return somVal.days.some(function (dayVal) {
                        //                     if (dayVal.day === filVal.day) {
                        //                         if (!dayVal.selected || val !== dayVal.teacherId) {
                        //                             return true;
                        //                         }
                        //                     }
                        //                     return false;
                        //                 });
                        //             });
                        //             return !isReassigned;
                        //         })
                        //     }
                        // );
                        let toSaveTeacherTimetable = Object.keys(newPeriodData).map(function (teacherId) {
                            let val = {
                                sessionId: postObj.sessionId,
                                schoolId: postObj.schoolId,
                                createdById: postObj.createdById,
                                teacherId: teacherId,
                            };
                            let findInPrev = allTimetable.find(function (findVal) {
                                return findVal.teacherId === teacherId;
                            });
                            val.periods = newPeriodData[teacherId];
                            if (findInPrev) {
                                val._id = findInPrev._id;
                            }
                            return val;
                        });
                        console.log('toSaveTeacherTimetable', toSaveTeacherTimetable);
                        toSaveTeacherTimetable.forEach(function (val) {
                            SchoolTimeTable.createTeacherTimeTable(val)
                        });
                    }
                }
                else {
                    SchoolTimeTable.createTeacherTimeTableBulk(allTeacherDataArr);
                }

                return SchoolTimeTable.createTimeTable(postObj)
                    .to(function (res) {
                        let message = "Timetable created!";
                        if (postObj._id) {
                            message = "Timetable Updated!!"
                        }
                        return {
                            success: true,
                            message: message,
                            data: res
                        }
                    })
            })
    }

    saveSimpleTimeTable(params) {
        let postObj = params.post;
        let error = '';
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.schoolId) {
            error = 'School id not present!';
        }
        if (!postObj.classId) {
            error = 'Class id not present!';
        }
        if (!postObj.sessionId) {
            error = 'Session id not present!';
        }
        if (!postObj.periods || !postObj.periods.length) {
            error = 'Period not present!';
        }
        if (error) {
            return deferred.failure(error);
        }
        return SchoolTimeTable.createTimeTable(postObj)
            .to(function (res) {
                let message = "Timetable created!";
                if (postObj._id) {
                    message = "Timetable Updated!!"
                }
                return {
                    success: true,
                    message: message,
                    data: res
                }
            })
    }

    getTimeTableBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return SchoolTimeTable.getAllTimeTable(schoolId).to(function (res) {
            return {
                success: true,
                message: "Timetable fetched!",
                data: res
            }
        })
    }

    getTeacherAttendance(params) {
        let aId = params.aId;
        if (!aId) {
            return deferred.failure('Teacher attendance id not provided');
        }
        return SchoolTimeTable.getTeacherAttendanceById(aId).to(function (res) {
            return {
                success: true,
                message: "Teacher Attendance fetched!",
                data: res
            }
        })
    }

    getTimeTableBySchoolAndClassId(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return SchoolTimeTable.getSchoolClassTimeTable(schoolId, classId, sessionId).to(function (res) {
            return {
                success: true,
                message: "Timetable fetched!",
                data: res
            }
        })
    }

    getDayTimeTableByTeacherId(params) {
        let teacherId = params.teacherId;
        let sessionId = params.sessionId;
        let day = params.query.day;
        if (params.query.day) {
            day = params.query.day.toLowerCase();
        } else {
            day = moment().tz('Asia/Calcutta').format('dddd').toLowerCase();
        }
        let todayDate = moment().tz('Asia/Calcutta').format('DD-MM-YYYY');
        if (!teacherId) {
            return deferred.failure('Teacher id not provided');
        }

        if (!sessionId) {
            return deferred.failure('Session id not provided');
        }
        return SchoolTimeTable.getTeacherAttendanceByTeacherSessionDate(teacherId, sessionId, todayDate)
            .to(function (attItems) {
                console.log('attItems', attItems);
                attItems.sort(function (a, b) {
                    return (parseInt(a.startTime.hour) * 60 + parseInt(a.startTime.minute)) -
                        (parseInt(b.startTime.hour) * 60 + parseInt(b.startTime.minute));
                });
                return SchoolTimeTable.getTodayTimeTable(teacherId, sessionId, day).to(function (res) {
                    // console.log('res', res);
                    // console.log('res.periods', res.periods);
                    if (!res || !res.periods || !res.periods.length) {
                        return {
                            success: false,
                            message: "No Timetable fetched!"
                        }
                    }
                    let filteredPeriods = res.periods.filter(function (val) {
                        // console.log('val.day', val.day);
                        // console.log('day', day);
                        return val.day === day;
                    });
                    // return filteredPeriods;
                    let allSub = filteredPeriods.map(x => x.subjectId);
                    let allClass = filteredPeriods.map(x => x.classId);
                    let classNames = Cls.getClassesByClassIds(allClass).to(idNameMap);
                    let subjectNames = Subject.getSubjectBySubjectIds(allSub).to(idNameMap);
                    let studentCount = Student.getTotalStudentByClassIds(allClass, sessionId).to(function (res) {
                        return res.reduce(function (a, p) {
                            a[p._id] = p.total;
                            return a;
                        }, {});
                    });
                    return deferred.combine({
                        classNameMap: classNames,
                        subjectNameMap: subjectNames,
                        studentCount: studentCount
                    }).to(function (comb) {
                        // console.log('comb', comb);
                        // return comb;
                        let toSend = filteredPeriods.map(function (val) {
                            val.subject = comb.subjectNameMap[val.subjectId];
                            val.class = comb.classNameMap[val.classId];
                            val.teacherId = teacherId;
                            val.sessionId = sessionId;
                            val.date = todayDate;
                            val.toTake = true;
                            val.totalStudent = comb.studentCount[val.classId] || 0;
                            return val;
                        });
                        console.log('toSend', toSend);
                        if (attItems.length) {
                            let toRemoveIds = [];
                            let takenArray = attItems.reduce((a, p) => {
                                if (!p.toTake) {
                                    a.push({
                                        class: p.class,
                                        subject: p.subject,
                                        startTime: p.startTime.hour + '' + p.startTime.minute
                                    });
                                } else {
                                    toRemoveIds.push(p._id.toString());
                                }
                                return a;
                            }, []);
                            if (takenArray.length) {
                                toSend = toSend.filter(val => {
                                    let tempClass = takenArray.find(x => {
                                        let c1 = (x.class === val.class);
                                        let c2 = (x.subject === val.subject);
                                        let c3 = (x.startTime === val.startTime.hour + '' + val.startTime.minute);
                                        return c1 && c2 && c3;
                                    });
                                    if (tempClass && tempClass.class && tempClass.subject) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                            }
                            console.log('toRemoveIds', toRemoveIds);
                            return SchoolTimeTable.removeTeacherAttandance(toRemoveIds).to(function (remRes) {
                                return SchoolTimeTable.createTeacherAttendance(toSend).to(function (createRes) {
                                    if (!createRes) {
                                        createRes = [];
                                    }
                                    attItems = attItems.filter(val => {
                                        return toRemoveIds.indexOf(val._id.toString()) === -1;
                                    });
                                    console.log('attItems after filter', attItems);
                                    let finalRes = attItems.concat(createRes);
                                    finalRes.sort(function (a, b) {
                                        return (parseInt(a.startTime.hour) * 60 + parseInt(a.startTime.minute)) -
                                            (parseInt(b.startTime.hour) * 60 + parseInt(b.startTime.minute));
                                    });
                                    return {
                                        success: true,
                                        message: "Timetable fetched!",
                                        data: finalRes
                                    }
                                });
                            })

                        }
                        else {
                            return SchoolTimeTable.createTeacherAttendance(toSend).to(function (createRes) {
                                createRes.sort(function (a, b) {
                                    return (parseInt(a.startTime.hour) * 60 + parseInt(a.startTime.minute)) -
                                        (parseInt(b.startTime.hour) * 60 + parseInt(b.startTime.minute));
                                });
                                return {
                                    success: true,
                                    message: "Timetable fetched!",
                                    data: createRes
                                }
                            })
                        }
                    })
                })
            })
    }

    getTimetablePdf(req, res) {
        let postData = req.body;
        let toSendData = postData.data;
        let fileName = postData.fileName;
        console.log('toSendData', toSendData);
        res.render('../templates/timeTable.jade', toSendData,
            function (err, result) {
                console.log('err', err);
                console.log('result', result);
                timeTableService.generateTimeTable(result, fileName).then(fileRes => {
                    res.send({filename: fileRes, success: true});
                    // res.sendfile(fileRes, {root: './public/feereceipt'});
                })
            }
        )
    }
}

module.exports = SchoolTimeTableAPI;
