import express from 'express';
import TranscriptController from '../controllers/transcriptController';

const router = express.Router();

// Xuất bảng điểm sinh viên
router.get('/student/:studentId', TranscriptController.generateTranscript);

export default router;