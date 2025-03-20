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
const facultyService_1 = __importDefault(require("../services/facultyService"));
class FacultyController {
    renameFaculty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const facultyId = req.params.facultyId;
                const newName = req.body.newName;
                const result = yield facultyService_1.default.renameFaculty(facultyId, newName);
                res.status(200).json({ message: 'Faculty renamed successfully', data: result });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    addFaculty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const result = yield facultyService_1.default.addFaculty(data);
                res.status(200).json({ message: 'Faculty added successfully', data: result });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.default = new FacultyController();
//# sourceMappingURL=facultyController.js.map