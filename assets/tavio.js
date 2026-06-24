/*****************************************************
 *  Author: Armin Silatani
 *  Date: 2026-05-28
 *  Version: 1.0.0
 ****************************************************
*/

/* =========================== TAVIO APP ============================ */

/* :::::::::::::::::::::::::: SUPABASE CLIENT :::::::::::::::::::::::::: */
const SUPABASE_URL = 'https://vzqicidepdmraygulrey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kqRWgOmLISOE2EuLL1s8fw_NW6FJRTI';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  console.log('Tavio: DOM loaded');

  /* :::::::::::::::::::::::::: CONSTANTS :::::::::::::::::::::::::: */
  const STORAGE_KEY      = 'tavio_prompts';
  const CURRENT_VERSION  = 1;
  const MASTER_PASSWORD  = '1320';
  const defaultPrompts = [];

  /* ------------------------- AI MODELS ------------------------- */
  const ALL_AI_MODELS = [
    // ... (دقیقاً همان آرایه‌ای که همیشه استفاده می‌کردید – برای خلاصه‌سازی، در اینجا تکرار نشده ولی باید کامل باشد)
  ];

  const getAiName = (id) => {
    const model = ALL_AI_MODELS.find(m => m.id === id);
    return model ? model.name : id;
  };

  let prompts = [];

  /* ------------------------- DATA LAYER ------------------------- */
  function loadPrompts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        prompts = defaultPrompts.map(p => ({ ...p }));
        saveToStorage();
        return;
      }
      const data = JSON.parse(raw);
      let needsSave = false;
      if (!data.version || data.version < CURRENT_VERSION) {
        if (Array.isArray(data.prompts)) {
          data.prompts = data.prompts.map(p => {
            const newP = { ...p };
            if (typeof newP.category === 'string') {
              newP.categories = newP.category ? [newP.category] : [];
              delete newP.category;
            }
            if (typeof newP.ai === 'string') {
              newP.ais = newP.ai ? [newP.ai] : [];
              delete newP.ai;
            }
            if (!Array.isArray(newP.categories)) newP.categories = [];
            if (!Array.isArray(newP.ais)) newP.ais = [];
            if (typeof newP.locked === 'undefined') newP.locked = false;
            return newP;
          });
          const defaultIds = new Set(defaultPrompts.map(p => p.id));
          data.prompts = data.prompts.filter(p => !defaultIds.has(p.id));
          defaultPrompts.forEach(dp => data.prompts.push({ ...dp }));
        }
        data.version = CURRENT_VERSION;
        needsSave = true;
      }
      prompts = Array.isArray(data.prompts) ? data.prompts : defaultPrompts.map(p => ({ ...p }));
      if (needsSave) saveToStorage();
    } catch (e) {
      prompts = defaultPrompts.map(p => ({ ...p }));
      saveToStorage();
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CURRENT_VERSION, prompts }));
  }

  let currentFilter = 'all';
  let currentSearch = '';
  let currentPromptId = null;
  let typingTimer = null;

  /* ------------------------- DOM REFS ------------------------- */
  const libraryView = document.getElementById('libraryView');
  const builderView = document.getElementById('builderView');
  const searchInput = document.getElementById('searchInput');
  const categoryFilters = document.getElementById('categoryFilters');
  const promptList = document.getElementById('promptList');
  const promptFormContainer = document.getElementById('promptFormContainer');
  const savePromptBtn = document.getElementById('savePrompt');
  const cancelPromptBtn = document.getElementById('cancelPrompt');
  const promptNameInput = document.getElementById('promptName');
  const promptCategoryInput = document.getElementById('promptCategory');
  const promptTemplateInput = document.getElementById('promptTemplate');
  const promptAiSelect = document.getElementById('promptAi');
  const promptLockedCheckbox = document.getElementById('promptLocked');
  const categorySuggestions = document.getElementById('categorySuggestions');
  const btnBackToLibrary = document.getElementById('btnBackToLibrary');
  const builderTitle = document.getElementById('builderTitle');
  const placeholderInputs = document.getElementById('placeholderInputs');
  const btnGeneratePrompt = document.getElementById('btnGeneratePrompt');
  const resultArea = document.getElementById('resultArea');
  const generatedPrompt = document.getElementById('generatedPrompt');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const btnClearBuilder = document.getElementById('btnClearBuilder');
  const aiModelsFull = document.getElementById('aiModelsFull');
  const promptDescription = document.getElementById('promptDescription');

  /* ------------------------- AUTH UI ELEMENTS ------------------------- */
  const sidebarLoginBtn   = document.getElementById('sidebar-login');
  const sidebarLogoutBtn  = document.getElementById('sidebar-logout');
  const sidebarDashboard  = document.getElementById('sidebar-dashboard');
  const avatarContent     = document.querySelector('.avatar-content');
  const notifDot          = document.getElementById('avatar-notif-dot');

  /* ------------------------- UTILS ------------------------- */
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const getAllCategories = () => {
    const cats = new Set();
    prompts.forEach(p => (p.categories || []).forEach(c => cats.add(c)));
    return [...cats].filter(Boolean);
  };

  const extractPlaceholders = (template) => {
    const regex = /{{(.*?)}}/g;
    const placeholders = new Set();
    let match;
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1].trim());
    }
    return [...placeholders];
  };

  const sortPrompts = (list) => [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  /* ------------------------- RENDER ------------------------- */
  function renderCategoryFilters() {
    const categories = getAllCategories();
    let html = '<button class="filter-chip active" data-category="all">All</button>';
    categories.forEach(cat => {
      html += `<button class="filter-chip" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
    });
    categoryFilters.innerHTML = html;
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === currentFilter);
    });
  }

  function renderLibrary() {
    let filtered = prompts.filter(p => {
      if (currentFilter !== 'all' && !(p.categories || []).includes(currentFilter)) return false;
      if (currentSearch && !p.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
      return true;
    });
    filtered = sortPrompts(filtered);
    if (filtered.length === 0) {
      promptList.innerHTML = '<p style="text-align:center; opacity:0.5; padding:40px;">No prompts found.</p>';
      return;
    }
    promptList.innerHTML = filtered.map(p => {
      const catBadges = (p.categories || []).map(c => `<span class="card-category">${escapeHtml(c)}</span>`).join('');
      const maxShow = 3;
      const aiList = p.ais || [];
      let aiBadgesHtml = '';
      if (aiList.length <= maxShow) {
        aiBadgesHtml = aiList.map(ai => `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`).join('');
      } else {
        const visible = aiList.slice(0, maxShow);
        const hiddenCount = aiList.length - maxShow;
        aiBadgesHtml = visible.map(ai => `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`).join('') +
          `<span class="ai-badge">+${hiddenCount} more</span>`;
      }
      const lockIcon = p.locked ? `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-lock-icon">
          <rect x="5" y="11" width="14" height="11" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
        </svg>
      ` : '';
      return `
        <div class="prompt-card ${p.pinned ? 'pinned' : ''}" data-id="${p.id}">
          <div class="card-main-content">
            <div class="card-info">
              <div class="card-name">${escapeHtml(p.name)}</div>
              <div class="card-meta">${catBadges}${aiBadgesHtml}</div>
            </div>
            <div class="card-actions">
              ${lockIcon}
              <button class="card-pin ${p.pinned ? 'pinned' : ''}" data-action="pin" data-id="${p.id}" title="Pin prompt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="card-password-form hidden">
            <p class="card-password-text">This prompt is locked. Enter the master password to unlock.</p>
            <input type="password" class="card-password-input" placeholder="Master password" autocomplete="off" />
            <div class="card-password-actions">
              <button class="btn btn-accent card-password-submit">Unlock</button>
              <button class="btn btn-outline card-password-cancel">Cancel</button>
            </div>
            <div class="card-password-error"></div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.prompt-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (card.classList.contains('password-active')) return;
        if (e.target.closest('[data-action="pin"]')) return;
        const id = card.dataset.id;
        const prompt = prompts.find(p => p.id === id);
        if (prompt && prompt.locked) {
          convertCardToPasswordInput(card, id);
        } else {
          openBuilder(id);
        }
      });
    });
    document.querySelectorAll('[data-action="pin"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePin(btn.dataset.id);
      });
    });
  }

  function renderAll() {
    renderCategoryFilters();
    renderLibrary();
    updateCategoryDatalist();
  }

  function updateCategoryDatalist() {
    const cats = getAllCategories();
    categorySuggestions.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">`).join('');
  }

  /* ------------------------- IN-CARD PASSWORD ------------------------- */
  function convertCardToPasswordInput(cardElement, promptId) { /* ... same as before ... */ }

  /* ------------------------- ACTIONS ------------------------- */
  function togglePin(id) { /* ... */ }
  function openBuilder(id) { /* ... */ }
  function generatePrompt() { /* ... */ }
  function copyToClipboard() { /* ... */ }
  function clearBuilder() { /* ... */ }

  /* ------------------------- EVENT LISTENERS (Library) ------------------------- */
  searchInput.addEventListener('input', (e) => { currentSearch = e.target.value; renderLibrary(); });
  categoryFilters.addEventListener('click', (e) => { /* ... */ });
  cancelPromptBtn.addEventListener('click', () => { promptFormContainer.classList.add('hidden'); });
  savePromptBtn.addEventListener('click', () => { /* ... */ });
  btnBackToLibrary.addEventListener('click', () => { /* ... */ });
  btnGeneratePrompt.addEventListener('click', generatePrompt);
  btnCopyPrompt.addEventListener('click', copyToClipboard);
  btnClearBuilder.addEventListener('click', clearBuilder);

  /* =========================== SIDEBAR MODULE =========================== */
  const MENU_TOOLS = [ /* ... your full array ... */ ];
  const ROLE_LEVELS = { 'recruit': 0, 'sergeant': 1, 'commander': 2, 'general': 3 };
  function getRoleLevel(role) { return ROLE_LEVELS[role] ?? -1; }
  let currentUserRoleLevel = -1;

  function renderSidebarTools(roleLevel) {
    const container = document.getElementById('sidebar-menu-items');
    if (!container) return;
    let html = '';
    MENU_TOOLS.forEach(tool => {
      const requiredLevel = getRoleLevel(tool.minRole);
      const hasAccess = roleLevel >= requiredLevel;
      const isDisabled = !tool.link || !hasAccess;
      const isSelf = tool.isSelf === true;
      let classes = 'sidebar-item';
      if (isDisabled) classes += ' disabled';
      if (isSelf) classes += ' active';
      const tag = tool.link ? 'a' : 'span';
      const hrefAttr = tool.link ? `href="${tool.link}" target="_blank" rel="noopener noreferrer"` : '';
      const tooltipHtml = !tool.link ? '<span class="coming-soon-tooltip">Soon</span>' : '';
      html += `<${tag} class="${classes}" ${hrefAttr}>
        <span class="sidebar-icon"><img src="${tool.iconURL}" alt="${tool.label}" onerror="this.style.display='none'" /></span>
        <span>${tool.label}</span>
        ${tooltipHtml}
      </${tag}>`;
    });
    container.innerHTML = html;
  }

  (function() {
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebar-overlay');
    const closeRow  = document.getElementById('sidebar-close-row');
    if (!toggleBtn || !sidebar || !overlay || !closeRow) return;
    let isOpen = false;
    function openSidebar() { if (isOpen) return; isOpen = true; overlay.classList.add('open'); toggleBtn.classList.add('open'); gsap.to(sidebar, { x: 0, duration: 0.5, ease: 'power3.out' }); }
    function closeSidebar() { if (!isOpen) return; isOpen = false; overlay.classList.remove('open'); toggleBtn.classList.remove('open'); gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.in' }); }
    toggleBtn.addEventListener('click', () => { isOpen ? closeSidebar() : openSidebar(); });
    closeRow.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closeSidebar(); });
  })();

  /* =========================== AUTH MODULE (RAVLO FLOW) =========================== */
  const authOverlay       = document.getElementById('auth-overlay');
  const authStep1         = document.getElementById('step-1');
  const authStep2Login    = document.getElementById('step-2-login');
  const authStep2Reg      = document.getElementById('step-2-register');
  const authStepForgot    = document.getElementById('step-forgot');

  const authEmail         = document.getElementById('auth-email');
  const authContinue      = document.getElementById('auth-continue-btn');
  const authErrorEl       = document.getElementById('auth-error');

  const authUserEmail     = document.getElementById('auth-user-email');
  const authPassword      = document.getElementById('auth-password');
  const authSignin        = document.getElementById('auth-signin-btn');
  const authForgotLink    = document.getElementById('auth-forgot-link');
  const authErrorLogin    = document.getElementById('auth-error-login');

  const regFirstname      = document.getElementById('reg-firstname');
  const regLastname       = document.getElementById('reg-lastname');
  const regPassword       = document.getElementById('reg-password');
  const regConfirm        = document.getElementById('reg-confirm');
  const authRegister      = document.getElementById('auth-register-btn');
  const authErrorReg      = document.getElementById('auth-error-register');
  const regSuccessEl      = document.getElementById('reg-success');
  const regToLoginBtn     = document.getElementById('reg-to-login-btn');

  const forgotEmailInput  = document.getElementById('forgot-email');
  const authSendReset     = document.getElementById('auth-send-reset-btn');
  const authBackToLogin   = document.getElementById('auth-back-to-login');
  const authSuccessMsg    = document.getElementById('auth-success-msg');

  function showStep(stepId) {
    [authStep1, authStep2Login, authStep2Reg, authStepForgot].forEach(s => s.classList.add('hidden'));
    document.getElementById(stepId).classList.remove('hidden');
  }

  // Continue – automatic user existence check via RPC
  if (authContinue) {
    authContinue.addEventListener('click', async () => {
      const email = authEmail.value.trim();
      if (!email) { authErrorEl.textContent = 'Please enter an email address.'; return; }
      authErrorEl.textContent = '';

      try {
        const { data: userExists, error: rpcError } = await sb.rpc('user_exists', { email_input: email });
        if (rpcError) {
          console.error('RPC error:', rpcError);
          authErrorEl.textContent = 'Service unavailable. Please try again.';
          return;
        }

        if (userExists === true) {
          authUserEmail.textContent = email;
          showStep('step-2-login');
        } else {
          // user does not exist → go to registration
          showStep('step-2-register');
        }
      } catch (err) {
        console.error(err);
        authErrorEl.textContent = 'Network error. Please try later.';
      }
    });
  }

  // Sign In
  if (authSignin) {
    authSignin.addEventListener('click', async () => {
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!password) { authErrorLogin.textContent = 'Password is required.'; return; }
      authErrorLogin.textContent = '';
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { authErrorLogin.textContent = error.message; return; }
      closeAuthOverlay();
    });
  }

  // Register
  if (authRegister) {
    authRegister.addEventListener('click', async () => {
      const email    = authEmail.value.trim();
      const password = regPassword.value;
      const confirm  = regConfirm.value;
      const first    = regFirstname.value.trim();
      const last     = regLastname.value.trim();
      if (!first || !last) { authErrorReg.textContent = 'Please fill in all fields.'; return; }
      if (password.length < 6) { authErrorReg.textContent = 'Password must be at least 6 characters.'; return; }
      if (password !== confirm) { authErrorReg.textContent = 'Passwords do not match.'; return; }
      authErrorReg.textContent = '';

      const { error } = await sb.auth.signUp({ email, password, options: { data: { first_name: first, last_name: last } } });
      if (error) { authErrorReg.textContent = error.message; return; }
      document.getElementById('reg-form-fields').style.display = 'none';
      regSuccessEl.style.display = 'block';
    });
  }

  if (regToLoginBtn) {
    regToLoginBtn.addEventListener('click', () => {
      regSuccessEl.style.display = 'none';
      document.getElementById('reg-form-fields').style.display = '';
      showStep('step-1');
      authEmail.value = '';
      regFirstname.value = '';
      regLastname.value = '';
      regPassword.value = '';
      regConfirm.value = '';
    });
  }

  if (authForgotLink) {
    authForgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotEmailInput.value = authEmail.value.trim();
      showStep('step-forgot');
    });
  }

  if (authSendReset) {
    authSendReset.addEventListener('click', async () => {
      const email = forgotEmailInput.value.trim();
      if (!email) { authSuccessMsg.textContent = 'Please enter your email.'; return; }
      const { error } = await sb.auth.resetPasswordForEmail(email);
      authSuccessMsg.textContent = error ? 'Error: ' + error.message : 'If an account exists, a reset link has been sent.';
    });
  }

  if (authBackToLogin) {
    authBackToLogin.addEventListener('click', (e) => { e.preventDefault(); showStep('step-2-login'); });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.innerHTML = isPassword
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
    });
  });

  function openAuthOverlay() {
    if (authOverlay) {
      authOverlay.style.display = 'flex';
      showStep('step-1');
      authEmail.value = '';
      if (authErrorEl) authErrorEl.textContent = '';
    }
  }

  function closeAuthOverlay() {
    if (authOverlay) authOverlay.style.display = 'none';
  }

  if (authOverlay) {
    authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuthOverlay(); });
  }

  if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', () => openAuthOverlay());
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', async () => { await sb.auth.signOut(); });

  /* =========================== PROFILE & ROLE =========================== */
  let currentUserProfile = null;

  async function fetchProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) {
      console.warn('Profile not found, fallback recruit');
      return { role: 'recruit', first_name: '', last_name: '', email: '' };
    }
    return data;
  }

  async function applyUserProfile(user) {
    if (!user) { setLoggedOutUI(); return; }
    if (!currentUserProfile || currentUserProfile.id !== user.id) {
      currentUserProfile = await fetchProfile(user.id);
    }
    const profile = currentUserProfile;
    const role = profile.role || 'recruit';
    sidebarLoginBtn.classList.add('hidden');
    sidebarLogoutBtn.classList.remove('hidden');
    sidebarDashboard.classList.remove('hidden');
    let avatarChar = '?';
    if (profile.first_name) avatarChar = profile.first_name.charAt(0).toUpperCase();
    else if (user.email) avatarChar = user.email.charAt(0).toUpperCase();
    if (avatarContent) avatarContent.textContent = avatarChar;
    if (notifDot) notifDot.style.display = 'none';
    currentUserRoleLevel = getRoleLevel(role);
    renderSidebarTools(currentUserRoleLevel);
  }

  function setLoggedOutUI() {
    sidebarLoginBtn.classList.remove('hidden');
    sidebarLogoutBtn.classList.add('hidden');
    sidebarDashboard.classList.add('hidden');
    if (avatarContent) avatarContent.textContent = '';
    currentUserProfile = null;
    currentUserRoleLevel = -1;
    renderSidebarTools(-1);
  }

  async function checkUser() {
    const { data: { session } } = await sb.auth.getSession();
    await applyUserProfile(session?.user ?? null);
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    await applyUserProfile(session?.user ?? null);
  });

  /* ------------------------- INIT & LOADER ------------------------- */
  loadPrompts();
  renderAll();
  checkUser();
  console.log('Tavio: Initialization complete.');

  const loader = document.getElementById('initial-loader');
  if (loader) loader.classList.add('hidden');
});