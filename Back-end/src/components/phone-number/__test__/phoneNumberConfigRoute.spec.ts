import request from 'supertest';
import express from 'express';
import phoneNumberRouter from '../routes/phoneNumberConfigRoute';

// Tạo app express test
const app = express();
app.use(express.json());
app.use('/api/phone-numbers', phoneNumberRouter);

// Mock controller đúng tên phương thức
jest.mock('../controllers/phoneNumberConfigController', () => ({
    getAllPhoneNumberConfigs: jest.fn((req, res) => 
        res.status(200).json({
            success: true,
            data: [
                {
                    country: 'Việt Nam',
                    countryCode: '+84',
                    regex: '^(0[35789]\\d{8})$|^(\\+84[35789]\\d{8})$'
                },
                {
                    country: 'United States',
                    countryCode: '+1',
                    regex: '^\\+1\\d{10}$'
                }
            ]
        })),
    getPhoneNumberConfig: jest.fn((req, res) =>
        res.status(200).json({
            success: true,
            data: [{
                country: req.params.country,
                countryCode: '+84',
                regex: '^(0[35789]\\d{8})$|^(\\+84[35789]\\d{8})$'
            }]
        })),
    addPhoneNumberConfig: jest.fn((req, res) => 
        res.status(201).json({
            success: true,
            data:[{
                data: req.body
            }]
        })),
    updatePhoneNumberConfig: jest.fn((req, res) =>
        res.status(200).json({
            success: true,
            data: {
                message: 'Phone number configuration updated successfully',
                updatedData: req.body
            }
        })),
    deletePhoneNumberConfig: jest.fn((req, res) =>
        res.status(200).json({
            success: true,
            data: {
                message: 'Phone number config deleted'
            }
        }))
}));

describe('Phone Number Config Route', () => {
    it('should get all phone number configurations', async () => {
        const response = await request(app).get('/api/phone-numbers');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
    });

    it('should get phone number configuration by country', async () => {
        // Encode URL params đúng cách
        const response = await request(app).get('/api/phone-numbers/Viet%20Nam');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0].country).toBe('Viet Nam');
    });

    it('should add a new phone number configuration', async () => {
        const newConfig = {
            country: 'Canada',
            countryCode: '+1',
            regex: '^\\+1\\d{10}$'
        };
        const response = await request(app)
            .post('/api/phone-numbers')
            .send(newConfig);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0].data).toEqual(newConfig);
    });

    it('should update an existing phone number configuration', async () => {
        const updatedConfig = {
            country: 'Việt Nam',
            countryCode: '+84',
            regex: '^(0[35789]\\d{9})$|^(\\+84[35789]\\d{9})$'
        };
        // Sửa từ PUT thành PATCH và thêm country vào URL
        const response = await request(app)
            .patch('/api/phone-numbers/Viet%20Nam')
            .send(updatedConfig);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.updatedData).toEqual(updatedConfig);
    });

    it('should delete a phone number configuration', async () => {
        // Thêm country vào URL
        const response = await request(app).delete('/api/phone-numbers/Viet%20Nam');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Phone number config deleted');
    });
});