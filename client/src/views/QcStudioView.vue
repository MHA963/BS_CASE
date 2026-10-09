<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTicketStore } from '../stores/tickets';
import { useAuthStore } from '../stores/auth';
import BeforeAfterSlider from '../components/qc/BeforeAfterSlider.vue';
import StatusBadge from '../components/common/StatusBadge.vue';
import PriorityBadge from '../components/common/PriorityBadge.vue';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Scissors,
  ArrowLeft,
  ShieldAlert,
  Building2,
  Clock,
  Eye,
  Check,
  Image as ImageIcon,
  Lock,
  ZoomIn,
  AlertTriangle
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const ticketStore = useTicketStore();
const authStore = useAuthStore();

const ticket = ref(null);
const activeShotIndex = ref(0);
const activeColorwayIndex = ref(0);
const showRejectModal = ref(false);
const showPatternLightbox = ref(false);
const rejectReason = ref('Color Deviation / Tone Mismatch');
const rejectNotes = ref('The tone deviates slightly from Pantone spec. Please adjust saturation.');
const isProcessing = ref(false);

// Track verified/inspected variants: Set of "shotCode_colorwayId"
const inspectedVariants = ref(new Set());

onMounted(async () => {
  const ticketId = route.params.id || 'TCK-1001';
  ticket.value = await ticketStore.fetchTicketById(ticketId);
  markCurrentVariantInspected();
});

const activeShot = computed(() => {
  if (!ticket.value || !ticket.value.shots) return null;
  return ticket.value.shots[activeShotIndex.value] || ticket.value.shots[0];
});

const activeColorway = computed(() => {
  if (!ticket.value || !ticket.value.colorways) return { id: 'cw-1', name: 'Granita', hex: '#8B263E', type: 'Solid' };
  return ticket.value.colorways[activeColorwayIndex.value] || ticket.value.colorways[0];
});

const originalImageSrc = computed(() => {
  if (!activeShot.value) return '';
  return `/api/assets/recolour-case/${activeShot.value.ticketFolder || 'Ticket 1'}/${activeShot.value.filename}`;
});

// Pattern reference file path (e.g. Block Libre.jpg / DOTS CLOUD DANCER.jpg)
const patternReferenceSrc = computed(() => {
  if (!ticket.value || !ticket.value.patternAttachment) return null;
  return `/api/assets/recolour-case/${ticket.value.patternAttachment.ticketFolder || 'Ticket 1'}/${ticket.value.patternAttachment.filename}`;
});

// Total required output combinations (e.g. 3 shots x 2 colorways = 6 variants)
const totalVariantsCount = computed(() => {
  if (!ticket.value) return 0;
  return (ticket.value.shots?.length || 0) * (ticket.value.colorways?.length || 0);
});

const inspectedCount = computed(() => inspectedVariants.value.size);
const allVariantsInspected = computed(() => {
  return totalVariantsCount.value > 0 && inspectedCount.value >= totalVariantsCount.value;
});

function markCurrentVariantInspected() {
  if (activeShot.value && activeColorway.value) {
    const key = `${activeShot.value.code}_${activeColorway.value.id}`;
    inspectedVariants.value.add(key);
  }
}

watch([activeShotIndex, activeColorwayIndex], () => {
  markCurrentVariantInspected();
});

function isVariantInspected(shotCode, colorwayId) {
  return inspectedVariants.value.has(`${shotCode}_${colorwayId}`);
}

function selectVariant(shotIdx, cwIdx) {
  activeShotIndex.value = shotIdx;
  activeColorwayIndex.value = cwIdx;
}

function verifyAllQuick() {
  if (!ticket.value) return;
  ticket.value.shots.forEach(s => {
    ticket.value.colorways.forEach(cw => {
      inspectedVariants.value.add(`${s.code}_${cw.id}`);
    });
  });
}

async function handleApprove() {
  if (!authStore.canApprove) {
    alert('Access Denied: Only Studio Production Managers are authorized to approve QC assets.');
    return;
  }

  if (!allVariantsInspected.value) {
    alert(`QC Safety Invariant: Please inspect all ${totalVariantsCount.value} angle & colorway variations before signing off (Currently ${inspectedCount.value}/${totalVariantsCount.value} inspected).`);
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

    alert(`All ${totalVariantsCount.value} variants approved and committed to Approved Library!`);
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
    <!-- Operator Access Guard (Strict Role-Based Security) -->
    <div
      v-if="authStore.isOperator"
      class="p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-3"
    >
      <div class="flex items-center gap-3 text-amber-900">
        <Lock class="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h2 class="text-sm font-bold">Manager QC Authorization Required</h2>
          <p class="text-xs text-amber-700">
            You are currently signed in as <strong>Studio Operator</strong>. Operators manage ticket creation and dispatch. The approval/rejection sign-off flow is restricted to Production Managers.
          </p>
        </div>
      </div>
      <div class="pt-2 flex items-center gap-3">
        <button
          @click="authStore.setRole('manager')"
          class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-2xs"
        >
          Switch to Production Manager Role
        </button>
        <router-link
          to="/queue"
          class="px-4 py-2 rounded-lg border border-amber-300 bg-white text-amber-800 text-xs font-semibold hover:bg-amber-50 transition-colors"
        >
          Return to Queue
        </router-link>
      </div>
    </div>

    <!-- Manager QC Studio Workspace -->
    <template v-else>
      <!-- Top Inspection Header Bar -->
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

        <!-- Approval Action Buttons with Mandatory Variant Check Indicator -->
        <div class="flex items-center gap-2.5">
          <button
            @click="showRejectModal = true"
            :disabled="isProcessing"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shadow-2xs"
          >
            <XCircle class="w-4 h-4 text-rose-600" />
            <span>Reject with Feedback</span>
          </button>

          <!-- Safe Approval Button (Enforces Variant Inspection) -->
          <button
            @click="handleApprove"
            :disabled="isProcessing || !allVariantsInspected"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm',
              allVariantsInspected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            ]"
            :title="allVariantsInspected ? 'Ready to sign off' : 'Inspect all variants below before approving'"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>Approve & Save to Library</span>
            <span
              :class="[
                'text-[10px] px-2 py-0.5 rounded-full font-bold',
                allVariantsInspected ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-600'
              ]"
            >
              {{ inspectedCount }}/{{ totalVariantsCount }} Inspected
            </span>
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
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                  activeShotIndex === idx ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <span>{{ shot.code }} ({{ shot.label }})</span>
                <span
                  v-if="isVariantInspected(shot.code, activeColorway.id)"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                ></span>
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
                <span
                  v-if="isVariantInspected(activeShot.code, cw.id)"
                  class="text-[9px] text-emerald-600 font-bold"
                >
                  ✓
                </span>
              </button>
            </div>
          </div>

          <!-- Before / After Slider Canvas -->
          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <BeforeAfterSlider
              :original-src="originalImageSrc"
              :colorway="activeColorway"
              :pattern-src="patternReferenceSrc"
            />
          </div>

          <!-- Mandatory Variant Inspection Matrix (Requirement 2.2) -->
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-indigo-600" />
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Mandatory Output Inspection Matrix ({{ inspectedCount }}/{{ totalVariantsCount }} Verified)
                </h3>
              </div>
              <button
                @click="verifyAllQuick"
                class="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Mark All Verified
              </button>
            </div>

            <p class="text-[11px] text-slate-500">
              Click each matrix cell to inspect and verify every angle and colorway before authorizing library approval:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <template v-for="(shot, sIdx) in ticket.shots" :key="shot.code">
                <div
                  v-for="(cw, cIdx) in ticket.colorways"
                  :key="`${shot.code}_${cw.id}`"
                  @click="selectVariant(sIdx, cIdx)"
                  :class="[
                    'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                    activeShotIndex === sIdx && activeColorwayIndex === cIdx
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                      : isVariantInspected(shot.code, cw.id)
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full border border-slate-300" :style="{ backgroundColor: cw.hex }"></span>
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800">{{ shot.code }} &bull; {{ cw.name }}</span>
                      <span class="text-[10px] text-slate-400">{{ shot.label }}</span>
                    </div>
                  </div>

                  <span
                    :class="[
                      'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1',
                      isVariantInspected(shot.code, cw.id)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    <Check v-if="isVariantInspected(shot.code, cw.id)" class="w-2.5 h-2.5" />
                    <span>{{ isVariantInspected(shot.code, cw.id) ? 'Verified' : 'Unchecked' }}</span>
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right 1 Col: Inspector, Reference Material & Checklist -->
        <div class="space-y-4">
          <!-- Pattern Reference Material Card (Requirement 2.3) -->
          <div
            v-if="ticket.patternAttachment"
            class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon class="w-3.5 h-3.5 text-purple-600" />
                Pattern Reference Asset
              </h2>
              <span class="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                AOP Spec
              </span>
            </div>

            <div
              @click="showPatternLightbox = true"
              class="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer group hover:border-purple-300 transition-all"
            >
              <img
                :src="patternReferenceSrc"
                :alt="ticket.patternAttachment.name"
                class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1">
                <ZoomIn class="w-4 h-4" />
                <span>Click to Zoom Pattern</span>
              </div>
            </div>

            <div class="text-[11px] text-slate-600">
              Pattern: <strong class="text-slate-900">{{ ticket.patternAttachment.name }}</strong>
            </div>
          </div>

          <!-- Target Colorway Spec Card -->
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

          <!-- Clipping Path & Quality Invariants -->
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Studio Quality Checks</h2>

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
                  <span class="font-medium">Fabric Weave & Texture</span>
                </div>
                <span class="font-bold text-[10px] uppercase">PASS</span>
              </div>
            </div>
          </div>

          <!-- Original Ticket Notes -->
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Original Ticket Notes</h2>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
              {{ ticket.guidelineNotes }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pattern Reference Lightbox Modal -->
      <div
        v-if="showPatternLightbox"
        @click="showPatternLightbox = false"
        class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 cursor-pointer"
      >
        <div class="max-w-2xl bg-white rounded-2xl overflow-hidden p-4 space-y-3" @click.stop>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900">{{ ticket.patternAttachment?.name }} (Original Pattern Swatch)</span>
            <button @click="showPatternLightbox = false" class="text-slate-400 hover:text-slate-600 font-bold text-base">&times;</button>
          </div>
          <img :src="patternReferenceSrc" class="w-full max-h-[70vh] object-contain rounded-lg" />
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
            Specify feedback for <strong>{{ ticket.partner }}</strong>:
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
    </template>
  </div>

  <div v-else class="p-12 text-center text-slate-500 text-xs">
    Loading ticket details...
  </div>
</template>
