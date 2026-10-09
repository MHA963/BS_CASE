<script setup>
import { useRouter } from 'vue-router';
import { useTicketStore } from '../../stores/tickets';
import { useAuthStore } from '../../stores/auth';
import StatusBadge from '../common/StatusBadge.vue';
import PriorityBadge from '../common/PriorityBadge.vue';
import ColorSwatchChip from '../common/ColorSwatchChip.vue';
import { Sparkles, Send, Play, CheckCircle, Lock } from 'lucide-vue-next';

defineProps({
  tickets: {
    type: Array,
    required: true
  }
});

const router = useRouter();
const ticketStore = useTicketStore();
const authStore = useAuthStore();

async function handleDispatch(ticketId) {
  await ticketStore.dispatchTicket(ticketId);
}

async function handleSimulate(ticketId, currentStatus) {
  const next = currentStatus === 'Sent' ? 'In Progress' : 'Awaiting Review';
  await ticketStore.simulatePartnerCompletion(ticketId, next);
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          <th class="py-3 px-4">Ticket / Style</th>
          <th class="py-3 px-4">Brand / Season</th>
          <th class="py-3 px-4">Partner</th>
          <th class="py-3 px-4">Priority</th>
          <th class="py-3 px-4">Target Colorways</th>
          <th class="py-3 px-4">Status</th>
          <th class="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
        <tr
          v-for="ticket in tickets"
          :key="ticket.id"
          class="hover:bg-slate-50/70 transition-colors"
        >
          <!-- Style ID & Name -->
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                <img
                  v-if="ticket.shots && ticket.shots[0]"
                  :src="`/api/assets/recolour-case/${ticket.shots[0].ticketFolder || 'Ticket 1'}/${ticket.shots[0].filename}`"
                  :alt="ticket.styleNumber"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-slate-900">#{{ ticket.styleNumber }}</span>
                <span class="text-[11px] text-slate-500 truncate max-w-[140px]">{{ ticket.styleName }}</span>
              </div>
            </div>
          </td>

          <!-- Brand / Season -->
          <td class="py-3.5 px-4 font-medium text-slate-800">
            <div>{{ ticket.brand }}</div>
            <div class="text-[11px] text-slate-400 font-mono">{{ ticket.season }}</div>
          </td>

          <!-- Partner -->
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 border border-slate-200 text-[11px]">
              {{ ticket.partner }}
            </span>
          </td>

          <!-- Priority -->
          <td class="py-3.5 px-4">
            <PriorityBadge :priority="ticket.priority" />
          </td>

          <!-- Colorways -->
          <td class="py-3.5 px-4">
            <div class="flex flex-wrap gap-1 max-w-[220px]">
              <ColorSwatchChip
                v-for="cw in ticket.colorways"
                :key="cw.id"
                :name="cw.name"
                :hex="cw.hex"
                :type="cw.type"
              />
            </div>
          </td>

          <!-- Status -->
          <td class="py-3.5 px-4">
            <StatusBadge :status="ticket.status" />
          </td>

          <!-- Actions -->
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button
                v-if="ticket.status === 'Pending' || ticket.status === 'Draft'"
                @click="handleDispatch(ticket.id)"
                class="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <Send class="w-3 h-3" />
                <span>Dispatch</span>
              </button>

              <button
                v-if="ticket.status === 'Sent' || ticket.status === 'In Progress'"
                @click="handleSimulate(ticket.id, ticket.status)"
                class="px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium text-[11px] hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Play class="w-3 h-3" />
                <span>Simulate</span>
              </button>

              <router-link
                v-if="ticket.status === 'Awaiting Review' && authStore.isManager"
                :to="`/qc/${ticket.id}`"
                class="px-2.5 py-1 rounded bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Sparkles class="w-3 h-3" />
                <span>Review QC</span>
              </router-link>

              <span
                v-else-if="ticket.status === 'Awaiting Review' && authStore.isOperator"
                class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1"
              >
                <Lock class="w-3 h-3" />
                <span>Awaiting Mgr</span>
              </span>

              <router-link
                v-if="ticket.status === 'Completed' && authStore.isManager"
                to="/library"
                class="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] flex items-center gap-1"
              >
                <CheckCircle class="w-3 h-3" />
                <span>Library</span>
              </router-link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
