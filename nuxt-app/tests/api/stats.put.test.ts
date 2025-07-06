import { describe, it, expect, vi, beforeEach } from 'vitest';
import statsPutHandler from '../../server/api/stats.put';
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

describe('stats.put.ts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new Client();
    vi.clearAllMocks();
  });

  it('should return 400 if stat name is missing', async () => {
    const mockEvent = createMockEvent({}, 'PUT');
    await expect(statsPutHandler(mockEvent as any)).rejects.toThrow('Stat name is required.');
  });

  it('should increment stat value successfully', async () => {
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

    const mockEvent = createMockEvent({ name: 'clicks' }, 'PUT');
    const result = await statsPutHandler(mockEvent as any);
    expect(result).toEqual({ message: 'Stat updated successfully.' });
    expect(mockClient.query).toHaveBeenCalledWith('UPDATE dashboard_stats SET stat_value = stat_value + 1 WHERE stat_name = $1', ['clicks']);
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('DB connection error'));

    const mockEvent = createMockEvent({ name: 'clicks' }, 'PUT');
    await expect(statsPutHandler(mockEvent as any)).rejects.toThrow('Internal Server Error');
    expect(mockClient.end).toHaveBeenCalled();
  });
});

