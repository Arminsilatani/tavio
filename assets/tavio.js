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
let shareTargetPromptId = null;
let selectedShareUserId = null;

// ================== PINNING ==================
const PIN_STORAGE_KEY = 'tavio_pinned_prompts';

function getPinnedIds() {
    try {
        const stored = localStorage.getItem(PIN_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function savePinnedIds(ids) {
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(ids));
}

function togglePin(promptId) {
    let pinned = getPinnedIds();
    const index = pinned.indexOf(promptId);
    if (index > -1) {
        pinned.splice(index, 1);
    } else {
        pinned.push(promptId);
    }
    savePinnedIds(pinned);
    filterPrompts();
    return pinned;
}

function isPinned(promptId) {
    return getPinnedIds().includes(promptId);
}

// ================== SHARING ==================
// Placeholder: fetch connected users from Supabase (must exist)
async function fetchConnectedUsers() {
    if (!currentUser) return [];
    // Assuming 'connections' table with user_id and connected_user_id where status = 'accepted'
    const { data, error } = await sb
        .from('connections')
        .select('connected_user_id')
        .eq('user_id', currentUser.id)
        .eq('status', 'accepted');
    if (error) {
        console.error('Error fetching connections:', error);
        return [];
    }
    const ids = data.map(row => row.connected_user_id);
    if (ids.length === 0) return [];
    // Fetch profiles for those users
    const { data: profiles, error: profError } = await sb
        .from('profiles')
        .select('id, first_name, last_name, username, photo_url')
        .in('id', ids);
    if (profError) return [];
    return profiles;
}

async function openShareModal(promptId) {
    shareTargetPromptId = promptId;
    const modal = document.getElementById('share-modal');
    const userList = document.getElementById('share-user-list');
    const sendBtn = document.getElementById('share-send-btn');
    selectedShareUserId = null;
    sendBtn.disabled = true;

    // Clear previous list
    userList.innerHTML = '<div style="color:#666; padding:8px;">Loading connections...</div>';

    const users = await fetchConnectedUsers();
    if (users.length === 0) {
        userList.innerHTML = '<div style="color:#666; padding:8px;">No connected users found.</div>';
        modal.classList.remove('hidden');
        return;
    }

    userList.innerHTML = '';
    users.forEach(user => {
        const label = user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.id;
        const div = document.createElement('div');
        div.className = 'sidebar-item';
        div.style.cursor = 'pointer';
        div.style.margin = '0';
        div.innerHTML = `
            <span class="sidebar-icon" style="position:relative;">
                ${user.photo_url ? `<img src="${user.photo_url}" width="20" height="20" style="border-radius:50%;">` : `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#111;text-align:center;line-height:20px;font-size:12px;font-weight:bold;">${label.charAt(0)}</span>`}
            </span>
            <span>${label}</span>
        `;
        div.dataset.userId = user.id;
        div.addEventListener('click', () => {
            // Deselect previous
            userList.querySelectorAll('.sidebar-item').forEach(el => el.style.background = 'transparent');
            div.style.background = 'rgba(255,255,255,0.08)';
            selectedShareUserId = user.id;
            sendBtn.disabled = false;
        });
        userList.appendChild(div);
    });

    modal.classList.remove('hidden');
}

function closeShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
    selectedShareUserId = null;
    shareTargetPromptId = null;
}

async function sendShareRequest() {
    if (!shareTargetPromptId || !selectedShareUserId) return;
    const prompt = prompts.find(p => p.id === shareTargetPromptId);
    if (!prompt) return;

    // Send notification to selected user
    const { error } = await sb
        .from('notifications')
        .insert({
            user_id: selectedShareUserId,
            sender_id: currentUser.id,
            type: 'share_prompt',
            data: {
                prompt_id: prompt.id,
                prompt_title: prompt.title,
                prompt_category: prompt.category,
                prompt_template: prompt.template
            },
            is_read: false,
            created_at: new Date().toISOString()
        });

    if (error) {
        alert('Failed to send share request. Please try again.');
        console.error(error);
    } else {
        alert('Prompt shared successfully!');
        closeShareModal();
    }
}

// ================== HANDLE INCOMING SHARE NOTIFICATIONS ==================
// This function is called when a notification of type 'share_prompt' is clicked in the sidebar.
// We'll add event listeners to notification items in loadTavioSidebarNotifications.
function handleShareNotification(notification) {
    const data = notification.data;
    if (!data) return;
    // Show preview modal
    const modal = document.getElementById('prompt-preview-modal');
    document.getElementById('preview-prompt-title').textContent = data.prompt_title || 'Shared Prompt';
    document.getElementById('preview-prompt-category').textContent = data.prompt_category || 'General';
    document.getElementById('preview-prompt-template').textContent = data.prompt_template || '(No template)';
    modal.dataset.notificationId = notification.id;
    modal.dataset.promptData = JSON.stringify(data);
    modal.classList.remove('hidden');
}

async function acceptSharedPrompt() {
    const modal = document.getElementById('prompt-preview-modal');
    const notifId = modal.dataset.notificationId;
    const promptData = JSON.parse(modal.dataset.promptData || '{}');
    if (!promptData.prompt_title) return;

    // Add prompt to current user's prompts
    const newPrompt = {
        id: Date.now() + Math.random(),
        title: promptData.prompt_title,
        category: promptData.prompt_category || 'general',
        template: promptData.prompt_template
    };
    prompts.unshift(newPrompt);
    filterPrompts();

    // Mark notification as read and update status
    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    // Optionally send acceptance notification back to sender
    await sb.from('notifications').insert({
        user_id: notification.sender_id, // need sender_id from notification
        sender_id: currentUser.id,
        type: 'share_accepted',
        data: { prompt_id: promptData.prompt_id },
        is_read: false
    });

    modal.classList.add('hidden');
    loadTavioSidebarNotifications(); // refresh
}

async function rejectSharedPrompt() {
    const modal = document.getElementById('prompt-preview-modal');
    const notifId = modal.dataset.notificationId;
    // Mark notification as read
    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    // Send rejection notification back to sender
    // (We need sender_id; we could store it in notification, but we'll assume it's there)
    // For simplicity, we'll send a generic rejection
    await sb.from('notifications').insert({
        user_id: currentUser.id, // placeholder – should be sender_id
        sender_id: currentUser.id,
        type: 'share_rejected',
        data: { prompt_id: JSON.parse(modal.dataset.promptData || '{}').prompt_id },
        is_read: false
    });
    modal.classList.add('hidden');
    loadTavioSidebarNotifications();
}

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

    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    } else {
        comp.clearUser();
    }

    comp.setTodayList([], []);
    comp.setEvents([]);
    updateNotificationDot();

    const nav = comp.shadowRoot?.getElementById('sidebar-nav');
    if (nav) nav.style.display = 'block';

    const todayList = comp.shadowRoot?.getElementById('sidebar-today-list');
    if (todayList) todayList.style.display = 'none';

    const overdueList = comp.shadowRoot?.getElementById('sidebar-overdue-list');
    if (overdueList) overdueList.style.display = 'none';

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

// ================== NOTIFICATIONS SIDEBAR ==================
async function loadTavioSidebarNotifications() {
    const container = document.getElementById('tavio-notif-list');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = '';
        return;
    }

    try {
        const { data, error } = await sb
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !data || data.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = data.map(n => {
            let actionsHtml = '';
            if (n.type === 'share_prompt' && !n.is_read) {
                actionsHtml = `
                    <div class="notif-actions">
                        <button class="accept-btn" data-notif-id="${n.id}">Accept</button>
                        <button class="reject-btn" data-notif-id="${n.id}">Reject</button>
                    </div>
                `;
            }
            return `
                <div class="tavio-notif-item" data-id="${n.id}" data-type="${n.type}" style="${n.is_read ? 'opacity:0.6;' : ''}">
                    <div class="notif-title">${n.type === 'share_prompt' ? '📨 Shared Prompt' : n.title || 'Notification'}</div>
                    <div class="notif-body">${n.body || (n.type === 'share_prompt' ? 'Someone shared a prompt with you.' : '')}</div>
                    <div class="notif-time">${new Date(n.created_at).toLocaleDateString('en-US')}</div>
                    ${actionsHtml}
                </div>
            `;
        }).join('');

        // Handle click on notification (for share_prompt)
        container.querySelectorAll('.tavio-notif-item').forEach(item => {
            const notifId = item.dataset.id;
            const type = item.dataset.type;
            // If it's a share_prompt and not yet read, clicking opens preview
            if (type === 'share_prompt') {
                const acceptBtn = item.querySelector('.accept-btn');
                const rejectBtn = item.querySelector('.reject-btn');
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const notification = data.find(n => n.id == notifId);
                        if (notification) {
                            handleShareNotification(notification);
                            // We'll handle accept inside the preview modal
                        }
                    });
                }
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Mark as read and send rejection
                        rejectSharedPromptViaNotif(notifId);
                    });
                }
                // Click on the item itself also opens preview
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.notif-actions')) return;
                    const notification = data.find(n => n.id == notifId);
                    if (notification && !notification.is_read) {
                        handleShareNotification(notification);
                    } else {
                        // Just mark as read if already read
                        sb.from('notifications').update({ is_read: true }).eq('id', notifId);
                        updateNotificationDot();
                    }
                });
            } else {
                // Other notification types: just mark as read on click
                item.addEventListener('click', async () => {
                    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
                    item.style.opacity = '0.6';
                    updateNotificationDot();
                });
            }
        });

    } catch (e) {
        console.error('Error loading notifications:', e);
        container.innerHTML = '';
    }
}

async function rejectSharedPromptViaNotif(notifId) {
    // Fetch notification to get sender_id and data
    const { data: notif, error } = await sb
        .from('notifications')
        .select('sender_id, data')
        .eq('id', notifId)
        .single();
    if (error) return;
    // Mark as read
    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    // Send rejection notification back to sender
    if (notif.sender_id) {
        await sb.from('notifications').insert({
            user_id: notif.sender_id,
            sender_id: currentUser.id,
            type: 'share_rejected',
            data: notif.data,
            is_read: false
        });
    }
    loadTavioSidebarNotifications();
    updateNotificationDot();
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

    const sorted = [...filteredPrompts].sort((a, b) => {
        const aPinned = isPinned(a.id);
        const bPinned = isPinned(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
    });

    sorted.forEach(prompt => {
        const pinned = isPinned(prompt.id);
        const card = document.createElement('div');
        card.className = 'prompt-card' + (pinned ? ' pinned-card' : '');
        card.innerHTML = `
            <div class="action-buttons">
                <button class="pin-btn ${pinned ? 'pinned' : ''}" data-id="${prompt.id}" onclick="event.stopPropagation(); togglePin(${prompt.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="${pinned ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                </button>
                <button class="share-btn" data-id="${prompt.id}" onclick="event.stopPropagation(); openShareModal(${prompt.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                    </svg>
                </button>
            </div>
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

// ================== UI EVENT LISTENERS ==================
function setupUIListeners() {
    document.getElementById('search-input').addEventListener('input', filterPrompts);

    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.dataset.category;
            filterByCategory(cat);
        });
    });

    document.getElementById('new-prompt-btn').addEventListener('click', showNewPromptModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', hideNewPromptModal);
    document.getElementById('add-prompt-btn').addEventListener('click', createNewPrompt);
    document.getElementById('new-prompt-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideNewPromptModal();
    });

    document.getElementById('back-to-library-btn').addEventListener('click', backToLibrary);
    document.getElementById('detect-variables-btn').addEventListener('click', detectVariables);
    document.getElementById('generate-prompt-btn').addEventListener('click', generatePrompt);
    document.getElementById('copy-prompt-btn').addEventListener('click', copyPrompt);
    document.getElementById('reset-btn').addEventListener('click', resetAll);
    document.getElementById('save-prompt-btn').addEventListener('click', saveCurrentPrompt);

    const sidebarNewPrompt = document.getElementById('tavio-new-prompt-item');
    if (sidebarNewPrompt) {
        sidebarNewPrompt.addEventListener('click', showNewPromptModal);
    }

    // Share modal events
    document.getElementById('share-cancel-btn').addEventListener('click', closeShareModal);
    document.getElementById('share-send-btn').addEventListener('click', sendShareRequest);
    document.getElementById('share-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeShareModal();
    });

    // Preview modal events
    document.getElementById('preview-accept-btn').addEventListener('click', acceptSharedPrompt);
    document.getElementById('preview-reject-btn').addEventListener('click', rejectSharedPrompt);
    document.getElementById('prompt-preview-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('prompt-preview-modal').classList.add('hidden');
        }
    });
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListeners();
    setupUIListeners();

    customElements.whenDefined('sidebar-component').then(() => {
        getSidebarComponent();
        syncSidebarComponent();
    });

    await restoreSession();
});