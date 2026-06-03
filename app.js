// ==========================
// ELEMENTS
// ==========================
const stage1 = document.getElementById('stage1');
const stage2 = document.getElementById('stage2');
const stage3 = document.getElementById('stage3');
const feedbackDiv = document.getElementById('feedback');
const progressBar = document.getElementById('progressBar');
const form = document.getElementById('registrationForm');

const loadingOverlay = document.getElementById('loadingOverlay');
const successScreen = document.getElementById('successScreen');
const closeSuccess = document.getElementById('closeSuccess');

const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

const nameEl = document.getElementById('name');
const staffId = document.getElementById('staffId');
const role = document.getElementById('role');
const phone = document.getElementById('phone');
const address = document.getElementById('address');
const college = document.getElementById('college');
const campusStatus = document.getElementById('campusStatus');
const driverLicense = document.getElementById('driverLicense');
const password = document.getElementById('password');

// ==========================
// VEHICLE STATE
// Max 5 for staff, 1 for student (enforced on submit based on role)
// ==========================
let vehicles = [];       // [{ id, plate, make, color }]
let drivers = [];        // [{ name, license }]

const MAX_VEHICLES = 5;
const MAX_DRIVERS = 2;

// ==========================
// HELPERS
// ==========================
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function shakeField(el) {
  if (!el) return;
  el.classList.add('shake', 'invalid');
  setTimeout(() => el.classList.remove('shake'), 300);
}

function showFeedback(message, type = 'error') {
  if (!feedbackDiv) return;
  feedbackDiv.textContent = message;
  feedbackDiv.className = type === 'success'
    ? 'bg-green-200 text-green-800 p-2 rounded-lg mb-2 text-sm'
    : 'bg-red-200 text-red-800 p-2 rounded-lg mb-2 text-sm';
  setTimeout(() => {
    feedbackDiv.textContent = '';
    feedbackDiv.className = '';
  }, 4000);
}

function markValid(input, condition) {
  if (!input) return;
  input.classList.toggle('valid', condition);
  input.classList.toggle('invalid', !condition);
}

function setStage(n) {
  [stage1, stage2, stage3].forEach((s, i) => {
    s.classList.toggle('hidden', i + 1 !== n);
  });
  const pct = { 1: 33, 2: 66, 3: 100 };
  progressBar.style.width = pct[n] + '%';

  ['stage1Indicator', 'stage2Indicator', 'stage3Indicator'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (i + 1 < n) {
      el.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold';
      el.innerHTML = '<i class="fas fa-check text-xs"></i>';
    } else if (i + 1 === n) {
      el.className = 'w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold';
      el.textContent = n;
    } else {
      el.className = 'w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold';
      el.textContent = i + 1;
    }
  });
}

// ==========================
// PHONE FORMAT
// ==========================
phone?.addEventListener('input', () => {
  let value = phone.value.replace(/\D/g, '');

  if (value.startsWith('07')) {
    value = value.slice(0, 10);
    let formatted = value;
    if (value.length > 3 && value.length <= 6) formatted = value.slice(0,3) + ' ' + value.slice(3);
    else if (value.length > 6) formatted = value.slice(0,3) + ' ' + value.slice(3,6) + ' ' + value.slice(6,10);
    phone.value = formatted;
  } else if (value.startsWith('263')) {
    value = value.slice(0, 12);
    let formatted = '+263';
    if (value.length > 3) formatted += ' ' + value.slice(3,5);
    if (value.length > 5) formatted += ' ' + value.slice(5,8);
    if (value.length > 8) formatted += ' ' + value.slice(8,12);
    phone.value = formatted.trim();
  }

  const clean = phone.value.replace(/\D/g, '');
  markValid(phone, clean.length === 10 || clean.length === 12);
});

driverLicense?.addEventListener('input', () => {
  let v = driverLicense.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
  driverLicense.value = v;
  markValid(driverLicense, v.length >= 6);
});

// ==========================
// VEHICLE CARD RENDERER
// ==========================
function renderVehicles() {
  const list = document.getElementById('vehicleList');
  const addBtn = document.getElementById('addVehicleBtn');
  const countLabel = document.getElementById('vehicleCountLabel');

  list.innerHTML = '';
  countLabel.textContent = `${vehicles.length} / ${MAX_VEHICLES}`;

  vehicles.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'vehicle-card glass-inner p-4 rounded-xl space-y-3 relative fade-in';
    card.dataset.vehicleIndex = i;

    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <i class="fas fa-car text-red-500"></i> Vehicle ${i + 1}
          <span class="text-xs text-gray-400 font-mono">#${v.id.slice(0,8)}</span>
        </span>
        ${vehicles.length > 1 ? `
        <button type="button" class="remove-vehicle-btn text-gray-400 hover:text-red-500 transition"
          data-index="${i}"
          style="background:none !important; box-shadow:none !important; color:#9ca3af; padding:4px;">
          <i class="fas fa-trash-alt text-sm"></i>
        </button>` : ''}
      </div>

      <div class="relative">
        <i class="fas fa-hashtag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" class="vehicle-plate w-full rounded-lg p-3 pl-9 text-sm" placeholder="Plate (ABC-1234)" maxlength="8" value="${v.plate}" data-index="${i}">
      </div>

      <div class="relative">
        <i class="fas fa-car-side absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" class="vehicle-make w-full rounded-lg p-3 pl-9 text-sm" placeholder="Make / Model" value="${v.make}" data-index="${i}">
      </div>

      <div class="relative">
        <i class="fas fa-palette absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" class="vehicle-color w-full rounded-lg p-3 pl-9 text-sm" placeholder="Color" value="${v.color}" data-index="${i}">
      </div>
    `;

    list.appendChild(card);
  });

  // Show/hide add button
  addBtn.style.display = vehicles.length >= MAX_VEHICLES ? 'none' : 'flex';

  // Bind plate format + live save
  list.querySelectorAll('.vehicle-plate').forEach(input => {
    input.addEventListener('input', () => {
      let val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (val.length > 3) val = val.slice(0,3) + '-' + val.slice(3,7);
      input.value = val;
      const idx = parseInt(input.dataset.index);
      vehicles[idx].plate = val;
      markValid(input, /^[A-Z]{3}-\d{4}$/.test(val));
    });
  });

  list.querySelectorAll('.vehicle-make').forEach(input => {
    input.addEventListener('input', () => {
      vehicles[parseInt(input.dataset.index)].make = input.value;
    });
  });

  list.querySelectorAll('.vehicle-color').forEach(input => {
    input.addEventListener('input', () => {
      vehicles[parseInt(input.dataset.index)].color = input.value;
    });
  });

  list.querySelectorAll('.remove-vehicle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      vehicles.splice(idx, 1);
      renderVehicles();
    });
  });
}

// ==========================
// DRIVER CARD RENDERER
// ==========================
function renderDrivers() {
  const list = document.getElementById('driverList');
  const addBtn = document.getElementById('addDriverBtn');

  list.innerHTML = '';

  drivers.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'glass-inner p-4 rounded-xl space-y-3 relative fade-in';

    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <i class="fas fa-user text-blue-500"></i> Driver ${i + 1}
        </span>
        <button type="button" class="remove-driver-btn text-gray-400 hover:text-red-500 transition"
          data-index="${i}"
          style="background:none !important; box-shadow:none !important; color:#9ca3af; padding:4px;">
          <i class="fas fa-trash-alt text-sm"></i>
        </button>
      </div>

      <div class="relative">
        <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" class="driver-name w-full rounded-lg p-3 pl-9 text-sm" placeholder="Driver Full Name" value="${d.name}" data-index="${i}">
      </div>

      <div class="relative">
        <i class="fas fa-id-badge absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" class="driver-license w-full rounded-lg p-3 pl-9 text-sm" placeholder="Driver License Number" value="${d.license}" data-index="${i}">
      </div>
    `;

    list.appendChild(card);
  });

  addBtn.style.display = drivers.length >= MAX_DRIVERS ? 'none' : 'flex';

  list.querySelectorAll('.driver-name').forEach(input => {
    input.addEventListener('input', () => {
      drivers[parseInt(input.dataset.index)].name = input.value;
    });
  });

  list.querySelectorAll('.driver-license').forEach(input => {
    input.addEventListener('input', () => {
      let v = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
      input.value = v;
      drivers[parseInt(input.dataset.index)].license = v;
    });
  });

  list.querySelectorAll('.remove-driver-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      drivers.splice(parseInt(btn.dataset.index), 1);
      renderDrivers();
    });
  });
}

// ==========================
// STAGE NAVIGATION
// ==========================
document.getElementById('nextStage1')?.addEventListener('click', () => {
  const fields = [nameEl, staffId, role, college, driverLicense, campusStatus, password];
  let valid = true;
  fields.forEach(el => {
    if (!el || !el.value.trim()) { shakeField(el); valid = false; }
  });
  if (!valid) return showFeedback('Fill all required fields!', 'error');
  if (password.value.length !== 8) {
    shakeField(password);
    return showFeedback('Password must be exactly 8 characters', 'error');
  }

  // Init first vehicle if empty
  if (vehicles.length === 0) {
    vehicles.push({ id: generateId(), plate: '', make: '', color: '' });
  }
  renderVehicles();
  setStage(2);
});

document.getElementById('prevStage2')?.addEventListener('click', () => setStage(1));

document.getElementById('nextStage2')?.addEventListener('click', () => {
  // Validate all vehicles
  let valid = true;
  const platePattern = /^[A-Z]{3}-\d{4}$/;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!platePattern.test(v.plate)) {
      showFeedback(`Vehicle ${i + 1}: Plate must be in format ABC-1234`, 'error');
      valid = false;
      break;
    }
    if (!v.make.trim()) {
      showFeedback(`Vehicle ${i + 1}: Make / Model is required`, 'error');
      valid = false;
      break;
    }
    if (!v.color.trim()) {
      showFeedback(`Vehicle ${i + 1}: Color is required`, 'error');
      valid = false;
      break;
    }
  }

  if (!valid) return;

  renderDrivers();
  setStage(3);
});

document.getElementById('prevStage3')?.addEventListener('click', () => {
  renderVehicles();
  setStage(2);
});

document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
  if (vehicles.length >= MAX_VEHICLES) return showFeedback(`Maximum ${MAX_VEHICLES} vehicles allowed`, 'error');
  vehicles.push({ id: generateId(), plate: '', make: '', color: '' });
  renderVehicles();
});

document.getElementById('addDriverBtn')?.addEventListener('click', () => {
  if (drivers.length >= MAX_DRIVERS) return showFeedback(`Maximum ${MAX_DRIVERS} additional drivers`, 'error');
  drivers.push({ name: '', license: '' });
  renderDrivers();
});

// ==========================
// SUBMIT
// ==========================
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate drivers if any
  for (let i = 0; i < drivers.length; i++) {
    const d = drivers[i];
    if (!d.name.trim() || !d.license.trim()) {
      return showFeedback(`Driver ${i + 1}: Name and License are required (or remove the driver)`, 'error');
    }
  }

  try {
    loadingOverlay?.classList.remove('hidden');

    const payload = {
      name: nameEl.value.trim(),
      staff_student_id: staffId.value.trim(),
      role: role.value,
      phone: phone.value || null,
      address: address.value || null,
      college: college.value || null,
      campus_status: campusStatus.value === 'on',
      driver_license: driverLicense.value || null,
      password: password.value,
      // Each vehicle already has a unique id
      vehicles: vehicles.map(v => ({
        id: v.id,
        plate_number: v.plate.trim(),
        make: v.make.trim(),
        color: v.color.trim()
      })),
      additional_drivers: drivers.map(d => ({
        name: d.name.trim(),
        license: d.license.trim()
      }))
    };

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Something went wrong');

    const user = data.data[0];
    const registeredVehicles = user.vehicles || vehicles;

    loadingOverlay?.classList.add('hidden');
    successScreen?.classList.remove('hidden');

    document.getElementById('successOwnerName').textContent = user.name;
    document.getElementById('successVehicleCount').textContent =
      `${registeredVehicles.length} vehicle${registeredVehicles.length !== 1 ? 's' : ''} registered`;

    // Generate QR for each vehicle
    await buildQRCarousel(user.id, registeredVehicles);

  } catch (err) {
    console.error(err);
    loadingOverlay?.classList.add('hidden');
    showFeedback(err.message, 'error');
  }
});

// ==========================
// QR CAROUSEL
// ==========================
async function buildQRCarousel(userId, vehicleList) {
  const carousel = document.getElementById('qrCarousel');
  const dots = document.getElementById('qrDots');
  carousel.innerHTML = '';
  dots.innerHTML = '';

  const canvases = [];

  for (let i = 0; i < vehicleList.length; i++) {
    const v = vehicleList[i];
    const wrapper = document.createElement('div');
    wrapper.className = `qr-slide ${i === 0 ? '' : 'hidden'}`;

    wrapper.innerHTML = `
      <div class="glass-inner p-4 rounded-xl text-center">
        <p class="font-semibold text-sm text-gray-700 mb-1">
          <i class="fas fa-car text-red-500 mr-1"></i> ${v.plate_number}
        </p>
        <p class="text-xs text-gray-400 mb-3">${v.make} · ${v.color}</p>
        <div class="flex justify-center mb-3">
          <canvas id="qrCanvas_${i}" class="rounded-lg"></canvas>
        </div>
        <p class="text-xs text-gray-400 font-mono">ID: ${v.id.slice(0,12)}…</p>
      </div>
    `;

    carousel.appendChild(wrapper);

    // Dot
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `w-2 h-2 rounded-full transition ${i === 0 ? 'bg-red-500' : 'bg-gray-300'}`;
    dot.style.cssText = 'background: none !important; box-shadow: none !important; padding: 0; width: 8px; height: 8px;';
    dot.style.background = i === 0 ? '#ef4444' : '#d1d5db';
    dot.dataset.slide = i;
    dot.addEventListener('click', () => showSlide(i));
    dots.appendChild(dot);

    // Generate QR
    const size = window.innerWidth < 400 ? 140 : 160;
    await QRCode.toCanvas(
      document.getElementById(`qrCanvas_${i}`),
      JSON.stringify({ type: 'moventra_vehicle', vehicle_id: v.id, user_id: userId }),
      { width: size }
    );

    canvases.push({ canvas: document.getElementById(`qrCanvas_${i}`), plate: v.plate_number });
  }

  // Show current slide
  let current = 0;
  function showSlide(idx) {
    carousel.querySelectorAll('.qr-slide').forEach((s, i) => s.classList.toggle('hidden', i !== idx));
    dots.querySelectorAll('button').forEach((d, i) => {
      d.style.background = i === idx ? '#ef4444' : '#d1d5db';
    });
    current = idx;
  }
  window._qrShowSlide = showSlide;

  // Swipe support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const next = diff > 0
        ? Math.min(current + 1, vehicleList.length - 1)
        : Math.max(current - 1, 0);
      showSlide(next);
    }
  });

  // Download all
  document.getElementById('downloadAllBtn').onclick = () => {
    canvases.forEach(({ canvas, plate }) => {
      const link = document.createElement('a');
      link.download = `QR_${plate.replace('-', '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };
}

// ==========================
// CLOSE SUCCESS
// ==========================
closeSuccess?.addEventListener('click', () => {
  successScreen.classList.add('hidden');
  form.reset();
  vehicles = [];
  drivers = [];
  setStage(1);
});

// ==========================
// MENU
// ==========================
menuBtn?.addEventListener('click', () => {
  sideMenu.classList.toggle('menu-open');
  overlay.classList.toggle('overlay-show');
});
overlay?.addEventListener('click', () => {
  sideMenu.classList.remove('menu-open');
  overlay.classList.remove('overlay-show');
});

// ==========================
// DROPDOWNS
// ==========================
document.querySelectorAll(".dropdown").forEach(dropdown => {
  const selected = dropdown.querySelector(".dropdown-selected span");
  const options = dropdown.querySelector(".dropdown-options");
  const hiddenInput = dropdown.nextElementSibling;

  dropdown.querySelector(".dropdown-selected").addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });

  options.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;
      options.querySelectorAll("div").forEach(o => o.classList.remove("active"));
      option.classList.add("active");
      dropdown.classList.remove("open");
    });
  });
});

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown").forEach(d => {
    if (!d.contains(e.target)) d.classList.remove("open");
  });
});

// ==========================
// MOUSE BACKGROUND
// ==========================
document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty("--x", (e.clientX / window.innerWidth * 100) + "%");
  document.body.style.setProperty("--y", (e.clientY / window.innerHeight * 100) + "%");
});
