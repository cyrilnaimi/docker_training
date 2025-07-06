<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <UCard class="w-96 p-6 space-y-4">
      <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white">{{ isLogin ? 'Login' : 'Register' }}</h2>
      <form @submit.prevent="isLogin ? handleLogin() : handleRegister()" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="Enter your email" required />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Enter your password" required />
        </UFormGroup>
        <UButton type="submit" block>{{ isLogin ? 'Log In' : 'Register' }}</UButton>
      </form>
      <UDivider />
      <UButton color="gray" variant="solid" block @click="isLogin = !isLogin">
        {{ isLogin ? 'Create New Account' : 'Back to Login' }}
      </UButton>
    </UCard>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { navigateTo } from '#app';

const state = reactive({ email: '', password: '' });
const isLogin = ref(true); // Reactive variable to toggle between login and register

const handleLogin = async () => {
  console.log('Attempting login...', state.email, state.password);
  try {
    await $fetch('/api/login', { method: 'POST', body: state });
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please check your credentials.');
  }
};

const handleRegister = async () => {
  console.log('Attempting registration...', state.email, state.password);
  try {
    await $fetch('/api/register', { method: 'POST', body: state });
    alert('Registration successful! Please log in.');
    isLogin.value = true; // Switch back to login form after successful registration
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed. Please try again.');
  }
};
</script>