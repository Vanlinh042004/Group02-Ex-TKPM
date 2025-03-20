"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityDocumentType = exports.StudentStatus = exports.Gender = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Gender;
(function (Gender) {
    Gender["MALE"] = "Nam";
    Gender["FEMALE"] = "N\u1EEF";
})(Gender || (exports.Gender = Gender = {}));
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["STUDYING"] = "\u0110ang h\u1ECDc";
    StudentStatus["GRADUATED"] = "\u0110\u00E3 t\u1ED1t nghi\u1EC7p";
    StudentStatus["DROPPED"] = "\u0110\u00E3 th\u00F4i h\u1ECDc";
    StudentStatus["PAUSED"] = "T\u1EA1m d\u1EEBng h\u1ECDc";
})(StudentStatus || (exports.StudentStatus = StudentStatus = {}));
var IdentityDocumentType;
(function (IdentityDocumentType) {
    IdentityDocumentType["CMND"] = "CMND";
    IdentityDocumentType["CCCD"] = "CCCD";
    IdentityDocumentType["PASSPORT"] = "H\u1ED9 chi\u1EBFu";
})(IdentityDocumentType || (exports.IdentityDocumentType = IdentityDocumentType = {}));
// Schema cho Address
const addressSchema = new mongoose_1.Schema({
    streetAddress: { type: String },
    ward: { type: String },
    district: { type: String },
    city: { type: String },
    country: { type: String, required: true }
});
// Schema cơ bản cho Identity Documents
const identityDocumentSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(IdentityDocumentType),
        required: true
    },
    number: { type: String, required: true },
    issueDate: { type: Date, required: true },
    issuePlace: { type: String, required: true },
    expiryDate: { type: Date, required: true }
}, {
    discriminatorKey: 'type'
});
// Schema cho Student
const studentSchema = new mongoose_1.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: true
    },
    nationality: {
        type: String,
        required: true,
        default: 'Việt Nam'
    },
    faculty: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    course: {
        type: String,
        required: true
    },
    program: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    // Địa chỉ
    permanentAddress: addressSchema,
    temporaryAddress: addressSchema,
    mailingAddress: {
        type: addressSchema,
        required: true
    },
    // Giấy tờ tùy thân
    identityDocument: {
        type: identityDocumentSchema,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(StudentStatus)
    }
}, {
    timestamps: true,
});
// Tạo index cho tìm kiếm nhanh hơn
studentSchema.index({ fullName: 'text', studentId: 1 });
// Tạo discriminator cho các loại giấy tờ tùy thân
// @ts-ignore - Để tránh lỗi TypeScript với discriminator
studentSchema.path('identityDocument').discriminator(IdentityDocumentType.CMND, new mongoose_1.Schema({}));
// @ts-ignore
studentSchema.path('identityDocument').discriminator(IdentityDocumentType.CCCD, new mongoose_1.Schema({
    hasChip: { type: Boolean, required: true }
}));
// @ts-ignore
studentSchema.path('identityDocument').discriminator(IdentityDocumentType.PASSPORT, new mongoose_1.Schema({
    issuingCountry: { type: String, required: true },
    notes: { type: String }
}));
exports.default = mongoose_1.default.model('Student', studentSchema);
//# sourceMappingURL=Student.js.map