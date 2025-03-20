"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
// Import module
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
// Connect to DB
(0, database_1.connect)();
const port = parseInt(process.env.PORT || '3000', 10);
const app = (0, express_1.default)();
// Use morgan for logging HTTP requests
app.use((0, morgan_1.default)('dev'));
// Sử dụng CORS cho tất cả các route
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(express_1.default.json());
// route init
(0, routes_1.default)(app);
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map