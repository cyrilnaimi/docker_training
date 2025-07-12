import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../../pages/dashboard.vue';
import { nextTick, defineComponent, h, Suspense } from 'vue';

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
  components: { Dashboard },
  template: '<Suspense><Dashboard/></Suspense>',
});

describe('Dashboard.vue', () => {
  it('renders dashboard stats', async () => {
    const wrapper = mount(AsyncWrapper);
    await nextTick(); // Wait for component to render after async setup
    await nextTick(); // and again for all children
    expect(wrapper.text()).toContain('clicks');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('items_processed');
    expect(wrapper.text()).toContain('42');
  });

  it('calls increment when button is clicked', async () => {
    const mockFetch = vi.fn(() => Promise.resolve());
    vi.stubGlobal('$fetch', mockFetch);

    const wrapper = mount(AsyncWrapper);
    await nextTick();
    await nextTick();

    const incrementButton = wrapper.findAll('button').filter(b => b.text() === 'Increment')[0];
    await incrementButton.trigger('click');

    expect(mockFetch).toHaveBeenCalledWith('/api/stats', { method: 'PUT', body: { name: 'clicks' } });
  });

  it('calls navigateTo on logout', async () => {
    const { navigateTo } = await import('#app');
    const wrapper = mount(AsyncWrapper);
    await nextTick();
    await nextTick();

    const logoutButton = wrapper.findAll('button').filter(b => b.text() === 'Logout')[0];
    await logoutButton.trigger('click');

    expect(navigateTo).toHaveBeenCalledWith('/login');
  });

  it('toggles user list visibility', async () => {
    const wrapper = mount(AsyncWrapper);
    await nextTick();
    await nextTick();

    // Initially, the user list should be hidden
    expect(wrapper.find('table').exists()).toBe(false);

    // Click the 'Show Users' button
    const showUsersButton = wrapper.findAll('button').filter(b => b.text() === 'Show Users')[0];
    await showUsersButton.trigger('click');
    await nextTick();

    // Now, the user list should be visible
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('user1@example.com');
    expect(wrapper.text()).toContain('user2@example.com');

    // Click the 'Hide Users' button
    const hideUsersButton = wrapper.findAll('button').filter(b => b.text() === 'Hide Users')[0];
    await hideUsersButton.trigger('click');
    await nextTick();

    // The user list should be hidden again
    expect(wrapper.find('table').exists()).toBe(false);
  });
});
