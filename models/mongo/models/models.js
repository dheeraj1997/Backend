let mongoose = require("mongoose");
let mongoConnection = require("../connection/mongoConnection").connection;

mongoose.Promise = global.Promise;

let inforidaDb = mongoConnection.useDb("inforida");

let dateSchema = mongoose.Schema({
    year: Number,
    month: Number,
    day: Number
});

let timeSchema = mongoose.Schema({hour: Number, minute: Number});

let periodSchema = mongoose.Schema({
    number: Number,
    startTime: timeSchema,
    endTime: timeSchema
});

let feeDataSchema = mongoose.Schema({
    particular: String,
    amount: Number,
    dueDate: Number,
    type: {
        type: String,
        enum: ['monthly', 'admission', 'transport'],
        default: 'monthly'
    },
    months: {type: Array, default: []}
});
let transportDataSchema = mongoose.Schema({
    disDate: dateSchema,
    doj: dateSchema,
    amount: Number,
    route: String,
    vehicleNo: String,
    months: {type: Array, default: []},
});

let forgetSchema = mongoose.Schema({
    otp: String,
    expiry: {type: Date},
    isUsed: {type: Boolean, default: false}
});

let userSchema = mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    email: String,
    mobile: {type: String},
    userType: mongoose.Schema.Types.Mixed,
    signUpIpAddress: String,
    lastLoginIpAddress: [String],
    createdById: String,
    status: {
        type: String,
        enum: ['activated', 'pending', 'deactivated'],
        default: 'activated'
    },
    forgetData: {type: forgetSchema},
    fcmTokens: [String],
    lastLogin: [{type: Date, default: Date.now}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    lastRecovered: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolSchema = mongoose.Schema({
    name: String,
    establishedYear: String,
    currentSession: String,
    contact: mongoose.Schema.Types.Mixed,
    profilePicture: String,
    coverPicture: String,
    picGallery: [String],
    about: String,
    address: mongoose.Schema.Types.Mixed,
    affiliation: mongoose.Schema.Types.Mixed,
    loginId: String,
    createdById: String,
    isOrganization: {type: Boolean, default: false},
    organizationName: String,
    organizationId: String,
    status: String,
    smsCount: {
        total: {type: Number, default: 100},
        used: {type: Number, default: 0}
    },
    createdAt: {type: Date, default: Date.now},
    location: mongoose.Schema.Types.Mixed,
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolSmsSchema = mongoose.Schema({
    schoolId: String,
    sessionId: String,
    jobId: String,
    text: String,
    smsLength: Number,
    totalSmsSent: Number,
    sentTo: [String],
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolPeriodSchema = mongoose.Schema({
    schoolId: String,
    sessionId: String,
    classId: String,
    totalPeriods: Number,
    periods: [],
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolTimeTableSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classId: String,
    periods: [],
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolFeesSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classId: String,
    feeData: {type: feeDataSchema, required: true},
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let accountantFeesSchema = mongoose.Schema({
    amount: Number,
    dueDate: Number,
    particular: String,
    type: {
        type: String,
        enum: ['monthly', 'admission', 'transport']
    },
    schoolId: String,
    sessionId: String,
    studentId: String,
    classId: String,
    month: String,
    feesId: String,
    fileName: String,
    paymentMode: String,
    toCollect: {type: Boolean, default: false},
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
});

let accountantShowFeesSchema = mongoose.Schema({
    total: Number,
    fileName: String,
    schoolId: String,
    sessionId: String,
    studentId: String,
    classId: String,
    feesIds: [String],
    paymentMode: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
});

let sessionSchema = mongoose.Schema({
    schoolId: String,
    name: String,
    startDate: dateSchema,
    endDate: dateSchema,
    comment: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let schoolDataSchema = mongoose.Schema({
    classId: String,
    schoolId: String,
    sessionId: String,
    admissionNumber: Number,
    rollNo: String,
    srnNo: String,
    admissionType: String,
    admissionDate: dateSchema,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let studentSchema = mongoose.Schema({
    name: String,
    motherName: String,
    motherOccupation: String,
    fatherOccupation: String,
    fatherName: String,
    isTransport: {type: Boolean, default: false},
    transportData: {type: transportDataSchema, required: false},
    schoolDetail: schoolDataSchema,
    guardianInfo: mongoose.Schema.Types.Mixed,
    aadhaarId: String,
    nationality: String,
    height: String,
    weight: String,
    bloodGroup: String,
    comment: String,
    gender: String,
    motherTongue: String,
    religion: String,
    caste: String,
    picture: String,
    contactNo: String,
    isHandicapped: Boolean,
    emergencyContactNo: String,
    primaryContactNo: String,
    contact: {
        phone: [String],
        email: [String]
    },
    dob: dateSchema,
    address: {
        latLong: String,
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    pictureGallery: [String],
    loginId: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false},
    isProfile: {type: Boolean, default: false},
    isTransport: {type: Boolean, default: false},
}, {strict: false});

let studentFeesSchema = mongoose.Schema({
    sessionId: String,
    studentId: String,
    schoolId: String,
    classId: String,
    feeData: {type: feeDataSchema, required: true},
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let classSchema = mongoose.Schema({
    name: String,
    schoolId: String,
    createdById: String,
    comment: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let subjectSchema = mongoose.Schema({
    name: String,
    schoolId: String,
    createdById: String,
    comment: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let noticeSchema = mongoose.Schema({
    title: String,
    schoolId: String,
    sessionId: String,
    noticeText: String,
    comment: String,
    noticeDate: {type: dateSchema},
    createdById: String,
    targetGroup: Array,
    isHoliday: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDraft: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
}, {strict: true});


let guardianSchema = mongoose.Schema({
    name: String,
    aadhaarId: String,
    createdById: String,
    studentId: [String],
    picture: String,
    contact: {
        phone: [String],
        email: [String]
    },
    address: {
        latLong: String,
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    pictureGallery: [String],
    loginId: String,
    comment: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isProfile: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let teacherTimeTableSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    teacherId: String,
    periods: [],
    createdById: String,
    comment: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let teacherSchema = mongoose.Schema({
    name: String,
    aadhaarId: String,
    schoolId: String,
    gender: String,
    motherTongue: String,
    bloodGroup: String,
    comment: String,
    picture: String,
    emergencyContactNo: String,
    contact: {
        phone: [String],
        email: [String]
    },
    address: {
        latLong: String,
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    pictureGallery: [String],
    education: mongoose.Schema.Types.Mixed,
    experience: mongoose.Schema.Types.Mixed,
    loginId: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let staffSchema = mongoose.Schema({
    name: String,
    aadhaarId: String,
    type: String,
    schoolId: String,
    gender: String,
    comment: String,
    motherTongue: String,
    bloodGroup: String,
    picture: String,
    emergencyContactNo: String,
    contact: {
        phone: [String],
        email: [String]
    },
    address: {
        latLong: String,
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    pictureGallery: [String],
    education: mongoose.Schema.Types.Mixed,
    experience: mongoose.Schema.Types.Mixed,
    loginId: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let bookSchema = mongoose.Schema({
    name: String,
    price: {type: Number, default: 0},
    code: String,
    schoolId: String,
    comment: String,
    author: String,
    publishingYear: {type: String},
    noOfBooks: {type: Number, default: 0},
    bookLeft: {type: Number, default: 0},
    bookCover: String,
    createdById: String,
    bookIssued: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: true});

let bookIssueSchema = mongoose.Schema({
    schoolId: String,
    bookId: String,
    classId: String,
    studentId: String,
    issueDate: {type: dateSchema},
    issueComment: String,
    expectedReturnDate: {type: dateSchema},
    returnComment: String,
    returnDate: {type: dateSchema},
    createdAt: {type: Date, default: Date.now},
    isIssued: {type: Boolean, default: true},
    isReturned: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
});


let teacherAttendanceSchema = mongoose.Schema({
    classId: String,
    startTime: mongoose.Schema.Types.Mixed,
    endTime: mongoose.Schema.Types.Mixed,
    teacherId: String,
    subjectId: String,
    selected: {type: Boolean, default: true},
    day: String,
    subject: String,
    class: String,
    comment: String,
    sessionId: String,
    schoolId: String,
    date: String,
    toTake: {type: Boolean, default: true},
    totalStudent: Number,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
});

let csDataSchema = mongoose.Schema({
    classId: String,
    frequency: Number,
});
let csDaySchema = mongoose.Schema({
    name: String,
    selected: Boolean,
});
let classAttendanceSettingSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classData: [csDataSchema],
    days: [csDaySchema],
    comment: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
});

let classAttendanceSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classId: String,
    comment: String,
    date: String,
    toTake: {type: Boolean, default: true},
    isSms: {type: Boolean, default: false},
    takenBy: String,
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false}
});

let classTakenAttendanceSchema = mongoose.Schema({
    studentId: String,
    rollNo: String,
    name: String,
    classAttendanceId: String,
    schoolId: String,
    classId: String,
    sessionId: String,
    schoolName: String,
    createdById: String,
    comment: String,
    date: String,
    status: {
        type: String,
        enum: ['absent', 'present', 'leave'],
        default: 'present'
    },
    createdAt: {type: Date, default: Date.now},
    isSms: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let attendanceSchema = mongoose.Schema({
    studentId: String,
    rollNo: String,
    name: String,
    teacherTimetableId: String,
    schoolId: String,
    classId: String,
    sessionId: String,
    createdById: String,
    comment: String,
    date: String,
    status: {
        type: String,
        enum: ['absent', 'present', 'leave'],
        default: 'present'
    },
    createdAt: {type: Date, default: Date.now},
    isSms: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let teacherHomeworkSchema = mongoose.Schema({
    classId: String,
    subjectId: String,
    schoolId: String,
    teacherId: String,
    homeworkText: String,
    comment: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let markSchema = mongoose.Schema({
    subjectId: String,
    maxMarks: Number,
    date: dateSchema,
    end: String,
    start: String
});

let examinationSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classId: String,
    name: String,
    marks: [markSchema],
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let gradeSchema = mongoose.Schema({
    minPercentage: Number,
    remark: String,
    gradePoint: Number,
    grade: String
});

let divisionSchema = mongoose.Schema({
    minPercentage: Number,
    remark: String,
    division: String
});

let examinationSettingSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    resultType: {
        type: String,
        enum: ['grade', 'division'],
        default: 'grade'
    },
    gradeSettings: [gradeSchema],
    divisionSettings: [divisionSchema],
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let markListSchema = mongoose.Schema({
    studentId: String,
    marks: Number,
});
let resultSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    classId: String,
    subjectId: String,
    examId: String,
    markList: [markListSchema],
    comment: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let transportSettingsSchema = mongoose.Schema({
    months: []
});
let gSettingsSchema = mongoose.Schema({
    sessionId: String,
    schoolId: String,
    admissionNo: Number,
    attendanceType: {
        type: String,
        enum: ['daily', 'timetable'],
        default: 'timetable'
    },
    smsLanguage: {
        type: String,
        enum: ['hin', 'eng'],
        default: 'eng'
    },
    feesSettings: {
        feeReceiptNo: Number,
        feeReceiptString: String,
        transportSettings: transportSettingsSchema
    },
    attendanceSignature: String,
    logo: String,
    comment: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let expensesSchema = mongoose.Schema({
    particular: String,
    category : String,
    schoolId: String,
    amount: Number,
    comment: String,
    expensesDate: {type: dateSchema},
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let expensesCategorySchema = mongoose.Schema({
    schoolId: String,
    name: String,
    comment: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let employeeSchema = mongoose.Schema({
    name: String,
    aadhaarId: String,
    gender: String,
    motherTongue: String,
    bloodGroup: String,
    picture: String,
    comment: String,
    contact: {
        phone: [String],
        email: [String]
    },
    address: {
        latLong: String,
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    hr: {
        panNo: String,
        exp: String,
        salary: String,
        designation: String,
    },
    pictureGallery: [String],
    education: mongoose.Schema.Types.Mixed,
    experience: mongoose.Schema.Types.Mixed,
    loginId: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});

let organizationSchema = mongoose.Schema({
    name: String,
    establishedYear: String,
    contact: {
        phone: [String],
        email: [String]
    },
    address: {
        village: String,
        block: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        completeAddress: String,
    },
    affiliation: {
        board: [String]
    },
    loginId: String,
    createdById: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: [{type: Date, default: Date.now}],
    isDeleted: {type: Boolean, default: false}
}, {strict: false});


let userModel = inforidaDb.model("user", userSchema, "user");
let schoolModel = inforidaDb.model("school", schoolSchema, "school");
let schoolFeesModel = inforidaDb.model("schoolFees", schoolFeesSchema, "schoolFees");
let schoolPeriodModel = inforidaDb.model("schoolPeriod", schoolPeriodSchema, "schoolPeriod");
let studentFeesModel = inforidaDb.model("studentFees", studentFeesSchema, "studentFees");
let accountantFeesModel = inforidaDb.model("accountantFees", accountantFeesSchema, "accountantFees");
let accountantShowFeesModel = inforidaDb.model("accountantShowFees", accountantShowFeesSchema, "accountantShowFees");
let schoolSmsModel = inforidaDb.model("schoolSms", schoolSmsSchema, "schoolSms");
let sessionModel = inforidaDb.model("session", sessionSchema, "session");
let studentModel = inforidaDb.model("student", studentSchema, "student");
let classModel = inforidaDb.model("class", classSchema, "class");
let subjectModel = inforidaDb.model("subject", subjectSchema, "subject");
let guardianModel = inforidaDb.model("guardian", guardianSchema, "guardian");
let noticeModel = inforidaDb.model("notice", noticeSchema, "notice");
let teacherModel = inforidaDb.model("teacher", teacherSchema, "teacher");
let staffModel = inforidaDb.model("staff", staffSchema, "staff");
let schoolTimeTableModel = inforidaDb.model("schoolTimeTable", schoolTimeTableSchema, "schoolTimeTable");
let teacherTimeTableModel = inforidaDb.model("teacherTimeTable", teacherTimeTableSchema, "teacherTimeTable");
let teacherAttendanceModel = inforidaDb.model("teacherAttendance", teacherAttendanceSchema, "teacherAttendance");
let attendanceModel = inforidaDb.model("attendance", attendanceSchema, "attendance");
let classAttendanceSettingModel = inforidaDb.model("classAttendanceSetting", classAttendanceSettingSchema, "classAttendanceSetting");
let classAttendanceModel = inforidaDb.model("classAttendance", classAttendanceSchema, "classAttendance");
let classTakenAttendanceModel = inforidaDb.model("classTakenAttendance", classTakenAttendanceSchema, "classTakenAttendance");
let bookModel = inforidaDb.model("book", bookSchema, "book");
let bookIssueModel = inforidaDb.model("bookIssue", bookIssueSchema, "bookIssue");
let teacherHomeworkModel = inforidaDb.model("teacherHomework", teacherHomeworkSchema, "teacherHomework");
let examinationModel = inforidaDb.model("examination", examinationSchema, "examination");
let examinationSettingModel = inforidaDb.model("examinationSettings", examinationSettingSchema, "examinationSettings");
let resultModel = inforidaDb.model("result", resultSchema, "result");
let gSettingsModel = inforidaDb.model("gSettings", gSettingsSchema, "gSettings");
let employeeModel = inforidaDb.model("employee", employeeSchema, "employee");
let expensesModel = inforidaDb.model("expenses", expensesSchema, "expenses");
let organizationModel = inforidaDb.model("organization", organizationSchema, "organization");
let expensesCategoryModel = inforidaDb.model("expensesCategory",expensesCategorySchema,"expensesCategory");
const Models = {
    user: userModel,
    school: schoolModel,
    schoolSms: schoolSmsModel,
    schoolFees: schoolFeesModel,
    schoolPeriod: schoolPeriodModel,
    studentFees: studentFeesModel,
    accountantFees: accountantFeesModel,
    accountantShowFees: accountantShowFeesModel,
    classAttendanceSetting: classAttendanceSettingModel,
    classAttendance: classAttendanceModel,
    classTakenAttendance: classTakenAttendanceModel,
    session: sessionModel,
    student: studentModel,
    class: classModel,
    subject: subjectModel,
    guardian: guardianModel,
    notice: noticeModel,
    teacher: teacherModel,
    staff: staffModel,
    book: bookModel,
    bookIssue: bookIssueModel,
    schoolTimeTable: schoolTimeTableModel,
    teacherTimeTable: teacherTimeTableModel,
    teacherAttendance: teacherAttendanceModel,
    attendance: attendanceModel,
    teacherHomework: teacherHomeworkModel,
    examination: examinationModel,
    examinationSetting: examinationSettingModel,
    result: resultModel,
    gSettings: gSettingsModel,
    employee: employeeModel,
    expenses: expensesModel,
    expensesCategory : expensesCategoryModel,
    organization: organizationModel
};

module.exports = Models;