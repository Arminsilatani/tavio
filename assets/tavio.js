/*****************************************************
 *  Author: Armin Silatani
 *  Date: 2026-06-25
 *  Version: 3.0.3 (Fixed sidebar menu)
 ****************************************************
 */

/* =========================== SUPABASE CLIENT ============================ */
const SUPABASE_URL = 'https://vzqicidepdmraygulrey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kqRWgOmLISOE2EuLL1s8fw_WN6FJRTI';

let sb = null;

function getSupabaseClient() {
    if (!sb) {
        try {
            if (typeof createClient === 'function') {
                sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            } else if (typeof supabase !== 'undefined' && supabase.createClient) {
                sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            } else {
                console.warn('Supabase client not available');
                sb = null;
            }
        } catch (e) {
            console.error('Supabase init error:', e);
            sb = null;
        }
    }
    return sb;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Tavio: DOM loaded');

    const sbClient = getSupabaseClient();
    if (!sbClient) {
        console.error('Supabase client not available.');
        const loader = document.getElementById('initial-loader');
        if (loader) loader.classList.add('hidden');
        return;
    }

    /* =========================== GLOBAL STATE ============================ */
    let currentUser = null;
    let currentProfile = null;
    let currentUserRoleLevel = -1;
    let tavioPrompts = [];
    let tavioCategories = [];
    let tavioSharedPrompts = [];
    let editingPromptId = null;
    let currentFilterCategory = 'all';
    let currentSearchTerm = '';
    let typingTimer = null;
    let currentPromptId = null;

    /* =========================== ROLE SYSTEM ============================ */
    const ROLE_LEVELS = {
        'recruit': 0,
        'sergeant': 1,
        'commander': 2,
        'general': 3
    };

    function getRoleLevel(role) {
        return ROLE_LEVELS[role?.toLowerCase()] ?? -1;
    }

    /* =========================== AI MODELS ============================ */
    const ALL_AI_MODELS = [
        { id: 'gpt-5.4', name: 'Chat GPT 5.4', active: true },
        { id: 'gpt-5.3-codex', name: 'Chat GPT 5.3 Codex', active: true },
        { id: 'gpt-5.4-mini', name: 'Chat GPT 5.4 mini', active: true },
        { id: 'gpt-5.4-nano', name: 'Chat GPT 5.4 nano', active: true },
        { id: 'o4-mini', name: 'Chat GPT o4-mini', active: true },
        { id: 'o4-mini-high', name: 'Chat GPT o4 mini (high)', active: true },
        { id: 'gpt-image-1.5', name: 'Chat GPT Image 1.5', active: true },
        { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', active: true },
        { id: 'claude-4.5-haiku', name: 'Claude 4.5 Haiku', active: true },
        { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', active: true },
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash', active: true },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', active: true },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 pro', active: true },
        { id: 'nano-banana-2', name: 'Nano Banana 2', active: true },
        { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', active: true },
        { id: 'deepseek-r1', name: 'DeepSeek R1', active: true },
        { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', active: true },
        { id: 'deepseek-instant', name: 'DeepSeek Instant', active: true },
        { id: 'deepseek-instant-dt', name: 'DeepSeek Instant (DeepThink)', active: true },
        { id: 'deepseek-instant-s', name: 'DeepSeek Instant (Search)', active: true },
        { id: 'deepseek-instant-dt-s', name: 'DeepSeek Instant (DeepThink + Search)', active: true },
        { id: 'deepseek-expert', name: 'DeepSeek Expert', active: true },
        { id: 'deepseek-expert-dt', name: 'DeepSeek Expert (DeepThink)', active: true },
        { id: 'deepseek-expert-s', name: 'DeepSeek Expert (Search)', active: true },
        { id: 'deepseek-expert-dt-s', name: 'DeepSeek Expert (DeepThink + Search)', active: true },
        { id: 'deepseek-vision', name: 'DeepSeek Vision', active: true },
        { id: 'deepseek-vision-dt', name: 'DeepSeek Vision (DeepThink)', active: true },
        { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', active: true },
        { id: 'grok-4', name: 'Grok 4', active: true },
        { id: 'grok-3', name: 'Grok 3', active: true },
        { id: 'glm-5', name: 'GLM 5', active: true },
        { id: 'kimi-2.5', name: 'Kimi 2.5', active: true },
        { id: 'minimax-m2', name: 'Minimax M2', active: true },
        { id: 'perplexity', name: 'Perplexity', active: true },
        { id: 'qwen-3', name: 'Qwen 3', active: true },
        { id: 'qwen-3-coder', name: 'Qwen 3 Coder', active: true },
        { id: 'qwen-3-max', name: 'Qwen 3 Max', active: true },
        { id: 'copilot-thinkdeeper', name: 'Copilot (Think Deeper)', active: true },
        { id: 'copilot-smart', name: 'Copilot (Smart)', active: true },
        { id: 'copilot-learn&study', name: 'Copilot (Learn & Study)', active: true },
        { id: 'copilot-deepresearch', name: 'Copilot (Deep Research)', active: true },
        { id: 'copilot-search', name: 'Copilot (Search)', active: true },
        { id: 'gpt-5.5', name: 'Chat GPT 5.5', active: false },
        { id: 'gpt-5.4-pro', name: 'Chat GPT 5.4 Pro', active: false },
        { id: 'o3', name: 'Chat GPT o3', active: false },
        { id: 'o3-pro', name: 'Chat GPT o3 pro', active: false },
        { id: 'dalle-3', name: 'DALL-E 3', active: false },
        { id: 'gpt-image-2', name: 'Chat GPT Image 2', active: false },
        { id: 'sora-2', name: 'Sora 2', active: false },
        { id: 'claude-4.7-opus', name: 'Claude 4.7 Opus', active: false },
        { id: 'nano-banana-pro', name: 'Nano Banana Pro', active: false },
        { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', active: false },
        { id: 'veo-3.1', name: 'Veo 3.1', active: false },
        { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', active: false },
        { id: 'imagen-4', name: 'Imagen 4', active: false },
        { id: 'grok-3-thinking', name: 'Grok 3 Thinking', active: false },
    ];

    const getAiName = (id) => {
        const model = ALL_AI_MODELS.find(m => m.id === id);
        return model ? model.name : id;
    };

    /* =========================== DOM REFS ============================ */
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
    const generatedPrompt = document.getElementById('generatedPrompt');
    const btnCopyPrompt = document.getElementById('btnCopyPrompt');
    const btnClearBuilder = document.getElementById('btnClearBuilder');
    const aiModelsFull = document.getElementById('aiModelsFull');
    const promptDescription = document.getElementById('promptDescription');

    const sidebarLoginBtn = document.getElementById('sidebar-login');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout');
    const sidebarDashboard = document.getElementById('sidebar-dashboard');
    const sidebarMenuItems = document.getElementById('sidebar-menu-items');
    const avatarContent = document.querySelector('.avatar-content');
    const notifDot = document.getElementById('avatar-notif-dot');

    /* =========================== UTILITY ============================ */
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const getAllCategories = () => {
        const cats = new Set();
        tavioPrompts.forEach(p => (p.categories || []).forEach(c => cats.add(c)));
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

    const sortPrompts = (list) => {
        return [...list].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
    };

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'ravlo-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    /* =========================== SUPABASE CRUD OPERATIONS ============================ */
    // ... (همان توابع قبلی، برای اختصار حذف شده‌اند، ولی در فایل اصلی باید باشند)

    /* =========================== RENDER FUNCTIONS ============================ */
    function renderCategoryFilters() { /* ... */ }
    function renderLibrary() { /* ... */ }
    function renderAll() { /* ... */ }
    function updateCategoryDatalist() { /* ... */ }

    /* =========================== SIDEBAR MENU ============================ */
    const MENU_TOOLS = [
        { label: 'Codara Service Generator', minRole: 'general', link: 'https://arminsilatani.github.io/codara/', iconURL: 'assets/logos/Co.svg' },
        { label: 'Nolvo Sitemap Builder', minRole: 'general', link: '', iconURL: 'assets/logos/No.svg' },
        { label: 'Qerlo Shortener', minRole: 'general', link: '', iconURL: 'assets/logos/Qe.svg' },
        { label: 'Tivra Minify', minRole: 'general', link: '', iconURL: 'assets/logos/Ti.svg' },
        { label: 'Semora Schema Generator', minRole: 'general', link: '', iconURL: 'assets/logos/Se.svg' },
        { label: 'Brilo Speed Check', minRole: 'general', link: '', iconURL: 'assets/logos/Br.svg' },
        { label: 'Sorbi Robots Builder', minRole: 'general', link: '', iconURL: 'assets/logos/So.svg' },
        { label: 'Velto Meta Inspector', minRole: 'general', link: '', iconURL: 'assets/logos/Ve.svg' },
        { label: 'Zorio Image Converter', minRole: 'recruit', link: 'https://arminsilatani.github.io/zorio/', iconURL: 'assets/logos/Zo.svg' },
        { label: 'Galvo Video Converter', minRole: 'general', link: '', iconURL: 'assets/logos/Ga.svg' },
        { label: 'Xelpo Pass Generator', minRole: 'general', link: '', iconURL: 'assets/logos/Xe.svg' },
        { label: 'Dirmo DNS Checker', minRole: 'general', link: '', iconURL: 'assets/logos/Di.svg' },
        { label: 'Lemro Keyword Research', minRole: 'general', link: '', iconURL: 'assets/logos/Le.svg' },
        { label: 'Hirvo Density', minRole: 'general', link: '', iconURL: 'assets/logos/Hi.svg' },
        { label: 'Jorvi Redirect', minRole: 'general', link: '', iconURL: 'assets/logos/Jo.svg' },
        { label: 'Mirto CRM', minRole: 'general', link: '', iconURL: 'assets/logos/Mi.svg' },
        { label: 'Ravlo Calendar', minRole: 'sergeant', link: 'https://arminsilatani.github.io/ravlo/', iconURL: 'assets/logos/Ra.svg' },
        { label: 'Rinvo Accounting', minRole: 'general', link: '', iconURL: 'assets/logos/Ri.svg' },
        { label: 'Yelmo Brand Namer', minRole: 'general', link: '', iconURL: 'assets/logos/Ye.svg' },
        { label: 'Cedro Flashcards', minRole: 'general', link: '', iconURL: 'assets/logos/Ce.svg' },
        { label: 'Fresca Colors Tool', minRole: 'general', link: '', iconURL: 'assets/logos/Fr.svg' },
        { label: 'Ubiro Beer Cost', minRole: 'general', link: '', iconURL: 'assets/logos/Ub.svg' },
        { label: 'Refacto Code Beautifier', minRole: 'general', link: '', iconURL: 'assets/logos/Re.svg' },
        { label: 'Pilvo Text Editor', minRole: 'recruit', link: 'https://arminsilatani.github.io/pilvo/', iconURL: 'assets/logos/Pi.svg' },
        { label: 'Tavio Prompt Library', minRole: 'recruit', link: 'https://arminsilatani.github.io/tavio/', iconURL: 'assets/logos/Ta.svg', isSelf: true },
        { label: 'Falco Favicon Generator', minRole: 'recruit', link: 'https://arminsilatani.github.io/falco/', iconURL: 'assets/logos/Fa.svg' },
        { label: 'Lume Epoch Converter', minRole: 'recruit', link: 'https://arminsilatani.github.io/lume/', iconURL: 'assets/logos/Lu.svg' },
        { label: 'Valeno Expiry Date Reminder', minRole: 'general', link: '', iconURL: 'assets/logos/Va.svg' },
        { label: 'Alviano Recipe Manager', minRole: 'general', link: '', iconURL: 'assets/logos/Al.svg' },
        { label: 'Mavero Workout Tracker', minRole: 'general', link: '', iconURL: 'assets/logos/Ma.svg' },
        { label: 'Tempozio Time Tracker', minRole: 'general', link: '', iconURL: 'assets/logos/Te.svg' },
        { label: 'Belluno Wishlist', minRole: 'general', link: '', iconURL: 'assets/logos/Be.svg' },
        { label: 'Nuvello Wallpaper App', minRole: 'general', link: '', iconURL: 'assets/logos/Nu.svg' },
        { label: 'Fiora Period Tracker', minRole: 'general', link: '', iconURL: 'assets/logos/Fi.svg' }
    ];

    function renderSidebarMenu() {
        console.log('renderSidebarMenu called, currentUser:', currentUser);
        console.log('currentProfile:', currentProfile);

        if (!sidebarMenuItems) {
            console.error('sidebar-menu-items not found in DOM');
            return;
        }

        // اگر کاربر وارد نشده، پیام لاگین نمایش بده
        if (!currentUser) {
            sidebarMenuItems.innerHTML = `
                <div style="padding: 12px 16px; color: #888; font-size: 13px;">
                    Please sign in to see tools.
                </div>
            `;
            return;
        }

        sidebarMenuItems.innerHTML = '';

        const role = currentProfile?.role || 'recruit';
        console.log('User role:', role);

        MENU_TOOLS.forEach(tool => {
            if (tool.isSelf) return;
            const allowed = getRoleLevel(role) >= getRoleLevel(tool.minRole);
            const btn = document.createElement('button');
            btn.className = 'sidebar-item' + (allowed ? '' : ' disabled');
            btn.disabled = !allowed;
            btn.innerHTML = `
                <span class="sidebar-icon">
                    <img src="${tool.iconURL}" width="20" height="20" alt="${tool.label}">
                </span>
                <span>${tool.label}</span>
                ${!tool.link ? '<span class="coming-soon-tooltip">Soon</span>' : ''}
            `;
            btn.addEventListener('click', () => {
                if (!currentUser) {
                    openAuthOverlay();
                    document.getElementById('auth-error').textContent = 'Please sign in to use this tool.';
                    return;
                }
                if (!allowed) {
                    showToast('Your access level is too low to use this tool.');
                    return;
                }
                if (tool.link) window.open(tool.link, '_blank');
                document.getElementById('sidebar-close-row')?.click();
            });
            sidebarMenuItems.appendChild(btn);
        });

        console.log('Sidebar menu rendered with', MENU_TOOLS.filter(t => !t.isSelf).length, 'items');
    }

    /* =========================== SIDEBAR TOGGLE ============================ */
    (function() {
        const toggleBtn = document.getElementById('menu-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const closeRow = document.getElementById('sidebar-close-row');
        if (!toggleBtn || !sidebar || !overlay || !closeRow) return;

        let isOpen = false;

        function openSidebar() {
            if (isOpen) return;
            isOpen = true;
            overlay.classList.add('open');
            toggleBtn.classList.add('open');
            if (typeof gsap !== 'undefined') {
                gsap.to(sidebar, { x: 0, duration: 0.5, ease: 'power3.out' });
            } else {
                sidebar.style.transform = 'translateX(0)';
            }
        }

        function closeSidebar() {
            if (!isOpen) return;
            isOpen = false;
            overlay.classList.remove('open');
            toggleBtn.classList.remove('open');
            if (typeof gsap !== 'undefined') {
                gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.in' });
            } else {
                sidebar.style.transform = 'translateX(-100%)';
            }
        }

        toggleBtn.addEventListener('click', () => { isOpen ? closeSidebar() : openSidebar(); });
        closeRow.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closeSidebar(); });
    })();

    /* =========================== AUTH ============================ */
    // ... (همان توابع قبلی، برای اختصار حذف شده‌اند، ولی باید در فایل اصلی باشند)

    /* =========================== PROFILE ============================ */
    async function fetchProfile(userId) {
        try {
            const { data, error } = await sbClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !data) {
                const { data: { user } } = await sbClient.auth.getUser();
                const md = user?.user_metadata || {};
                return {
                    id: userId,
                    role: md.role || 'recruit',
                    first_name: md.first_name || '',
                    last_name: md.last_name || '',
                    photo_url: md.photo_url || '',
                    email: user?.email || ''
                };
            }
            return data;
        } catch (e) {
            console.warn('Profile fetch error:', e);
            return { id: userId, role: 'recruit', first_name: '', last_name: '', photo_url: '' };
        }
    }

    async function applyUserProfile(user) {
        console.log('applyUserProfile called with user:', user);

        if (!user) {
            currentUser = null;
            currentProfile = null;
            currentUserRoleLevel = -1;
            setLoggedOutUI();
            return;
        }

        currentUser = user;
        if (!currentProfile || currentProfile.id !== user.id) {
            currentProfile = await fetchProfile(user.id);
        }

        const profile = currentProfile;
        const role = profile.role || 'recruit';

        // Update UI elements
        if (sidebarLoginBtn) sidebarLoginBtn.classList.add('hidden');
        if (sidebarLogoutBtn) sidebarLogoutBtn.classList.remove('hidden');
        if (sidebarDashboard) sidebarDashboard.classList.remove('hidden');

        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email || 'Dashboard';
        const dashboardTextEl = document.querySelector('.sidebar-dashboard-text');
        if (dashboardTextEl) dashboardTextEl.textContent = fullName;

        if (avatarContent) {
            if (profile.photo_url) {
                avatarContent.innerHTML = `<img src="${profile.photo_url}" alt="Profile" width="20" height="20" style="border-radius:50%; object-fit:cover;" onerror="this.outerHTML='<span class=\\'avatar-initial\\'>${fullName.charAt(0).toUpperCase()}</span>';">`;
            } else {
                avatarContent.innerHTML = `<span class="avatar-initial">${fullName.charAt(0).toUpperCase()}</span>`;
            }
        }

        if (notifDot) notifDot.style.display = 'none';

        currentUserRoleLevel = getRoleLevel(role);
        console.log('User role level:', currentUserRoleLevel);

        // Render sidebar menu AFTER user is set
        renderSidebarMenu();

        // Load data
        await fetchTavioCategories();
        await fetchTavioPrompts();
        await fetchSharedPrompts();
        renderAll();
    }

    function setLoggedOutUI() {
        console.log('setLoggedOutUI called');
        if (sidebarLoginBtn) sidebarLoginBtn.classList.remove('hidden');
        if (sidebarLogoutBtn) sidebarLogoutBtn.classList.add('hidden');
        if (sidebarDashboard) sidebarDashboard.classList.add('hidden');
        if (avatarContent) avatarContent.textContent = '';
        currentUser = null;
        currentProfile = null;
        currentUserRoleLevel = -1;
        tavioPrompts = [];
        tavioCategories = [];
        tavioSharedPrompts = [];
        renderSidebarMenu();
        renderAll();
    }

    /* =========================== AUTH STATE ============================ */
    async function checkUser() {
        try {
            const { data: { session } } = await sbClient.auth.getSession();
            await applyUserProfile(session?.user ?? null);
        } catch (e) {
            console.warn('Session check error:', e);
            setLoggedOutUI();
        }
    }

    sbClient.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);
        await applyUserProfile(session?.user ?? null);
        if (event === 'SIGNED_IN') {
            closeAuthOverlay();
            showToast('Signed in successfully!');
        }
        if (event === 'SIGNED_OUT') {
            setLoggedOutUI();
            showToast('Signed out.');
        }
    });

    /* =========================== INIT ============================ */
    async function initApp() {
        console.log('Tavio: Initializing...');
        const loader = document.getElementById('initial-loader');

        // Hide loader after 3 seconds anyway (safety net)
        const timeoutId = setTimeout(() => {
            if (loader) loader.classList.add('hidden');
            console.log('Tavio: Loader hidden (timeout)');
        }, 3000);

        try {
            await checkUser();
            // If everything loaded, hide loader
            if (loader) loader.classList.add('hidden');
            clearTimeout(timeoutId);
        } catch (e) {
            console.error('Init error:', e);
            if (loader) loader.classList.add('hidden');
            clearTimeout(timeoutId);
        }
        console.log('Tavio: Initialization complete.');
    }

    initApp();
});