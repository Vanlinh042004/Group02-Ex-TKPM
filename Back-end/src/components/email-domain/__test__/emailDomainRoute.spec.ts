import request from 'supertest';
import express from 'express';
import emailDomainRouter from '../routes/emailDomainRoute';

// Tạo app express test
const app = express();
app.use(express.json());
app.use('/api/email-domains', emailDomainRouter);

// Mock controller
jest.mock('../controllers/emailDomainController', () => {
  return {
    __esModule: true,
    default: {
      addAllowedEmailDomain: jest.fn((req, res) => {
        const domain = req.body.domain;
        res.status(200).json({
          message: 'Domain added successfully',
          data: { domain, _id: 'mock-id', createdAt: new Date(), updatedAt: new Date() }
        });
      }),
      deleteAllowedEmailDomain: jest.fn((req, res) => {
        const domain = req.params.domain;
        res.status(200).json({
          message: 'Domain deleted successfully',
          data: { domain, _id: 'mock-id' }
        });
      }),
      updateAllowedEmailDomain: jest.fn((req, res) => {
        const domain = req.params.domain;
        const newDomain = req.body.newDomain;
        res.status(200).json({
          message: 'Domain updated successfully',
          data: { domain: newDomain, _id: 'mock-id', updatedAt: new Date() }
        });
      }),
      getAllAllowedEmailDomains: jest.fn((req, res) => {
        res.status(200).json({
          data: [
            { domain: 'example.com', _id: 'mock-id-1' },
            { domain: 'test.edu', _id: 'mock-id-2' }
          ]
        });
      })
    }
  };
});

// Import controller để kiểm tra nó đã được gọi
import EmailDomainController from '../controllers/emailDomainController';

describe('Email Domain Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST / should add new allowed email domain', async () => {
    const domainData = { domain: 'example.com' };
    const res = await request(app)
      .post('/api/email-domains')
      .send(domainData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Domain added successfully');
    expect(res.body.data.domain).toBe('example.com');
    expect(EmailDomainController.addAllowedEmailDomain).toHaveBeenCalled();
  });

  it('DELETE /:domain should delete an allowed email domain', async () => {
    const res = await request(app)
      .delete('/api/email-domains/example.com');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Domain deleted successfully');
    expect(res.body.data.domain).toBe('example.com');
    expect(EmailDomainController.deleteAllowedEmailDomain).toHaveBeenCalled();
  });

  it('PATCH /:domain should update an allowed email domain', async () => {
    const updateData = { newDomain: 'updated-example.com' };
    const res = await request(app)
      .patch('/api/email-domains/example.com')
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Domain updated successfully');
    expect(res.body.data.domain).toBe('updated-example.com');
    expect(EmailDomainController.updateAllowedEmailDomain).toHaveBeenCalled();
  });

  it('GET / should get all allowed email domains', async () => {
    const res = await request(app)
      .get('/api/email-domains');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].domain).toBe('example.com');
    expect(EmailDomainController.getAllAllowedEmailDomains).toHaveBeenCalled();
  });
});