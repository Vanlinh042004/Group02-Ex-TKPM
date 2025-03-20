"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = __importDefault(require("../controllers/studentController"));
const validateStudent_1 = __importDefault(require("../middlewares/validateStudent"));
const router = express_1.default.Router();
router.post('/add', validateStudent_1.default, studentController_1.default.addStudent);
router.delete('/delete/:studentId', studentController_1.default.deleteStudent);
router.patch('/update/:studentId', validateStudent_1.default, studentController_1.default.updateStudent);
router.get('/search', studentController_1.default.searchStudent);
router.get('/list', studentController_1.default.getAllStudent);
exports.default = router;
//# sourceMappingURL=studentRoute.js.map