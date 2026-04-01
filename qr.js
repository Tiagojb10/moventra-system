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
const downloadBtn = document.getElementById('downloadQR');
const feedbackDiv = document.getElementById('feedback');

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
// FEEDBACK (MATCHES app.js)
// ==========================
function showFeedback(message, type = 'error') {
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
// SEARCH USER
// ==========================
async function searchUser() {
  const id = searchInput.value.trim();

  // Clear previous state
  feedbackDiv.textContent = '';
  resultBox.classList.add('hidden');
  downloadBtn.classList.add('hidden');

  if (!id) {
    return showFeedback("Please enter an ID");
  }

  try {
    const res = await fetch(`/api/search?id=${id}`);
    const data = await res.json();

    if (!res.ok) {
      return showFeedback(data.error || "Search failed");
    }

    // SHOW RESULT
    resultBox.classList.remove('hidden');

    resultName.textContent = data.data.name;
    resultPlate.textContent = "Plate: " + data.data.plate_number;

    // GENERATE QR
    await QRCode.toCanvas(
      resultQR,
      JSON.stringify({
        type: 'moventra_user',
        id: data.data.id
      }),
      { width: 180 }
    );

    // SHOW DOWNLOAD BUTTON
    downloadBtn.classList.remove('hidden');

    // DOWNLOAD LOGIC
    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.download = `QR_${data.data.id}.png`;
      link.href = resultQR.toDataURL('image/png');
      link.click();
    };

    // SUCCESS MESSAGE
    showFeedback("QR code generated successfully", "success");

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
