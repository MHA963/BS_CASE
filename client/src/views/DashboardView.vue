<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTicketStore } from '../stores/tickets';
import { useKpiStore } from '../stores/kpis';
import StatusBadge from '../components/common/StatusBadge.vue';
import {
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  PlusCircle,
  Building2,
  AlertTriangle
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const ticketStore = useTicketStore();
const kpiStore = useKpiStore();

onMounted(async () => {
  await Promise.all([
    ticketStore.fetchTickets(),
    kpiStore.fetchKpis()
  ]);
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Top Welcome & Role Context Banner -->
    <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">BESTSELLER Studio Workflow</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Digital Asset Engine</span>
        </div>
        <h1 class="text-xl font-bold text-slate-900">
          Good morning, {{ authStore.currentUser.name }}
        </h1>
        <p class="text-xs text-slate-500">
          Active Mode: <strong class="text-slate-800">{{ authStore.currentUser.title }}</strong>.
          {{ authStore.isManager ? 'You have full authorization to sign off and approve recolour tickets to the digital asset library.' : 'You can create recolour orders and dispatch to retouch partners.' }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <router-link
          v-if="authStore.isOperator"
          to="/create"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle class="w-4 h-4" />
          <span>New Recolour Ticket</span>
        </router-link>

        <router-link
          v-else-if="authStore.isManager"
          to="/qc/TCK-1001"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Sparkles class="w-4 h-4" />
          <span>Clear QC Bottleneck</span>
        </router-link>

        <router-link
          to="/queue"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
        >
          <Layers class="w-4 h-4 text-slate-500" />
          <span>View Queue</span>
        </router-link>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Active Tickets -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-medium text-slate-600">Active Tickets</span>
          <Layers class="w-4 h-4 text-slate-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ kpiStore.kpis.activeTickets }}</span>
          <span class="text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">In Pipeline</span>
        </div>
      </div>

      <!-- Awaiting QC Approval -->
      <div class="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/20 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-amber-700">
          <span class="text-xs font-semibold text-amber-900">Awaiting QC Approval</span>
          <Sparkles class="w-4 h-4 text-amber-600" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-amber-900">{{ kpiStore.kpis.awaitingQcApproval }}</span>
          <span class="text-[11px] text-amber-700 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">Ready for QC</span>
        </div>
      </div>

      <!-- Partner SLA Rate -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-medium text-slate-600">Partner SLA Rate</span>
          <TrendingUp class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ kpiStore.kpis.partnerSlaRate }}</span>
          <span class="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">On Target</span>
        </div>
      </div>

      <!-- Avg Turnaround Time -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-medium text-slate-600">Avg Turnaround</span>
          <Clock class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ kpiStore.kpis.avgTurnaroundHours }}</span>
          <span class="text-[11px] text-slate-500">Industry leading</span>
        </div>
      </div>

      <!-- Reshoot Savings -->
      <div class="p-4 rounded-xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-emerald-700">
          <span class="text-xs font-semibold text-emerald-900">Reshoot Cost Saved</span>
          <PiggyBank class="w-4 h-4 text-emerald-600" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-emerald-900">{{ kpiStore.kpis.reshootSavingsEuro }}</span>
          <span class="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Digital ROI</span>
        </div>
      </div>
    </div>

    <!-- Middle Section: Throughput Chart, Partner Distribution & Urgent Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Throughput Visual Chart -->
      <div class="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Weekly Ticket Throughput & Delivery Velocity</h2>
            <p class="text-xs text-slate-500">Volume dispatched vs approved by studio</p>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">Last 7 Days</span>
        </div>

        <!-- Visual Bar Chart -->
        <div class="h-48 flex items-end justify-between gap-3 pt-6 px-2">
          <div
            v-for="item in kpiStore.kpis.weeklyThroughput"
            :key="item.day"
            class="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div class="w-full flex items-end justify-center gap-1 h-36">
              <!-- Total Dispatched Volume Bar -->
              <div
                class="w-4 rounded-t bg-slate-200 group-hover:bg-slate-300 transition-all"
                :style="{ height: `${(item.volume / 30) * 100}%` }"
                :title="`Dispatched: ${item.volume}`"
              ></div>
              <!-- Completed Bar -->
              <div
                class="w-4 rounded-t bg-slate-900 group-hover:bg-indigo-600 transition-all"
                :style="{ height: `${(item.completed / 30) * 100}%` }"
                :title="`Completed: ${item.completed}`"
              ></div>
            </div>
            <span class="text-[11px] font-semibold text-slate-500">{{ item.day }}</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-slate-200"></span>
            <span>Dispatched Tickets</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-slate-900"></span>
            <span>QC Approved Assets</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards (Role Aware) -->
      <div class="space-y-6">
        <!-- MANAGER VIEW: Urgent QC Approval Action Card -->
        <div v-if="authStore.isManager" class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-amber-500" />
              Priority QC Items (Manager Sign-Off)
            </h2>
            <router-link to="/queue" class="text-xs text-indigo-600 hover:underline font-medium">All</router-link>
          </div>

          <div class="space-y-2">
            <div
              v-for="ticket in ticketStore.tickets.filter(t => t.status === 'Awaiting Review')"
              :key="ticket.id"
              class="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded bg-white border border-amber-200 overflow-hidden shrink-0">
                  <img
                    v-if="ticket.shots && ticket.shots[0]"
                    :src="`/api/assets/recolour-case/${ticket.shots[0].ticketFolder || 'Ticket 1'}/${ticket.shots[0].filename}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-900">#{{ ticket.styleNumber }} ({{ ticket.brand }})</span>
                  <span class="text-[10px] text-amber-800 font-medium">Ready for A/B sign off</span>
                </div>
              </div>

              <router-link
                :to="`/qc/${ticket.id}`"
                class="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-2xs transition-colors shrink-0"
              >
                Inspect
              </router-link>
            </div>

            <div
              v-if="ticketStore.tickets.filter(t => t.status === 'Awaiting Review').length === 0"
              class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl"
            >
              🎉 QC Queue clear! No tickets currently awaiting sign-off.
            </div>
          </div>
        </div>

        <!-- OPERATOR VIEW: Open Tickets & Pending Dispatch Action Card -->
        <div v-else class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers class="w-4 h-4 text-indigo-500" />
              Operator Action Items
            </h2>
            <router-link to="/queue" class="text-xs text-indigo-600 hover:underline font-medium">View All</router-link>
          </div>

          <div class="space-y-2">
            <!-- 1. Open Tickets Waiting for Dispatch -->
            <div
              v-for="ticket in ticketStore.tickets.filter(t => t.status === 'Pending' || t.status === 'Draft')"
              :key="ticket.id"
              class="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded bg-white border border-blue-200 overflow-hidden shrink-0">
                  <img
                    v-if="ticket.shots && ticket.shots[0]"
                    :src="`/api/assets/recolour-case/${ticket.shots[0].ticketFolder || 'Ticket 1'}/${ticket.shots[0].filename}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-900">#{{ ticket.styleNumber }} ({{ ticket.brand }})</span>
                  <span class="text-[10px] text-blue-700 font-medium">Ready to dispatch to {{ ticket.partner }}</span>
                </div>
              </div>

              <button
                @click="ticketStore.dispatchTicket(ticket.id)"
                class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-2xs transition-colors shrink-0"
              >
                Dispatch
              </button>
            </div>

            <!-- 2. Tickets Awaiting Manager QC -->
            <div
              v-for="ticket in ticketStore.tickets.filter(t => t.status === 'Awaiting Review')"
              :key="ticket.id"
              class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded bg-white border border-slate-200 overflow-hidden shrink-0">
                  <img
                    v-if="ticket.shots && ticket.shots[0]"
                    :src="`/api/assets/recolour-case/${ticket.shots[0].ticketFolder || 'Ticket 1'}/${ticket.shots[0].filename}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-900">#{{ ticket.styleNumber }} ({{ ticket.brand }})</span>
                  <span class="text-[10px] text-slate-500 font-medium">Delivered by {{ ticket.partner }}</span>
                </div>
              </div>

              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Awaiting Manager QC
              </span>
            </div>

            <div
              v-if="ticketStore.tickets.filter(t => t.status === 'Pending' || t.status === 'Draft' || t.status === 'Awaiting Review').length === 0"
              class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl"
            >
              All orders are currently in progress or completed.
            </div>
          </div>
        </div>

        <!-- Partner Workload Breakdown -->
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 class="w-4 h-4 text-slate-500" />
            Partner Workload Breakdown
          </h2>

          <div class="space-y-2.5">
            <div
              v-for="partner in kpiStore.kpis.partnerBreakdown"
              :key="partner.name"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-slate-700">{{ partner.name }}</span>
                <span class="font-bold text-slate-900">{{ partner.percentage }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{ width: `${partner.percentage}%`, backgroundColor: partner.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
