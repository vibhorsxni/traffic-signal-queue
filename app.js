/* ═══════════════════════════════════════════════════════════════
   Traffic Signal Queue Management — app.js
   Queue (FIFO) data-structure demo with animated UI
   ═══════════════════════════════════════════════════════════════ */

// ─── Queue Implementation ────────────────────────────────────
class VehicleQueue {
  #items = [];

  enqueue(vehicle) {
    this.#items.push(vehicle);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.#items.shift();
  }

  peek() {
    return this.isEmpty() ? null : this.#items[0];
  }

  get size() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  clear() {
    this.#items = [];
  }

  toArray() {
    return [...this.#items];
  }
}

// ─── Vehicle data ────────────────────────────────────────────
const VEHICLE_TYPES = {
  car:        { emoji: '🚗', label: 'Car' },
  suv:        { emoji: '🚙', label: 'SUV' },
  bus:        { emoji: '🚌', label: 'Bus' },
  truck:      { emoji: '🚚', label: 'Truck' },
  bike:       { emoji: '🏍️', label: 'Bike' },
  taxi:       { emoji: '🚕', label: 'Taxi' },
  ambulance:  { emoji: '🚑', label: 'Ambulance' },
  police:     { emoji: '🚓', label: 'Police' },
  van:        { emoji: '🚐', label: 'Van' },
  scooter:    { emoji: '🛵', label: 'Scooter' },
  bicycle:    { emoji: '🚲', label: 'Bicycle' },
  firetruck:  { emoji: '🚒', label: 'Fire Truck' },
};

function resolveVehicle(input) {
  const key = input.trim().toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(VEHICLE_TYPES)) {
    if (key === k || key === v.label.toLowerCase().replace(/\s+/g, '')) {
      return { ...v };
    }
  }
  // Fallback — generic vehicle
  return { emoji: '🚗', label: input.trim().slice(0, 18) || 'Vehicle' };
}

// ─── Traffic Signal State Machine ────────────────────────────
const SIGNAL_STATES = [
  { name: 'red',    label: 'STOP — vehicles are queuing',    dotClass: 'red-dot' },
  { name: 'yellow', label: 'CAUTION — prepare to move',      dotClass: 'yellow-dot' },
  { name: 'green',  label: 'GO — vehicles are passing',      dotClass: 'green-dot' },
];

let signalIndex = 0;           // starts on RED
let autoDequeueInterval = null;

// ─── DOM references ──────────────────────────────────────────
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const dom = {
  lightRed:      $('#lightRed'),
  lightYellow:   $('#lightYellow'),
  lightGreen:    $('#lightGreen'),
  statusDot:     $('.status-dot'),
  statusText:    $('#statusText'),
  vehicleInput:  $('#vehicleInput'),
  btnEnqueue:    $('#btnEnqueue'),
  btnDequeue:    $('#btnDequeue'),
  btnPeek:       $('#btnPeek'),
  btnClear:      $('#btnClear'),
  btnToggle:     $('#btnToggleSignal'),
  queueSize:     $('#queueSize'),
  queueContainer:$('#queueContainer'),
  queueEmpty:    $('#queueEmpty'),
  queueTrack:    $('#queueTrack'),
  labelFront:    $('#labelFront'),
  labelRear:     $('#labelRear'),
  statEnqueued:  $('#statEnqueued'),
  statDequeued:  $('#statDequeued'),
  statCurrent:   $('#statCurrent'),
  logList:       $('#logList'),
  toast:         $('#toast'),
};

// ─── Instance ────────────────────────────────────────────────
const queue = new VehicleQueue();
let totalEnqueued = 0;
let totalDequeued = 0;
let vehicleCounter = 0;       // unique id per card

// ─── Utilities ───────────────────────────────────────────────
function timeStr() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function showToast(msg, duration = 2200) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), duration);
}

function addLog(text, type = 'info') {
  const li = document.createElement('li');
  li.className = `log-item log-${type}`;
  li.innerHTML = `<span class="log-time">${timeStr()}</span> ${text}`;
  dom.logList.prepend(li);
  // Keep log trimmed
  while (dom.logList.children.length > 60) dom.logList.lastChild.remove();
}

// ─── Render helpers ──────────────────────────────────────────
function renderQueue() {
  const items = queue.toArray();
  dom.queueSize.textContent = items.length;
  dom.statCurrent.textContent = items.length;

  // Toggle empty state
  if (items.length === 0) {
    dom.queueEmpty.style.display = '';
    dom.queueTrack.style.display = 'none';
    dom.labelFront.style.visibility = 'hidden';
    dom.labelRear.style.visibility  = 'hidden';
  } else {
    dom.queueEmpty.style.display = 'none';
    dom.queueTrack.style.display = 'flex';
    dom.labelFront.style.visibility = 'visible';
    dom.labelRear.style.visibility  = 'visible';
  }

  // Build cards
  dom.queueTrack.innerHTML = '';
  items.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.id = v.id;
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <span class="vehicle-emoji">${v.emoji}</span>
      <span class="vehicle-name">${v.label}</span>
      <span class="vehicle-position">#${i + 1}${i === 0 ? ' (front)' : ''}</span>
    `;
    dom.queueTrack.appendChild(card);
  });
}

// ─── Signal rendering ────────────────────────────────────────
function renderSignal() {
  const state = SIGNAL_STATES[signalIndex];
  // Reset
  [dom.lightRed, dom.lightYellow, dom.lightGreen].forEach(l => l.classList.remove('active'));
  // Activate
  if (state.name === 'red')    dom.lightRed.classList.add('active');
  if (state.name === 'yellow') dom.lightYellow.classList.add('active');
  if (state.name === 'green')  dom.lightGreen.classList.add('active');

  // Status
  dom.statusDot.className = `status-dot ${state.dotClass}`;
  dom.statusText.textContent = state.label;

  // Auto-dequeue on green
  clearInterval(autoDequeueInterval);
  if (state.name === 'green') {
    autoDequeueInterval = setInterval(() => {
      if (!queue.isEmpty()) {
        dequeueVehicle(true);
      } else {
        clearInterval(autoDequeueInterval);
      }
    }, 1600);
  }
}

// ─── Actions ─────────────────────────────────────────────────
function enqueueVehicle() {
  const raw = dom.vehicleInput.value.trim();
  if (!raw) {
    showToast('⚠️  Enter a vehicle type');
    dom.vehicleInput.focus();
    return;
  }
  const v = resolveVehicle(raw);
  v.id = ++vehicleCounter;
  queue.enqueue(v);
  totalEnqueued++;
  dom.statEnqueued.textContent = totalEnqueued;
  dom.vehicleInput.value = '';
  dom.vehicleInput.focus();
  addLog(`Enqueued <b>${v.emoji} ${v.label}</b>  →  queue size: ${queue.size}`, 'enqueue');
  renderQueue();
  // Scroll to end
  dom.queueTrack.scrollLeft = dom.queueTrack.scrollWidth;
}

function dequeueVehicle(auto = false) {
  if (queue.isEmpty()) {
    showToast('Queue is empty — nothing to dequeue');
    return;
  }

  // If signal is red and it's a manual dequeue, warn
  if (SIGNAL_STATES[signalIndex].name === 'red' && !auto) {
    showToast('🚦 Signal is RED — switch to green first!');
    return;
  }

  const front = queue.peek();
  // Animate out
  const frontCard = dom.queueTrack.querySelector('.vehicle-card');
  if (frontCard) {
    frontCard.classList.add('dequeue-animate');
    setTimeout(() => {
      queue.dequeue();
      totalDequeued++;
      dom.statDequeued.textContent = totalDequeued;
      addLog(`Dequeued <b>${front.emoji} ${front.label}</b>  ←  queue size: ${queue.size}`, 'dequeue');
      renderQueue();
    }, 420);
  } else {
    queue.dequeue();
    totalDequeued++;
    dom.statDequeued.textContent = totalDequeued;
    addLog(`Dequeued <b>${front.emoji} ${front.label}</b>  ←  queue size: ${queue.size}`, 'dequeue');
    renderQueue();
  }
}

function peekVehicle() {
  const front = queue.peek();
  if (!front) {
    showToast('Queue is empty — nothing to peek');
    return;
  }
  addLog(`Peeked  →  <b>${front.emoji} ${front.label}</b> is at the front`, 'peek');
  showToast(`👁 Front: ${front.emoji} ${front.label}`);
  // Visual highlight
  const frontCard = dom.queueTrack.querySelector('.vehicle-card');
  if (frontCard) {
    frontCard.classList.add('peek-highlight');
    setTimeout(() => frontCard.classList.remove('peek-highlight'), 1400);
  }
}

function clearQueue() {
  if (queue.isEmpty()) {
    showToast('Queue is already empty');
    return;
  }
  const count = queue.size;
  queue.clear();
  addLog(`Cleared queue — removed <b>${count}</b> vehicle(s)`, 'clear');
  renderQueue();
}

function cycleSignal() {
  signalIndex = (signalIndex + 1) % SIGNAL_STATES.length;
  const state = SIGNAL_STATES[signalIndex];
  addLog(`Signal changed to <b style="text-transform:uppercase">${state.name}</b>`, 'signal');
  renderSignal();
}

// ─── Event Listeners ─────────────────────────────────────────
dom.btnEnqueue.addEventListener('click', enqueueVehicle);
dom.btnDequeue.addEventListener('click', () => dequeueVehicle(false));
dom.btnPeek.addEventListener('click', peekVehicle);
dom.btnClear.addEventListener('click', clearQueue);
dom.btnToggle.addEventListener('click', cycleSignal);

dom.vehicleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enqueueVehicle();
});

// ─── Ambient Particles ──────────────────────────────────────
(function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    const size = Math.random() * 120 + 40;
    span.style.width  = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left   = `${Math.random() * 100}%`;
    span.style.top    = `${Math.random() * 100}%`;
    span.style.animationDelay    = `${Math.random() * 15}s`;
    span.style.animationDuration = `${14 + Math.random() * 10}s`;
    container.appendChild(span);
  }
})();

// ─── Initial render ──────────────────────────────────────────
renderSignal();
renderQueue();
