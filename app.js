/**
 * Premium YouTube Clone - Dynamic Application Engine
 * Handles client-side routing, theme toggling, search suggestions & filtering,
 * interactive watch screen features, subscriber states, description expansion, comments,
 * and a premium Toast Notification System for unintegrated features/edge-cases.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Application State
  const state = {
    currentScreen: 'home', // 'home' or 'watch'
    theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    isSubscribed: false,
    subscribersCount: 1240000, // 1.24M
    isLiked: false,
    isDisliked: false,
    likesCount: 12453,
    activeVideoId: null,
    // Store video database from the page cards for dynamic template populating
    videos: []
  };

  // Select DOM Elements
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const homeGrid = document.querySelector('.content');
  const topicBar = document.querySelector('.topic-suggestion');
  const watchScreen = document.getElementById('watch-screen');
  const searchInput = document.getElementById('search-input-el');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const searchSuggestions = document.getElementById('search-suggestions');
  const searchButtonBtn = document.getElementById('search-button-btn');
  const logoBtn = document.getElementById('yt-ringo2-svg_yt8'); // YouTube Logo
  const homeSidebarBtn = document.querySelector('.sidebar .homelogo');
  const homeToggleSidebarBtn = document.querySelector('.togglesidebar li:first-child a');
  
  // Watch Screen Details
  const mainVideo = document.getElementById('main-video');
  const watchTitle = document.getElementById('watch-title');
  const watchViewsDate = document.getElementById('watch-views-date');
  const watchChannelLogo = document.getElementById('watch-channel-logo');
  const watchChannelName = document.getElementById('watch-channel-name');
  const subCountEl = document.getElementById('sub-count');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const likeBtn = document.getElementById('like-btn');
  const likeCountEl = document.getElementById('like-count');
  const dislikeBtn = document.getElementById('dislike-btn');
  const descBox = document.getElementById('description-box');
  const descToggleBtn = document.getElementById('desc-toggle-btn');
  const suggestedVideosList = document.getElementById('suggested-videos-list');

  // Comments System
  const commentInput = document.getElementById('comment-input');
  const commentActions = document.getElementById('comment-actions');
  const commentCancel = document.getElementById('comment-cancel');
  const commentSubmit = document.getElementById('comment-submit');
  const commentsList = document.getElementById('comments-list');
  const commentsCountTitle = document.getElementById('comments-count-title');

  // --- Theme Management ---
  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button icon
    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    }
  }

  // Set initial theme
  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      showToast(`Switched to ${state.theme === 'dark' ? 'Premium Dark' : 'Modern Light'} Theme`, 'info', 'fa-solid fa-circle-half-stroke');
    });
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'info', iconClass = 'fa-solid fa-circle-info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon ${type}"><i class="${iconClass}"></i></div>
      <div class="toast-message">${message}</div>
      <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
    `;

    container.appendChild(toast);

    // Trigger reflow to start transition
    toast.offsetHeight;
    toast.classList.add('show');

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      removeToast(toast);
    });

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      removeToast(toast);
    }, 3500);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }

  // --- Extract Video Database from Cards ---
  function parseVideoCards() {
    const cardElements = document.querySelectorAll('.content .card');
    state.videos = Array.from(cardElements).map((card, index) => {
      const imgEl = card.querySelector('.header img');
      const logoEl = card.querySelector('.channel_logo img');
      const titleEl = card.querySelector('.video_title h4');
      const channelEl = card.querySelector('.video_title p:nth-of-type(1)');
      const statsEl = card.querySelector('.video_title p:nth-of-type(2)');
      
      const titleText = titleEl ? titleEl.innerText : 'When Cartoon Tried To Tell Us Something...| Cartoon Wisdom';
      const channelName = channelEl ? channelEl.innerText : 'Inspirophoria';
      const statsText = statsEl ? statsEl.innerText : '333K views • 3 weeks ago';
      const imgSrc = imgEl ? imgEl.getAttribute('src') : `src/image${(index % 14) + 1}.jpg`;
      const logoSrc = logoEl ? logoEl.getAttribute('src') : `src/logo${(index % 5) + 1}.jpg`;

      // Set unique data attribute to trigger Watch page routing
      card.setAttribute('data-video-index', index);
      
      // Inject duration badge onto card thumbnails
      const durationStr = getRandomDuration(index);
      const headerEl = card.querySelector('.header');
      if (headerEl && !headerEl.querySelector('.video-duration')) {
        const durationBadge = document.createElement('span');
        durationBadge.className = 'video-duration';
        durationBadge.innerText = durationStr;
        headerEl.appendChild(durationBadge);
      }

      return {
        id: index,
        title: titleText,
        channel: channelName,
        stats: statsText,
        imgSrc: imgSrc,
        logoSrc: logoSrc,
        duration: durationStr
      };
    });
  }

  function getRandomDuration(index) {
    const minutes = [8, 12, 5, 14, 21, 10, 18, 4, 15, 27, 9, 32, 11, 13];
    const seconds = ['24', '45', '12', '55', '03', '10', '18', '50', '39', '14', '08', '29', '42', '00'];
    return `${minutes[index % minutes.length]}:${seconds[index % seconds.length]}`;
  }

  parseVideoCards();

  // --- Dynamic Routing (Home <-> Watch) ---
  function showScreen(screen, videoData = null) {
    state.currentScreen = screen;
    
    if (screen === 'home') {
      // Show Home sections
      homeGrid.style.display = 'grid';
      topicBar.style.display = 'flex';
      watchScreen.style.display = 'none';
      
      // Pause video playback
      if (mainVideo) {
        mainVideo.pause();
      }
      
      // Sync Sidebar Active states
      document.querySelectorAll('.sidebar > div, .togglesidebar li').forEach(el => {
        el.classList.remove('active');
      });
      if (homeSidebarBtn) homeSidebarBtn.classList.add('active');
      
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (screen === 'watch' && videoData) {
      // Hide Home sections
      homeGrid.style.display = 'none';
      topicBar.style.display = 'none';
      watchScreen.style.display = 'block';
      
      // Populate Watch screen template
      watchTitle.innerText = videoData.title;
      watchViewsDate.innerText = videoData.stats;
      watchChannelLogo.setAttribute('src', videoData.logoSrc);
      watchChannelName.innerText = videoData.channel;
      
      // Reset video controls and poster
      if (mainVideo) {
        mainVideo.setAttribute('poster', videoData.imgSrc);
        mainVideo.load();
        
        // Show custom skeleton loader that fades out as video buffer warms up
        const skeleton = document.getElementById('player-skeleton');
        if (skeleton) {
          skeleton.style.display = 'block';
          skeleton.style.opacity = '1';
          mainVideo.addEventListener('loadeddata', () => {
            skeleton.style.opacity = '0';
            setTimeout(() => { skeleton.style.display = 'none'; }, 300);
          }, { once: true });
        }
        
        // Smoothly auto-play video
        const playPromise = mainVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Autoplay prevented.");
            showToast('Click the play button to start. Autoplay blocked by browser privacy.', 'info', 'fa-solid fa-circle-play');
          });
        }
      }

      // Reset subscriber and like buttons states
      resetWatchPageInteractiveStates();

      // Populate watch recommendations
      populateRecommendations(videoData.id);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Watch Screen Actions Reset ---
  function resetWatchPageInteractiveStates() {
    state.isSubscribed = false;
    state.isLiked = false;
    state.isDisliked = false;
    
    // Subscriber count randomization
    state.subscribersCount = Math.floor(Math.random() * 500 + 10) * 10000; // between 100K and 5.1M
    subCountEl.innerText = formatCount(state.subscribersCount) + " subscribers";
    
    subscribeBtn.className = 'subscribe-btn';
    subscribeBtn.innerText = 'Subscribe';

    // Likes randomization
    state.likesCount = Math.floor(Math.random() * 50 + 1) * 1000 + Math.floor(Math.random() * 999);
    likeCountEl.innerText = formatCount(state.likesCount);
    
    likeBtn.className = 'watch-action-btn';
    likeBtn.querySelector('i').className = 'fa-regular fa-thumbs-up';
    dislikeBtn.className = 'watch-action-btn';
    dislikeBtn.querySelector('i').className = 'fa-regular fa-thumbs-down';

    // Clear previous input comments
    if (commentInput) {
      commentInput.value = '';
      commentActions.style.display = 'none';
      commentSubmit.setAttribute('disabled', 'true');
    }
    
    // Collapse description box
    if (descBox) {
      descBox.classList.remove('expanded');
      descToggleBtn.innerText = 'Show more';
    }
  }

  function formatCount(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  // --- Subscribe Animation & State Toggle ---
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      state.isSubscribed = !state.isSubscribed;
      
      // Trigger smooth scale pop effect
      subscribeBtn.style.transform = 'scale(0.92)';
      setTimeout(() => { subscribeBtn.style.transform = ''; }, 120);

      if (state.isSubscribed) {
        state.subscribersCount++;
        subscribeBtn.className = 'subscribe-btn subscribed';
        subscribeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Subscribed';
        showToast(`Subscribed to ${watchChannelName.innerText}! Added to your active subscriptions.`, 'info', 'fa-regular fa-circle-check');
      } else {
        state.subscribersCount--;
        subscribeBtn.className = 'subscribe-btn';
        subscribeBtn.innerText = 'Subscribe';
        showToast(`Unsubscribed from ${watchChannelName.innerText}.`, 'info', 'fa-solid fa-circle-exclamation');
      }
      subCountEl.innerText = formatCount(state.subscribersCount) + " subscribers";
    });
  }

  // --- Likes/Dislikes Action Animations ---
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      // Trigger elastic bounce on thumb up
      const icon = likeBtn.querySelector('i');
      icon.style.transform = 'scale(1.3) rotate(-15deg)';
      setTimeout(() => { icon.style.transform = ''; }, 200);

      if (state.isLiked) {
        state.isLiked = false;
        state.likesCount--;
        likeBtn.classList.remove('active');
        icon.className = 'fa-regular fa-thumbs-up';
      } else {
        state.isLiked = true;
        state.likesCount++;
        likeBtn.classList.add('active');
        icon.className = 'fa-solid fa-thumbs-up';
        showToast('Added to your Liked Videos.', 'info', 'fa-regular fa-thumbs-up');
        
        // Remove dislike if active
        if (state.isDisliked) {
          state.isDisliked = false;
          dislikeBtn.classList.remove('active');
          dislikeBtn.querySelector('i').className = 'fa-regular fa-thumbs-down';
        }
      }
      likeCountEl.innerText = formatCount(state.likesCount);
    });
  }

  if (dislikeBtn) {
    dislikeBtn.addEventListener('click', () => {
      // Trigger elastic bounce on thumb down
      const icon = dislikeBtn.querySelector('i');
      icon.style.transform = 'scale(1.3) rotate(15deg)';
      setTimeout(() => { icon.style.transform = ''; }, 200);

      if (state.isDisliked) {
        state.isDisliked = false;
        dislikeBtn.classList.remove('active');
        icon.className = 'fa-regular fa-thumbs-down';
      } else {
        state.isDisliked = true;
        dislikeBtn.classList.add('active');
        icon.className = 'fa-solid fa-thumbs-down';
        showToast('Feedback submitted to algorithms.', 'info', 'fa-regular fa-thumbs-down');
        
        // Remove like if active
        if (state.isLiked) {
          state.isLiked = false;
          state.likesCount--;
          likeBtn.classList.remove('active');
          likeBtn.querySelector('i').className = 'fa-regular fa-thumbs-up';
          likeCountEl.innerText = formatCount(state.likesCount);
        }
      }
    });
  }

  // --- Collapsible Description Box ---
  if (descToggleBtn && descBox) {
    descToggleBtn.addEventListener('click', () => {
      const isExpanded = descBox.classList.toggle('expanded');
      descToggleBtn.innerText = isExpanded ? 'Show less' : 'Show more';
    });
  }

  // --- Interactive Comments System ---
  if (commentInput) {
    commentInput.addEventListener('focus', () => {
      commentActions.style.display = 'flex';
    });

    commentInput.addEventListener('input', () => {
      if (commentInput.value.trim().length > 0) {
        commentSubmit.removeAttribute('disabled');
      } else {
        commentSubmit.setAttribute('disabled', 'true');
      }
    });

    commentCancel.addEventListener('click', () => {
      commentInput.value = '';
      commentActions.style.display = 'none';
      commentSubmit.setAttribute('disabled', 'true');
    });

    commentSubmit.addEventListener('click', () => {
      const text = commentInput.value.trim();
      if (!text) return;

      // Create new comment element
      const newComment = document.createElement('div');
      newComment.className = 'comment-item self-comment animate-comment';
      newComment.innerHTML = `
        <img class="comment-user-avatar" src="https://yt3.ggpht.com/p5mMuAK9UigbDKeR2JoNB4nDmnS8aP2eVCsw_afZ3tgLK4wvmOMar6qc43FTKdXZcaREb-Rl0A=s88-c-k-c0x00ffffff-no-rj" alt="Your Avatar">
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-username">@you</span>
            <span class="comment-time">Just now</span>
          </div>
          <div class="comment-text">${escapeHTML(text)}</div>
          <div class="comment-actions">
            <button class="comment-action-btn"><i class="fa-regular fa-thumbs-up"></i> 0</button>
            <button class="comment-action-btn"><i class="fa-regular fa-thumbs-down"></i></button>
            <button class="comment-action-btn reply-btn">Reply</button>
          </div>
        </div>
      `;

      // Prepend comments
      commentsList.insertBefore(newComment, commentsList.firstChild);

      // Reset Form
      commentInput.value = '';
      commentSubmit.setAttribute('disabled', 'true');
      showToast('Comment published successfully!', 'info', 'fa-regular fa-comment-dots');
      
      // Update comment numbers dynamically
      const countMatch = commentsCountTitle.innerText.match(/\d[\d,]*/);
      if (countMatch) {
        let currentCount = parseInt(countMatch[0].replace(/,/g, ''));
        commentsCountTitle.innerText = (currentCount + 1).toLocaleString() + " Comments";
      }

      // Smooth focus-out
      commentInput.blur();
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // --- Populate Watch Recommendations ---
  function populateRecommendations(excludeId) {
    if (!suggestedVideosList) return;
    
    suggestedVideosList.innerHTML = '';
    
    // Filter videos to display others
    const suggestions = state.videos.filter(vid => vid.id !== excludeId);
    
    suggestions.forEach(vid => {
      const sugCard = document.createElement('div');
      sugCard.className = 'suggested-card';
      sugCard.setAttribute('data-video-id', vid.id);
      sugCard.innerHTML = `
        <div class="sug-thumbnail">
          <img src="${vid.imgSrc}" alt="Thumbnail">
          <span class="sug-duration">${vid.duration}</span>
        </div>
        <div class="sug-details">
          <h4 class="sug-title">${vid.title}</h4>
          <span class="sug-channel">${vid.channel}</span>
          <span class="sug-views">${vid.stats}</span>
        </div>
      `;
      
      sugCard.addEventListener('click', () => {
        showScreen('watch', vid);
      });
      
      suggestedVideosList.appendChild(sugCard);
    });
  }

  // --- Hooking Click Events on Video Cards ---
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.content .card');
    if (card) {
      const idx = parseInt(card.getAttribute('data-video-index'));
      if (!isNaN(idx) && state.videos[idx]) {
        showScreen('watch', state.videos[idx]);
      }
    }
  });

  // --- Hooking Home / Navigation Button Actions ---
  // Header Logo click triggers back-to-home
  if (logoBtn) {
    logoBtn.style.cursor = 'pointer';
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('home');
    });
  }

  // Also enable Logo parent click if it has an element
  const logoWrapper = document.querySelector('.header1 .menu .logo-wrapper') || document.querySelector('.header1 .menu');
  if (logoWrapper) {
    const logoSvg = logoWrapper.querySelector('svg:nth-of-type(2)');
    if (logoSvg) {
      logoSvg.style.cursor = 'pointer';
      logoSvg.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('home');
      });
    }
  }

  if (homeSidebarBtn) {
    homeSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('home');
    });
  }

  if (homeToggleSidebarBtn) {
    homeToggleSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('home');
    });
  }

  // --- Search Filtering & Suggestions ---
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
      clearSearchBtn.style.display = val.length > 0 ? 'block' : 'none';
      
      if (val.length > 0) {
        searchSuggestions.style.display = 'block';
        filterSuggestions(val);
      } else {
        searchSuggestions.style.display = 'none';
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        searchSuggestions.style.display = 'block';
      }
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.input-field')) {
        searchSuggestions.style.display = 'none';
      }
    });

    // Clear Search Input
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchSuggestions.style.display = 'none';
        searchInput.focus();
        resetSearchFilter();
      });
    }

    // Trigger filter on pressing Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSearch(searchInput.value.trim());
        searchSuggestions.style.display = 'none';
        searchInput.blur();
      }
    });
  }

  if (searchButtonBtn) {
    searchButtonBtn.addEventListener('click', () => {
      triggerSearch(searchInput.value.trim());
      searchSuggestions.style.display = 'none';
    });
  }

  // Handle Search Suggestions list item clicks
  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const term = item.querySelector('span').innerText;
      searchInput.value = term;
      clearSearchBtn.style.display = 'block';
      searchSuggestions.style.display = 'none';
      triggerSearch(term);
    });
  });

  function filterSuggestions(term) {
    const lowercaseTerm = term.toLowerCase();
    const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');
    suggestions.forEach(item => {
      const text = item.querySelector('span').innerText.toLowerCase();
      if (text.includes(lowercaseTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function triggerSearch(term) {
    if (state.currentScreen !== 'home') {
      showScreen('home');
    }

    const cards = document.querySelectorAll('.content .card');
    let matchCount = 0;
    const lowercaseTerm = term.toLowerCase();

    cards.forEach(card => {
      const title = card.querySelector('.video_title h4').innerText.toLowerCase();
      const channel = card.querySelector('.video_title p:nth-of-type(1)').innerText.toLowerCase();
      
      if (title.includes(lowercaseTerm) || channel.includes(lowercaseTerm)) {
        card.style.display = 'block';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Remove existing empty state if any
    const existingEmptyState = document.getElementById('search-empty-state');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }

    // Add visual empty state if zero matches
    if (matchCount === 0) {
      const emptyState = document.createElement('div');
      emptyState.id = 'search-empty-state';
      emptyState.className = 'empty-state-container';
      emptyState.innerHTML = `
        <i class="fa-regular fa-folder-open empty-icon"></i>
        <h2>No results found for "${escapeHTML(term)}"</h2>
        <p>Try matching cartoon wisdom, inspiring series, or specific channels.</p>
        <button class="reset-search-btn" id="reset-search-btn">Reset Search</button>
      `;
      homeGrid.parentNode.insertBefore(emptyState, homeGrid.nextSibling);
      homeGrid.style.display = 'none';

      document.getElementById('reset-search-btn').addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        resetSearchFilter();
      });
    } else {
      homeGrid.style.display = 'grid';
    }
  }

  function resetSearchFilter() {
    const existingEmptyState = document.getElementById('search-empty-state');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }
    
    document.querySelectorAll('.content .card').forEach(card => {
      card.style.display = 'block';
    });
    
    homeGrid.style.display = 'grid';
  }

  // --- Suggestion chip buttons filter functionality ---
  document.querySelectorAll('.theams_button').forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active states on chip items
      document.querySelectorAll('.theams_button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const category = button.innerText.trim();
      if (category === 'All') {
        resetSearchFilter();
      } else {
        triggerSearch(category);
      }
    });
  });

  // ==========================================================================
  // Edge-case & Unintegrated UI Click Handlers (User Friendly Toasts)
  // ==========================================================================

  // Header Actions
  const createBtn = document.querySelector('.createlogo');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      showToast('Create video studio panel is a mockup in this clone build.', 'warning', 'fa-solid fa-video-slash');
    });
  }

  const bellBtn = document.querySelector('.belllogo');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      showToast('Notifications simulated. You are completely up to date!', 'info', 'fa-regular fa-bell');
    });
  }

  const micBtn = document.querySelector('.mic-button');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      showToast('Voice Search is unintegrated. Please type query in Search Bar.', 'warning', 'fa-solid fa-microphone-slash');
    });
  }

  const avatarBtn = document.querySelector('.account_logo');
  if (avatarBtn) {
    avatarBtn.addEventListener('click', () => {
      showToast('Account profile settings require database integrations.', 'info', 'fa-regular fa-user');
    });
  }

  // Sidebar / collapsed sidebar unintegrated link notifications
  document.querySelectorAll('.sidebar > div').forEach(el => {
    if (el.classList.contains('homelogo')) return;
    el.addEventListener('click', () => {
      const featureName = el.querySelector('span').innerText;
      showToast(`"${featureName}" section is a visual mockup in this clone.`, 'info', 'fa-solid fa-shapes');
    });
  });

  document.querySelectorAll('.togglesidebar li').forEach(el => {
    const anchor = el.querySelector('a');
    if (!anchor) return;
    const text = anchor.innerText.trim();
    if (text === 'Home') return;

    el.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(`"${text}" segment requires dynamic user sessions. mockup only.`, 'info', 'fa-solid fa-lock');
    });
  });

  // Watch Screen Action Panel Simulation
  const shareBtn = document.querySelector('.watch-action-btn:nth-of-type(3)');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      // Simulate clipboard copy
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Video link copied to clipboard!', 'info', 'fa-solid fa-link');
      }).catch(() => {
        showToast('Video share link generated successfully.', 'info', 'fa-solid fa-arrow-up-from-bracket');
      });
    });
  }

  const downloadBtn = document.querySelector('.watch-action-btn:nth-of-type(4)');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('Offline download started... Simulator only.', 'warning', 'fa-solid fa-arrow-down');
    });
  }

  const dotsBtn = document.querySelector('.circle-btn');
  if (dotsBtn) {
    dotsBtn.addEventListener('click', () => {
      showToast('Reporting and advanced configuration options are restricted.', 'info', 'fa-solid fa-shield-halved');
    });
  }

  // Comment sub actions (nested replies, sort dropdown warning)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.reply-btn')) {
      showToast('Nested replies are under development in this release.', 'info', 'fa-regular fa-comments');
    } else if (e.target.closest('.comments-sort')) {
      showToast('Sorting algorithms are deactivated. Showing default chronology.', 'info', 'fa-solid fa-arrow-down-wide-narrow');
    } else if (e.target.closest('.comment-action-btn')) {
      const icon = e.target.closest('.comment-action-btn').querySelector('i');
      if (icon) {
        icon.style.transform = 'scale(1.25)';
        setTimeout(() => { icon.style.transform = ''; }, 150);
        showToast('Feedback counted on user comment.', 'info', 'fa-regular fa-face-smile');
      }
    }
  });
});
