import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import QueueView from '../views/QueueView.vue';
import TicketCreateView from '../views/TicketCreateView.vue';
import QcStudioView from '../views/QcStudioView.vue';
import ApprovedLibraryView from '../views/ApprovedLibraryView.vue';
import PartnerOverviewView from '../views/PartnerOverviewView.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Studio Dashboard' }
  },
  {
    path: '/queue',
    name: 'queue',
    component: QueueView,
    meta: { title: 'Ticket Queue' }
  },
  {
    path: '/create',
    name: 'create-ticket',
    component: TicketCreateView,
    meta: { title: 'New Recolour Ticket' }
  },
  {
    path: '/qc/:id',
    name: 'qc-studio',
    component: QcStudioView,
    meta: { title: 'Quality Control Studio' }
  },
  {
    path: '/library',
    name: 'approved-library',
    component: ApprovedLibraryView,
    meta: { title: 'Approved Photos Library' }
  },
  {
    path: '/partners',
    name: 'partners',
    component: PartnerOverviewView,
    meta: { title: 'Partner Integration' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
