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
   const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query);
     if (isUrl) {
         finalUrl = query.startsWith('http') ? query : `https://${query}`;
       if (finalUrl.includes('google.com') && !finalUrl.includes('igu=1')) {
          finalUrl = 'https://www.google.com/search?q=&igu=1';
     }
  } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
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
       savedHistory.unshift({ url: finalUrl, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
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

 document.getElementById('btn-refresh').addEventListener('click', () => { if (iframe.src) iframe.src = iframe.src; });

 document.getElementById('btn-back').addEventListener('click', () => {
    if (sessionIndex > 0) { sessionIndex--; navigate(sessionHistory[sessionIndex], true); }
 });

 document.getElementById('btn-forward').addEventListener('click', () => {
    if (sessionIndex < sessionHistory.length - 1) { sessionIndex++; navigate(sessionHistory[sessionIndex], true); }
 });

 function checkIfBookmarked() {
    if (!currentFinalUrl) { btnBookmark.textContent = 'BOOKMARK'; return; }
  const isBookmarked = savedBookmarks.some(b => b.url === currentFinalUrl);
    btnBookmark.textContent = isBookmarked ? 'SAVED' : 'BOOKMARK';
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
 document.getElementById('btn-show-downloads').addEventListener('click', () => openLibrary('downloads-view'));
 document.getElementById('close-library').addEventListener('click', () => libraryModal.style.display = 'none');
 document.querySelectorAll('.lib-nav-item').forEach(tab => tab.addEventListener('click', (e) => openLibrary(e.currentTarget.dataset.target)));

 function renderLibrary() {
    const bmList = document.getElementById('bookmarks-list');
  bmList.innerHTML = savedBookmarks.length ? '' : '<p class="empty-state-notice">No saved endpoints.</p>';
    savedBookmarks.forEach((b, i) => {
      const li = document.createElement('li');
        li.innerHTML = `<span class="record-target-url" title="${b.url}">${b.url}</span> <button class="item-delete-btn" data-index="${i}" data-type="bm">DEL</button>`;
      li.querySelector('.record-target-url').addEventListener('click', () => { navigate(b.url); libraryModal.style.display = 'none'; });
        bmList.appendChild(li);
  });

    const histList = document.getElementById('history-list');
  histList.innerHTML = savedHistory.length ? '' : '<p class="empty-state-notice">No record found.</p>';
    savedHistory.forEach((h, i) => {
      const li = document.createElement('li');
        li.innerHTML = `<span class="record-target-url" title="${h.url}">${h.url}</span> <span class="record-timestamp">${h.time}</span> <button class="item-delete-btn" data-index="${i}" data-type="hist">DEL</button>`;
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

 const btnDarkMode = document.getElementById('btn-darkmode');
 btnDarkMode.addEventListener('click', () => {
    document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
    localStorage.setItem("browserDarkMode", isDark);
  btnDarkMode.textContent = isDark ? "LIGHT" : "DARK";
 });

 if (localStorage.getItem("browserDarkMode") === "true") {
    document.body.classList.add("dark");
  btnDarkMode.textContent = "LIGHT";
 }

 const btnProfile = document.getElementById('btn-profile');
 const authModal = document.getElementById('auth-modal');

 function checkAuthStatus() {
    const storedUser = localStorage.getItem('browserUser');
  if (storedUser) {
       btnProfile.textContent = JSON.parse(storedUser).name.toUpperCase();
       document.getElementById('welcome-text').textContent = `Operator: ${JSON.parse(storedUser).name}`;
    } else {
       btnProfile.textContent = 'ACCOUNT';
       document.getElementById('welcome-text').textContent = 'Workspace Portal';
    }
 }

 btnProfile.addEventListener('click', () => {
    if (localStorage.getItem('browserUser')) {
       if(confirm("Terminate session?")) { localStorage.removeItem('browserUser'); checkAuthStatus(); }
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

 const newsFeed = document.getElementById('news-feed');
 const loadingSpinner = document.getElementById('loading-spinner');

 const googleNewsDatabase = [
    { title: "NVIDIA announces next-generation chip architecture with doubled optical interface throughput", source: "The Verge", time: "18 mins ago", url: "https://en.wikipedia.org/wiki/Nvidia", img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80", category: "Technology" },
    { title: "Global central banks signal unified approach on liquidity calibration heading into Q4", source: "Financial Times", time: "42 mins ago", url: "https://en.wikipedia.org/wiki/Central_bank", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80", category: "Business" },
    { title: "Deep-ocean hydrothermal vent mapping reveals unknown microbial colony subsets", source: "Nature", time: "1 hr ago", url: "https://en.wikipedia.org/wiki/Hydrothermal_vent", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&q=80", category: "Science" },
    { title: "Open-weights model benchmarking suite standardizes evaluation across edge hardware", source: "Ars Technica", time: "2 hrs ago", url: "https://en.wikipedia.org/wiki/Artificial_intelligence", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", category: "Technology" },
    { title: "European logistics corridors implement automated corridor priority rules", source: "Reuters", time: "3 hrs ago", url: "https://en.wikipedia.org/wiki/Supply_chain", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80", category: "Business" },
    { title: "Quantum error correction milestone verified via multi-qubit entanglement test", source: "IEEE Spectrum", time: "4 hrs ago", url: "https://en.wikipedia.org/wiki/Quantum_computing", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80", category: "Science" },
    { title: "Major enterprise cloud provider rolls out zero-trust kernel attestation policy", source: "ZDNet", time: "5 hrs ago", url: "https://en.wikipedia.org/wiki/Zero_trust_security_model", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80", category: "Technology" },
    { title: "Semiconductor supply fabrication output stabilizes across eastern manufacturing hubs", source: "Bloomberg", time: "6 hrs ago", url: "https://en.wikipedia.org/wiki/Semiconductor_fabrication_plant", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80", category: "Business" }
 ];

 let currentCategory = 'Home';
 let pageCursor = 0;
 let isLoading = false;
 const batchSize = 4;

 function filterStories() {
    if (currentCategory === 'Home' || currentCategory === 'For You' || currentCategory === 'Following') {
      return googleNewsDatabase;
    }
    return googleNewsDatabase.filter(item => item.category === currentCategory);
 }

 function getDynamicSyntheticItem(index, baseList) {
    const template = googleNewsDatabase[index % googleNewsDatabase.length];
    return {
      title: `${template.title} [Wire Stream Update #${index + 1}]`,
      source: template.source,
      time: `${Math.floor((index + 2) * 1.5)} hrs ago`,
      url: template.url,
      img: template.img,
      category: template.category
    };
 }

 function appendNewsBatch() {
    if (isLoading) return;
  isLoading = true;
    loadingSpinner.style.display = 'block';

  setTimeout(() => {
       const activeList = filterStories();
       const fragment = document.createDocumentFragment();
       for (let i = 0; i < batchSize; i++) {
          const itemIndex = pageCursor * batchSize + i;
          const data = itemIndex < activeList.length
             ? activeList[itemIndex]
             : getDynamicSyntheticItem(itemIndex, activeList);

          const card = document.createElement('a');
          card.className = 'news-feed-card';
          card.href = '#';
          card.addEventListener('click', (e) => {
             e.preventDefault();
             navigate(data.url);
          });
          card.innerHTML = `
             <img src="${data.img}" alt="" class="news-thumbnail">
             <div class="news-content">
                <div class="news-source-row">
                   <span class="news-source">${data.source}</span>
                   <span class="news-time">${data.time}</span>
                </div>
                <h4 class="news-title">${data.title}</h4>
             </div>
          `;
          fragment.appendChild(card);
       }
       newsFeed.appendChild(fragment);
       pageCursor++;
       isLoading = false;
       loadingSpinner.style.display = 'none';
       loadingSpinner.textContent = "Streaming payload records...";
  }, 280);
 }

 function resetAndLoadFeed() {
    newsFeed.innerHTML = '';
  pageCursor = 0;
    appendNewsBatch();
 }

 document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.cat;
      resetAndLoadFeed();
    });
 });

 appendNewsBatch();

 mainContent.addEventListener('scroll', () => {
    if (placeholder.style.display !== 'none' && !isLoading) {
       if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 200) {
          appendNewsBatch();
       }
    }
 });

 const musicToggle = document.getElementById('music-toggle');
 const musicBody = document.getElementById('music-body');
 musicToggle.addEventListener('click', () => {
    const isHidden = musicBody.style.display === 'none';
  musicBody.style.display = isHidden ? 'block' : 'none';
  musicToggle.querySelector('span:last-child').textContent = isHidden ? 'SHOW' : 'HIDE';
 });
});