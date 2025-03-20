"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const program_1 = __importDefault(require("../models/program"));
const Faculty_1 = __importDefault(require("../../faculty/models/Faculty"));
const mongoose_1 = __importDefault(require("mongoose"));
class ProgramService {
    renameProgram(programId, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            const program = yield program_1.default.findById(programId);
            if (!program) {
                throw new Error('Program not found');
            }
            program.name = newName;
            yield program.save();
            return program;
        });
    }
    addProgram(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.name || !data.duration || !data.faculty) {
                throw new Error('Missing required fields');
            }
            if (data.duration <= 0) {
                throw new Error('Duration must be greater than 0');
            }
            let facultyId;
            // Nếu truyền vào là ID
            if (mongoose_1.default.Types.ObjectId.isValid(data.faculty)) {
                facultyId = new mongoose_1.default.Types.ObjectId(data.faculty);
            }
            // Nếu truyền vào là tên khoa
            else {
                const faculty = yield Faculty_1.default.findOne({
                    name: { $regex: data.faculty.toString(), $options: 'i' }
                });
                if (!faculty) {
                    throw new Error('Faculty not found');
                }
                facultyId = new mongoose_1.default.Types.ObjectId(faculty._id.toString());
            }
            // Kiểm tra trùng tên chương trình
            const existingProgram = yield program_1.default.findOne({ name: data.name });
            if (existingProgram) {
                throw new Error('Program name already exists');
            }
            // Tạo dữ liệu chương trình
            const programData = Object.assign(Object.assign({}, data), { faculty: facultyId, createdAt: new Date(), updatedAt: new Date() });
            const newProgram = new program_1.default(programData);
            yield newProgram.save();
            return newProgram;
        });
    }
}
exports.default = new ProgramService();
//# sourceMappingURL=programService.js.map