import { describe, it, expect, vi, beforeEach } from 'vitest';
import usersGetHandler from '../../server/api/users.get';
import { Client, Pool } from 'pg'; // Import Pool

// Mock the pg Client and Pool
vi.mock('pg', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [] }), // Default to empty rows
    end: vi.fn().mockResolvedValue(undefined),
  })),
  Pool: vi.fn(() => ({
    query: vi.fn().mockResolvedValue({ rows: [] }),
  })),
}));

// Helper to create a mock H3Event
const createMockEvent = (body: any = {}, method: string = 'GET') => ({
  node: { req: { headers: {}, method: method, body: body } as any, res: {} as any } as any,
  context: {} as any,
  // Mock readBody function
  readBody: vi.fn().mockResolvedValue(body),
});

describe('users.get.ts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new Client();
    vi.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@example.com', created_at: new Date().toISOString() },
      { id: 2, email: 'user2@example.com', created_at: new Date().toISOString() },
    ];
    mockClient.query.mockResolvedValueOnce({ rows: mockUsers });

    const mockEvent = createMockEvent({}, 'GET');
    const result = await usersGetHandler(mockEvent as any);
    expect(result).toEqual(mockUsers);
    expect(mockClient.query).toHaveBeenCalledWith('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('DB connection error'));

    const mockEvent = createMockEvent({}, 'GET');
    await expect(usersGetHandler(mockEvent as any)).rejects.toThrow('Internal Server Error');
    expect(mockClient.end).toHaveBeenCalled();
  });
});



