<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useTicketStore } from '../../stores/tickets';
import { useKpiStore } from '../../stores/kpis';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-vue-next';
import logoUrl from '../../assets/bestseller_logo_black.png';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ticketStore = useTicketStore();
const kpiStore = useKpiStore();

const awaitingQcCount = computed(() => {
  return ticketStore.tickets.filter(t => t.status === 'Awaiting Review').length;
});

const activeCount = computed(() => {
  return ticketStore.tickets.filter(t => t.status !== 'Completed').length;
});

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Ticket Queue',
    path: '/queue',
    icon: Layers,
    badge: activeCount
  },
  {
    name: 'New Ticket',
    path: '/create',
    icon: PlusCircle,
    badge: null
  },
  {
    name: 'Approved Library',
    path: '/library',
    icon: CheckCircle2,
    badge: null
  },
  {
    name: 'Partner Integration',
    path: '/partners',
    icon: Building2,
    badge: null
  }
];
</script>

<template>
  <aside class="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen select-none shrink-0 sticky top-0 z-30">
    <!-- Brand Logo Header -->
    <div class="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
      <router-link to="/dashboard" class="flex items-center gap-3 group">
        <img
          :src="logoUrl"
          alt="BESTSELLER Logo"
          class="h-6 w-auto object-contain transition-transform group-hover:scale-105"
        />
        <div class="flex flex-col">
          <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Recolour OS</span>
          <span class="text-xs font-semibold text-slate-800 tracking-tight">Studio Suite</span>
        </div>
      </router-link>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Navigation
      </div>

      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
          route.path === item.path
            ? 'bg-slate-900 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <component
            :is="item.icon"
            :class="[
              'w-4 h-4 transition-colors',
              route.path === item.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
            ]"
          />
          <span>{{ item.name }}</span>
        </div>

        <!-- Badges -->
        <span
          v-if="item.badge && item.badge.value > 0"
          :class="[
            'text-[10px] px-2 py-0.5 rounded-full font-bold',
            route.path === item.path
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-700'
          ]"
        >
          {{ item.badge.value }}
        </span>
      </router-link>

      <!-- Quick QC Studio Direct Link if tickets awaiting QC -->
      <div class="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span>QC Studio Action</span>
        <span v-if="awaitingQcCount > 0" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
      </div>

      <router-link
        to="/qc/TCK-1001"
        :class="[
          'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all border',
          route.path.startsWith('/qc')
            ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-sm'
            : 'bg-amber-50/70 border-amber-200/80 text-amber-900 hover:bg-amber-100/80'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <Sparkles class="w-4 h-4 text-amber-600" :class="{ 'text-white': route.path.startsWith('/qc') }" />
          <span>A/B QC Inspection</span>
        </div>
        <span
          class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          :class="route.path.startsWith('/qc') ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-900'"
        >
          {{ awaitingQcCount }} Awaiting
        </span>
      </router-link>
    </nav>

    <!-- Role Switcher (Nice-to-Have Requirement) -->
    <div class="p-3 border-t border-slate-200/80 bg-slate-50/70">
      <div class="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-slate-500" />
            Active Role
          </span>
          <span
            :class="[
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              authStore.isManager ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
            ]"
          >
            {{ authStore.isManager ? 'Manager' : 'Operator' }}
          </span>
        </div>

        <button
          @click="authStore.toggleRole"
          class="w-full py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-between transition-colors"
          title="Switch between Operator (Create/Dispatch) and Manager (QC Approvals)"
        >
          <span class="truncate">{{ authStore.currentUser.title }}</span>
          <span class="text-[10px] text-indigo-600 font-semibold underline shrink-0 ml-1">Switch</span>
        </button>

        <p class="text-[10px] text-slate-500 leading-tight">
          {{ authStore.isManager ? 'Can approve / reject QC photos and sign off assets.' : 'Can create tickets and dispatch to retouch partners.' }}
        </p>
      </div>
    </div>
  </aside>
</template>
