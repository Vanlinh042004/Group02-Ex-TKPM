import { Request, Response } from 'express';
import EmailDomainController from '../controllers/emailDomainController';
import EmailDomainService from '../services/emailDomainService';

jest.mock('../services/emailDomainService');

const mockRequest = (params = {}, body = {}) => {
  return {
    params,
    body,
  } as unknown as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('EmailDomainController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAllowedEmailDomain', () => {
    it('should add a domain successfully', async () => {
      const mockDomain = { domain: 'example.com', _id: 'some-id' };
      (EmailDomainService.addAllowedEmailDomain as jest.Mock).mockResolvedValue(
        mockDomain
      );

      const req = mockRequest({}, { domain: 'example.com' });
      const res = mockResponse();

      await EmailDomainController.addAllowedEmailDomain(req, res);

      expect(EmailDomainService.addAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain added successfully',
        data: mockDomain,
      });
    });

    it('should handle errors when adding a domain', async () => {
      const mockError = new Error('Duplicate domain');
      (EmailDomainService.addAllowedEmailDomain as jest.Mock).mockRejectedValue(
        mockError
      );

      const req = mockRequest({}, { domain: 'example.com' });
      const res = mockResponse();

      await EmailDomainController.addAllowedEmailDomain(req, res);

      expect(EmailDomainService.addAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com'
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Duplicate domain',
      });
    });

    it('should handle missing domain in body', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await EmailDomainController.addAllowedEmailDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain is required',
      });
    });
  });

  describe('deleteAllowedEmailDomain', () => {
    it('should delete a domain successfully', async () => {
      const mockDomain = { domain: 'example.com', _id: 'some-id' };
      (
        EmailDomainService.deleteAllowedEmailDomain as jest.Mock
      ).mockResolvedValue(mockDomain);

      const req = mockRequest({ domain: 'example.com' });
      const res = mockResponse();

      await EmailDomainController.deleteAllowedEmailDomain(req, res);

      expect(EmailDomainService.deleteAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain deleted successfully',
        data: mockDomain,
      });
    });

    it('should handle errors when deleting a domain', async () => {
      const mockError = new Error('Domain not found');
      (
        EmailDomainService.deleteAllowedEmailDomain as jest.Mock
      ).mockRejectedValue(mockError);

      const req = mockRequest({ domain: 'example.com' });
      const res = mockResponse();

      await EmailDomainController.deleteAllowedEmailDomain(req, res);

      expect(EmailDomainService.deleteAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com'
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain not found',
      });
    });

    it('should handle missing domain in params', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await EmailDomainController.deleteAllowedEmailDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain is required',
      });
    });
  });

  describe('updateAllowedEmailDomain', () => {
    it('should update a domain successfully', async () => {
      const mockDomain = { domain: 'new-example.com', _id: 'some-id' };
      (
        EmailDomainService.updateAllowedEmailDomain as jest.Mock
      ).mockResolvedValue(mockDomain);

      const req = mockRequest(
        { domain: 'example.com' },
        { newDomain: 'new-example.com' }
      );
      const res = mockResponse();

      await EmailDomainController.updateAllowedEmailDomain(req, res);

      expect(EmailDomainService.updateAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com',
        'new-example.com'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain updated successfully',
        data: mockDomain,
      });
    });

    it('should handle errors when updating a domain', async () => {
      const mockError = new Error('Domain not found');
      (
        EmailDomainService.updateAllowedEmailDomain as jest.Mock
      ).mockRejectedValue(mockError);

      const req = mockRequest(
        { domain: 'example.com' },
        { newDomain: 'new-example.com' }
      );
      const res = mockResponse();

      await EmailDomainController.updateAllowedEmailDomain(req, res);

      expect(EmailDomainService.updateAllowedEmailDomain).toHaveBeenCalledWith(
        'example.com',
        'new-example.com'
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain not found',
      });
    });

    it('should handle missing domain in params', async () => {
      const req = mockRequest({}, { newDomain: 'new-example.com' });
      const res = mockResponse();

      await EmailDomainController.updateAllowedEmailDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Domain is required',
      });
    });

    it('should handle missing newDomain in body', async () => {
      const req = mockRequest({ domain: 'example.com' }, {});
      const res = mockResponse();

      await EmailDomainController.updateAllowedEmailDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'New domain is required',
      });
    });
  });

  describe('getAllAllowedEmailDomains', () => {
    it('should get all domains successfully', async () => {
      const mockDomains = [
        { domain: 'example.com', _id: 'id-1' },
        { domain: 'test.edu', _id: 'id-2' },
      ];
      (
        EmailDomainService.getAllAllowedEmailDomains as jest.Mock
      ).mockResolvedValue(mockDomains);

      const req = mockRequest();
      const res = mockResponse();

      await EmailDomainController.getAllAllowedEmailDomains(req, res);

      expect(EmailDomainService.getAllAllowedEmailDomains).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockDomains,
      });
    });

    it('should handle errors when getting all domains', async () => {
      const mockError = new Error('Database error');
      (
        EmailDomainService.getAllAllowedEmailDomains as jest.Mock
      ).mockRejectedValue(mockError);

      const req = mockRequest();
      const res = mockResponse();

      await EmailDomainController.getAllAllowedEmailDomains(req, res);

      expect(EmailDomainService.getAllAllowedEmailDomains).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });
});
