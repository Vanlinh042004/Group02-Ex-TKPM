"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facultyController_1 = __importDefault(require("../controllers/facultyController"));
const router = express_1.default.Router();
router.patch('/update/:facultyId', facultyController_1.default.renameFaculty);
router.post('/add', facultyController_1.default.addFaculty);
exports.default = router;
//# sourceMappingURL=facultyRoute.js.map