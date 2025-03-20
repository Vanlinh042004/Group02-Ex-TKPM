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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const facultySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
});
// Middleware để khởi tạo dữ liệu mặc định
facultySchema.statics.initializeDefaultFaculties = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultFaculties = [
            {
                name: 'Khoa Luật',
                description: 'Khoa chuyên đào tạo về luật pháp và nhà nước',
                abbreviation: 'KL'
            },
            {
                name: 'Khoa Tiếng Anh Thương Mại',
                description: 'Khoa chuyên đào tạo tiếng Anh trong lĩnh vực thương mại',
                abbreviation: 'KTATT'
            },
            {
                name: 'Khoa Tiếng Nhật',
                description: 'Khoa chuyên đào tạo tiếng Nhật và văn hóa Nhật Bản',
                abbreviation: 'KTN'
            },
            {
                name: 'Khoa Tiếng Pháp',
                description: 'Khoa chuyên đào tạo tiếng Pháp và văn hóa Pháp',
                abbreviation: 'KTP'
            }
        ];
        // Đếm số lượng khoa hiện tại
        const facultyCount = yield this.countDocuments();
        // Chỉ thêm nếu chưa có khoa nào
        if (facultyCount === 0) {
            try {
                yield this.create(defaultFaculties);
                console.log('Đã khởi tạo các khoa mặc định');
            }
            catch (error) {
                console.error('Lỗi khi khởi tạo các khoa mặc định:', error);
            }
        }
    });
};
const Faculty = mongoose_1.default.model('Faculty', facultySchema);
// Gọi phương thức khởi tạo sau khi kết nối mongoose
mongoose_1.default.connection.once('open', () => __awaiter(void 0, void 0, void 0, function* () {
    yield Faculty.initializeDefaultFaculties();
}));
exports.default = mongoose_1.default.model('Faculty', facultySchema);
//# sourceMappingURL=Faculty.js.map