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

// LOADING / SUCCESS
const loadingOverlay = document.getElementById('loadingOverlay');
const successScreen = document.getElementById('successScreen');
const closeSuccess = document.getElementById('closeSuccess');

// MENU
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

// INPUTS
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
// PHONE FORMAT
// ==========================
phone?.addEventListener('input', () => {
  let value = phone.value.replace(/\D/g, '');

  if (value.length > 3 && value.length <= 6) {
    value = value.slice(0,3) + ' ' + value.slice(3);
  } else if (value.length > 6) {
    value = value.slice(0,3) + ' ' + value.slice(3,6) + ' ' + value.slice(6,10);
  }

  phone.value = value;
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
// 🚀 SUBMIT (SECURE VERSION)
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

    // 🔐 SEND TO BACKEND INSTEAD OF SUPABASE
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

    if (!response.ok) throw new Error(data.error);

    loadingOverlay?.classList.add('hidden');
    successScreen?.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    loadingOverlay?.classList.add('hidden');
    showFeedback('Error saving data!', 'error');
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