<script setup>
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
    <!-- Sidebar Navigation -->
    <AppSidebar />

    <!-- Main Content View Area -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <!-- Header Bar -->
      <AppHeader />

      <!-- View Router Container -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
