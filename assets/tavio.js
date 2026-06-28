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
function syncSidebarComponent() {
    const comp = getSidebarComponent();
    if (!comp || typeof comp.setUser !== 'function') return;

    // فقط در صورت وجود کاربر اطلاعات را ارسال کن (در غیر این صورت slot دست‌نخورده می‌ماند)
    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    }
    // حذف clearUser() تا محتوای slot پاک نشود

    // مخفی‌سازی بخش Today/Overdue پیش‌فرض (در صورت وجود)
    if (comp.shadowRoot) {
        const todayList = comp.shadowRoot.getElementById('sidebar-today-list');
        if (todayList) {
            const section = todayList.closest('.sidebar-section') || todayList.parentElement;
            if (section) section.style.display = 'none';
        }
    }

    comp.setTodayList([], []);
    comp.setEvents([]);
    updateNotificationDot();

    if (typeof loadTavioSidebarNotifications === 'function') {
        loadTavioSidebarNotifications();
    }
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
    syncSidebarComponent();   // حالا فقط در صورت لاگین بودن setUser می‌شود، slot حفظ می‌شود

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

    // Password visibility toggle
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.getAttribute('data-target');
            const input = document.getElementById(inputId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const svg = btn.querySelector('svg');
            if (isPassword) {
                svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
            } else {
                svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
            }
        });
    });
}

// ================== TAVIO PROMPT LOGIC ==================
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
    const activeCat = document.querySelector('.category-chip.active')?.dataset.category || 'all';
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
        chip.classList.toggle('active', chip.dataset.category === cat);
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

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('initial-loader').classList.add('hidden');
    }, 800);
});

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListeners();

    // صبر کن تا کامپوننت sidebar تعریف شود
    await customElements.whenDefined('sidebar-component');
    getSidebarComponent();   // لیسنرهای login/logout

    // ابتدا نشست را بازیابی کن (اگر کاربر لاگین باشد currentUser تنظیم می‌شود)
    await restoreSession();

    // حالا sidebar را فقط در صورت لاگین بودن همگام کن
    if (currentUser) {
        syncSidebarComponent();
    }

    // اتصال دکمه New Prompt در sidebar
    const newPromptBtn = document.getElementById('tavio-new-prompt-item');
    if (newPromptBtn) {
        newPromptBtn.addEventListener('click', () => {
            if (!currentUser) return;   // اگر کاربر لاگین نکرده باشد، هیچ اتفاقی نیفتد
            showNewPromptModal();
        });
    }
});