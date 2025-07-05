<template>  
  <UCard>  
    <form @submit.prevent="handleLogin">  
      <UFormGroup label="Email" name="email"><UInput v-model="state.email" /></UFormGroup>  
      <UFormGroup label="Password" name="password"><UInput v-model="state.password" type="password" /></UFormGroup>  
      <UButton type="submit">Log In</UButton>  
    </form>  
  </UCard>  
</template>  
<script setup>  
import { reactive } from 'vue';
import { navigateTo } from '#app';

const state = reactive({ email: '', password: '' });

const handleLogin = async () => {  
  console.log('Attempting login...', state.email, state.password);
  try {
    await $fetch('/api/login', { method: 'POST', body: state });  
    navigateTo('/dashboard');  
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please check your credentials.');
  }
}  
</script>