<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useTicketStore } from '../../stores/tickets';
import {
  Search,
  RotateCcw,
  Bell,
  Sparkles,
  ExternalLink
} from 'lucide-vue-next';

const authStore = useAuthStore();
const ticketStore = useTicketStore();
const isResetting = ref(false);

async function handleReset() {
  if (confirm('Reset database to initial case seed (Tickets 1-4)?')) {
    isResetting.value = true;
    await ticketStore.resetToSeed();
    setTimeout(() => {
      isResetting.value = false;
      alert('Case dataset reloaded!');
    }, 400);
  }
}
</script>

<template>
  <header class="h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
    <!-- Search Bar -->
    <div class="relative w-80">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        v-model="ticketStore.searchQuery"
        @input="ticketStore.fetchTickets"
        type="text"
        placeholder="Search style # (e.g. 15377489), brand..."
        class="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
      />
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-3">
      <!-- Quick Seed Reset Button for interview reviewers -->
      <button
        @click="handleReset"
        :disabled="isResetting"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium shadow-2xs transition-colors"
        title="Reset mock data to clean Tickets 1-4"
      >
        <RotateCcw class="w-3.5 h-3.5 text-slate-400" :class="{ 'animate-spin': isResetting }" />
        <span>Reset Case Seeds</span>
      </button>

      <!-- Role Badge Pill -->
      <div class="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
        <div class="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          {{ authStore.currentUser.initials }}
        </div>
        <div class="flex flex-col text-left">
          <span class="text-xs font-semibold text-slate-800 leading-none">{{ authStore.currentUser.name }}</span>
          <span class="text-[10px] text-slate-500">{{ authStore.currentUser.title }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
