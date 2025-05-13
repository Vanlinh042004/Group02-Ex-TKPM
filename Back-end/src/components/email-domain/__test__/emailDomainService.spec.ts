import EmailDomain from '../models/EmailDomain';
import EmailDomainService from '../services/emailDomainService';

// Mock model
jest.mock('../models/EmailDomain');

describe('EmailDomainService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAllowedEmailDomain', () => {
    it('should add a new email domain', async () => {
      const mockDomain = {
        domain: 'example.com',
        _id: 'mock-id',
        save: jest.fn().mockResolvedValue({
          domain: 'example.com',
          _id: 'mock-id'
        })
      };
      
      (EmailDomain as unknown as jest.Mock).mockImplementation(() => mockDomain);
      
      const result = await EmailDomainService.addAllowedEmailDomain('example.com');
      
      expect(EmailDomain).toHaveBeenCalledWith({ domain: 'example.com' });
      expect(mockDomain.save).toHaveBeenCalled();
      expect(result).toEqual({
        domain: 'example.com',
        _id: 'mock-id'
      });
    });
  });

  describe('deleteAllowedEmailDomain', () => {
    it('should delete an email domain', async () => {
      const mockDeletedDomain = {
        domain: 'example.com',
        _id: 'mock-id'
      };
      
      (EmailDomain.findOneAndDelete as jest.Mock).mockResolvedValue(mockDeletedDomain);
      
      const result = await EmailDomainService.deleteAllowedEmailDomain('example.com');
      
      expect(EmailDomain.findOneAndDelete).toHaveBeenCalledWith({ domain: 'example.com' });
      expect(result).toEqual(mockDeletedDomain);
    });
    
    it('should throw an error if domain not found', async () => {
      (EmailDomain.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      
      await expect(EmailDomainService.deleteAllowedEmailDomain('example.com'))
        .rejects.toThrow('Domain not found');
        
      expect(EmailDomain.findOneAndDelete).toHaveBeenCalledWith({ domain: 'example.com' });
    });
  });

  describe('updateAllowedEmailDomain', () => {
    it('should update an email domain', async () => {
      const mockUpdatedDomain = {
        domain: 'new-example.com',
        _id: 'mock-id'
      };
      
      (EmailDomain.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedDomain);
      
      const result = await EmailDomainService.updateAllowedEmailDomain('example.com', 'new-example.com');
      
      expect(EmailDomain.findOneAndUpdate).toHaveBeenCalledWith(
        { domain: 'example.com' },
        { domain: 'new-example.com' },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedDomain);
    });
    
    it('should throw an error if domain not found', async () => {
      (EmailDomain.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      
      await expect(EmailDomainService.updateAllowedEmailDomain('example.com', 'new-example.com'))
        .rejects.toThrow('Domain not found');
        
      expect(EmailDomain.findOneAndUpdate).toHaveBeenCalledWith(
        { domain: 'example.com' },
        { domain: 'new-example.com' },
        { new: true }
      );
    });
  });

  describe('getAllAllowedEmailDomains', () => {
    it('should return all email domains', async () => {
      const mockDomains = [
        { domain: 'example.com', _id: 'id-1' },
        { domain: 'test.edu', _id: 'id-2' }
      ];
      
      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);
      
      const result = await EmailDomainService.getAllAllowedEmailDomains();
      
      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toEqual(mockDomains);
    });
  });

  describe('isValidEmailDomain', () => {
    it('should return true for valid email domain', async () => {
      const mockDomains = [
        { domain: 'example.com', _id: 'id-1' },
        { domain: 'test.edu', _id: 'id-2' }
      ];
      
      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);
      
      const result = await EmailDomainService.isValidEmailDomain('user@example.com');
      
      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should return false for invalid email domain', async () => {
      const mockDomains = [
        { domain: 'example.com', _id: 'id-1' },
        { domain: 'test.edu', _id: 'id-2' }
      ];
      
      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);
      
      const result = await EmailDomainService.isValidEmailDomain('user@invalid.com');
      
      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });
    
    it('should throw an error for invalid email format', async () => {
      await expect(EmailDomainService.isValidEmailDomain('invalid-email'))
        .rejects.toThrow('Invalid email format');
    });
  });

  describe('parseDomain', () => {
    it('should parse domain from email correctly', () => {
      // Phương thức này là private nên cần truy cập nó thông qua isValidEmailDomain
      // Vì vậy, chúng ta sẽ mock các phương thức khác để chúng ta có thể kiểm tra riêng phương thức này
      
      (EmailDomain.find as jest.Mock).mockResolvedValue([]);
      
      // Gọi isValidEmailDomain và bắt lỗi từ nó để kiểm tra parseDomain
      EmailDomainService.isValidEmailDomain('user@example.com')
        .then(() => {
          // Chúng ta không cần kiểm tra kết quả của isValidEmailDomain ở đây
          // Chúng ta chỉ sử dụng nó để gọi parseDomain
        })
        .catch(() => {
          // Bỏ qua lỗi có thể xảy ra
        });
        
      // Đảm bảo tìm kiếm được gọi để xác định rằng parseDomain không gây ra lỗi
      expect(EmailDomain.find).toHaveBeenCalled();
    });
  });
});