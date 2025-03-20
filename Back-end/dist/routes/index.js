"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const studentRoute_1 = __importDefault(require("../components/student/routes/studentRoute"));
const facultyRoute_1 = __importDefault(require("../components/faculty/routes/facultyRoute"));
const programRoute_1 = __importDefault(require("../components/program/routes/programRoute"));
/**
 * Cấu hình tất cả các routes cho ứng dụng
 * @param app Express application instance
 */
function route(app) {
    app.use('/api/student', studentRoute_1.default);
    app.use('/api/faculty', facultyRoute_1.default);
    app.use('/api/program', programRoute_1.default);
}
exports.default = route;
//# sourceMappingURL=index.js.map