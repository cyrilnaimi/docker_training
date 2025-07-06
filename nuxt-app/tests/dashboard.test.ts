import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../../pages/dashboard.vue';
import { nextTick, defineComponent, h } from 'vue';

// Mock useFetch and navigateTo
vi.mock('#app', () => ({
  useFetch: vi.fn((url) => {
    if (url === '/api/stats') {
      return Promise.resolve({ data: { value: [
        { id: 1, stat_name: 'clicks', stat_value: 10 },
        { id: 2, stat_name: 'items_processed', stat_value: 42 },
      ]}, refresh: vi.fn() });
    } else if (url === '/api/users') {
      return Promise.resolve({ data: { value: [
        { id: 1, email: 'user1@example.com', created_at: new Date().toISOString() },
        { id: 2, email: 'user2@example.com', created_at: new Date().toISOString() },
      ] } });
    }
    return Promise.resolve({ data: { value: null } });
  }),
  navigateTo: vi.fn(),
}));

vi.mock('#imports', () => ({
  useFetch: vi.fn((url) => {
    if (url === '/api/stats') {
      return Promise.resolve({ data: { value: [
        { id: 1, stat_name: 'clicks', stat_value: 10 },
        { id: 2, stat_name: 'items_processed', stat_value: 42 },
      ]}, refresh: vi.fn() });
    } else if (url === '/api/users') {
      return Promise.resolve({ data: { value: [
        { id: 1, email: 'user1@example.com', created_at: new Date().toISOString() },
        { id: 2, email: 'user2@example.com', created_at: new Date().toISOString() },
      ] } });
    }
    return Promise.resolve({ data: { value: null } });
  }),
  navigateTo: vi.fn(),
}));

// Wrapper component to handle Suspense
const AsyncWrapper = defineComponent({
  name: 'AsyncWrapper',
  setup() {
    return () => h(Dashboard);
  },
});

describe('Dashboard.vue', () => {
  it('renders dashboard stats', async () => {
    const wrapper = mount(AsyncWrapper);
    await nextTick(); // Wait for component to render after async setup
    expect(wrapper.text()).toContain('clicks: 10');
    expect(wrapper.text()).toContain('items_processed: 42');
  });

  it('calls increment when button is clicked', async () => {
    const mockFetch = vi.fn(() => Promise.resolve());
    vi.stubGlobal('$fetch', mockFetch);

    const wrapper = mount(AsyncWrapper);
    await nextTick(); // Wait for component to render after async setup

    const incrementButton = wrapper.findAll('button').filter(b => b.text() === 'Increment')[0];
    await incrementButton.trigger('click');

    expect(mockFetch).toHaveBeenCalledWith('/api/stats', { method: 'PUT', body: { name: 'clicks' } });
  });

  it('calls navigateTo on logout', async () => {
    const { navigateTo } = await import('#app');
    const wrapper = mount(AsyncWrapper);
    await nextTick(); // Wait for component to render after async setup

    const logoutButton = wrapper.findAll('button').filter(b => b.text() === 'Logout')[0];
    await logoutButton.trigger('click');

    expect(navigateTo).toHaveBeenCalledWith('/login');
  });
});
