<script setup>
import { ref, onMounted } from 'vue';
import { useTicketStore } from '../stores/tickets';
import {
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  Sparkles,
  ExternalLink,
  Activity,
  Send
} from 'lucide-vue-next';

const ticketStore = useTicketStore();
const partners = ref([]);
const isLoading = ref(false);

async function fetchPartners() {
  isLoading.value = true;
  try {
    const res = await fetch('/api/partners');
    const data = await res.json();
    if (data.success) {
      partners.value = data.data;
    }
  } catch (err) {
    console.error('Failed to fetch partners:', err);
  } finally {
    isLoading.value = false;
  }
}

async function simulatePartnerAction(ticketId) {
  await ticketStore.simulatePartnerCompletion(ticketId, 'Awaiting Review');
  alert(`Simulated partner webhook callback: Assets delivered for Ticket ${ticketId}!`);
}

onMounted(async () => {
  await Promise.all([
    fetchPartners(),
    ticketStore.fetchTickets()
  ]);
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Partner Integration & SLA Engine</h1>
        <p class="text-xs text-slate-500">
          Monitor external digital retouching partner APIs, receipt status, and webhook simulation.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>All Partner Gateways Online</span>
        </span>
      </div>
    </div>

    <!-- Partner Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        v-for="partner in partners"
        :key="partner.id"
        class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {{ partner.name.substring(0, 2).toUpperCase() }}
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {{ partner.status }}
            </span>
          </div>

          <div>
            <h2 class="text-base font-bold text-slate-900">{{ partner.name }}</h2>
            <p class="text-xs text-slate-500">{{ partner.serviceTier }}</p>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-600">
              <span>SLA Performance:</span>
              <strong class="text-slate-900 font-bold">{{ partner.slaRate }}</strong>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Avg Turnaround:</span>
              <strong class="text-slate-900 font-bold">{{ partner.avgTurnaroundHours }} hrs</strong>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>API Endpoint:</span>
              <span class="font-mono text-[10px] text-slate-500 truncate max-w-[130px]">{{ partner.apiEndpoint }}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Active Orders:</span>
          <span class="font-bold text-slate-900">{{ partner.activeTickets }} in queue</span>
        </div>
      </div>
    </div>

    <!-- Live Active Dispatched Tickets Table -->
    <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Active Retouch Orders in Progress</h2>
          <p class="text-xs text-slate-500">Live SLA countdown and instant simulator callback controls</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th class="py-3 px-4">Ticket</th>
              <th class="py-3 px-4">Partner</th>
              <th class="py-3 px-4">Sent At</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Simulator Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="ticket in ticketStore.tickets.filter(t => t.status === 'Sent' || t.status === 'In Progress')"
              :key="ticket.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="py-3.5 px-4 font-bold text-slate-900">
                #{{ ticket.styleNumber }} ({{ ticket.brand }})
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-800">
                {{ ticket.partner }}
              </td>
              <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                {{ ticket.sentAt ? new Date(ticket.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now' }}
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200 animate-pulse">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <button
                  @click="simulatePartnerAction(ticket.id)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>Simulate Delivery Callback</span>
                </button>
              </td>
            </tr>

            <tr v-if="ticketStore.tickets.filter(t => t.status === 'Sent' || t.status === 'In Progress').length === 0">
              <td colspan="5" class="py-8 text-center text-xs text-slate-400">
                No orders currently in partner retouching queue. Create and dispatch a ticket to test.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
