/* ==========================================================================
   ANITUBE COMMON SEARCH CONTROLLER & ROUTER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalSearch();
});

function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  const isMobileScreen = () => window.innerWidth <= 767;

  // On Mobile: Clicking search box navigates directly to dedicated search.html
  searchInput.onclick = (e) => {
    if (isMobileScreen()) {
      e.preventDefault();
      location.href = 'search.html';
    }
  };

  // Create & Append Desktop Search Dropdown if missing
  let dropdown = document.getElementById('headerSearchDropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'headerSearchDropdown';
    dropdown.className = 'header-search-dropdown';
    searchInput.parentElement.appendChild(dropdown);
  }

  // Populate Dropdown Content for Desktop
  function renderDropdown(query = '') {
    if (isMobileScreen()) return;

    const recent = ANITUBE_STATE.recentSearches || ['Solo Leveling', 'Demon Slayer', 'Jujutsu Kaisen'];
    const trending = ['One Piece 1090', 'Bleach TYBW', 'Chainsaw Man'];

    let html = '';

    if (recent.length > 0) {
      html += `<div class="dropdown-section-title">🕒 Recent Searches</div>`;
      html += recent.map(item => `
        <div class="dropdown-item-row" data-query="${item}">
          <div class="dropdown-item-left"><i class="fa-solid fa-clock-rotate-left"></i> <span>${item}</span></div>
          <i class="fa-solid fa-xmark btn-remove-history" style="color:var(--text-muted);" title="Remove" data-remove="${item}"></i>
        </div>
      `).join('');
    }

    html += `<div class="dropdown-section-title" style="margin-top:0.4rem;">🔥 Trending Searches</div>`;
    html += trending.map(item => `
      <div class="dropdown-item-row" data-query="${item}">
        <div class="dropdown-item-left"><i class="fa-solid fa-fire" style="color:#f59e0b;"></i> <span>${item}</span></div>
      </div>
    `).join('');

    dropdown.innerHTML = html;

    // Item Click Events
    dropdown.querySelectorAll('.dropdown-item-row').forEach(row => {
      row.onclick = (e) => {
        if (e.target.classList.contains('btn-remove-history')) {
          e.stopPropagation();
          const removeTerm = e.target.getAttribute('data-remove');
          ANITUBE_STATE.removeRecentSearch(removeTerm);
          renderDropdown(query);
          return;
        }
        const q = row.getAttribute('data-query');
        if (q) {
          executeSearch(q);
        }
      };
    });
  }

  function executeSearch(query) {
    if (!query || !query.trim()) return;
    const cleanQ = query.trim();
    ANITUBE_STATE.addRecentSearch(cleanQ);
    if (dropdown) dropdown.classList.remove('show');
    location.href = `search.html?q=${encodeURIComponent(cleanQ)}`;
  }

  // Show dropdown on focus / input (Desktop Only)
  searchInput.onfocus = () => {
    if (isMobileScreen()) {
      location.href = 'search.html';
      return;
    }
    renderDropdown(searchInput.value);
    dropdown.classList.add('show');
  };

  searchInput.oninput = (e) => {
    if (isMobileScreen()) return;
    renderDropdown(e.target.value);
    dropdown.classList.add('show');
  };

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      executeSearch(searchInput.value);
    }
  };

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (dropdown && searchInput.parentElement && !searchInput.parentElement.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

function playShow(showId) {
  ANITUBE_STATE.activeShowId = showId;
  location.href = 'player.html';
}
