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
const Faculty_1 = __importDefault(require("../models/Faculty"));
class FacultyService {
    renameFaculty(facultyId, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            const faculty = yield Faculty_1.default.findById(facultyId);
            if (!faculty) {
                throw new Error('Faculty not found');
            }
            faculty.name = newName;
            yield faculty.save();
            return faculty;
        });
    }
    addFaculty(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.name || !data.abbreviation) {
                throw new Error('Missing required fields');
            }
            const existingFaculty = yield Faculty_1.default.findOne({ name: data.name });
            if (existingFaculty) {
                throw new Error('Faculty already exists');
            }
            const newFaculty = new Faculty_1.default(data);
            yield newFaculty.save();
            return newFaculty;
        });
    }
}
exports.default = new FacultyService();
//# sourceMappingURL=facultyService.js.map