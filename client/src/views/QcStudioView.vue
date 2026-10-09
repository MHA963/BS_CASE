<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTicketStore } from '../stores/tickets';
import { useAuthStore } from '../stores/auth';
import BeforeAfterSlider from '../components/qc/BeforeAfterSlider.vue';
import StatusBadge from '../components/common/StatusBadge.vue';
import PriorityBadge from '../components/common/PriorityBadge.vue';
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Scissors,
  ArrowLeft,
  ShieldAlert,
  Building2,
  Clock,
  MessageSquare
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const ticketStore = useTicketStore();
const authStore = useAuthStore();

const ticket = ref(null);
const activeShotIndex = ref(0);
const activeColorwayIndex = ref(0);
const showRejectModal = ref(false);
const rejectReason = ref('Color Deviation / Tone Mismatch');
const rejectNotes = ref('The Pantone tone is slightly desaturated in the shadow areas. Please adjust curve.');
const isProcessing = ref(false);

onMounted(async () => {
  const ticketId = route.params.id || 'TCK-1001';
  ticket.value = await ticketStore.fetchTicketById(ticketId);
});

const activeShot = computed(() => {
  if (!ticket.value || !ticket.value.shots) return null;
  return ticket.value.shots[activeShotIndex.value] || ticket.value.shots[0];
});

const activeColorway = computed(() => {
  if (!ticket.value || !ticket.value.colorways) return { name: 'Granita', hex: '#8B263E', type: 'Solid' };
  return ticket.value.colorways[activeColorwayIndex.value] || ticket.value.colorways[0];
});

const originalImageSrc = computed(() => {
  if (!activeShot.value) return '';
  return `/api/assets/recolour-case/${activeShot.value.ticketFolder || 'Ticket 1'}/${activeShot.value.filename}`;
});

async function handleApprove() {
  if (!authStore.canApprove) {
    alert('Role Restriction: Switch to Production Manager in the sidebar to approve QC assets.');
    return;
  }

  isProcessing.value = true;
  try {
    await ticketStore.approvePhoto({
      ticketId: ticket.value.id,
      colorwayId: activeColorway.value.id,
      shotId: activeShot.value.id,
      approvedBy: authStore.currentUser.name
    });

    alert(`Photo for "${activeColorway.value.name}" (${activeShot.value.code}) approved and stored in Approved Library!`);
    router.push('/library');
  } catch (err) {
    alert('Approval error: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
}

async function handleReject() {
  isProcessing.value = true;
  try {
    await ticketStore.rejectPhoto({
      ticketId: ticket.value.id,
      colorwayId: activeColorway.value.id,
      reason: rejectReason.value,
      feedbackNotes: rejectNotes.value,
      rejectedBy: authStore.currentUser.name
    });

    showRejectModal.value = false;
    alert(`Asset rejected and returned to ${ticket.value.partner} with feedback notes.`);
    router.push('/queue');
  } catch (err) {
    alert('Rejection error: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div v-if="ticket" class="space-y-6 pb-12">
    <!-- Top Inspection Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
      <div class="flex items-center gap-3">
        <router-link
          to="/queue"
          class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-900">#{{ ticket.styleNumber }} — {{ ticket.styleName }}</span>
            <PriorityBadge :priority="ticket.priority" />
          </div>
          <p class="text-[11px] text-slate-500">
            Partner: <strong class="text-slate-800">{{ ticket.partner }}</strong> &bull; Brand: {{ ticket.brand }} &bull; Season: {{ ticket.season }}
          </p>
        </div>
      </div>

      <!-- Action Approval / Reject Buttons -->
      <div class="flex items-center gap-2.5">
        <button
          @click="showRejectModal = true"
          :disabled="isProcessing"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shadow-2xs"
        >
          <XCircle class="w-4 h-4 text-rose-600" />
          <span>Reject with Feedback</span>
        </button>

        <button
          @click="handleApprove"
          :disabled="isProcessing"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <CheckCircle class="w-4 h-4" />
          <span>Approve & Save to Library</span>
        </button>
      </div>
    </div>

    <!-- Main Studio Split View -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- Left 3 Cols: Interactive Before/After Curtain Slider -->
      <div class="lg:col-span-3 space-y-4">
        <!-- Angle & Colorway Switcher Tabs -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <!-- Shot Angle Switcher -->
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Angle:</span>
            <button
              v-for="(shot, idx) in ticket.shots"
              :key="shot.code"
              @click="activeShotIndex = idx"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                activeShotIndex === idx ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              {{ shot.code }} ({{ shot.label }})
            </button>
          </div>

          <!-- Target Colorway Switcher -->
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Target Colorway:</span>
            <button
              v-for="(cw, idx) in ticket.colorways"
              :key="cw.id"
              @click="activeColorwayIndex = idx"
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                activeColorwayIndex === idx
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs ring-1 ring-indigo-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span class="w-3 h-3 rounded-full border border-slate-300" :style="{ backgroundColor: cw.hex }"></span>
              <span>{{ cw.name }}</span>
            </button>
          </div>
        </div>

        <!-- Before / After Slider Canvas -->
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <BeforeAfterSlider
            :original-src="originalImageSrc"
            :colorway="activeColorway"
            :show-clipping-overlay="ticket.clippingPath"
          />
        </div>
      </div>

      <!-- Right 1 Col: Inspector & Quality Verification Checklist -->
      <div class="space-y-4">
        <!-- Target Colorway Card -->
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Target Pantone Spec</h2>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-lg border border-slate-300 shadow-sm shrink-0"
                :style="{ backgroundColor: activeColorway.hex }"
              ></span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-900">{{ activeColorway.name }}</span>
                <span class="text-[11px] text-slate-500 font-mono">{{ activeColorway.pantone }}</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-400">
              HEX Code: <strong class="text-slate-700 font-mono">{{ activeColorway.hex }}</strong>
            </div>
          </div>
        </div>

        <!-- Clipping Path Verification -->
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Quality Checks</h2>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div class="flex items-center gap-2">
                <Scissors class="w-3.5 h-3.5 text-emerald-600" />
                <span class="font-medium">1 Single Clipping Path</span>
              </div>
              <span class="font-bold text-[10px] uppercase">PASS</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div class="flex items-center gap-2">
                <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
                <span class="font-medium">Texture & Knit Preservation</span>
              </div>
              <span class="font-bold text-[10px] uppercase">PASS</span>
            </div>
          </div>
        </div>

        <!-- Case Guidelines & Notes -->
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Original Ticket Notes</h2>
          <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
            {{ ticket.guidelineNotes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Reject Feedback Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-rose-600">
            <XCircle class="w-5 h-5" />
            <h3 class="text-sm font-bold text-slate-900">Reject Asset & Return to Queue</h3>
          </div>
          <button @click="showRejectModal = false" class="text-slate-400 hover:text-slate-600 text-xs font-bold">
            &times;
          </button>
        </div>

        <p class="text-xs text-slate-500">
          Specify why this recoloured photo does not meet BESTSELLER studio standards:
        </p>

        <div class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="font-semibold text-slate-700">Reason</label>
            <select
              v-model="rejectReason"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
            >
              <option value="Color Deviation / Tone Mismatch">Color Deviation / Tone Mismatch</option>
              <option value="Missing or Multiple Clipping Paths">Missing or Multiple Clipping Paths</option>
              <option value="Shadow / Knit Texture Blur">Shadow / Knit Texture Blur</option>
              <option value="Pattern Alignment Error">Pattern Alignment Error</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700">Feedback for Partner Retoucher</label>
            <textarea
              v-model="rejectNotes"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="showRejectModal = false"
            type="button"
            class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            @click="handleReject"
            :disabled="isProcessing"
            type="button"
            class="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="p-12 text-center text-slate-500 text-xs">
    Loading ticket details...
  </div>
</template>
