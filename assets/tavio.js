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

// Modal states
let modalSelectedAIModels = [];
let modalSelectedCategories = [];

// Filter state
let activeCategoryFilters = [];

const ALL_CATEGORIES = [
    {
        id: 'writing',
        label: 'Writing',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>`
    },
    {
        id: 'coding',
        label: 'Coding',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>`
    },
    {
        id: 'marketing',
        label: 'Marketing',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /></svg>`
    },
    {
        id: 'analysis',
        label: 'Analysis',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`
    },
    {
        id: 'education',
        label: 'Education / Learning',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>`
    },
    {
        id: 'productivity',
        label: 'Productivity',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>`
    },
    {
        id: 'creative',
        label: 'Creative',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>`
    },
    {
        id: 'image_media',
        label: 'Image / Media',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`
    }
];

const ALL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`;

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
    if (fieldDefinitions[index]) fieldDefinitions[index].name = value;
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
    if (fieldDefinitions[index]) fieldDefinitions[index].description = value;
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
        tag.addEventListener('click', () => toggleModalAIModel(model));
        container.appendChild(tag);
    });

    modalSelectedAIModels.forEach(model => {
        if (!defaultModels.includes(model)) {
            const tag = document.createElement('div');
            tag.className = 'ai-model-tag selected';
            tag.dataset.model = model;
            tag.textContent = model;
            tag.addEventListener('click', () => toggleModalAIModel(model));
            container.appendChild(tag);
        }
    });
}

function toggleModalAIModel(model) {
    const idx = modalSelectedAIModels.indexOf(model);
    if (idx > -1) modalSelectedAIModels.splice(idx, 1);
    else modalSelectedAIModels.push(model);
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

// ================== MODAL CATEGORIES ==================
function renderModalCategories() {
    const container = document.getElementById('modal-categories-container');
    if (!container) return;
    container.innerHTML = '';
    ALL_CATEGORIES.forEach(cat => {
        const chip = document.createElement('div');
        chip.className = 'category-chip';
        if (modalSelectedCategories.includes(cat.id)) chip.classList.add('active');
        chip.dataset.category = cat.id;
        chip.innerHTML = `<span class="chip-icon">${cat.icon}</span><span>${cat.label}</span>`;
        chip.addEventListener('click', () => {
            const idx = modalSelectedCategories.indexOf(cat.id);
            if (idx > -1) modalSelectedCategories.splice(idx, 1);
            else modalSelectedCategories.push(cat.id);
            renderModalCategories();
        });
        container.appendChild(chip);
    });
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
        applyCategoryFilters();
    }
}

// ================== FETCH PROMPTS ==================
function parseCategoryArray(category_id) {
    if (!category_id) return [];
    try {
        if (typeof category_id === 'string') return JSON.parse(category_id);
        if (Array.isArray(category_id)) return category_id;
    } catch (e) {}
    return [];
}

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
            description: p.description || '',
            categories: parseCategoryArray(p.category_id),
            template: p.content || '',
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
    applyCategoryFilters();
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
                prompt_description: prompt.description || '',
                prompt_category: JSON.stringify(prompt.categories),
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

    const catsContainer = document.getElementById('preview-prompt-categories');
    catsContainer.innerHTML = '';
    const categoriesArray = parseCategoryArray(data.prompt_category);
    categoriesArray.forEach(catId => {
        const label = ALL_CATEGORIES.find(c => c.id === catId)?.label || catId;
        const chip = document.createElement('span');
        chip.className = 'category-chip';
        chip.textContent = label;
        chip.style.pointerEvents = 'none';
        chip.style.marginRight = '4px';
        catsContainer.appendChild(chip);
    });

    let templateHtml = data.prompt_template || '(No template)';
    if (data.prompt_description) {
        templateHtml = `<em>${data.prompt_description}</em><br><br>` + templateHtml;
    }
    document.getElementById('preview-prompt-template').innerHTML = templateHtml;
    modal.dataset.notificationId = notification.id;
    modal.dataset.promptData = JSON.stringify(data);
    modal.classList.remove('hidden');
}

async function acceptSharedPrompt() {
    const modal = document.getElementById('prompt-preview-modal');
    const notifId = modal.dataset.notificationId;
    const promptData = JSON.parse(modal.dataset.promptData || '{}');
    if (!promptData.prompt_title) return;

    const categoriesArray = parseCategoryArray(promptData.prompt_category);
    const newPrompt = {
        title: promptData.prompt_title,
        description: promptData.prompt_description || '',
        categories: categoriesArray,
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
            description: newPrompt.description,
            content: newPrompt.template,
            category_id: JSON.stringify(newPrompt.categories),
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
    applyCategoryFilters();

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
        const categoryChips = (prompt.categories || []).map(catId => {
            const label = ALL_CATEGORIES.find(c => c.id === catId)?.label || catId;
            return `<span class="category-chip" style="pointer-events:none;">${label}</span>`;
        }).join('');
        const descHtml = prompt.description ? `<p class="prompt-desc">${prompt.description}</p>` : '';
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
            <div class="category-chips-inline">${categoryChips}</div>
            <h4>${prompt.title}</h4>
            ${descHtml}
            <p class="prompt-snippet">${prompt.template ? prompt.template.substring(0, 110) : ''}...</p>
            <div class="prompt-author">by ${prompt.author_name || 'Unknown'}</div>
        `;
        card.onclick = () => loadPromptIntoEditor(prompt);
        grid.appendChild(card);
    });
}

function applyCategoryFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    let filtered = prompts;
    if (searchTerm) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm) || (p.template && p.template.toLowerCase().includes(searchTerm)) || (p.description && p.description.toLowerCase().includes(searchTerm)));
    }
    if (activeCategoryFilters.length > 0) {
        filtered = filtered.filter(p => p.categories.some(cat => activeCategoryFilters.includes(cat)));
    }
    renderPromptGrid(filtered);
}

function filterPrompts() {
    applyCategoryFilters();
}

function setCategoryFilter(category) {
    if (category === 'all') {
        activeCategoryFilters = [];
    } else {
        const idx = activeCategoryFilters.indexOf(category);
        if (idx > -1) activeCategoryFilters.splice(idx, 1);
        else activeCategoryFilters.push(category);
    }
    updateCategoryChipsUI();
    filterPrompts();
}

function updateCategoryChipsUI() {
    document.querySelectorAll('#category-filters .category-chip').forEach(chip => {
        const cat = chip.dataset.category;
        if (cat === 'all') {
            chip.classList.toggle('active', activeCategoryFilters.length === 0);
        } else {
            chip.classList.toggle('active', activeCategoryFilters.includes(cat));
        }
    });
}

function loadPromptIntoEditor(prompt) {
    currentPrompt = {...prompt};
    document.getElementById('library-view').classList.remove('active');
    document.getElementById('editor-view').classList.add('active');
    document.getElementById('current-prompt-title').textContent = prompt.title;
    document.getElementById('prompt-description').value = prompt.description || '';
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
    modalSelectedCategories = [];
    document.getElementById('modal-description').value = '';
    renderModalAIModels();
    renderModalCategories();
}

function hideNewPromptModal() {
    document.getElementById('new-prompt-modal').classList.add('hidden');
}

async function createNewPrompt() {
    const title = document.getElementById('modal-title').value.trim();
    const description = document.getElementById('modal-description').value.trim().substring(0, 50);
    const template = document.getElementById('modal-template').value.trim();
    if (!title || !template) {
        alert("Title and template are required.");
        return;
    }
    if (modalSelectedCategories.length === 0) {
        alert("Please select at least one category.");
        return;
    }

    const fields = parsePromptFields(template);
    fieldDefinitions = fields;

    const newPrompt = {
        title: title,
        description: description,
        categories: modalSelectedCategories,
        template: template,
        user_id: currentUser.id,
        pinned: false,
        author_name: currentProfile ? (currentProfile.first_name + ' ' + currentProfile.last_name).trim() || currentProfile.username || 'Unknown' : 'Unknown',
        field_definitions: fieldDefinitions,
        ai_models: modalSelectedAIModels
    };

    const { data, error } = await sb
        .from('tavio_prompts')
        .insert({
            title: newPrompt.title,
            description: newPrompt.description,
            content: newPrompt.template,
            category_id: JSON.stringify(modalSelectedCategories),
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
    document.getElementById('modal-description').value = '';
    document.getElementById('modal-template').value = '';
    applyCategoryFilters();
    loadPromptIntoEditor(newPrompt);
}

async function saveCurrentPrompt() {
    if (!currentPrompt) return;
    const description = document.getElementById('prompt-description').value.trim().substring(0, 50);
    const template = document.getElementById('template-textarea').value.trim();
    if (!template) return;
    currentPrompt.description = description;
    currentPrompt.template = template;
    currentPrompt.field_definitions = fieldDefinitions;
    currentPrompt.ai_models = selectedAIModels;

    const { error } = await sb
        .from('tavio_prompts')
        .update({
            description: description,
            content: template,
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
    applyCategoryFilters();
}

// ================== UI EVENT LISTENERS ==================
function setupUIListeners() {
    document.getElementById('search-input').addEventListener('input', filterPrompts);

    // Category filter chips inside the scrollable container
    document.querySelectorAll('#category-filters .category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            setCategoryFilter(chip.dataset.category);
        });
    });

    // Scroll buttons for main category filters
    document.getElementById('cat-scroll-left').addEventListener('click', () => {
        document.getElementById('category-filters').scrollBy({ left: -200, behavior: 'smooth' });
    });
    document.getElementById('cat-scroll-right').addEventListener('click', () => {
        document.getElementById('category-filters').scrollBy({ left: 200, behavior: 'smooth' });
    });

    // Scroll buttons for modal categories
    document.getElementById('modal-cat-scroll-left').addEventListener('click', () => {
        document.getElementById('modal-categories-container').scrollBy({ left: -200, behavior: 'smooth' });
    });
    document.getElementById('modal-cat-scroll-right').addEventListener('click', () => {
        document.getElementById('modal-categories-container').scrollBy({ left: 200, behavior: 'smooth' });
    });

    document.getElementById('new-prompt-btn').addEventListener('click', showNewPromptModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', hideNewPromptModal);
    document.getElementById('add-prompt-btn').addEventListener('click', createNewPrompt);
    document.getElementById('new-prompt-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideNewPromptModal();
    });

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

const ALL_AI_MODELS = [
    // OpenAI
    { id: "gpt-5.4", name: "GPT-5.4", company: "OpenAI", tags: ["agentic","paid"], modality:["general","agentic"], pricing:"paid" },
    { id: "gpt-5.5-instant", name: "GPT-5.5 Instant", company: "OpenAI", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },
    { id: "gpt-5.1-thinking", name: "GPT-5.1 Thinking", company: "OpenAI", tags: ["reasoning","paid"], modality:["reasoning"], pricing:"paid" },
    { id: "gpt-5.1-pro", name: "GPT-5.1 Pro", company: "OpenAI", tags: ["advanced","paid"], modality:["general","advanced"], pricing:"paid" },
    { id: "gpt-5.1-instant", name: "GPT-5.1 Instant", company: "OpenAI", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "gpt-5", name: "GPT-5", company: "OpenAI", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "gpt-5-thinking", name: "GPT-5 Thinking", company: "OpenAI", tags: ["reasoning","paid"], modality:["reasoning"], pricing:"paid" },
    { id: "gpt-5-instant", name: "GPT-5 Instant", company: "OpenAI", tags: ["fast","paid"], modality:["general","fast"], pricing:"paid" },
    { id: "o3-pro", name: "o3-pro", company: "OpenAI", tags: ["reasoning","paid"], modality:["reasoning"], pricing:"paid" },
    { id: "o3-mini", name: "o3-mini", company: "OpenAI", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },
    { id: "gpt-oss-120b", name: "GPT-OSS 120B", company: "OpenAI", tags: ["open","free"], modality:["general"], pricing:"free" },
    { id: "gpt-oss-20b", name: "GPT-OSS 20B", company: "OpenAI", tags: ["open","free"], modality:["general"], pricing:"free" },
    { id: "gpt-oss-safeguard-120b", name: "GPT-OSS Safeguard 120B", company: "OpenAI", tags: ["safety","free"], modality:["safety"], pricing:"free" },
    { id: "gpt-oss-safeguard-20b", name: "GPT-OSS Safeguard 20B", company: "OpenAI", tags: ["safety","free"], modality:["safety"], pricing:"free" },
    { id: "gpt-image-2", name: "GPT Image 2", company: "OpenAI", tags: ["image","paid"], modality:["image"], pricing:"paid" },
    { id: "gpt-realtime-2", name: "GPT Realtime 2", company: "OpenAI", tags: ["voice","paid"], modality:["voice"], pricing:"paid" },
    { id: "gpt-realtime-mini", name: "GPT Realtime Mini", company: "OpenAI", tags: ["voice","paid"], modality:["voice"], pricing:"paid" },

    // Anthropic
    { id: "claude-fable-5", name: "Claude Fable 5", company: "Anthropic", tags: ["limited","paid"], modality:["general"], pricing:"paid" },
    { id: "claude-mythos-5", name: "Claude Mythos 5", company: "Anthropic", tags: ["limited","paid"], modality:["general"], pricing:"paid" },
    { id: "claude-opus-4.8", name: "Claude Opus 4.8", company: "Anthropic", tags: ["reasoning","paid"], modality:["reasoning"], pricing:"paid" },
    { id: "claude-opus-4.7", name: "Claude Opus 4.7", company: "Anthropic", tags: ["coding","paid"], modality:["coding"], pricing:"paid" },
    { id: "claude-opus-4.6", name: "Claude Opus 4.6", company: "Anthropic", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "claude-sonnet-4.6", name: "Claude Sonnet 4.6", company: "Anthropic", tags: ["practical","paid"], modality:["general"], pricing:"paid" },
    { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", company: "Anthropic", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", company: "Anthropic", tags: ["fast","paid"], modality:["general","fast"], pricing:"paid" },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", company: "Anthropic", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", company: "Anthropic", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },

    // Meta
    { id: "llama-4-scout", name: "Llama 4 Scout", company: "Meta", tags: ["light","free"], modality:["general"], pricing:"free" },
    { id: "llama-4-maverick", name: "Llama 4 Maverick", company: "Meta", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "llama-4-behemoth", name: "Llama 4 Behemoth", company: "Meta", tags: ["large","free"], modality:["general"], pricing:"free" },
    { id: "llama-3.3", name: "Llama 3.3", company: "Meta", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "llama-3.2", name: "Llama 3.2", company: "Meta", tags: ["multimodal","free"], modality:["multimodal"], pricing:"free" },
    { id: "llama-3.1", name: "Llama 3.1", company: "Meta", tags: ["general","free"], modality:["general"], pricing:"free" },

    // Google
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", company: "Google", tags: ["reasoning","freemium"], modality:["reasoning"], pricing:"freemium" },
    { id: "gemini-3.1-flash", name: "Gemini 3.1 Flash", company: "Google", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", company: "Google", tags: ["economical","freemium"], modality:["general"], pricing:"freemium" },
    { id: "gemini-3-pro-image", name: "Gemini 3 Pro Image", company: "Google", tags: ["image","paid"], modality:["image"], pricing:"paid" },
    { id: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image", company: "Google", tags: ["image","paid"], modality:["image"], pricing:"paid" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", company: "Google", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "gemini-3-pro", name: "Gemini 3 Pro", company: "Google", tags: ["advanced","freemium"], modality:["general"], pricing:"freemium" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", company: "Google", tags: ["reasoning","freemium"], modality:["reasoning"], pricing:"freemium" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", company: "Google", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", company: "Google", tags: ["economical","freemium"], modality:["general"], pricing:"freemium" },
    { id: "gemma-4", name: "Gemma 4", company: "Google", tags: ["open","free"], modality:["general"], pricing:"free" },
    { id: "gemma-3", name: "Gemma 3", company: "Google", tags: ["open","free"], modality:["general"], pricing:"free" },
    { id: "veo-3.1-lite-preview", name: "Veo 3.1 Lite Preview", company: "Google", tags: ["video","paid"], modality:["video"], pricing:"paid" },

    // Microsoft
    { id: "mai-voice-1", name: "MAI Voice-1", company: "Microsoft", tags: ["voice","freemium"], modality:["voice"], pricing:"freemium" },
    { id: "mai-image-1", name: "MAI Image-1", company: "Microsoft", tags: ["image","freemium"], modality:["image"], pricing:"freemium" },
    { id: "phi-4", name: "Phi-4", company: "Microsoft", tags: ["reasoning","free"], modality:["reasoning"], pricing:"free" },
    { id: "phi-4-mini", name: "Phi-4-mini", company: "Microsoft", tags: ["light","free"], modality:["general"], pricing:"free" },
    { id: "phi-4-multimodal", name: "Phi-4-multimodal", company: "Microsoft", tags: ["multimodal","free"], modality:["multimodal"], pricing:"free" },
    { id: "phi-3.5", name: "Phi-3.5", company: "Microsoft", tags: ["general","free"], modality:["general"], pricing:"free" },

    // xAI
    { id: "grok-4", name: "Grok 4", company: "xAI", tags: ["reasoning","paid"], modality:["reasoning"], pricing:"paid" },
    { id: "grok-4-fast", name: "Grok 4 Fast", company: "xAI", tags: ["fast","paid"], modality:["general","fast"], pricing:"paid" },
    { id: "grok-3", name: "Grok 3", company: "xAI", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "grok-3-mini", name: "Grok 3 Mini", company: "xAI", tags: ["economical","freemium"], modality:["general"], pricing:"freemium" },

    // Mistral
    { id: "mistral-large", name: "Mistral Large", company: "Mistral", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "mistral-medium", name: "Mistral Medium", company: "Mistral", tags: ["practical","paid"], modality:["general"], pricing:"paid" },
    { id: "mistral-small", name: "Mistral Small", company: "Mistral", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },
    { id: "mistral-nemo", name: "Mistral Nemo", company: "Mistral", tags: ["light","free"], modality:["general"], pricing:"free" },
    { id: "mistral-code", name: "Mistral Code", company: "Mistral", tags: ["coding","paid"], modality:["coding"], pricing:"paid" },
    { id: "mixtral-8x22b", name: "Mixtral 8x22B", company: "Mistral", tags: ["reasoning","free"], modality:["reasoning"], pricing:"free" },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", company: "Mistral", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "pixtral", name: "Pixtral", company: "Mistral", tags: ["multimodal","freemium"], modality:["multimodal"], pricing:"freemium" },

    // DeepSeek
    { id: "deepseek-v4", name: "DeepSeek V4", company: "DeepSeek", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "deepseek-r1", name: "DeepSeek R1", company: "DeepSeek", tags: ["reasoning","free"], modality:["reasoning"], pricing:"free" },
    { id: "deepseek-v3", name: "DeepSeek V3", company: "DeepSeek", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", company: "DeepSeek", tags: ["coding","free"], modality:["coding"], pricing:"free" },
    { id: "deepseek-vl", name: "DeepSeek VL", company: "DeepSeek", tags: ["multimodal","free"], modality:["multimodal"], pricing:"free" },

    // Qwen / Alibaba
    { id: "qwen-3.6-plus", name: "Qwen 3.6-Plus", company: "Qwen / Alibaba", tags: ["coding","freemium"], modality:["coding"], pricing:"freemium" },
    { id: "qwen-3", name: "Qwen 3", company: "Qwen / Alibaba", tags: ["general","free"], modality:["general"], pricing:"free" },
    { id: "qwen-2.5-max", name: "Qwen 2.5 Max", company: "Qwen / Alibaba", tags: ["reasoning","freemium"], modality:["reasoning"], pricing:"freemium" },
    { id: "qwen-2.5-plus", name: "Qwen 2.5 Plus", company: "Qwen / Alibaba", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "qwen-2.5-coder", name: "Qwen 2.5 Coder", company: "Qwen / Alibaba", tags: ["coding","free"], modality:["coding"], pricing:"free" },
    { id: "qwen-vl", name: "Qwen VL", company: "Qwen / Alibaba", tags: ["multimodal","free"], modality:["multimodal"], pricing:"free" },

    // Baidu
    { id: "ernie-4.5", name: "Ernie 4.5", company: "Baidu", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "ernie-4.0", name: "Ernie 4.0", company: "Baidu", tags: ["reasoning","freemium"], modality:["reasoning"], pricing:"freemium" },
    { id: "ernie-speed", name: "Ernie Speed", company: "Baidu", tags: ["fast","freemium"], modality:["general","fast"], pricing:"freemium" },

    // Zhipu
    { id: "glm-5.1", name: "GLM-5.1", company: "Zhipu", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "glm-5v-turbo", name: "GLM-5V-Turbo", company: "Zhipu", tags: ["multimodal","freemium"], modality:["multimodal"], pricing:"freemium" },
    { id: "glm-4.6", name: "GLM-4.6", company: "Zhipu", tags: ["general","freemium"], modality:["general"], pricing:"freemium" },
    { id: "glm-4.5", name: "GLM-4.5", company: "Zhipu", tags: ["practical","freemium"], modality:["general"], pricing:"freemium" },

    // Cohere
    { id: "command-a", name: "Command A", company: "Cohere", tags: ["general","paid"], modality:["general"], pricing:"paid" },
    { id: "command-r", name: "Command R", company: "Cohere", tags: ["retrieval","paid"], modality:["retrieval"], pricing:"paid" },
    { id: "command-r-plus", name: "Command R+", company: "Cohere", tags: ["advanced","paid"], modality:["general"], pricing:"paid" },

    // Perplexity
    { id: "sonar", name: "Sonar", company: "Perplexity", tags: ["search","freemium"], modality:["search"], pricing:"freemium" },
    { id: "sonar-pro", name: "Sonar Pro", company: "Perplexity", tags: ["advanced","freemium"], modality:["search"], pricing:"freemium" },
    { id: "sonar-reasoner", name: "Sonar Reasoner", company: "Perplexity", tags: ["reasoning","freemium"], modality:["reasoning"], pricing:"freemium" },

    // Stability AI
    { id: "stable-diffusion-3.5", name: "Stable Diffusion 3.5", company: "Stability AI", tags: ["image","free"], modality:["image"], pricing:"free" },
    { id: "stable-diffusion-3", name: "Stable Diffusion 3", company: "Stability AI", tags: ["image","free"], modality:["image"], pricing:"free" },
    { id: "stable-audio-2.0", name: "Stable Audio 2.0", company: "Stability AI", tags: ["audio","free"], modality:["audio"], pricing:"free" }
];

// Unique modalities and pricing for capsules
const ALL_MODALITIES = ["general","agentic","fast","reasoning","advanced","image","voice","video","multimodal","coding","safety","search","retrieval","audio"];
// we'll only show a few main ones in capsules; we can use the first few unique ones or define a specific set:
const MODALITY_CAPSULES = ["image","voice","video","coding","reasoning","multimodal","general","search","audio"];
const PRICING_CAPSULES = ["free","freemium","paid"];

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