<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useTicketStore } from '../../stores/tickets';
import StatusBadge from '../common/StatusBadge.vue';
import PriorityBadge from '../common/PriorityBadge.vue';
import ColorSwatchChip from '../common/ColorSwatchChip.vue';
import {
  Clock,
  Send,
  Sparkles,
  Scissors,
  CheckCircle,
  Play,
  Lock
} from 'lucide-vue-next';

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const authStore = useAuthStore();
const ticketStore = useTicketStore();

const primaryShot = computed(() => {
  return props.ticket.shots && props.ticket.shots[0]
    ? `/api/assets/recolour-case/${props.ticket.shots[0].ticketFolder || 'Ticket 1'}/${props.ticket.shots[0].filename}`
    : null;
});

async function handleDispatch() {
  await ticketStore.dispatchTicket(props.ticket.id);
}

async function handleSimulateProgress() {
  if (props.ticket.status === 'Sent') {
    await ticketStore.simulatePartnerCompletion(props.ticket.id, 'In Progress');
  } else if (props.ticket.status === 'In Progress') {
    await ticketStore.simulatePartnerCompletion(props.ticket.id, 'Awaiting Review');
  }
}
</script>

<template>
  <div class="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between space-y-3">
    <!-- Header: Style Number & Priority -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-slate-900">#{{ ticket.styleNumber }}</span>
          <span class="text-[10px] text-slate-400 font-medium">({{ ticket.brand }})</span>
        </div>
        <span class="text-[11px] text-slate-600 font-medium truncate max-w-[160px]">{{ ticket.styleName }}</span>
      </div>
      <PriorityBadge :priority="ticket.priority" />
    </div>

    <!-- Thumbnail & Shot Counts -->
    <div class="flex items-center gap-3">
      <div class="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
        <img
          v-if="primaryShot"
          :src="primaryShot"
          :alt="ticket.styleNumber"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <span class="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/60 text-[9px] text-white font-mono">
          {{ ticket.shots?.length || 3 }} shots
        </span>
      </div>

      <div class="flex flex-col flex-1 min-w-0 space-y-1">
        <div class="flex items-center gap-1 text-[11px] text-slate-500">
          <Clock class="w-3 h-3 text-slate-400" />
          <span v-if="ticket.slaHours">{{ ticket.slaHours }}h turnaround</span>
          <span v-else-if="ticket.status === 'Sent'">ETA: ~4.5 hrs</span>
          <span v-else>{{ ticket.partner }} ({{ ticket.season }})</span>
        </div>

        <div class="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit border border-emerald-200">
          <Scissors class="w-3 h-3" />
          <span>1 Clipping Path</span>
        </div>
      </div>
    </div>

    <!-- Requested Colorways Swatches -->
    <div class="space-y-1">
      <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Colorways</div>
      <div class="flex flex-wrap gap-1">
        <ColorSwatchChip
          v-for="cw in ticket.colorways"
          :key="cw.id"
          :name="cw.name"
          :hex="cw.hex"
          :type="cw.type"
        />
      </div>
    </div>

    <!-- Actions & Footer -->
    <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
      <StatusBadge :status="ticket.status" />

      <div class="flex items-center gap-1.5">
        <!-- Dispatch button for Draft/Pending -->
        <button
          v-if="ticket.status === 'Pending' || ticket.status === 'Draft'"
          @click="handleDispatch"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors shadow-2xs"
          title="Send to Partner"
        >
          <Send class="w-3 h-3" />
          <span>Dispatch</span>
        </button>

        <!-- Partner Simulator Fast-Forward Button -->
        <button
          v-if="ticket.status === 'Sent' || ticket.status === 'In Progress'"
          @click="handleSimulateProgress"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-medium transition-colors"
          title="Simulate Partner Retouch Progress"
        >
          <Play class="w-3 h-3 text-indigo-500" />
          <span>Simulate</span>
        </button>

        <!-- Review QC Button (Only for Manager Role) -->
        <router-link
          v-if="ticket.status === 'Awaiting Review' && authStore.isManager"
          :to="`/qc/${ticket.id}`"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors shadow-sm animate-pulse"
        >
          <Sparkles class="w-3 h-3" />
          <span>Review QC</span>
        </router-link>

        <span
          v-else-if="ticket.status === 'Awaiting Review' && authStore.isOperator"
          class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1"
        >
          <Lock class="w-3 h-3" />
          <span>Awaiting Manager</span>
        </span>

        <!-- View Button for other states -->
        <router-link
          v-if="ticket.status === 'Completed' && authStore.isManager"
          :to="`/library`"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
        >
          <CheckCircle class="w-3 h-3 text-emerald-600" />
          <span>In Library</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
