document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const btnGo = document.getElementById('btn-go');
  const placeholder = document.getElementById('placeholder');
  const iframe = document.getElementById('browser-frame');
  const btnBookmark = document.getElementById('btn-bookmark');
  const btnPopout = document.getElementById('btn-popout');
  const mainContent = document.getElementById('main-content');
  
  let sessionHistory = [];
  let sessionIndex = -1;
  let currentFinalUrl = '';
  let savedBookmarks = JSON.parse(localStorage.getItem('browserBookmarks')) || [];
  let savedHistory = JSON.parse(localStorage.getItem('browserHistory')) || [];

  function navigate(query, isHistoryNavigation = false) {
    if (!query || !query.trim()) return;
    
    let finalUrl = '';
    const isUrl = /^https?:\/\//i.test(query) || /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(query);
    
    if (isUrl) {
      finalUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      // Switched default search to DuckDuckGo to bypass Google's strict iframe reCAPTCHA blocks
      finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web&kp=1`;
    }
    
    currentFinalUrl = finalUrl;
    urlInput.value = finalUrl;
    
    placeholder.style.display = 'none';
    mainContent.style.padding = '0';
    iframe.style.display = 'block';
    iframe.src = finalUrl;
    checkIfBookmarked();
    
    if (!isHistoryNavigation) {
      sessionHistory = sessionHistory.slice(0, sessionIndex + 1);
      sessionHistory.push(finalUrl);
      sessionIndex++;
      
      savedHistory.unshift({ 
        url: finalUrl, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      });
      if(savedHistory.length > 50) savedHistory.pop();
      localStorage.setItem('browserHistory', JSON.stringify(savedHistory));
      renderLibrary();
    }
  }

  btnGo.addEventListener('click', () => navigate(urlInput.value));
  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate(urlInput.value); });
  
  btnPopout.addEventListener('click', () => {
    if (currentFinalUrl) window.open(currentFinalUrl, '_blank');
  });

  document.querySelectorAll('.site-shortcut').forEach(card => {
    card.addEventListener('click', () => navigate(card.getAttribute('data-url')));
  });

  document.getElementById('btn-home').addEventListener('click', () => {
    iframe.style.display = 'none';
    iframe.src = '';
    placeholder.style.display = 'flex';
    urlInput.value = '';
    currentFinalUrl = '';
    checkIfBookmarked();
  });

  document.getElementById('btn-refresh').addEventListener('click', () => { 
    if (iframe.src) iframe.src = iframe.src; 
  });
  document.getElementById('btn-back').addEventListener('click', () => {
    if (sessionIndex > 0) { sessionIndex--; navigate(sessionHistory[sessionIndex], true); }
  });
  document.getElementById('btn-forward').addEventListener('click', () => {
    if (sessionIndex < sessionHistory.length - 1) { sessionIndex++; navigate(sessionHistory[sessionIndex], true); }
  });

  function checkIfBookmarked() {
    if (!currentFinalUrl) { btnBookmark.textContent = 'SAVE'; return; }
    const isBookmarked = savedBookmarks.some(b => b.url === currentFinalUrl);
    btnBookmark.textContent = isBookmarked ? 'SAVED' : 'SAVE';
  }

  btnBookmark.addEventListener('click', () => {
    if(!currentFinalUrl) return;
    const exists = savedBookmarks.findIndex(b => b.url === currentFinalUrl);
    if (exists >= 0) {
      savedBookmarks.splice(exists, 1);
    } else {
      savedBookmarks.push({ url: currentFinalUrl, title: currentFinalUrl });
    }
    localStorage.setItem('browserBookmarks', JSON.stringify(savedBookmarks));
    checkIfBookmarked();
    renderLibrary();
  });

  // --- Modals ---
  const libraryModal = document.getElementById('library-modal');
  function openLibrary(tabId) {
    libraryModal.style.display = 'flex';
    document.querySelectorAll('.library-panel').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.lib-nav-item').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    const activeTabBtn = Array.from(document.querySelectorAll('.lib-nav-item')).find(t => t.dataset.target === tabId);
    if(activeTabBtn) activeTabBtn.classList.add('active');
    renderLibrary();
  }

  document.getElementById('btn-show-bookmarks').addEventListener('click', () => openLibrary('bookmarks-view'));
  document.getElementById('btn-show-history').addEventListener('click', () => openLibrary('history-view'));
  document.getElementById('close-library').addEventListener('click', () => libraryModal.style.display = 'none');
  
  document.querySelectorAll('.lib-nav-item').forEach(tab => {
    tab.addEventListener('click', (e) => openLibrary(e.currentTarget.dataset.target));
  });

  function renderLibrary() {
    const bmList = document.getElementById('bookmarks-list');
    bmList.innerHTML = '';
    savedBookmarks.forEach((b, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="record-target-url" title="${b.url}">${b.url}</span> <button class="action-danger-btn item-delete-btn" data-index="${i}" data-type="bm">X</button>`;
      li.querySelector('.record-target-url').addEventListener('click', () => { navigate(b.url); libraryModal.style.display = 'none'; });
      bmList.appendChild(li);
    });

    const histList = document.getElementById('history-list');
    histList.innerHTML = '';
    savedHistory.forEach((h, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="record-target-url" title="${h.url}">${h.url}</span> <span class="record-timestamp">${h.time}</span> <button class="action-danger-btn item-delete-btn" data-index="${i}" data-type="hist">X</button>`;
      li.querySelector('.record-target-url').addEventListener('click', () => { navigate(h.url); libraryModal.style.display = 'none'; });
      histList.appendChild(li);
    });

    document.querySelectorAll('.item-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.index;
        if(e.target.dataset.type === 'bm') {
          savedBookmarks.splice(idx, 1);
          localStorage.setItem('browserBookmarks', JSON.stringify(savedBookmarks));
          checkIfBookmarked();
        } else {
          savedHistory.splice(idx, 1);
          localStorage.setItem('browserHistory', JSON.stringify(savedHistory));
        }
        renderLibrary();
      });
    });
  }

  document.getElementById('clear-bookmarks').addEventListener('click', () => { savedBookmarks = []; localStorage.removeItem('browserBookmarks'); checkIfBookmarked(); renderLibrary(); });
  document.getElementById('clear-history').addEventListener('click', () => { savedHistory = []; localStorage.removeItem('browserHistory'); renderLibrary(); });

  // --- Auth ---
  const btnProfile = document.getElementById('btn-profile');
  const authModal = document.getElementById('auth-modal');

  function checkAuthStatus() {
    const storedUser = localStorage.getItem('browserUser');
    if (storedUser) {
      btnProfile.textContent = "USER: " + JSON.parse(storedUser).name.toUpperCase();
      document.getElementById('welcome-text').textContent = `Welcome, ${JSON.parse(storedUser).name}`;
    } else {
      btnProfile.textContent = 'SYSTEM_AUTH';
      document.getElementById('welcome-text').textContent = 'Neural Workspace';
    }
  }

  btnProfile.addEventListener('click', () => {
    if (localStorage.getItem('browserUser')) {
      if(confirm("Terminate encrypted session?")) { localStorage.removeItem('browserUser'); checkAuthStatus(); }
    } else {
      authModal.style.display = 'flex';
    }
  });

  document.getElementById('close-modal').addEventListener('click', () => authModal.style.display = 'none');
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('browserUser', JSON.stringify({
      name: document.getElementById('auth-name').value,
      email: document.getElementById('auth-email').value
    }));
    authModal.style.display = 'none';
    document.getElementById('auth-form').reset();
    checkAuthStatus();
  });
  
  checkAuthStatus();

  // ---------------------------------------------------------
  // LIVE NEWS INTEGRATION (REPLACES FAKE STATIC NEWS)
  // Opens in a New Tab to bypass Google Recaptcha completely!
  // ---------------------------------------------------------
  const newsFeed = document.getElementById('news-feed');
  const loadingSpinner = document.getElementById('loading-spinner');
  let currentCategory = 'Home';

  // We use rss2json to convert live Google News RSS into usable JSON data
  const rssFeeds = {
    'Home': 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    'Technology': 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
    'Business': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
    'Science': 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en'
  };

  async function fetchLiveNews(category) {
    loadingSpinner.style.display = 'block';
    newsFeed.innerHTML = '';

    const rssUrl = rssFeeds[category];
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'ok') {
        loadingSpinner.style.display = 'none';
        
        // Grab top 10 articles
        const articles = data.items.slice(0, 10);
        
        articles.forEach(article => {
          // Format date safely
          let pubTime = new Date(article.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let sourceName = article.author || article.title.split(' - ').pop() || 'Live News';
          let cleanTitle = article.title.substring(0, article.title.lastIndexOf(" - ")) || article.title;

          const card = document.createElement('a');
          card.className = 'news-feed-card';
          card.href = article.link; 
          card.target = '_blank'; // <--- CRITICAL FIX: Opens in new tab, avoids recaptcha block!
          
          card.innerHTML = `
            <div class="news-content">
              <div class="news-source-row">
                <span class="news-source">${sourceName}</span>
                <span class="news-time">Updated: ${pubTime}</span>
              </div>
              <h4 class="news-title">${cleanTitle}</h4>
            </div>
            <span class="news-indicator-badge" style="color:var(--pink); font-weight:800; font-size:12px;">↗ READ</span>
          `;
          newsFeed.appendChild(card);
        });
      } else {
        throw new Error("API Limit Reached");
      }
    } catch (error) {
      loadingSpinner.textContent = "Feed unavailable. Retrying connection...";
    }
  }

  // Handle Category Clicks
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.cat;
      fetchLiveNews(currentCategory);
    });
  });

  // Initial Fetch on Load
  fetchLiveNews('Home');

  // Spotify Dock
  const musicToggle = document.getElementById('music-toggle');
  const musicBody = document.getElementById('music-body');
  const musicIcon = document.getElementById('music-icon');
  
  musicToggle.addEventListener('click', () => {
    const isHidden = musicBody.style.display === 'none';
    musicBody.style.display = isHidden ? 'block' : 'none';
    musicIcon.textContent = isHidden ? 'HIDE' : 'SHOW';
  });
});