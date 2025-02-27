import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Import your express app
const app = require('../index'); // Adjust the path as needed

// Mock the database pool
jest.mock('../db', () => ({
  query: jest.fn(),
}));
const pool = require('../db');

describe('Authentication Routes', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/signup', () => {
    const validUser = {
      username: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!@#' // Valid password matching requirements
    };

    it('should create a new user successfully', async () => {
      // Mock the database responses
      pool.query
        // First query - check if user exists
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        // Second query - insert new user
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            username: validUser.username,
            email: validUser.email
          }]
        });

      const response = await request(app)
        .post('/api/signup')
        .send(validUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe(validUser.username);
      expect(response.body.user.email).toBe(validUser.email);
    });

    it('should return error if user already exists', async () => {
      // Mock existing user
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: validUser.email }],
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/signup')
        .send(validUser)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/signin', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'TestPass123!@#'
    };

    it('should sign in user successfully', async () => {
      // Create hashed password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      // Mock the database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'Test User',
          email: testUser.email,
          password: hashedPassword
        }]
      });

      const response = await request(app)
        .post('/api/signin')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return error for non-existent user', async () => {
      // Mock empty database response
      pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const response = await request(app)
        .post('/api/signin')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return error for invalid password', async () => {
      // Create hashed password for a different password
      const hashedPassword = await bcrypt.hash('DifferentPass123!@#', 10);

      // Mock the database response with wrong password
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: testUser.email,
          password: hashedPassword
        }]
      });

      const response = await request(app)
        .post('/api/signin')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid password');
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should return 403 for invalid token', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });
}); 