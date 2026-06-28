// ================== CONFIGURATION ==================
const SUPABASE_URL = 'https://vzqicidepdmraygulrey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kqRWgOmLISOE2EuLL1s8fw_WN6FJRTI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================== GLOBAL STATE ==================
let currentUser = null;
let currentProfile = null;
let currentUserRole = 'public';
let sidebarComponent = null;

// Original prompts
let prompts = [ /* ... same as before ... */ ];

let currentPrompt = null;
let currentVariables = {};

// ================== LOADER & MODAL HELPERS ==================
function showGlobalLoader() { document.getElementById('initial-loader').style.display = 'flex'; }
function hideGlobalLoader() { document.getElementById('initial-loader').style.display = 'none'; }
function openModal(modal) { modal.style.display = 'flex'; }
function closeModal(modal) { modal.style.display = 'none'; }
function showStep(stepId) {
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

// ================== SIDEBAR ACCESS ==================
function getSidebarComponent() {
    if (!sidebarComponent) {
        sidebarComponent = document.querySelector('sidebar-component');
        if (sidebarComponent) {
            // گوش دادن به رویدادهای سایدبار
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

// ================== SIDEBAR SYNC ==================
function syncSidebarComponent() {
    const comp = getSidebarComponent();
    if (!comp) return;
    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    } else {
        comp.clearUser();
    }
    comp.setTodayList([], []);
    comp.setEvents([]);
    updateNotificationDot();
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
        if (data?.length > 0) hasNotifications = true;
    }
    comp.setNotificationDot(hasNotifications);
}

// ================== AUTH FUNCTIONS ==================
async function logout() {
    await sb.auth.signOut();
    currentUser = null;
    currentProfile = null;
    currentUserRole = 'public';
    syncSidebarComponent();
    document.getElementById('app-container').classList.add('app-hidden');
    const authOverlay = document.getElementById('auth-overlay');
    // پاک‌سازی فیلدها
    authOverlay.querySelector('#auth-email').value = '';
    authOverlay.querySelector('#auth-password-login').value = '';
    authOverlay.querySelector('#auth-password-register').value = '';
    showStep('step-1');
    openModal(authOverlay);
}

async function restoreSession() {
    showGlobalLoader();
    // ابتدا توکن‌های URL را چک کن (برای بازگشت از ایمیل تأیید)
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

// ================== AUTH EVENT LISTENERS (ساده‌شده) ==================
function setupAuthListeners() {
    const authOverlay = document.getElementById('auth-overlay');

    // Continue button → مستقیم به فرم ورود (همراه با لینک ثبت‌نام)
    document.getElementById('auth-continue-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value.trim();
        if (!email) {
            document.getElementById('auth-error-1').style.display = 'block';
            document.getElementById('auth-error-1').textContent = 'Please enter your email.';
            return;
        }
        document.getElementById('login-email-display').textContent = email;
        document.getElementById('register-email-display').textContent = email; // برای حالت ثبت‌نام
        showStep('step-2-login');
        document.getElementById('auth-error-1').style.display = 'none';
    });

    // Sign in
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

    // Register
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
        const { data, error } = await sb.auth.signUp({
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

    // دکمه «حساب جدید» در فرم ورود → برو به ثبت‌نام
    document.getElementById('auth-back-to-email-2').addEventListener('click', () => {
        showStep('step-2-register');
    });
    // دکمه «برگشت به ایمیل» در ثبت‌نام
    document.getElementById('auth-back-to-email').addEventListener('click', () => {
        showStep('step-1');
    });

    // Forgot password
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
    document.getElementById('auth-back-to-login').addEventListener('click', () => {
        showStep('step-2-login');
    });
}

// ================== PROMPT FUNCTIONS (بدون تغییر) ==================
// ... تمام توابع مربوط به کتابخانه (renderPromptGrid, filterPrompts, ...) را عیناً از کد قبلی کپی کنید
// (آن‌ها وابستگی به auth ندارند و صحیح کار می‌کنند)

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListeners();

    // صبر کن تا کامپوننت سایدبار تعریف شود
    customElements.whenDefined('sidebar-component').then(() => {
        getSidebarComponent(); // listenerها را متصل کن
        syncSidebarComponent(); // وضعیت اولیه (بدون کاربر)
    });

    await restoreSession();
});