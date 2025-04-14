import { Request, Response } from 'express';
import RegistrationService from '../services/registrationService';

class TranscriptController {
  /**
   * Xuất bảng điểm sinh viên
   */
  async generateTranscript(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const format = (req.query.format as string || 'csv').toLowerCase();

      // Validate format
      if (!['csv', 'json'].includes(format)) {
        res.status(400).json({ 
          message: 'Format must be either csv or json' 
        });
        return;
      }

      const filePath = await RegistrationService.generateTranscript(
        studentId, 
        format as 'csv' | 'json'
      );

      // Trả về đường dẫn file
      res.status(200).json({
        message: 'Xuất bảng điểm thành công',
        filePath
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message 
      });
    }
  }
}

export default new TranscriptController();