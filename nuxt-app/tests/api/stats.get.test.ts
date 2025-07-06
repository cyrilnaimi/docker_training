import { describe, it, expect, vi, beforeEach } from 'vitest';
import statsGetHandler from '../../server/api/stats.get';
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

describe('stats.get.ts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new Client();
    vi.clearAllMocks();
  });

  it('should fetch stats successfully', async () => {
    const mockStats = [
      { id: 1, stat_name: 'clicks', stat_value: 10 },
      { id: 2, stat_name: 'items_processed', stat_value: 42 },
    ];
    mockClient.query.mockResolvedValueOnce({ rows: mockStats });

    const mockEvent = createMockEvent({}, 'GET');
    const result = await statsGetHandler(mockEvent as any);
    expect(result).toEqual(mockStats);
    expect(mockClient.query).toHaveBeenCalledWith('SELECT id, stat_name, stat_value FROM dashboard_stats');
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('DB connection error'));

    const mockEvent = createMockEvent({}, 'GET');
    await expect(statsGetHandler(mockEvent as any)).rejects.toThrow('Internal Server Error');
    expect(mockClient.end).toHaveBeenCalled();
  });
});
