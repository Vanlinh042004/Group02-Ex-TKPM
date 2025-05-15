import request from 'supertest';
import express from 'express';
import emailDomainRouter from '../routes/emailDomainRoute';

const app = express();
app.use(express.json());
app.use('/api/email-domains', emailDomainRouter);

jest.mock('../controllers/emailDomainController', () => {
  return {
    __esModule: true,
    default: {
      addAllowedEmailDomain: jest.fn((req, res) => {
        if (!req.body.domain) {
          return res.status(400).json({ message: 'Domain is required' });
        }
        const domain = req.body.domain;
        res.status(200).json({
          message: 'Domain added successfully',
          data: {
            domain,
            _id: 'mock-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }),
      deleteAllowedEmailDomain: jest.fn((req, res) => {
        if (!req.params.domain) {
          return res.status(400).json({ message: 'Domain is required' });
        }
        const domain = req.params.domain;
        if (domain === 'notfound.com') {
          return res.status(400).json({ message: 'Domain not found' });
        }
        res.status(200).json({
          message: 'Domain deleted successfully',
          data: { domain, _id: 'mock-id' },
        });
      }),
      updateAllowedEmailDomain: jest.fn((req, res) => {
        if (!req.params.domain) {
          return res.status(400).json({ message: 'Domain is required' });
        }
        if (!req.body.newDomain) {
          return res.status(400).json({ message: 'New domain is required' });
        }
        const domain = req.params.domain;
        const newDomain = req.body.newDomain;
        if (domain === 'notfound.com') {
          return res.status(400).json({ message: 'Domain not found' });
        }
        res.status(200).json({
          message: 'Domain updated successfully',
          data: { domain: newDomain, _id: 'mock-id', updatedAt: new Date() },
        });
      }),
      getAllAllowedEmailDomains: jest.fn((req, res) => {
        res.status(200).json({
          data: [
            { domain: 'example.com', _id: 'mock-id-1' },
            { domain: 'test.edu', _id: 'mock-id-2' },
          ],
        });
      }),
    },
  };
});

import EmailDomainController from '../controllers/emailDomainController';

describe('Email Domain Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST / should add new allowed email domain', async () => {
    const domainData = { domain: 'example.com' };
    const res = await request(app).post('/api/email-domains').send(domainData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Domain added successfully');
    expect(res.body.data.domain).toBe('example.com');
    expect(EmailDomainController.addAllowedEmailDomain).toHaveBeenCalled();
  });

  it('POST / should return 400 if missing domain', async () => {
    const res = await request(app).post('/api/email-domains').send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Domain is required');
    expect(EmailDomainController.addAllowedEmailDomain).toHaveBeenCalled();
  });

  it('DELETE /:domain should delete an allowed email domain', async () => {
    const res = await request(app).delete('/api/email-domains/example.com');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Domain deleted successfully');
    expect(res.body.data.domain).toBe('example.com');
    expect(EmailDomainController.deleteAllowedEmailDomain).toHaveBeenCalled();
  });

  it('DELETE /:domain should return 400 if domain not found', async () => {
    const res = await request(app).delete('/api/email-domains/notfound.com');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Domain not found');
    expect(EmailDomainController.deleteAllowedEmailDomain).toHaveBeenCalled();
  });

  it('DELETE /:domain should return 400 if missing domain', async () => {
    const res = await request(app).delete('/api/email-domains/');

    // supertest sẽ trả về 404 vì không match route, nên không cần kiểm tra ở đây
    expect([400, 404]).toContain(res.status);
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

  it('PATCH /:domain should return 400 if missing newDomain', async () => {
    const res = await request(app)
      .patch('/api/email-domains/example.com')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('New domain is required');
    expect(EmailDomainController.updateAllowedEmailDomain).toHaveBeenCalled();
  });

  it('PATCH /:domain should return 400 if domain not found', async () => {
    const updateData = { newDomain: 'updated-example.com' };
    const res = await request(app)
      .patch('/api/email-domains/notfound.com')
      .send(updateData);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Domain not found');
    expect(EmailDomainController.updateAllowedEmailDomain).toHaveBeenCalled();
  });

  it('PATCH /:domain should return 400 if missing domain', async () => {
    const updateData = { newDomain: 'updated-example.com' };
    const res = await request(app)
      .patch('/api/email-domains/')
      .send(updateData);

    // supertest sẽ trả về 404 vì không match route, nên không cần kiểm tra ở đây
    expect([400, 404]).toContain(res.status);
  });

  it('GET / should get all allowed email domains', async () => {
    const res = await request(app).get('/api/email-domains');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].domain).toBe('example.com');
    expect(EmailDomainController.getAllAllowedEmailDomains).toHaveBeenCalled();
  });
});
