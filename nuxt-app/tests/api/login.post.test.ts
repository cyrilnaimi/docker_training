import { describe, it, expect, vi, beforeEach } from 'vitest';
import loginHandler from '../../server/api/login.post';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import { readBody } from 'h3';

// Mock pg Client, bcrypt, and h3's readBody
vi.mock('pg', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [] }),
    end: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('bcrypt', async () => {
  const actual = await vi.importActual('bcrypt');
  return {
    ...actual,
    compare: vi.fn(),
  };
});

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    readBody: vi.fn(),
  };
});

// Helper to create a mock H3Event
const createMockEvent = () => ({});

describe('login.post.ts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new Client();
    vi.clearAllMocks();
  });

  it('should return 400 if email or password are missing', async () => {
    (readBody as vi.Mock).mockResolvedValue({});
    const mockEvent = createMockEvent();
    await expect(loginHandler(mockEvent as any)).rejects.toThrow('Email and password are required.');

    (readBody as vi.Mock).mockResolvedValue({ email: 'test@example.com' });
    const mockEvent2 = createMockEvent();
    await expect(loginHandler(mockEvent2 as any)).rejects.toThrow('Email and password are required.');
  });

  it('should return 401 for invalid credentials (user not found)', async () => {
    (readBody as vi.Mock).mockResolvedValue({ email: 'nonexistent@example.com', password: 'password' });
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    const mockEvent = createMockEvent();
    await expect(loginHandler(mockEvent as any)).rejects.toThrow('Invalid credentials.');
    expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['nonexistent@example.com']);
  });

  it('should return 401 for invalid credentials (password mismatch)', async () => {
    (readBody as vi.Mock).mockResolvedValue({ email: 'test@example.com', password: 'wrongpassword' });
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', password: 'hashedPassword' }] });
    (bcrypt.compare as vi.Mock).mockResolvedValue(false);

    const mockEvent = createMockEvent();
    await expect(loginHandler(mockEvent as any)).rejects.toThrow('Invalid credentials.');
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
  });

  it('should return success message for valid credentials', async () => {
    (readBody as vi.Mock).mockResolvedValue({ email: 'test@example.com', password: 'correctpassword' });
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', password: 'hashedPassword' }] });
    (bcrypt.compare as vi.Mock).mockResolvedValue(true);

    const mockEvent = createMockEvent();
    const result = await loginHandler(mockEvent as any);
    expect(result).toEqual({ message: 'Login successful.' });
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    (readBody as vi.Mock).mockResolvedValue({ email: 'test@example.com', password: 'password' });
    mockClient.connect.mockRejectedValueOnce(new Error('DB connection error'));

    const mockEvent = createMockEvent();
    await expect(loginHandler(mockEvent as any)).rejects.toThrow('Internal Server Error');
    expect(mockClient.end).toHaveBeenCalled();
  });
});


