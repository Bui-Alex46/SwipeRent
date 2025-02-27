const request = require('supertest');
const app = require('../index');
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Mock the database pool
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('Application Routes', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Mock user creation response
    pool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Check if user exists
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }]
      }); // Create user

    // Create test user
    const userResponse = await request(app)
      .post('/api/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!@#'
      });

    userId = 1; // Set userId directly since we know the mock value
    authToken = jwt.sign({ id: userId }, 'hello'); // Use the same secret as in your backend
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/applications', () => {
    it('should create a new application', async () => {
      // Setup mocks for this test
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // No existing application
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Apartment exists
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'verified' }] }) // Verified documents
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User profile exists
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1,
            user_id: userId,
            apartment_id: 12345,
            status: 'pending'
          }]
        }); // Create application

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          apartmentId: 12345,
          propertyManagerEmail: 'manager@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
    });

    it('should prevent duplicate applications', async () => {
      // Mock existing application
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: userId, apartment_id: 12345 }]
      });

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          apartmentId: 12345,
          propertyManagerEmail: 'manager@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('You have already applied to this apartment');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          apartmentId: 12345,
          propertyManagerEmail: 'manager@test.com'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/applications/check/:apartmentId', () => {
    it('should check application status', async () => {
      // Mock existing application
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: userId, apartment_id: 12345, status: 'pending' }]
      });

      const response = await request(app)
        .get('/api/applications/check/12345')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hasApplied');
      expect(response.body.hasApplied).toBe(true);
    });

    it('should return false for non-existent applications', async () => {
      // Mock no existing application
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/applications/check/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.hasApplied).toBe(false);
      expect(response.body.application).toBe(null);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/applications/check/12345');

      expect(response.status).toBe(401);
    });
  });
}); 