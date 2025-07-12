<template>
  <div>
    <NuxtPage />
    <div class="version-info">
      App Version: {{ appVersion }}
      <span v-if="commitHash"> | Commit: {{ commitHash }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';

const appVersion = ref('');
const commitHash = ref('');

onMounted(() => {
  const runtimeConfig = useRuntimeConfig();
  appVersion.value = runtimeConfig.public.appVersion || 'N/A';
  commitHash.value = runtimeConfig.public.commitHash || '';
});
</script>

<style>
.version-info {
  position: fixed;
  bottom: 10px;
  left: 10px;
  font-size: 0.8em;
  color: #888;
}
</style>
