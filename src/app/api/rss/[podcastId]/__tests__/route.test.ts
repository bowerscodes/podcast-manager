/**
 * @jest-environment node
 */

import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_BASE_URL = 'https://test.com';

// Mock RSS utils
jest.mock('@/lib/rss-utils', () => ({
  generateRSSFeed: jest.fn().mockReturnValue('<rss>test</rss>'),
  detectPlatform: jest.fn().mockReturnValue('Web')
}));

// Mock Supabase - need to mock both supabase instances
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      if (table === 'podcasts') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ 
              data: [{ id: 'test-podcast-id', title: 'Test Podcast' }], 
              error: null 
            }))
          }))
        };
      }
      if (table === 'episodes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        };
      }
      return {
        insert: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    })
  }))
}));

describe('/api/rss/[podcastId] route', () => {
  it('should return RSS feed for valid podcast', async () => {
    const request = new NextRequest('http://localhost:3000/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8');
  });
});
