import RegistrationController from '../controllers/registrationController';
import RegistrationService from '../services/registrationService';


jest.mock('../services/registrationService');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RegistrationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register course successfully', async () => {
    const req: any = { body: { studentId: 'SV001', classId: 'CSC10001-11' } };
    const res = mockRes();
    const mockData = { id: '123' };
    (RegistrationService.registerCourse as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.registerCourse(req, res);

    expect(RegistrationService.registerCourse).toHaveBeenCalledWith('SV001', 'CSC10001-11');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Register successfully',
    });
  });

  it('should return error when registration fails', async () => {
    const req: any = { body: { studentId: 'SV002', classId: 'CSC10001-11' } };
    const res = mockRes();
    (RegistrationService.registerCourse as jest.Mock).mockRejectedValue(new Error('Registration failed'));

    await RegistrationController.registerCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Registration failed',
    });
  });

  it('should fetch all registrations', async () => {
    const req: any = {};
    const res = mockRes();
    const mockData = [{ id: 'reg1' }];
    (RegistrationService.getAllRegistrations as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.getAllRegistrations(req, res);

    expect(RegistrationService.getAllRegistrations).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Fetch all registrations successfully',
    });
  });

  it('should cancel registration successfully', async () => {
    const req: any = { params: { registrationId: 'abc123' }, body: { reason: 'No longer needed' } };
    const res = mockRes();
    const mockData = { id: 'abc123', status: 'cancelled' };
    (RegistrationService.cancelRegistration as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.cancelRegistration(req, res);

    expect(RegistrationService.cancelRegistration).toHaveBeenCalledWith('abc123', 'No longer needed');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Cancel registration successfully',
    });
  });

  it('should update grade successfully', async () => {
    const req: any = { params: { registrationId: 'abc123' }, body: { grade: 90 } };
    const res = mockRes();
    const mockData = { id: 'abc123', grade: 90 };
    (RegistrationService.updateGrade as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.updateGrade(req, res);

    expect(RegistrationService.updateGrade).toHaveBeenCalledWith('abc123', 90);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Update grade successfully',
    });
  });

  it('should fetch all students from class', async () => {
    const req: any = { params: { classId: 'CSC10001-11' } };
    const res = mockRes();
    const mockData = [{ id: 'student1' }];
    (RegistrationService.getAllStudentsFromClass as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.getAllStudentsFromClass(req, res);

    expect(RegistrationService.getAllStudentsFromClass).toHaveBeenCalledWith('CSC10001-11');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Fetch all students in class successfully',
    });
  });

  it('should generate transcript successfully', async () => {
    const req: any = { params: { studentId: 'SV001' } };
    const res = mockRes();
    const mockData = { transcript: [] };
    (RegistrationService.generateTranscript as jest.Mock).mockResolvedValue(mockData);

    await RegistrationController.generateTranscript(req, res);

    expect(RegistrationService.generateTranscript).toHaveBeenCalledWith('SV001');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      message: 'Generate transcript successfully',
    });
  });

  it('should handle error when generating transcript', async () => {
    const req: any = { params: { studentId: 'SV002' } };
    const res = mockRes();
    (RegistrationService.generateTranscript as jest.Mock).mockRejectedValue(
      new Error('Failed to generate transcript')
    );

    await RegistrationController.generateTranscript(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to generate transcript',
    });
  });
});
