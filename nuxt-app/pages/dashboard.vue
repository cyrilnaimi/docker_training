<template>  
  <UCard>  
    <template #header>Dashboard</template>  
    <div v-for="stat in stats.data.value" :key="stat.id">  
      {{ stat.stat_name }}: {{ stat.stat_value }}  
      <UButton @click="increment(stat.stat_name)">+</UButton>  
    </div>  
  </UCard>  
</template>  
<script setup>  
const stats = await useFetch('/api/stats');  
const increment = async (name) => {  
  await $fetch('/api/stats', { method: 'PUT', body: { name } });  
  await stats.refresh();  
}  
</script>
