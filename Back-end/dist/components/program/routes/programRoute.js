"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const programController_1 = __importDefault(require("../controllers/programController"));
const router = express_1.default.Router();
router.patch('/update/:programId', programController_1.default.renameProgram);
router.post('/add', programController_1.default.addProgram);
exports.default = router;
//# sourceMappingURL=programRoute.js.map