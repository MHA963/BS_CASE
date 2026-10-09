<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketStore } from '../stores/tickets';
import { useAuthStore } from '../stores/auth';
import TicketCard from '../components/tickets/TicketCard.vue';
import TicketTable from '../components/tickets/TicketTable.vue';
import {
  PlusCircle,
  Kanban,
  Table as TableIcon,
  Filter,
  Search,
  Sparkles,
  Send,
  Layers,
  RefreshCw
} from 'lucide-vue-next';

const router = useRouter();
const ticketStore = useTicketStore();
const authStore = useAuthStore();

onMounted(async () => {
  await ticketStore.fetchTickets();
});

const partners = ['All', 'Pixelz', 'RetouchPro', 'Studio In-House'];
const statuses = ['All', 'Pending', 'Sent', 'In Progress', 'Awaiting Review', 'Completed', 'Rejected'];
const priorities = ['All', 'High', 'Medium', 'Low'];
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Recolour Ticket Queue</h1>
        <p class="text-xs text-slate-500">
          Track lifecycle work orders across retouching partners and studio quality control.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- View Mode Switcher -->
        <div class="flex items-center p-1 rounded-lg bg-slate-200/80 border border-slate-300/60 text-xs">
          <button
            @click="ticketStore.viewMode = 'kanban'"
            :class="[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all',
              ticketStore.viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <Kanban class="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            @click="ticketStore.viewMode = 'table'"
            :class="[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all',
              ticketStore.viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <TableIcon class="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>

        <router-link
          to="/create"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle class="w-4 h-4" />
          <span>Create Ticket</span>
        </router-link>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Partner Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium">Partner:</span>
          <select
            v-model="ticketStore.partnerFilter"
            @change="ticketStore.fetchTickets"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium focus:outline-none"
          >
            <option v-for="p in partners" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium">Status:</span>
          <select
            v-model="ticketStore.statusFilter"
            @change="ticketStore.fetchTickets"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium focus:outline-none"
          >
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium">Priority:</span>
          <select
            v-model="ticketStore.priorityFilter"
            @change="ticketStore.fetchTickets"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium focus:outline-none"
          >
            <option v-for="pr in priorities" :key="pr" :value="pr">{{ pr }}</option>
          </select>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-medium">
        Showing {{ ticketStore.filteredTickets.length }} tickets
      </div>
    </div>

    <!-- View: KANBAN BOARD -->
    <div v-if="ticketStore.viewMode === 'kanban'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      <!-- Column 1: Draft & Pending -->
      <div class="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-slate-400"></span>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Pending Dispatch</h3>
          </div>
          <span class="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs">
            {{ ticketStore.kanbanColumns.draftPending.length }}
          </span>
        </div>

        <div class="space-y-3">
          <TicketCard
            v-for="ticket in ticketStore.kanbanColumns.draftPending"
            :key="ticket.id"
            :ticket="ticket"
          />
          <div
            v-if="ticketStore.kanbanColumns.draftPending.length === 0"
            class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl"
          >
            No pending tickets
          </div>
        </div>
      </div>

      <!-- Column 2: In Retouch / Partner Processing -->
      <div class="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">With Partner (Retouching)</h3>
          </div>
          <span class="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs">
            {{ ticketStore.kanbanColumns.sent.length + ticketStore.kanbanColumns.inProgress.length }}
          </span>
        </div>

        <div class="space-y-3">
          <TicketCard
            v-for="ticket in [...ticketStore.kanbanColumns.sent, ...ticketStore.kanbanColumns.inProgress]"
            :key="ticket.id"
            :ticket="ticket"
          />
          <div
            v-if="ticketStore.kanbanColumns.sent.length === 0 && ticketStore.kanbanColumns.inProgress.length === 0"
            class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl"
          >
            No active partner orders
          </div>
        </div>
      </div>

      <!-- Column 3: Awaiting Review / QC Studio -->
      <div class="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <h3 class="text-xs font-bold text-amber-900 uppercase tracking-wider">Awaiting QC Review</h3>
          </div>
          <span class="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
            {{ ticketStore.kanbanColumns.awaitingReview.length }}
          </span>
        </div>

        <div class="space-y-3">
          <TicketCard
            v-for="ticket in ticketStore.kanbanColumns.awaitingReview"
            :key="ticket.id"
            :ticket="ticket"
          />
          <div
            v-if="ticketStore.kanbanColumns.awaitingReview.length === 0"
            class="p-6 text-center text-xs text-amber-600/70 border border-dashed border-amber-300 rounded-xl"
          >
            No tickets awaiting review
          </div>
        </div>
      </div>

      <!-- Column 4: Completed & Approved -->
      <div class="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 class="text-xs font-bold text-emerald-900 uppercase tracking-wider">Completed / Approved</h3>
          </div>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            {{ ticketStore.kanbanColumns.completed.length }}
          </span>
        </div>

        <div class="space-y-3">
          <TicketCard
            v-for="ticket in ticketStore.kanbanColumns.completed"
            :key="ticket.id"
            :ticket="ticket"
          />
          <div
            v-if="ticketStore.kanbanColumns.completed.length === 0"
            class="p-6 text-center text-xs text-emerald-700/60 border border-dashed border-emerald-300 rounded-xl"
          >
            No completed tickets yet
          </div>
        </div>
      </div>
    </div>

    <!-- View: TABLE MODE -->
    <div v-else>
      <TicketTable :tickets="ticketStore.filteredTickets" />
    </div>
  </div>
</template>
