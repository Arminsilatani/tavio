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

// ================== SYNC SIDEBAR (اصلاح شده) ==================
function syncSidebarComponent() {
    const comp = getSidebarComponent();
    if (!comp || typeof comp.setUser !== 'function') return;

    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    } else {
        comp.clearUser();
    }

    // مخفی کردن بخش Today/Overdue پیش‌فرض
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

// ================== TAVIO SIDEBAR NOTIFICATIONS ==================
async function loadTavioSidebarNotifications() {
    const container = document.getElementById('tavio-notif-list');
    if (!container || !currentUser) {
        if (container) container.innerHTML = '';
        return;
    }

    const { data: notifications } = await sb
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

    container.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `<p class="sidebar-empty-msg">هیچ اعلان جدیدی نیست</p>`;
        return;
    }

    notifications.forEach(notif => {
        const div = document.createElement('div');
        div.className = 'tavio-notif-item';
        div.innerHTML = `
            <div class="notif-title">${notif.title || 'اعلان'}</div>
            <div class="notif-body">${notif.body || ''}</div>
            <div class="notif-time">${new Date(notif.created_at).toLocaleDateString('fa-IR')}</div>
        `;
        container.appendChild(div);
    });
}

// ================== SIDEBAR ITEM LISTENERS ==================
function setupSidebarListeners() {
    const newPromptItem = document.getElementById('tavio-new-prompt-item');
    if (newPromptItem) {
        newPromptItem.addEventListener('click', () => {
            showNewPromptModal();
        });
    }
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
            await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
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
    // ... (کد auth listeners شما بدون تغییر باقی می‌ماند)
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

    // بقیه listenerهای auth (signin, register, forgot, toggle password و ...) بدون تغییر کپی کنید
    // برای کوتاه شدن اینجا فقط قسمتی مهم را گذاشتم، بقیه را از کد قبلی‌تان بچسبانید.
}

// ================== TAVIO PROMPT LOGIC ==================
// (تمام توابع renderPromptGrid, filter, detectVariables, generatePrompt و ... بدون تغییر)

function renderPromptGrid(filteredPrompts) { /* ... */ }
function filterPrompts() { /* ... */ }
function filterByCategory(cat) { /* ... */ }
function loadPromptIntoEditor(prompt) { /* ... */ }
function backToLibrary() { /* ... */ }
function detectVariables() { /* ... */ }
function updateVar(key, value) { /* ... */ }
function generatePrompt() { /* ... */ }
function copyPrompt() { /* ... */ }
function resetAll() { /* ... */ }

function showNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.remove('hidden');
    document.getElementById('modal-title').focus();
}

function hideNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.add('hidden');
}

function createNewPrompt() { /* ... */ }
function saveCurrentPrompt() { /* ... */ }

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListeners();

    customElements.whenDefined('sidebar-component').then(() => {
        getSidebarComponent();
        setupSidebarListeners();     // ← اتصال New Prompt
        syncSidebarComponent();
    });

    await restoreSession();
});