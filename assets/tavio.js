// ================== CONFIG ==================
const SUPABASE_URL = 'https://vzqicidepdmraygulrey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kqRWgOmLISOE2EuLL1s8fw_WN6FJRTI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================== STATE ==================
let currentUser = null;
let currentProfile = null;
let currentUserRole = 'public';
let sidebarComponent = null;

// Original prompts
let prompts = [
    { id: 1, title: "Story Writer", category: "writing", template: "Write an engaging short story about {{character}} who lives in {{setting}}. The main conflict involves {{conflict}}." },
    { id: 2, title: "Code Explainer", category: "coding", template: "Explain this {{language}} code snippet in simple terms: {{code}}" },
    { id: 3, title: "Email Marketer", category: "marketing", template: "Write a cold outreach email for {{product}} targeting {{audience}}. Highlight the key benefit: {{benefit}}." },
    { id: 4, title: "Business Idea Validator", category: "business", template: "Evaluate this business idea: {{idea}}. Provide pros, cons, and market potential." }
];

let currentPrompt = null;
let currentVariables = {};

// ================== HELPERS ==================
function showGlobalLoader() {
    document.getElementById('initial-loader').style.display = 'flex';
}
function hideGlobalLoader() {
    document.getElementById('initial-loader').style.display = 'none';
}
function openModal(modal) {
    modal.style.display = 'flex';
}
function closeModal(modal) {
    modal.style.display = 'none';
}
function showStep(stepId) {
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

// ================== SIDEBAR ==================
function getSidebarComponent() {
    if (!sidebarComponent) {
        sidebarComponent = document.querySelector('sidebar-component');
        if (sidebarComponent) {
            sidebarComponent.addEventListener('login-request', () => {
                openModal(document.getElementById('auth-overlay'));
            });
            sidebarComponent.addEventListener('logout-request', () => {
                logout();
            });
        }
    }
    return sidebarComponent;
}

// ================== PROFILE ==================
async function buildCurrentProfile(user) {
    const { data: profileRow } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const md = user.user_metadata || {};
    return {
        id: user.id,
        first_name: profileRow?.first_name ?? md.first_name ?? '',
        last_name: profileRow?.last_name ?? md.last_name ?? '',
        photo_url: profileRow?.photo_url ?? md.photo_url ?? '',
        username: profileRow?.username ?? md.username ?? '',
        role: profileRow?.role ?? md.role ?? 'recruit'
    };
}

// ================== SYNC SIDEBAR ==================
function injectCustomSidebarContent() {
    const comp = getSidebarComponent();
    if (!comp || !comp.shadowRoot) return;

    // حذف محتوای قبلی اگر وجود دارد
    const oldContent = comp.shadowRoot.getElementById('tavio-custom-content');
    if (oldContent) oldContent.remove();

    // ایجاد محتوای جدید
    const container = document.createElement('div');
    container.id = 'tavio-custom-content';
    container.innerHTML = `
        <style>
            #tavio-custom-content {
                padding: 0 4px;
                margin-top: 16px;
                font-family: "Kalameh", sans-serif;
                color: var(--text, #f5f5f5);
            }
            .tavio-new-prompt-btn {
                background: var(--accent, #B0FFA5);
                color: #111;
                width: 100%;
                padding: 10px 14px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: background 0.2s;
                margin-bottom: 20px;
                border: none;
                font-family: inherit;
                display: block;
            }
            .tavio-new-prompt-btn:hover {
                background: #c8ffbe;
            }
            .tavio-section-header {
                font-size: 11px;
                text-transform: uppercase;
                color: #777;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
            }
            .tavio-notif-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .tavio-empty-msg {
                color: #555;
                font-size: 13px;
                margin: 0;
            }
            .tavio-notif-item {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 13px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .tavio-notif-item:hover {
                background: rgba(255,255,255,0.06);
            }
            .tavio-notif-item .notif-title {
                font-weight: 600;
                color: #ddd;
                margin-bottom: 4px;
            }
            .tavio-notif-item .notif-body {
                color: #aaa;
                font-size: 12px;
                line-height: 1.4;
            }
            .tavio-notif-item .notif-time {
                font-size: 10px;
                color: #666;
                margin-top: 6px;
            }
        </style>
        <button id="tavio-new-prompt-btn" class="tavio-new-prompt-btn">+ New Prompt</button>
        <div class="tavio-section-header">Shared Prompts</div>
        <div id="tavio-notif-list" class="tavio-notif-list">
            <p class="tavio-empty-msg">No shared prompts yet</p>
        </div>
    `;

    // اضافه کردن به انتهای shadow root (قبل از دکمه logout یا بعد از بخش today که پنهان می‌کنیم)
    comp.shadowRoot.appendChild(container);

    // اتصال رویداد دکمه
    const newPromptBtn = container.querySelector('#tavio-new-prompt-btn');
    if (newPromptBtn) {
        newPromptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNewPromptModal();
            // بستن سایدبار
            const overlay = comp.shadowRoot.getElementById('sidebar-overlay');
            if (overlay) overlay.click();
        });
    }
}

function syncSidebarComponent() {
    const comp = getSidebarComponent();
    if (!comp || typeof comp.setUser !== 'function') return;

    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    } else {
        comp.clearUser();
    }

    // مخفی‌کردن بخش Today/Overdue پیش‌فرض
    if (comp.shadowRoot) {
        const todayList = comp.shadowRoot.getElementById('sidebar-today-list');
        if (todayList) {
            let section = todayList.closest('.sidebar-section') || todayList.parentElement;
            if (section) section.style.display = 'none';
        }
    }

    comp.setTodayList([], []);
    comp.setEvents([]);
    updateNotificationDot();
    loadTavioSidebarNotifications();

    // تزریق محتوای سفارشی (بعد از اینکه shadow root آماده شد)
    injectCustomSidebarContent();
}

async function updateNotificationDot() {
    const comp = getSidebarComponent();
    if (!comp) return;
    let hasNotifications = false;
    if (currentUser) {
        const { data } = await sb
            .from('notifications')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('is_read', false)
            .limit(1);
        if (data && data.length > 0) hasNotifications = true;
    }
    comp.setNotificationDot(hasNotifications);
}

// ================== AUTH ==================
async function logout() {
    await sb.auth.signOut();
    currentUser = null;
    currentProfile = null;
    currentUserRole = 'public';
    syncSidebarComponent();

    document.getElementById('app-container').classList.add('app-hidden');
    const authOverlay = document.getElementById('auth-overlay');
    authOverlay.querySelector('#auth-email').value = '';
    authOverlay.querySelector('#auth-password-login').value = '';
    authOverlay.querySelector('#auth-password-register').value = '';
    showStep('step-1');
    openModal(authOverlay);
}

async function restoreSession() {
    showGlobalLoader();

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    if (accessToken && refreshToken) {
        try {
            await sb.auth.setSession({ access_token, refresh_token });
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        currentProfile = await buildCurrentProfile(currentUser);
        currentUserRole = currentProfile?.role || 'recruit';
        document.getElementById('app-container').classList.remove('app-hidden');
        closeModal(document.getElementById('auth-overlay'));

        await customElements.whenDefined('sidebar-component');
        syncSidebarComponent();

        renderPromptGrid(prompts);
        filterByCategory('all');
    } else {
        document.getElementById('app-container').classList.add('app-hidden');
        openModal(document.getElementById('auth-overlay'));
        showStep('step-1');
    }
    hideGlobalLoader();
}

// ================== AUTH LISTENERS ==================
function setupAuthListeners() {
    const authOverlay = document.getElementById('auth-overlay');

    document.getElementById('auth-continue-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value.trim();
        if (!email) {
            document.getElementById('auth-error-1').style.display = 'block';
            document.getElementById('auth-error-1').textContent = 'Please enter your email.';
            return;
        }
        document.getElementById('login-email-display').textContent = email;
        document.getElementById('register-email-display').textContent = email;
        showStep('step-2-login');
        document.getElementById('auth-error-1').style.display = 'none';
    });

    document.getElementById('auth-signin-btn').addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password-login').value;
        document.getElementById('auth-error-login').style.display = 'none';
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            document.getElementById('auth-error-login').textContent = error.message;
            document.getElementById('auth-error-login').style.display = 'block';
            return;
        }
        currentUser = data.user;
        currentProfile = await buildCurrentProfile(data.user);
        currentUserRole = currentProfile?.role || 'recruit';
        closeModal(authOverlay);
        document.getElementById('app-container').classList.remove('app-hidden');

        await customElements.whenDefined('sidebar-component');
        syncSidebarComponent();

        renderPromptGrid(prompts);
        filterByCategory('all');
    });

    document.getElementById('auth-register-btn').addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password-register').value;
        const firstName = document.getElementById('auth-first-name').value.trim();
        const lastName = document.getElementById('auth-last-name').value.trim();
        document.getElementById('auth-error-register').style.display = 'none';
        if (password.length < 6) {
            document.getElementById('auth-error-register').textContent = 'Password must be at least 6 characters.';
            document.getElementById('auth-error-register').style.display = 'block';
            return;
        }
        const { error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: { first_name: firstName, last_name: lastName },
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) {
            document.getElementById('auth-error-register').textContent = error.message;
            document.getElementById('auth-error-register').style.display = 'block';
            return;
        }
        alert('Registration successful! Please check your email to confirm your account.');
        closeModal(authOverlay);
    });

    document.getElementById('auth-back-to-email').addEventListener('click', () => showStep('step-1'));
    document.getElementById('auth-back-to-email-2').addEventListener('click', () => showStep('step-2-register'));

    document.getElementById('forgot-link').addEventListener('click', (e) => {
        e.preventDefault();
        showStep('step-forgot');
        document.getElementById('forgot-email').value = document.getElementById('auth-email').value.trim();
    });

    document.getElementById('auth-reset-btn').addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value.trim();
        if (!email) return;
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        const msg = document.getElementById('forgot-message');
        msg.style.display = 'block';
        if (error) {
            msg.textContent = error.message;
            msg.style.color = '#ff5555';
        } else {
            msg.textContent = 'Reset link sent! Check your email.';
            msg.style.color = 'var(--accent)';
        }
    });
    document.getElementById('auth-back-to-login').addEventListener('click', () => showStep('step-2-login'));
}

// ================== TAVIO SIDEBAR NOTIFICATIONS ==================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadTavioSidebarNotifications() {
    if (!currentUser) return;
    const comp = getSidebarComponent();
    if (!comp || !comp.shadowRoot) return;
    const listContainer = comp.shadowRoot.getElementById('tavio-notif-list');
    if (!listContainer) return;

    const { data, error } = await sb
        .from('notifications')
        .select('id, title, body, created_at, is_read')
        .eq('user_id', currentUser.id)
        .eq('type', 'prompt_share')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Failed to load Tavio notifications:', error);
        return;
    }

    if (!data || data.length === 0) {
        listContainer.innerHTML = '<p class="tavio-empty-msg">No shared prompts yet</p>';
        return;
    }

    listContainer.innerHTML = data.map(notif => {
        const time = new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `
            <div class="tavio-notif-item" data-notif-id="${notif.id}">
                <div class="notif-title">${escapeHtml(notif.title) || 'Shared Prompt'}</div>
                <div class="notif-body">${escapeHtml(notif.body) || ''}</div>
                <div class="notif-time">${time}</div>
            </div>
        `;
    }).join('');

    // رویداد کلیک روی اعلان‌ها
    listContainer.querySelectorAll('.tavio-notif-item').forEach(item => {
        item.addEventListener('click', () => {
            const notifId = item.dataset.notifId;
            console.log('Notification clicked:', notifId);
            // بستن سایدبار
            const overlay = comp.shadowRoot.getElementById('sidebar-overlay');
            if (overlay) overlay.click();
        });
    });
}

// ================== TAVIO PROMPT LOGIC ==================
// (بدون تغییر باقی می‌ماند)
function renderPromptGrid(filteredPrompts) {
    const grid = document.getElementById('prompt-grid');
    if (!grid) return;
    grid.innerHTML = '';
    filteredPrompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <span class="category">${prompt.category}</span>
            <h4>${prompt.title}</h4>
            <p>${prompt.template.substring(0, 110)}...</p>
        `;
        card.onclick = () => loadPromptIntoEditor(prompt);
        grid.appendChild(card);
    });
}

function filterPrompts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const activeCat = document.querySelector('.category-chip.active')?.id?.replace('cat-', '') || 'all';
    let filtered = prompts;
    if (searchTerm) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm) || p.template.toLowerCase().includes(searchTerm));
    }
    if (activeCat !== 'all') {
        filtered = filtered.filter(p => p.category === activeCat);
    }
    renderPromptGrid(filtered);
}

function filterByCategory(cat) {
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.toggle('active', chip.id === `cat-${cat}`);
    });
    filterPrompts();
}

function loadPromptIntoEditor(prompt) {
    currentPrompt = {...prompt};
    document.getElementById('library-view').classList.remove('active');
    document.getElementById('editor-view').classList.add('active');
    document.getElementById('current-prompt-title').textContent = prompt.title;
    document.getElementById('template-textarea').value = prompt.template;
    detectVariables();
}

function backToLibrary() {
    document.getElementById('editor-view').classList.remove('active');
    document.getElementById('library-view').classList.add('active');
    resetAll();
}

function detectVariables() {
    const template = document.getElementById('template-textarea').value;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    const vars = new Set();
    while ((match = regex.exec(template)) !== null) {
        vars.add(match[1].trim());
    }
    currentVariables = {};
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    if (vars.size === 0) {
        container.innerHTML = `<p style="color:#666; grid-column:1/-1;">No {{variables}} detected. Add some to your template.</p>`;
        return;
    }
    vars.forEach(v => {
        currentVariables[v] = '';
        const div = document.createElement('div');
        div.className = 'variable-field';
        div.innerHTML = `
            <label>${v}</label>
            <input type="text" id="var-${v}" placeholder="Enter ${v}" oninput="updateVar('${v}', this.value)">
        `;
        container.appendChild(div);
    });
}

function updateVar(key, value) {
    currentVariables[key] = value;
}

function generatePrompt() {
    let filled = document.getElementById('template-textarea').value;
    Object.keys(currentVariables).forEach(key => {
        const val = currentVariables[key] || `[${key}]`;
        filled = filled.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });
    const display = document.getElementById('result-display');
    display.textContent = '';
    document.getElementById('result-actions').classList.add('hidden');
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < filled.length) {
            display.textContent += filled.charAt(i);
            i++;
            display.scrollTop = display.scrollHeight;
        } else {
            clearInterval(typeInterval);
            document.getElementById('result-actions').classList.remove('hidden');
        }
    }, 12);
}

function copyPrompt() {
    const text = document.getElementById('result-display').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy');
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = original, 1800);
    });
}

function resetAll() {
    document.getElementById('result-display').textContent = '';
    document.getElementById('result-actions').classList.add('hidden');
    document.getElementById('variables-container').innerHTML = '';
    currentVariables = {};
}

function showNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.remove('hidden');
    document.getElementById('modal-title').focus();
}
function hideNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.add('hidden');
}
function createNewPrompt() {
    const title = document.getElementById('modal-title').value.trim();
    const category = document.getElementById('modal-category').value;
    const template = document.getElementById('modal-template').value.trim();
    if (!title || !template) {
        alert("Title and template are required.");
        return;
    }
    const newPrompt = { id: Date.now(), title, category, template };
    prompts.unshift(newPrompt);
    hideNewPromptModal();
    document.getElementById('modal-title').value = '';
    document.getElementById('modal-template').value = '';
    filterPrompts();
    loadPromptIntoEditor(newPrompt);
}
function saveCurrentPrompt() {
    if (!currentPrompt) return;
    const template = document.getElementById('template-textarea').value.trim();
    if (!template) return;
    currentPrompt.template = template;
    const index = prompts.findIndex(p => p.id === currentPrompt.id);
    if (index !== -1) prompts[index] = currentPrompt;
    else prompts.unshift(currentPrompt);
    alert("Prompt saved to library!");
    filterPrompts();
}

// بستن سایدبار از بیرون (کمکی)
window.ravloCloseSidebar = function() {
    const sidebar = document.querySelector('sidebar-component');
    if (sidebar?.shadowRoot) {
        const overlay = sidebar.shadowRoot.getElementById('sidebar-overlay');
        if (overlay) overlay.click();
    }
};

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListeners();

    // Wait for sidebar component to be defined before interacting
    customElements.whenDefined('sidebar-component').then(() => {
        getSidebarComponent();       // attach listeners
        syncSidebarComponent();      // show logged‑out state
    });

    await restoreSession();         // check if already logged in
});