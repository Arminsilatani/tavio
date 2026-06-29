// ================== CONFIG ==================
const SUPABASE_URL = 'https://vzqicidepdmraygulrey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kqRWgOmLISOE2EuLL1s8fw_WN6FJRTI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================== STATE ==================
let currentUser = null;
let currentProfile = null;
let currentUserRole = 'public';
let sidebarComponent = null;

let prompts = [];
let currentPrompt = null;
let currentVariables = {};
let shareTargetPromptId = null;
let selectedShareUserId = null;

// ================== FIELD DEFINITIONS ==================
let fieldDefinitions = [];

// New state for modal AI models
let modalSelectedAIModels = [];

function parsePromptFields(template) {
    const fields = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        const content = match[1].trim();
        let type = 'text';
        let options = [];
        let name = content;

        if (content.includes('.')) {
            type = 'single-select';
            options = content.split('.').map(s => s.trim()).filter(s => s);
            name = options.join('_');
        } else if (content.includes('/')) {
            type = 'multi-select';
            options = content.split('/').map(s => s.trim()).filter(s => s);
            name = options.join('_');
        }

        const existing = fieldDefinitions.find(f => f.name === name && f.type === type);
        if (!existing) {
            fields.push({
                name: name,
                type: type,
                options: options,
                description: '',
                raw: match[1]
            });
        } else {
            existing.options = options;
        }
    }
    return fields;
}

function renderFieldEditors() {
    const container = document.getElementById('fields-container');
    if (!container) return;
    container.innerHTML = '';

    if (fieldDefinitions.length === 0) {
        container.innerHTML = `<p style="color:#666; grid-column:1/-1;">No fields detected. Use {field} in your template.</p>`;
        return;
    }

    fieldDefinitions.forEach((field, index) => {
        const div = document.createElement('div');
        div.className = 'field-editor';
        div.dataset.index = index;

        let optionsHtml = '';
        if (field.type === 'single-select' || field.type === 'multi-select') {
            optionsHtml = `
                <div class="field-options">
                    ${field.options.map(opt => `
                        <span class="option-tag">
                            ${opt}
                            <button onclick="removeOption(${index}, '${opt}')">✕</button>
                        </span>
                    `).join('')}
                    <input type="text" class="add-option-input" id="option-input-${index}" placeholder="Add option...">
                    <button class="add-option-btn" onclick="addOption(${index})">+</button>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="field-row">
                <label>Name</label>
                <input type="text" value="${field.name}" onchange="updateFieldName(${index}, this.value)" placeholder="Field name">
                <label>Type</label>
                <select onchange="updateFieldType(${index}, this.value)">
                    <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                    <option value="single-select" ${field.type === 'single-select' ? 'selected' : ''}>Single Select</option>
                    <option value="multi-select" ${field.type === 'multi-select' ? 'selected' : ''}>Multi Select</option>
                </select>
                <button class="remove-field-btn" onclick="removeField(${index})">✕ Remove</button>
            </div>
            ${optionsHtml}
            <div class="field-description">
                <textarea placeholder="Field description (optional)" onchange="updateFieldDescription(${index}, this.value)">${field.description || ''}</textarea>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateFieldName(index, value) {
    if (fieldDefinitions[index]) {
        fieldDefinitions[index].name = value;
    }
}

function updateFieldType(index, value) {
    if (fieldDefinitions[index]) {
        fieldDefinitions[index].type = value;
        if (value === 'text') {
            fieldDefinitions[index].options = [];
        }
        renderFieldEditors();
    }
}

function updateFieldDescription(index, value) {
    if (fieldDefinitions[index]) {
        fieldDefinitions[index].description = value;
    }
}

function addOption(index) {
    const input = document.getElementById(`option-input-${index}`);
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;
    if (fieldDefinitions[index]) {
        if (!fieldDefinitions[index].options) fieldDefinitions[index].options = [];
        fieldDefinitions[index].options.push(value);
        input.value = '';
        renderFieldEditors();
    }
}

function removeOption(index, option) {
    if (fieldDefinitions[index]) {
        fieldDefinitions[index].options = fieldDefinitions[index].options.filter(o => o !== option);
        renderFieldEditors();
    }
}

function removeField(index) {
    fieldDefinitions.splice(index, 1);
    renderFieldEditors();
}

function detectFields() {
    const template = document.getElementById('template-textarea').value;
    const detected = parsePromptFields(template);
    detected.forEach(d => {
        const existing = fieldDefinitions.find(f => f.name === d.name && f.type === d.type);
        if (existing) {
            d.description = existing.description || d.description;
        }
    });
    fieldDefinitions = detected;
    renderFieldEditors();
}

// ================== AI MODELS (Editor) ==================
let selectedAIModels = [];

function renderAIModels() {
    const container = document.getElementById('ai-models-container');
    if (!container) return;
    const tags = container.querySelectorAll('.ai-model-tag');
    tags.forEach(tag => {
        const model = tag.dataset.model;
        if (selectedAIModels.includes(model)) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });
}

function toggleAIModel(model) {
    const index = selectedAIModels.indexOf(model);
    if (index > -1) {
        selectedAIModels.splice(index, 1);
    } else {
        selectedAIModels.push(model);
    }
    renderAIModels();
}

function addCustomAIModel() {
    const input = document.getElementById('ai-model-input');
    const model = input.value.trim();
    if (!model) return;
    if (!selectedAIModels.includes(model)) {
        selectedAIModels.push(model);
        const container = document.getElementById('ai-models-container');
        const tag = document.createElement('div');
        tag.className = 'ai-model-tag selected';
        tag.dataset.model = model;
        tag.textContent = model;
        tag.onclick = () => toggleAIModel(model);
        container.insertBefore(tag, input);
        renderAIModels();
    }
    input.value = '';
}

// ================== AI MODELS (Modal) ==================
function renderModalAIModels() {
    const container = document.getElementById('modal-ai-models-container');
    if (!container) return;
    container.innerHTML = '';

    const defaultModels = ['gpt-4', 'claude-3', 'gemini-pro', 'llama-3', 'mistral-large'];
    defaultModels.forEach(model => {
        const tag = document.createElement('div');
        tag.className = 'ai-model-tag';
        if (modalSelectedAIModels.includes(model)) {
            tag.classList.add('selected');
        }
        tag.dataset.model = model;
        tag.textContent = model.replace(/-/g, ' ');
        tag.addEventListener('click', () => {
            toggleModalAIModel(model);
        });
        container.appendChild(tag);
    });

    // Add any custom models already selected
    modalSelectedAIModels.forEach(model => {
        if (!defaultModels.includes(model)) {
            const tag = document.createElement('div');
            tag.className = 'ai-model-tag selected';
            tag.dataset.model = model;
            tag.textContent = model;
            tag.addEventListener('click', () => {
                toggleModalAIModel(model);
            });
            container.appendChild(tag);
        }
    });
}

function toggleModalAIModel(model) {
    const index = modalSelectedAIModels.indexOf(model);
    if (index > -1) {
        modalSelectedAIModels.splice(index, 1);
    } else {
        modalSelectedAIModels.push(model);
    }
    renderModalAIModels();
}

function addCustomModalAIModel() {
    const input = document.getElementById('modal-ai-model-input');
    const model = input.value.trim();
    if (!model) return;
    if (!modalSelectedAIModels.includes(model)) {
        modalSelectedAIModels.push(model);
        renderModalAIModels();
    }
    input.value = '';
}

// ================== BOOKMARK ==================
async function toggleBookmark(promptId) {
    if (!currentUser) {
        alert('Please sign in to bookmark prompts.');
        return;
    }
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const newPinned = !prompt.pinned;
    const { error } = await sb
        .from('tavio_prompts')
        .update({ pinned: newPinned })
        .eq('id', promptId)
        .eq('user_id', currentUser.id);

    if (error) {
        console.error('Error toggling bookmark:', error);
        alert('Failed to update bookmark. Please try again.');
    } else {
        prompt.pinned = newPinned;
        filterPrompts();
    }
}

// ================== FETCH PROMPTS ==================
async function fetchPromptsWithAuthors() {
    if (!currentUser) return [];
    try {
        const { data: promptsData, error: promptsError } = await sb
            .from('tavio_prompts')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (promptsError) {
            console.error('Error fetching prompts:', promptsError);
            return [];
        }

        if (!promptsData || promptsData.length === 0) return [];

        const userIds = [...new Set(promptsData.map(p => p.user_id))];
        const { data: profilesData } = await sb
            .from('profiles')
            .select('id, first_name, last_name, username')
            .in('id', userIds);

        const authorMap = {};
        if (profilesData) {
            profilesData.forEach(prof => {
                const name = `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || prof.username || 'Unknown';
                authorMap[prof.id] = name;
            });
        }

        return promptsData.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category_id || 'general',
            template: p.template || '',
            user_id: p.user_id,
            pinned: p.pinned || false,
            created_at: p.created_at,
            updated_at: p.updated_at,
            author_name: authorMap[p.user_id] || 'Unknown',
            field_definitions: p.field_definitions || [],
            ai_models: p.ai_models || []
        }));
    } catch (e) {
        console.error('Error in fetchPromptsWithAuthors:', e);
        return [];
    }
}

async function syncPrompts() {
    const fetched = await fetchPromptsWithAuthors();
    prompts = fetched.length > 0 ? fetched : [];
    renderPromptGrid(prompts);
    filterByCategory('all');
}

// ================== SHARING ==================
async function fetchConnectedUsers() {
    if (!currentUser) return [];
    try {
        const { data, error } = await sb
            .from('dashboard_connectionrequests')
            .select('from_id, to_id')
            .or(`from_id.eq.${currentUser.id},to_id.eq.${currentUser.id}`)
            .eq('status', 'accepted');

        if (error) return [];

        if (!data || data.length === 0) return [];

        const connectedIds = data.map(row => {
            if (row.from_id === currentUser.id) return row.to_id;
            else if (row.to_id === currentUser.id) return row.from_id;
            return null;
        }).filter(id => id && id !== currentUser.id);

        if (connectedIds.length === 0) return [];

        const uniqueIds = [...new Set(connectedIds)];
        const { data: profiles } = await sb
            .from('profiles')
            .select('id, first_name, last_name, username, photo_url')
            .in('id', uniqueIds);

        return profiles || [];
    } catch (e) {
        console.error('Error in fetchConnectedUsers:', e);
        return [];
    }
}

async function openShareModal(promptId) {
    shareTargetPromptId = promptId;
    const modal = document.getElementById('share-modal');
    const userList = document.getElementById('share-user-list');
    const sendBtn = document.getElementById('share-send-btn');
    selectedShareUserId = null;
    sendBtn.disabled = true;

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
            <span class="sidebar-icon">
                ${user.photo_url ? `<img src="${user.photo_url}" width="20" height="20" style="border-radius:50%;">` : `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#111;text-align:center;line-height:20px;font-size:12px;font-weight:bold;">${label.charAt(0)}</span>`}
            </span>
            <span>${label}</span>
        `;
        div.dataset.userId = user.id;
        div.addEventListener('click', () => {
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
                prompt_template: prompt.template,
                author_id: prompt.user_id,
                author_name: prompt.author_name,
                field_definitions: prompt.field_definitions || [],
                ai_models: prompt.ai_models || []
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

// ================== HANDLE SHARE NOTIFICATIONS ==================
function handleShareNotification(notification) {
    const data = notification.data;
    if (!data) return;
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

    const newPrompt = {
        title: promptData.prompt_title,
        category: promptData.prompt_category || 'general',
        template: promptData.prompt_template,
        user_id: currentUser.id,
        pinned: false,
        author_name: promptData.author_name || 'Unknown',
        field_definitions: promptData.field_definitions || [],
        ai_models: promptData.ai_models || []
    };

    const { data, error } = await sb
        .from('tavio_prompts')
        .insert({
            title: newPrompt.title,
            category_id: newPrompt.category,
            template: newPrompt.template,
            user_id: newPrompt.user_id,
            pinned: newPrompt.pinned,
            field_definitions: newPrompt.field_definitions,
            ai_models: newPrompt.ai_models
        })
        .select('id, created_at, updated_at')
        .single();

    if (error) {
        alert('Failed to save prompt. Please try again.');
        console.error(error);
        return;
    }

    newPrompt.id = data.id;
    newPrompt.created_at = data.created_at;
    newPrompt.updated_at = data.updated_at;
    prompts.unshift(newPrompt);
    filterPrompts();

    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    await sb.from('notifications').insert({
        user_id: notification.sender_id,
        sender_id: currentUser.id,
        type: 'share_accepted',
        data: { prompt_id: promptData.prompt_id },
        is_read: false
    });

    modal.classList.add('hidden');
    loadTavioSidebarNotifications();
    updateNotificationDot();
}

async function rejectSharedPrompt() {
    const modal = document.getElementById('prompt-preview-modal');
    const notifId = modal.dataset.notificationId;
    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    await sb.from('notifications').insert({
        user_id: currentUser.id,
        sender_id: currentUser.id,
        type: 'share_rejected',
        data: { prompt_id: JSON.parse(modal.dataset.promptData || '{}').prompt_id },
        is_read: false
    });
    modal.classList.add('hidden');
    loadTavioSidebarNotifications();
    updateNotificationDot();
}

// ================== HELPERS ==================
function showGlobalLoader() {
    document.getElementById('initial-loader').style.display = 'flex';
}
function hideGlobalLoader() {
    document.getElementById('initial-loader').style.display = 'none';
}
function openModal(modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
function closeModal(modal) {
    modal.classList.add('hidden');
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

        container.querySelectorAll('.tavio-notif-item').forEach(item => {
            const notifId = item.dataset.id;
            const type = item.dataset.type;
            if (type === 'share_prompt') {
                const acceptBtn = item.querySelector('.accept-btn');
                const rejectBtn = item.querySelector('.reject-btn');
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const notification = data.find(n => n.id == notifId);
                        if (notification) handleShareNotification(notification);
                    });
                }
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        rejectSharedPromptViaNotif(notifId);
                    });
                }
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.notif-actions')) return;
                    const notification = data.find(n => n.id == notifId);
                    if (notification && !notification.is_read) {
                        handleShareNotification(notification);
                    } else {
                        sb.from('notifications').update({ is_read: true }).eq('id', notifId);
                        updateNotificationDot();
                    }
                });
            } else {
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
    const { data: notif } = await sb
        .from('notifications')
        .select('sender_id, data')
        .eq('id', notifId)
        .single();
    await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
    if (notif?.sender_id) {
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
        await syncPrompts();
    } else {
        document.getElementById('app-container').classList.add('app-hidden');
        openModal(document.getElementById('auth-overlay'));
        showStep('step-1');
    }
    hideGlobalLoader();
}

// ================== AUTH LISTENERS ==================
function setupAuthListeners() {
    const continueBtn = document.getElementById('auth-continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
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
    }

    const signinBtn = document.getElementById('auth-signin-btn');
    if (signinBtn) {
        signinBtn.addEventListener('click', async function(e) {
            try {
                const emailInput = document.getElementById('auth-email');
                const passwordInput = document.getElementById('auth-password-login');
                const errorDisplay = document.getElementById('auth-error-login');

                if (!emailInput || !passwordInput) {
                    console.error('Email or password input not found in DOM');
                    return;
                }

                const email = emailInput.value.trim();
                const password = passwordInput.value;

                if (!email || !password) {
                    errorDisplay.textContent = 'Please enter email and password.';
                    errorDisplay.style.display = 'block';
                    return;
                }

                errorDisplay.style.display = 'none';
                const { data, error } = await sb.auth.signInWithPassword({ email, password });

                if (error) {
                    console.error('Sign in error:', error);
                    errorDisplay.textContent = error.message;
                    errorDisplay.style.display = 'block';
                    return;
                }

                currentUser = data.user;
                currentProfile = await buildCurrentProfile(data.user);
                currentUserRole = currentProfile?.role || 'recruit';

                closeModal(document.getElementById('auth-overlay'));
                document.getElementById('app-container').classList.remove('app-hidden');
                syncSidebarComponent();
                await syncPrompts();
            } catch (err) {
                console.error('Unhandled sign in error:', err);
                alert('An error occurred during sign in. Check console for details.');
            }
        });
    }

    const registerBtn = document.getElementById('auth-register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
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
    }

    const back1 = document.getElementById('auth-back-to-email');
    if (back1) back1.addEventListener('click', () => showStep('step-1'));
    const back2 = document.getElementById('auth-back-to-email-2');
    if (back2) back2.addEventListener('click', () => showStep('step-2-register'));

    const forgotLink = document.getElementById('forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showStep('step-forgot');
            document.getElementById('forgot-email').value = document.getElementById('auth-email').value.trim();
        });
    }

    const resetBtn = document.getElementById('auth-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
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
    }

    const backToLogin = document.getElementById('auth-back-to-login');
    if (backToLogin) backToLogin.addEventListener('click', () => showStep('step-2-login'));

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
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    sorted.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card' + (prompt.pinned ? ' pinned-card' : '');
        card.innerHTML = `
            <div class="action-buttons">
                <button class="pin-btn ${prompt.pinned ? 'pinned' : ''}" onclick="event.stopPropagation(); toggleBookmark(${prompt.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="${prompt.pinned ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                </button>
                <button class="share-btn" onclick="event.stopPropagation(); openShareModal(${prompt.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                    </svg>
                </button>
            </div>
            <span class="category">${prompt.category}</span>
            <h4>${prompt.title}</h4>
            <p>${prompt.template ? prompt.template.substring(0, 110) : ''}...</p>
            <div class="prompt-author">by ${prompt.author_name || 'Unknown'}</div>
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
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm) || (p.template && p.template.toLowerCase().includes(searchTerm)));
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
    document.getElementById('template-textarea').value = prompt.template || '';
    fieldDefinitions = prompt.field_definitions || [];
    selectedAIModels = prompt.ai_models || [];
    renderFieldEditors();
    renderAIModels();
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
    detectFields();
    const container = document.getElementById('variables-container');
    if (container) {
        container.innerHTML = '';
        if (vars.size === 0 && fieldDefinitions.length === 0) {
            container.innerHTML = `<p style="color:#666; grid-column:1/-1;">No fields detected. Use {field} or {{variable}} in your template.</p>`;
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
    fieldDefinitions.forEach(field => {
        const regex = new RegExp(`\\{${field.raw || field.name}\\}`, 'g');
        let value = field.value || `[${field.name}]`;
        if (field.type === 'single-select' && field.options.length > 0) {
            value = field.value || field.options[0] || `[${field.name}]`;
        }
        if (field.type === 'multi-select' && field.options.length > 0) {
            const selected = field.value || [];
            value = selected.length > 0 ? selected.join(', ') : `[${field.name}]`;
        }
        filled = filled.replace(regex, value);
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
    fieldDefinitions = [];
    selectedAIModels = [];
    renderFieldEditors();
    renderAIModels();
}

function showNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.remove('hidden');
    document.getElementById('modal-title').focus();
    modalSelectedAIModels = [];
    renderModalAIModels();
}

function hideNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.add('hidden');
}

async function createNewPrompt() {
    const title = document.getElementById('modal-title').value.trim();
    const category = document.getElementById('modal-category').value;
    const template = document.getElementById('modal-template').value.trim();
    if (!title || !template) {
        alert("Title and template are required.");
        return;
    }

    const fields = parsePromptFields(template);
    fieldDefinitions = fields;

    const newPrompt = {
        title: title,
        category: category,
        template: template,
        user_id: currentUser.id,
        pinned: false,
        author_name: currentProfile ? (currentProfile.first_name + ' ' + currentProfile.last_name).trim() || currentProfile.username || 'Unknown' : 'Unknown',
        field_definitions: fieldDefinitions,
        ai_models: modalSelectedAIModels  // Now from modal selection
    };

    const { data, error } = await sb
        .from('tavio_prompts')
        .insert({
            title: newPrompt.title,
            category_id: newPrompt.category,
            template: newPrompt.template,
            user_id: newPrompt.user_id,
            pinned: newPrompt.pinned,
            field_definitions: newPrompt.field_definitions,
            ai_models: modalSelectedAIModels
        })
        .select('id, created_at, updated_at')
        .single();

    if (error) {
        alert('Failed to save prompt. Please try again.');
        console.error(error);
        return;
    }

    newPrompt.id = data.id;
    newPrompt.created_at = data.created_at;
    newPrompt.updated_at = data.updated_at;
    prompts.unshift(newPrompt);
    hideNewPromptModal();
    document.getElementById('modal-title').value = '';
    document.getElementById('modal-template').value = '';
    filterPrompts();
    loadPromptIntoEditor(newPrompt);
}

async function saveCurrentPrompt() {
    if (!currentPrompt) return;
    const template = document.getElementById('template-textarea').value.trim();
    if (!template) return;
    currentPrompt.template = template;
    currentPrompt.field_definitions = fieldDefinitions;
    currentPrompt.ai_models = selectedAIModels;

    const { error } = await sb
        .from('tavio_prompts')
        .update({
            template: template,
            field_definitions: fieldDefinitions,
            ai_models: selectedAIModels
        })
        .eq('id', currentPrompt.id)
        .eq('user_id', currentUser.id);

    if (error) {
        alert('Failed to save prompt. Please try again.');
        console.error(error);
        return;
    }

    const index = prompts.findIndex(p => p.id === currentPrompt.id);
    if (index !== -1) prompts[index] = {...currentPrompt};
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

    // Modal AI model listeners
    document.getElementById('modal-add-ai-model-btn').addEventListener('click', addCustomModalAIModel);
    document.getElementById('modal-ai-model-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCustomModalAIModel();
    });

    document.getElementById('back-to-library-btn').addEventListener('click', backToLibrary);
    document.getElementById('detect-variables-btn').addEventListener('click', detectFields);
    document.getElementById('generate-prompt-btn').addEventListener('click', generatePrompt);
    document.getElementById('copy-prompt-btn').addEventListener('click', copyPrompt);
    document.getElementById('reset-btn').addEventListener('click', resetAll);
    document.getElementById('save-prompt-btn').addEventListener('click', saveCurrentPrompt);

    document.getElementById('add-ai-model-btn').addEventListener('click', addCustomAIModel);
    document.getElementById('ai-model-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCustomAIModel();
    });

    document.querySelectorAll('.ai-model-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const model = tag.dataset.model;
            toggleAIModel(model);
        });
    });

    const sidebarNewPrompt = document.getElementById('tavio-new-prompt-item');
    if (sidebarNewPrompt) {
        sidebarNewPrompt.addEventListener('click', showNewPromptModal);
    }

    document.getElementById('share-cancel-btn').addEventListener('click', closeShareModal);
    document.getElementById('share-send-btn').addEventListener('click', sendShareRequest);
    document.getElementById('share-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeShareModal();
    });

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