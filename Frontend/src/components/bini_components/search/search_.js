import fetchSuggestedFollowers from '../../../services/bini_services/post/fetchSuggestedFollowers.js';
import fetchSearchAll from '../../../services/bini_services/search/fetchSearch.js';
import follow from '../../../services/bini_services/post/fetchFollow.js';
import { renderThreadsSidebar } from '../threadsSidebar.js';


export default async function Search_(root) {
  const threadsSidebar = await renderThreadsSidebar();
  
  const component = document.createElement('div');
  component.innerHTML = `
    <div class="search-container" id="searchContainer" style="position:relative;">
      <div class="search-bar" style="position:relative;">
        <img src="/search.png" alt="Search Icon" class="search-icon" id="searchIcon">
        <input type="text" id="searchInput" autocomplete="off">
        <button id="searchBtn" style="display:none"></button>
      </div>
      <div class="homepage-right">
        ${threadsSidebar.html}
      </div>
      <div class="search-results"></div>
      <div class="search-suggest_to_follow"></div>
    </div>
  `;

  root.appendChild(component);
  
  // Setup click handlers for threads
  const threadsSidebarContainer = component.querySelector('.threads-sidebar');
  if (threadsSidebarContainer && threadsSidebar.setupClickHandlers) {
    threadsSidebar.setupClickHandlers(threadsSidebarContainer);
  }

  const searchIcon = component.querySelector('#searchIcon');
  const searchInput = component.querySelector('#searchInput');
  const searchBtn = component.querySelector('#searchBtn');
  const searchResults = component.querySelector('.search-results');
  const suggestToFollowDiv = component.querySelector('.search-suggest_to_follow');
  const token = localStorage.getItem('authToken');

  if (!token) {
    alert('Please login first.');
    return;
  }

  // Overlay dropdown for user search
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.style.display = 'none';
  overlay.style.position = 'absolute';
  overlay.style.background = '#fff';
  overlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  overlay.style.width = '100%';
  overlay.style.maxHeight = '250px';
  overlay.style.overflowY = 'auto';
  overlay.style.zIndex = '1000';
  overlay.style.borderRadius = '8px';
  overlay.style.top = '50px'; // adjust if needed
  overlay.style.left = '0';
  overlay.style.padding = '0';

  component.querySelector('.search-bar').appendChild(overlay);

  // Hide icon on focus or when typing
  searchInput.addEventListener('focus', () => {
    searchIcon.style.display = 'none';
  });
  // Debounce utility to avoid spamming backend on every keystroke
  let debounceTimer = null;
  const DEBOUNCE_MS = 300;

  searchInput.addEventListener('input', () => {
    const raw = searchInput.value || '';
    const query = raw.trim();

    // Always hide icon when user types
    if (raw.length > 0) searchIcon.style.display = 'none';

    // Clear any pending debounce
    if (debounceTimer) clearTimeout(debounceTimer);

    // If empty input, hide overlay and restore icon
    if (query.length === 0) {
      overlay.style.display = 'none';
      searchIcon.style.display = '';
      return;
    }

    // Proceed for any non-empty query (debounced) — backend will accept any non-empty keyword

    // Debounced backend call for valid queries (>=3 chars)
    debounceTimer = setTimeout(async () => {
      try {
        const { users } = await fetchSearchAll(token, query);
        console.log('Search results:', users);
        if (users && users.length > 0) {
          overlay.innerHTML = `
            <ul class="search-overlay-list" style="list-style:none;padding:0;margin:0;">
              ${users.map(user => `
                <li class="search-overlay-item" data-userid="${user.user_id}" style="padding:8px;cursor:pointer;display:flex;align-items:center;">
                  <img src="${user.profile_picture || 'default-profile.png'}" alt="${user.fullname}" style="width:32px;height:32px;border-radius:50%;margin-right:8px;">
                  <span>${user.fullname}</span>
                </li>
              `).join('')}
            </ul>
          `;
        } else {
          overlay.innerHTML = `<div style="padding:8px;">No users found.</div>`;
        }
        overlay.style.display = 'block';
      } catch (err) {
        overlay.innerHTML = `<div style="padding:8px;">Search failed.</div>`;
        overlay.style.display = 'block';
      }
    }, DEBOUNCE_MS);
  });
  searchInput.addEventListener('blur', () => {
    setTimeout(() => { overlay.style.display = 'none'; }, 150);
    if (searchInput.value.length === 0) {
      searchIcon.style.display = '';
    }
  });

  // Allow pressing Enter to search (optional, can be removed if not needed)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Overlay pointerdown: go to user profile (use pointerdown so it fires before input blur)
  overlay.addEventListener('pointerdown', function(e) {
    const li = e.target.closest('.search-overlay-item');
    if (li) {
      e.preventDefault();
      const userId = li.getAttribute('data-userid');
      localStorage.setItem('selectedUserId', userId);
      // Optionally clear search input and hide overlay
      searchInput.value = '';
      overlay.style.display = 'none';
      // Navigate to others profile
      window.history.pushState({}, '', `/bini/others-profile`);
      window.dispatchEvent(new Event('popstate'));
    }
  });

  // Search button click (if you want to keep searchThreads for posts, keep this)
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchThreads(token, query);
    } else {
      searchResults.innerHTML = '<p>Please enter a search term.</p>';
    }
  });

  // --- SUGGESTED FOLLOWERS LOGIC ---
  const BATCH_SIZE = 10;
  let displayedOffset = 0;
  let hasMoreSuggestions = true;

  async function loadSuggestedFollowers(offset = 0, append = false) {
    try {
      const suggestions = await fetchSuggestedFollowers(token, BATCH_SIZE, offset);
      hasMoreSuggestions = suggestions && suggestions.length >= BATCH_SIZE;
      renderSuggestedFollowers(suggestions, append);
      if (!append) displayedOffset = suggestions ? suggestions.length : 0;
      else displayedOffset += suggestions ? suggestions.length : 0;
      updateShowMoreButton();
    } catch (err) {
      if (!append) suggestToFollowDiv.innerHTML = '<p>Failed to load suggestions.</p>';
    }
  }

  function updateShowMoreButton() {
    const btn = suggestToFollowDiv.querySelector('.show-more-btn');
    if (btn) btn.style.display = hasMoreSuggestions ? 'inline-flex' : 'none';
  }

  async function renderSuggestedFollowers(users, append = false) {
    const existingUl = suggestToFollowDiv.querySelector('.suggested-follow-list');
    if (!append || !existingUl) {
      if (!users || !users.length) {
        suggestToFollowDiv.innerHTML = '<p>No suggestions found.</p>';
        return;
      }
      suggestToFollowDiv.innerHTML = `
        <ul class="suggested-follow-list">
          ${users.map(user => buildUserRow(user)).join('')}
        </ul>
        <div class="show-more-wrap" style="text-align:center;margin-top:1rem;">
          <button class="show-more-btn" style="display:none;">Show More</button>
        </div>
      `;
    } else if (users && users.length) {
      users.forEach(user => {
        const temp = document.createElement('div');
        temp.innerHTML = buildUserRow(user);
        existingUl.appendChild(temp.firstElementChild);
      });
    }
    bindSuggestedRowEvents();
    bindShowMoreEvent();
  }

  function buildUserRow(user) {
    return `
      <li class="suggested-user-row" data-userid="${user.user_id}" style="cursor:pointer;">
      
        <img src="${user.profile_picture || '/circle-user.png'}" alt="${user.fullname}" class="suggested-user-image" onerror="this.src='/circle-user.png';">
        <div class="suggested-user-info">
          <span class="suggested-fullname">${user.fullname}</span>
          <span class="suggested-followers">${user.followers_count} followers</span>
        </div>
        <button class="follow-btn" data-userid="${user.user_id}">Follow</button>
      </li>
    `;
  }

  function bindSuggestedRowEvents() {
    suggestToFollowDiv.querySelectorAll('.suggested-user-row').forEach(li => {
      li.replaceWith(li.cloneNode(true)); // remove old listeners
    });
    const rows = suggestToFollowDiv.querySelectorAll('.suggested-user-row');
    rows.forEach(li => {
      li.addEventListener('click', function(e) {
        if (e.target.classList.contains('follow-btn')) return;
        const userId = this.getAttribute('data-userid');
        localStorage.setItem('selectedUserId', userId);
        window.history.pushState({}, '', `/bini/others-profile`);
        window.dispatchEvent(new Event('popstate'));
      });
    });
    suggestToFollowDiv.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const userId = this.getAttribute('data-userid');
        const row = this.closest('.suggested-user-row');
        const fullname = row?.querySelector('.suggested-fullname')?.textContent || 'user';
        try {
          await follow(userId, token);
          alert(`You are now following ${fullname}`);
          row.remove();
          const next = await fetchSuggestedFollowers(token, 1, displayedOffset);
          if (next && next.length) {
            const ul = suggestToFollowDiv.querySelector('.suggested-follow-list');
            if (ul) {
              const temp = document.createElement('div');
              temp.innerHTML = buildUserRow(next[0]);
              ul.appendChild(temp.firstElementChild);
              displayedOffset++;
              bindSuggestedRowEvents();
            }
          }
        } catch (err) {
          alert('Failed to follow. Please try again.');
        }
      });
    });
  }

  function bindShowMoreEvent() {
    const btn = suggestToFollowDiv.querySelector('.show-more-btn');
    if (btn) {
      btn.onclick = () => loadSuggestedFollowers(displayedOffset, true);
    }
  }

  loadSuggestedFollowers(0, false);
}

// Placeholder for searching threads/posts. Backend endpoint not confirmed,
// so this shows a friendly message and logs a warning. Replace with an
// actual implementation (fetch + render) when the threads search endpoint
// is available.
async function searchThreads(token, query) {
  console.warn('searchThreads() called but not implemented. Query:', query);
  const resultsContainer = document.querySelector('.search-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div style="padding:16px;">
        <p><strong>Thread search</strong> is not implemented yet. Searched for: <em>${query}</em></p>
        <p>If you expect thread search, implement a backend endpoint like <code>/v1/bini/search/threads?keyword=</code> and call it from here.</p>
      </div>
    `;
  }
}
