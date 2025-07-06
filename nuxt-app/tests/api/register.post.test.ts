import { describe, it, expect, vi, beforeEach } from 'vitest';
import registerHandler from '../../server/api/register.post';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt'; // Import as a namespace

// Mock the pg Client and bcrypt
vi.mock('pg', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [] }), // Default to empty rows
    end: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('bcrypt', async () => {
  const actual = await vi.importActual('bcrypt');
  return {
    ...actual,
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

// Helper to create a mock H3Event
const createMockEvent = (body: any = {}, method: string = 'GET') => ({
  node: { req: { headers: { 'content-type': 'application/json' }, method: method, body: body } as any, res: {} as any } as any,
  context: {} as any,
  // Mock readBody function
  readBody: vi.fn().mockResolvedValue(body),
});

describe('register.post.ts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new Client();
    vi.clearAllMocks();
  });

  it('should return 400 if email or password are missing', async () => {
    const mockEvent = createMockEvent({}, 'POST');
    await expect(registerHandler(mockEvent as any)).rejects.toThrow('Email and password are required.');
    mockEvent.readBody.mockResolvedValueOnce({ email: 'test@example.com' });
    const mockEvent2 = createMockEvent({ email: 'test@example.com' }, 'POST');
    await expect(registerHandler(mockEvent2 as any)).rejects.toThrow('Email and password are required.');
  });

  it('should return 409 if user already exists', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // User exists

    const mockEvent = createMockEvent({ email: 'existing@example.com', password: 'password' }, 'POST');
    await expect(registerHandler(mockEvent as any)).rejects.toThrow('User with this email already exists.');
    expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['existing@example.com']);
  });

  it('should register user successfully', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // User does not exist
    (bcrypt.hash as vi.Mock).mockResolvedValue('hashedPassword');
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Insert success

    const mockEvent = createMockEvent({ email: 'newuser@example.com', password: 'newpassword' }, 'POST');
    const result = await registerHandler(mockEvent as any);
    expect(result).toEqual({ message: 'User registered successfully.' });
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO users (email, password) VALUES ($1, $2)', ['newuser@example.com', 'hashedPassword']);
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('DB connection error'));

    const mockEvent = createMockEvent({ email: 'test@example.com', password: 'password' }, 'POST');
    await expect(registerHandler(mockEvent as any)).rejects.toThrow('Internal Server Error');
    expect(mockClient.end).toHaveBeenCalled();
  });
});

