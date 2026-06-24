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
    // Active
    { id: 'gpt-5.4',                    name: 'Chat GPT 5.4',                              active: true  },
    { id: 'gpt-5.3-codex',              name: 'Chat GPT 5.3 Codex',                        active: true  },
    { id: 'gpt-5.4-mini',               name: 'Chat GPT 5.4 mini',                         active: true  },
    { id: 'gpt-5.4-nano',               name: 'Chat GPT 5.4 nano',                         active: true  },
    { id: 'o4-mini',                    name: 'Chat GPT o4-mini',                          active: true  },
    { id: 'o4-mini-high',               name: 'Chat GPT o4 mini (high)',                   active: true  },
    { id: 'gpt-image-1.5',              name: 'Chat GPT Image 1.5',                        active: true  },
    { id: 'claude-4.6-sonnet',          name: 'Claude 4.6 Sonnet',                         active: true  },
    { id: 'claude-4.5-haiku',           name: 'Claude 4.5 Haiku',                          active: true  },
    { id: 'gemini-3.1-pro',             name: 'Gemini 3.1 Pro',                            active: true  },
    { id: 'gemini-3-flash',             name: 'Gemini 3 Flash',                            active: true  },
    { id: 'gemini-2.5-flash',           name: 'Gemini 2.5 Flash',                          active: true  },
    { id: 'gemini-2.5-pro',             name: 'Gemini 2.5 pro',                            active: true  },
    { id: 'nano-banana-2',              name: 'Nano Banana 2',                             active: true  },
    { id: 'deepseek-v4-flash',          name: 'DeepSeek V4 Flash',                         active: true  },
    { id: 'deepseek-r1',                name: 'DeepSeek R1',                               active: true  },
    { id: 'deepseek-v4-pro',            name: 'DeepSeek V4 Pro',                           active: true  },
    // DeepSeek Instant
    { id: 'deepseek-instant',           name: 'DeepSeek Instant',                          active: true  },
    { id: 'deepseek-instant-dt',        name: 'DeepSeek Instant (DeepThink)',               active: true  },
    { id: 'deepseek-instant-s',         name: 'DeepSeek Instant (Search)',                 active: true  },
    { id: 'deepseek-instant-dt-s',      name: 'DeepSeek Instant (DeepThink + Search)',     active: true  },
    // DeepSeek Expert
    { id: 'deepseek-expert',            name: 'DeepSeek Expert',                           active: true  },
    { id: 'deepseek-expert-dt',         name: 'DeepSeek Expert (DeepThink)',               active: true  },
    { id: 'deepseek-expert-s',          name: 'DeepSeek Expert (Search)',                  active: true  },
    { id: 'deepseek-expert-dt-s',       name: 'DeepSeek Expert (DeepThink + Search)',      active: true  },
    // DeepSeek Vision
    { id: 'deepseek-vision',            name: 'DeepSeek Vision',                           active: true  },
    { id: 'deepseek-vision-dt',         name: 'DeepSeek Vision (DeepThink)',               active: true  },
    { id: 'grok-4.1-fast',              name: 'Grok 4.1 Fast',                             active: true  },
    { id: 'grok-4',                     name: 'Grok 4',                                    active: true  },
    { id: 'grok-3',                     name: 'Grok 3',                                    active: true  },
    { id: 'glm-5',                      name: 'GLM 5',                                     active: true  },
    { id: 'kimi-2.5',                   name: 'Kimi 2.5',                                  active: true  },
    { id: 'minimax-m2',                 name: 'Minimax M2',                                active: true  },
    { id: 'perplexity',                 name: 'Perplexity',                                active: true  },
    { id: 'qwen-3',                     name: 'Qwen 3',                                    active: true  },
    { id: 'qwen-3-coder',               name: 'Qwen 3 Coder',                              active: true  },
    { id: 'qwen-3-max',                 name: 'Qwen 3 Max',                                active: true  },
    { id: 'copilot-thinkdeeper',        name: 'Copilot (Think Deeper)',                    active: true  },
    { id: 'copilot-smart',              name: 'Copilot (Smart)',                           active: true  },
    { id: 'copilot-learn&study',        name: 'Copilot (Learn & Study)',                   active: true  },
    { id: 'copilot-deepresearch',       name: 'Copilot (Deep Research)',                   active: true  },
    { id: 'copilot-search',             name: 'Copilot (Search)',                          active: true  },
    // Inactive
    { id: 'gpt-5.5',                    name: 'Chat GPT 5.5',                              active: false },
    { id: 'gpt-5.4-pro',                name: 'Chat GPT 5.4 Pro',                          active: false },
    { id: 'o3',                         name: 'Chat GPT o3',                               active: false },
    { id: 'o3-pro',                     name: 'Chat GPT o3 pro',                           active: false },
    { id: 'dalle-3',                    name: 'DALL-E 3',                                  active: false },
    { id: 'gpt-image-2',                name: 'Chat GPT Image 2',                          active: false },
    { id: 'sora-2',                     name: 'Sora 2',                                    active: false },
    { id: 'claude-4.7-opus',            name: 'Claude 4.7 Opus',                           active: false },
    { id: 'nano-banana-pro',            name: 'Nano Banana Pro',                           active: false },
    { id: 'gemini-3.5-flash',           name: 'Gemini 3.5 Flash',                          active: false },
    { id: 'veo-3.1',                    name: 'Veo 3.1',                                   active: false },
    { id: 'veo-3.1-fast',               name: 'Veo 3.1 Fast',                              active: false },
    { id: 'imagen-4',                   name: 'Imagen 4',                                  active: false },
    { id: 'grok-3-thinking',            name: 'Grok 3 Thinking',                           active: false },
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
      const catBadges = (p.categories || []).map(c =>
        `<span class="card-category">${escapeHtml(c)}</span>`
      ).join('');
      const maxShow = 3;
      const aiList = p.ais || [];
      let aiBadgesHtml = '';
      if (aiList.length <= maxShow) {
        aiBadgesHtml = aiList.map(ai =>
          `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`
        ).join('');
      } else {
        const visible = aiList.slice(0, maxShow);
        const hiddenCount = aiList.length - maxShow;
        aiBadgesHtml =
          visible.map(ai => `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`).join('') +
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
              <div class="card-meta">
                ${catBadges}
                ${aiBadgesHtml}
              </div>
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
  function convertCardToPasswordInput(cardElement, promptId) {
    if (cardElement.classList.contains('password-active')) return;
    cardElement.classList.add('password-active');
    const passwordForm = cardElement.querySelector('.card-password-form');
    const input = passwordForm.querySelector('.card-password-input');
    const submitBtn = passwordForm.querySelector('.card-password-submit');
    const cancelBtn = passwordForm.querySelector('.card-password-cancel');
    const errorDiv = passwordForm.querySelector('.card-password-error');
    input.focus();
    const handleSubmit = () => {
      const entered = input.value;
      if (entered === MASTER_PASSWORD) {
        openBuilder(promptId);
      } else {
        errorDiv.textContent = 'Incorrect password.';
        input.select();
      }
    };
    const handleCancel = () => {
      cardElement.classList.remove('password-active');
      input.value = '';
      errorDiv.textContent = '';
    };
    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
    submitBtn.addEventListener('click', (e) => e.stopPropagation());
    cancelBtn.addEventListener('click', (e) => e.stopPropagation());
  }

  /* ------------------------- ACTIONS ------------------------- */
  function togglePin(id) {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      prompt.pinned = !prompt.pinned;
      saveToStorage();
      renderAll();
    }
  }

  function openBuilder(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    currentPromptId = id;
    builderTitle.textContent = prompt.name;
    if (prompt.description) {
      promptDescription.textContent = prompt.description;
    } else {
      promptDescription.textContent = '';
    }
    let aiHtml = '<div class="ai-status-section"><h4>AI Models</h4><div class="ai-status-list">';
    (prompt.ais || []).forEach(aiId => {
      const model = ALL_AI_MODELS.find(m => m.id === aiId);
      const name = model ? model.name : aiId;
      const isActive = model ? model.active : true;
      const statusClass = isActive ? 'ai-active' : 'ai-inactive';
      aiHtml += `<span class="ai-status-chip ${statusClass}">${escapeHtml(name)}</span>`;
    });
    aiHtml += '</div></div>';
    aiModelsFull.innerHTML = aiHtml;

    const placeholders = extractPlaceholders(prompt.template);
    let fieldsHtml = '';
    if (placeholders.length === 0) {
      fieldsHtml = '<p style="opacity:0.7;">This prompt has no placeholders. You can use it as is.</p>';
    } else {
      fieldsHtml = placeholders.map(ph => {
        const isLong = /faq|anchor|full article|full persian article|full translated text|image description/i.test(ph);
        const tag = isLong ? 'textarea' : 'input';
        const extra = isLong ? ' rows="4"' : ' type="text"';
        return `
          <div class="placeholder-field">
            <label for="input_${escapeHtml(ph)}">${escapeHtml(ph)}</label>
            <${tag}${extra} id="input_${escapeHtml(ph)}" placeholder="Enter ${escapeHtml(ph)}" autocomplete="off"></${tag}>
          </div>
        `;
      }).join('');
    }
    placeholderInputs.innerHTML = fieldsHtml;
    document.querySelector('.container').classList.add('builder-mode');
    generatedPrompt.value = '';
    libraryView.classList.add('hidden');
    builderView.classList.remove('hidden');
  }

  function generatePrompt() {
    const prompt = prompts.find(p => p.id === currentPromptId);
    if (!prompt) return;
    const placeholders = extractPlaceholders(prompt.template);
    let filled = prompt.template;
    placeholders.forEach(ph => {
      const el = document.getElementById(`input_${ph}`);
      const val = el ? el.value : '';
      const escapedPh = ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`{{${escapedPh}}}`, 'gi');
      filled = filled.replace(regex, val || `{{${ph}}}`);
    });
    if (typingTimer) clearInterval(typingTimer);
    generatedPrompt.value = '';
    generatedPrompt.classList.add('typing');
    generatedPrompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    let i = 0;
    const chars = filled.split('');
    const speed = 5;
    typingTimer = setInterval(() => {
      if (i < chars.length) {
        generatedPrompt.value += chars[i];
        generatedPrompt.scrollTop = generatedPrompt.scrollHeight;
        i++;
      } else {
        clearInterval(typingTimer);
        generatedPrompt.classList.remove('typing');
      }
    }, speed);
  }

  function copyToClipboard() {
    generatedPrompt.select();
    document.execCommand('copy');
    btnCopyPrompt.style.color = 'var(--accent)';
    setTimeout(() => { btnCopyPrompt.style.color = ''; }, 1000);
  }

  function clearBuilder() {
    const inputs = document.querySelectorAll('#placeholderInputs input, #placeholderInputs textarea');
    inputs.forEach(input => { input.value = ''; });
    generatedPrompt.value = '';
    if (typingTimer) {
      clearInterval(typingTimer);
      generatedPrompt.classList.remove('typing');
    }
  }

  /* ------------------------- EVENT LISTENERS (Library) ------------------------- */
  searchInput.addEventListener('input', (e) => { currentSearch = e.target.value; renderLibrary(); });
  categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    currentFilter = chip.dataset.category;
    renderAll();
  });
  cancelPromptBtn.addEventListener('click', () => { promptFormContainer.classList.add('hidden'); });
  savePromptBtn.addEventListener('click', () => {
    const name = promptNameInput.value.trim();
    const catRaw = promptCategoryInput.value.trim();
    const template = promptTemplateInput.value.trim();
    const selected = Array.from(promptAiSelect.selectedOptions).map(opt => opt.value);
    const locked = promptLockedCheckbox ? promptLockedCheckbox.checked : false;
    if (!name || !catRaw || !template) {
      alert('Please fill in all fields.');
      return;
    }
    const categories = catRaw.split(',').map(c => c.trim()).filter(Boolean);
    const newPrompt = {
      id: Date.now().toString(),
      name,
      categories,
      ais: selected.length > 0 ? selected : [],
      pinned: false,
      locked: locked,
      template
    };
    prompts.push(newPrompt);
    saveToStorage();
    promptFormContainer.classList.add('hidden');
    promptNameInput.value = '';
    promptCategoryInput.value = '';
    promptTemplateInput.value = '';
    promptAiSelect.selectedIndex = -1;
    if (promptLockedCheckbox) promptLockedCheckbox.checked = false;
    renderAll();
  });
  btnBackToLibrary.addEventListener('click', () => {
    builderView.classList.add('hidden');
    libraryView.classList.remove('hidden');
    currentPromptId = null;
    placeholderInputs.innerHTML = '';
    aiModelsFull.innerHTML = '';
    generatedPrompt.value = '';
    document.querySelector('.container').classList.remove('builder-mode');
    if (typingTimer) { clearInterval(typingTimer); generatedPrompt.classList.remove('typing'); }
  });
  btnGeneratePrompt.addEventListener('click', generatePrompt);
  btnCopyPrompt.addEventListener('click', copyToClipboard);
  btnClearBuilder.addEventListener('click', clearBuilder);

  /* =========================== SIDEBAR MODULE =========================== */
  const MENU_TOOLS = [
      { label: 'Codara Service Generator',    minRole: 'general',  link: 'https://arminsilatani.github.io/codara/', iconURL: 'assets/logos/Co.svg' },
      { label: 'Nolvo Sitemap Builder',       minRole: 'general',  link: '', iconURL: 'assets/logos/No.svg' },
      { label: 'Qerlo Shortener',             minRole: 'general',  link: '', iconURL: 'assets/logos/Qe.svg' },
      { label: 'Tivra Minify',                minRole: 'general',  link: '', iconURL: 'assets/logos/Ti.svg' },
      { label: 'Semora Schema Generator',     minRole: 'general',  link: '', iconURL: 'assets/logos/Se.svg' },
      { label: 'Brilo Speed Check',           minRole: 'general',  link: '', iconURL: 'assets/logos/Br.svg' },
      { label: 'Sorbi Robots Builder',        minRole: 'general',  link: '', iconURL: 'assets/logos/So.svg' },
      { label: 'Velto Meta Inspector',        minRole: 'general',  link: '', iconURL: 'assets/logos/Ve.svg' },
      { label: 'Zorio Image Converter',       minRole: 'recruit',  link: 'https://arminsilatani.github.io/zorio/', iconURL: 'assets/logos/Zo.svg' },
      { label: 'Galvo Video Converter',       minRole: 'general',  link: '', iconURL: 'assets/logos/Ga.svg' },
      { label: 'Xelpo Pass Generator',        minRole: 'general',  link: '', iconURL: 'assets/logos/Xe.svg' },
      { label: 'Dirmo DNS Checker',           minRole: 'general',  link: '', iconURL: 'assets/logos/Di.svg' },
      { label: 'Lemro Keyword Research',      minRole: 'general',  link: '', iconURL: 'assets/logos/Le.svg' },
      { label: 'Hirvo Density',               minRole: 'general',  link: '', iconURL: 'assets/logos/Hi.svg' },
      { label: 'Jorvi Redirect',              minRole: 'general',  link: '', iconURL: 'assets/logos/Jo.svg' },
      { label: 'Mirto CRM',                   minRole: 'general',  link: '', iconURL: 'assets/logos/Mi.svg' },
      { label: 'Ravlo Calendar',              minRole: 'sergeant', link: 'https://arminsilatani.github.io/ravlo/', iconURL: 'assets/logos/Ra.svg' },
      { label: 'Rinvo Accounting',            minRole: 'general',  link: '', iconURL: 'assets/logos/Ri.svg' },
      { label: 'Yelmo Brand Namer',           minRole: 'general',  link: '', iconURL: 'assets/logos/Ye.svg' },
      { label: 'Cedro Flashcards',            minRole: 'general',  link: '', iconURL: 'assets/logos/Ce.svg' },
      { label: 'Fresca Colors Tool',          minRole: 'general',  link: '', iconURL: 'assets/logos/Fr.svg' },
      { label: 'Ubiro Beer Cost',             minRole: 'general',  link: '', iconURL: 'assets/logos/Ub.svg' },
      { label: 'Refacto Code Beautifier',     minRole: 'general',  link: '', iconURL: 'assets/logos/Re.svg' },
      { label: 'Pilvo Text Editor',           minRole: 'recruit',  link: 'https://arminsilatani.github.io/pilvo/', iconURL: 'assets/logos/Pi.svg' },
      { label: 'Tavio Prompt Library',        minRole: 'recruit',  link: 'https://arminsilatani.github.io/tavio/', iconURL: 'assets/logos/Ta.svg' , isSelf: true },
      { label: 'Falco Favicon Generator',     minRole: 'recruit',  link: 'https://arminsilatani.github.io/falco/', iconURL: 'assets/logos/Fa.svg' },
      { label: 'Lume Epoch Converter',        minRole: 'recruit',  link: 'https://arminsilatani.github.io/lume/', iconURL: 'assets/logos/Lu.svg' },
      { label: 'Valeno Expiry Date Reminder', minRole: 'general',  link: '', iconURL: 'assets/logos/Va.svg' },
      { label: 'Alviano Recipe Manager',      minRole: 'general',  link: '', iconURL: 'assets/logos/Al.svg' },
      { label: 'Mavero Workout Tracker',      minRole: 'general',  link: '', iconURL: 'assets/logos/Ma.svg' },
      { label: 'Tempozio Time Tracker',       minRole: 'general',  link: '', iconURL: 'assets/logos/Te.svg' },
      { label: 'Belluno Wishlist',            minRole: 'general',  link: '', iconURL: 'assets/logos/Be.svg' },
      { label: 'Nuvello Wallpaper App',       minRole: 'general',  link: '', iconURL: 'assets/logos/Nu.svg' },
      { label: 'Fiora Period Tracker',        minRole: 'general',  link: '', iconURL: 'assets/logos/Fi.svg' }
  ];

  const ROLE_LEVELS = {
    'recruit': 0,
    'sergeant': 1,
    'commander': 2,
    'general': 3
  };

  function getRoleLevel(role) {
    return ROLE_LEVELS[role] ?? -1;
  }

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
      html += `
        <${tag} class="${classes}" ${hrefAttr}>
          <span class="sidebar-icon">
            <img src="${tool.iconURL}" alt="${tool.label}" onerror="this.style.display='none'" />
          </span>
          <span>${tool.label}</span>
          ${tooltipHtml}
        </${tag}>
      `;
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
    function openSidebar() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add('open');
      toggleBtn.classList.add('open');
      gsap.to(sidebar, { x: 0, duration: 0.5, ease: 'power3.out' });
    }
    function closeSidebar() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('open');
      toggleBtn.classList.remove('open');
      gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.in' });
    }
    toggleBtn.addEventListener('click', () => { isOpen ? closeSidebar() : openSidebar(); });
    closeRow.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closeSidebar(); });
  })();

  /* =========================== AUTH MODULE (RAVLO STYLE – profiles lookup) =========================== */
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
    [authStep1, authStep2Login, authStep2Reg, authStepForgot].forEach(s => {
      if (s) s.classList.add('hidden');
    });
    const stepEl = document.getElementById(stepId);
    if (stepEl) stepEl.classList.remove('hidden');
  }

  // Continue – بررسی وجود ایمیل در profiles
  if (authContinue) {
    authContinue.addEventListener('click', async () => {
      const email = authEmail.value.trim();
      if (!email) {
        authErrorEl.textContent = 'Please enter an email address.';
        return;
      }
      authErrorEl.textContent = '';

      try {
        const { data, error } = await sb
          .from('profiles')
          .select('id')
          .eq('email', email)
          .limit(1);

        if (error) {
          console.warn('Profiles check error:', error);
          // اگر کوئری شکست خورد (RLS یا مشکل موقت)، امن‌ترین کار رفتن به صفحه ورود است.
          authUserEmail.textContent = email;
          showStep('step-2-login');
          return;
        }

        if (data && data.length > 0) {
          // کاربر وجود دارد
          authUserEmail.textContent = email;
          showStep('step-2-login');
        } else {
          // کاربر جدید
          showStep('step-2-register');
        }
      } catch (err) {
        console.warn('Unexpected error during profiles check:', err);
        authUserEmail.textContent = email;
        showStep('step-2-login');
      }
    });
  }

  // Sign In
  if (authSignin) {
    authSignin.addEventListener('click', async () => {
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!password) {
        authErrorLogin.textContent = 'Password is required.';
        return;
      }
      authErrorLogin.textContent = '';
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        authErrorLogin.textContent = error.message;
        return;
      }
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
      if (!first || !last) {
        authErrorReg.textContent = 'Please fill in all fields.';
        return;
      }
      if (password.length < 6) {
        authErrorReg.textContent = 'Password must be at least 6 characters.';
        return;
      }
      if (password !== confirm) {
        authErrorReg.textContent = 'Passwords do not match.';
        return;
      }
      authErrorReg.textContent = '';
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: first, last_name: last }
        }
      });
      if (error) {
        authErrorReg.textContent = error.message;
        return;
      }
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
    authBackToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showStep('step-2-login');
    });
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
    authOverlay.addEventListener('click', (e) => {
      if (e.target === authOverlay) closeAuthOverlay();
    });
  }

  if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', () => openAuthOverlay());
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', async () => { await sb.auth.signOut(); });

  /* =========================== PROFILE & ROLE =========================== */
  let currentUserProfile = null;

  async function fetchProfile(userId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) {
      console.warn('Profile not found, using recruit fallback');
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
  if (loader) {
    loader.classList.add('hidden');
  }
});