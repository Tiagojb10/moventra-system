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

// 🔥 NEW: download button (we will create it dynamically)
let downloadBtn;

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
// 🔥 FEEDBACK SYSTEM (same style as app.js)
// ==========================
function showFeedback(message) {
  alert(message); // simple for now (can upgrade to UI later)
}

// ==========================
// 🔍 SEARCH USER (IMPROVED)
// ==========================
async function searchUser() {
  const id = searchInput.value.trim();

  if (!id) {
    return showFeedback("Please enter an ID");
  }

  try {
    const res = await fetch(`/api/search?id=${id}`);
    const data = await res.json();

    if (!res.ok) {
      return showFeedback(data.error || "Search failed");
    }

    // ==========================
    // SHOW RESULT
    // ==========================
    resultBox.classList.remove('hidden');

    resultName.textContent = data.data.name;
    resultPlate.textContent = "Plate: " + data.data.plate_number;

    // ==========================
    // GENERATE QR
    // ==========================
    await QRCode.toCanvas(
      resultQR,
      JSON.stringify({
        type: 'moventra_user',
        id: data.data.id
      }),
      { width: 180 }
    );

    // ==========================
    // 🔥 ADD DOWNLOAD BUTTON
    // ==========================
    if (!downloadBtn) {
      downloadBtn = document.createElement('button');
      downloadBtn.textContent = "Download QR";
      downloadBtn.className = "mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition w-full";

      resultBox.appendChild(downloadBtn);
    }

    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.download = `QR_${data.data.id}.png`;
      link.href = resultQR.toDataURL();
      link.click();
    };

  } catch (err) {
    console.error(err);
    showFeedback("Server error. Please try again.");
  }
}

// ==========================
// EVENTS
// ==========================
window.searchUser = searchUser;

searchInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchUser();
});

// ==========================
// ICONS
// ==========================
setTimeout(() => {
  if (window.lucide) lucide.createIcons();
}, 100);
