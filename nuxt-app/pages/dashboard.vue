<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <UCard class="w-full max-w-4xl mx-auto p-6 space-y-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Version: {{ $config.public.appVersion }} <br> Commit: {{ $config.public.commitHash }}
          </div>
          <div class="flex space-x-2">
            <UButton icon="i-heroicons-arrow-path" @click="stats.refresh()">Refresh Data</UButton>
            <UButton icon="i-heroicons-users" @click="showUsers = !showUsers">{{ showUsers ? 'Hide Users' : 'Show Users' }}</UButton>
            <UButton icon="i-heroicons-arrow-left-on-rectangle" @click="handleLogout">Logout</UButton>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="stat in stats.data.value" :key="stat.id" class="flex flex-col items-center justify-center p-4">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">{{ stat.stat_name }}</h3>
          <p class="text-4xl font-bold text-primary-500 dark:text-primary-400">{{ stat.stat_value }}</p>
          <UButton @click="increment(stat.stat_name)" class="mt-2">Increment</UButton>
        </UCard>
      </div>

      <div v-if="showUsers" class="mt-6">
        <h3 class="text-xl font-bold mb-4">Registered Users</h3>
        <UTable :rows="users.data.value" :columns="userColumns" />
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { navigateTo } from '#app';
import { ref } from 'vue';

const stats = await useFetch('/api/stats');
const users = await useFetch('/api/users');
const showUsers = ref(false);

const userColumns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'created_at', label: 'Registered On' },
];

const increment = async (name) => {
  await $fetch('/api/stats', { method: 'PUT', body: { name } });
  await stats.refresh();
};

const handleLogout = () => {
  // In a real application, you would clear authentication tokens here
  navigateTo('/login');
};
</script>
