// ==========================
// ELEMENTS
// ==========================
const stage1 = document.getElementById('stage1');
const stage2 = document.getElementById('stage2');
const nextStageBtn = document.getElementById('nextStage');
const prevStageBtn = document.getElementById('prevStage');
const feedbackDiv = document.getElementById('feedback');
const progressBar = document.getElementById('progressBar');
const form = document.getElementById('registrationForm');

const loadingOverlay = document.getElementById('loadingOverlay');
const successScreen = document.getElementById('successScreen');
const closeSuccess = document.getElementById('closeSuccess');

const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

const name = document.getElementById('name');
const staffId = document.getElementById('staffId');
const role = document.getElementById('role');
const phone = document.getElementById('phone');
const address = document.getElementById('address');
const college = document.getElementById('college');
const campusStatus = document.getElementById('campusStatus');
const driverLicense = document.getElementById('driverLicense');
const plateNumber = document.getElementById('plateNumber');
const make = document.getElementById('make');
const color = document.getElementById('color');

// ==========================
// HELPERS
// ==========================
function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('shake', 'invalid');
  setTimeout(() => el.classList.remove('shake'), 300);
}

function showFeedback(message, type = 'success') {
  if (!feedbackDiv) return;

  feedbackDiv.textContent = message;
  feedbackDiv.className =
    type === 'success'
      ? 'bg-green-200 text-green-800 p-2 rounded-lg mb-2 text-sm'
      : 'bg-red-200 text-red-800 p-2 rounded-lg mb-2 text-sm';

  setTimeout(() => {
    feedbackDiv.textContent = '';
    feedbackDiv.className = '';
  }, 4000);
}

// ==========================
// VALIDATION
// ==========================
function validateField(inputId, checkId) {
  const input = document.getElementById(inputId);
  const check = document.getElementById(checkId);

  if (!input || !check) return;

  input.addEventListener('input', () => {
    if (input.value.trim() !== '') {
      input.classList.add('valid');
      input.classList.remove('invalid');
      check.style.opacity = '1';
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      check.style.opacity = '0';
    }
  });
}

validateField('name','nameCheck');
validateField('staffId','staffIdCheck');
validateField('phone','phoneCheck');

// ==========================
// 🇿🇼 SMART ZIM FORMATTING
// ==========================

// 📱 PHONE (local + international)
phone?.addEventListener('input', () => {
  let value = phone.value.replace(/\D/g, '');

  // LOCAL: 0771234567 → 077 123 4567
  if (value.startsWith('07')) {
    value = value.slice(0, 10);

    let formatted = value;

    if (value.length > 3 && value.length <= 6) {
      formatted = value.slice(0,3) + ' ' + value.slice(3);
    } else if (value.length > 6) {
      formatted =
        value.slice(0,3) + ' ' +
        value.slice(3,6) + ' ' +
        value.slice(6,10);
    }

    phone.value = formatted;
    return;
  }

  // INTERNATIONAL: 263771234567 → +263 77 123 4567
  if (value.startsWith('263')) {
    value = value.slice(0, 12);

    let formatted = '+263';

    if (value.length > 3) formatted += ' ' + value.slice(3,5);
    if (value.length > 5) formatted += ' ' + value.slice(5,8);
    if (value.length > 8) formatted += ' ' + value.slice(8,12);

    phone.value = formatted.trim();
  }
});

// 🚗 PLATE NUMBER (ZIM STYLE)
plateNumber?.addEventListener('input', () => {
  let value = plateNumber.value.toUpperCase();
  value = value.replace(/[^A-Z0-9]/g, '');

  if (value.length <= 3) {
    plateNumber.value = value;
  } else if (value.length <= 7) {
    plateNumber.value =
      value.slice(0,3) + ' ' + value.slice(3);
  } else {
    plateNumber.value =
      value.slice(0,2) + ' ' +
      value.slice(2,5) + ' ' +
      value.slice(5,7);
  }
});

// 🪪 DRIVER LICENSE
driverLicense?.addEventListener('input', () => {
  let value = driverLicense.value.toUpperCase();
  value = value.replace(/[^A-Z0-9]/g, '');
  value = value.slice(0, 15);
  driverLicense.value = value;
});

// ==========================
// 🔥 REAL-TIME VALIDATION
// ==========================
function markValid(input, condition) {
  if (!input) return;

  if (condition) {
    input.classList.add('valid');
    input.classList.remove('invalid');
  } else {
    input.classList.remove('valid');
    input.classList.add('invalid');
  }
}

// phone (10 digits local OR 12 intl)
phone?.addEventListener('input', () => {
  const clean = phone.value.replace(/\D/g, '');
  markValid(phone, clean.length === 10 || clean.length === 12);
});

plateNumber?.addEventListener('input', () => {
  markValid(plateNumber, plateNumber.value.replace(/\s/g,'').length >= 5);
});

driverLicense?.addEventListener('input', () => {
  markValid(driverLicense, driverLicense.value.length >= 6);
});

// ==========================
// STAGE NAVIGATION
// ==========================
nextStageBtn?.addEventListener('click', () => {
  const fields = [name, staffId, role, college, driverLicense, campusStatus];
  let valid = true;

  fields.forEach(el => {
    if (!el || !el.value.trim()) {
      if (el) shakeField(el.id);
      valid = false;
    }
  });

  if (!valid) return showFeedback('Fill all required fields!', 'error');

  stage1.classList.add('hidden');
  stage2.classList.remove('hidden');
  progressBar.style.width = '100%';
});

prevStageBtn?.addEventListener('click', () => {
  stage2.classList.add('hidden');
  stage1.classList.remove('hidden');
  progressBar.style.width = '50%';
});

// ==========================
// 🚀 SUBMIT
// ==========================
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fields = [name, staffId, role, college, driverLicense, campusStatus, plateNumber, make, color];
  let valid = true;

  fields.forEach(el => {
    if (!el || !el.value.trim()) {
      if (el) shakeField(el.id);
      valid = false;
    }
  });

  if (!valid) return showFeedback('Complete all fields!', 'error');

  try {
    loadingOverlay?.classList.remove('hidden');

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        staff_student_id: staffId.value,
        role: role.value,
        phone: phone.value,
        address: address.value,
        college: college.value,
        campus_status: campusStatus.value === 'on',
        driver_license: driverLicense.value,
        plate_number: plateNumber.value,
        make: make.value,
        color: color.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    loadingOverlay?.classList.add('hidden');
    successScreen?.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    loadingOverlay?.classList.add('hidden');
    showFeedback(err.message, 'error');
  }
});

// ==========================
// SUCCESS CLOSE
// ==========================
closeSuccess?.addEventListener('click', () => {
  successScreen.classList.add('hidden');

  form.reset();

  stage2.classList.add('hidden');
  stage1.classList.remove('hidden');

  progressBar.style.width = '50%';
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
  const x = (e.clientX / window.innerWidth) * 100 + "%";
  const y = (e.clientY / window.innerHeight) * 100 + "%";

  document.body.style.setProperty("--x", x);
  document.body.style.setProperty("--y", y);
});
