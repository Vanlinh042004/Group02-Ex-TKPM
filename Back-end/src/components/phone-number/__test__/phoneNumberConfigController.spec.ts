import phoneNumberConfigController from '../controllers/phoneNumberConfigController';
import phoneNumberConfigService from '../services/phoneNumberConfigService';

// Mock service
jest.mock('../services/phoneNumberConfigService');

// Helper function định nghĩa mockRes
const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Helper function định nghĩa mockReq
const mockReq = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
});

describe('phoneNumberConfigController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getPhoneNumberConfig', () => {
        it('should return phone number config successfully', async () => {
            const mockConfig = { countryCode: '+1', length: 10 };
            (phoneNumberConfigService.getPhoneNumberConfig as jest.Mock).mockResolvedValue(mockConfig);

            const req: any = mockReq({}, { country: 'US' });
            const res = mockRes();

            await phoneNumberConfigController.getPhoneNumberConfig(req, res);

            expect(phoneNumberConfigService.getPhoneNumberConfig).toHaveBeenCalledTimes(1);
            expect(phoneNumberConfigService.getPhoneNumberConfig).toHaveBeenCalledWith('US');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockConfig);
        });

        it('should handle errors when fetching phone number config', async () => {
            const mockError = new Error('Failed to fetch config');
            (phoneNumberConfigService.getPhoneNumberConfig as jest.Mock).mockRejectedValue(mockError);

            const req: any = mockReq({}, { country: 'US' });
            const res = mockRes();

            await phoneNumberConfigController.getPhoneNumberConfig(req, res);

            expect(phoneNumberConfigService.getPhoneNumberConfig).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: mockError.message 
            });
        });
    });

    describe('updatePhoneNumberConfig', () => {
        it('should update phone number config successfully', async () => {
            const mockBody = { countryCode: '+1', length: 10 };
            const mockUpdatedConfig = { ...mockBody };
            (phoneNumberConfigService.updatePhoneNumberConfig as jest.Mock).mockResolvedValue(mockUpdatedConfig);

            const req: any = mockReq(mockBody, { country: 'US' });
            const res = mockRes();

            await phoneNumberConfigController.updatePhoneNumberConfig(req, res);

            expect(phoneNumberConfigService.updatePhoneNumberConfig).toHaveBeenCalledWith('US', mockBody);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedConfig);
        });

        it('should handle errors when updating phone number config', async () => {
            const mockBody = { countryCode: '+1', length: 10 };
            const mockError = new Error('Failed to update config');
            (phoneNumberConfigService.updatePhoneNumberConfig as jest.Mock).mockRejectedValue(mockError);

            const req: any = mockReq(mockBody, { country: 'US' });
            const res = mockRes();

            await phoneNumberConfigController.updatePhoneNumberConfig(req, res);

            expect(phoneNumberConfigService.updatePhoneNumberConfig).toHaveBeenCalledWith('US', mockBody);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: mockError.message 
            });
        });
    });
});