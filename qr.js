// ==========================
// ELEMENTS
// ==========================
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

const searchInput = document.getElementById('searchId');
const resultBox = document.getElementById('resultBox');
const resultName = document.getElementById('resultName');
const resultPlate = document.getElementById('resultPlate');
const resultQR = document.getElementById('resultQR');

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
// 🔍 SEARCH USER (SECURE)
// ==========================
async function searchUser() {
  const id = searchInput.value.trim();

  if (!id) return;

  try {
    // 🔐 CALL BACKEND INSTEAD OF SUPABASE
    const res = await fetch(`/api/search?id=${id}`);
    const data = await res.json();

    if (!res.ok) {
      alert("User not found");
      return;
    }

    // SHOW RESULT
    resultBox.classList.remove('hidden');
    resultName.textContent = data.name;
    resultPlate.textContent = "Plate: " + data.plate_number;

    // GENERATE QR
    QRCode.toCanvas(
      resultQR,
      JSON.stringify({
        type: 'moventra_user',
        id: data.id
      }),
      { width: 180 }
    );

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
}

// ==========================
// EVENTS
// ==========================
window.searchUser = searchUser;

// ENTER KEY SUPPORT
searchInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchUser();
});

// ==========================
// ICONS
// ==========================
setTimeout(() => {
  if (window.lucide) lucide.createIcons();
}, 100);