/*****************************************************
 *  Author: Armin Silatani
 *  Date: 2026-06-26
 *  Version: 4.0.3 (Final fully working Tavio with shared sidebar)
 ****************************************************/

// ======= 🚨 نیروی امداد برای حذف لودینگ (مستقل از هر چیزی) =======
(function killLoaderNow() {
    console.log('🔥🔥🔥 نیروی امداد لودینگ فعال شد');
    const killLoader = () => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.classList.add('hidden');
            loader.style.display = 'none';
            console.log('🔥 لودینگ با زور و در کسری از ثانیه حذف شد');
        } else {
            console.warn('🔥 المنت لودینگ پیدا نشد، شاید هنوز DOM آماده نبوده');
        }
    };

    // اگر DOM آماده باشد، مستقیم اجرا کن
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', killLoader);
    } else {
        killLoader();
    }

    // باز هم یک ضربه‌گیر امنیتی با تایمر ۱ ثانیه
    setTimeout(killLoader, 1000);
})();
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

/* =========================== MAIN APP ============================ */
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
    let currentUserRole = 'public';
    let tavioPrompts = [];
    let tavioCategories = [];
    let tavioSharedPrompts = [];
    let editingPromptId = null;
    let currentFilterCategory = 'all';
    let currentSearchTerm = '';
    let typingTimer = null;
    let currentPromptId = null;

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

    /* =========================== DOM REFS (non-sidebar) ============================ */
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
    async function fetchTavioPrompts() {
        if (!currentUser) { tavioPrompts = []; return []; }
        try {
            const { data, error } = await sbClient
                .from('tavio_prompts')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('pinned', { ascending: false })
                .order('created_at', { ascending: false });
            if (error) { console.error('Error fetching prompts:', error); return []; }
            tavioPrompts = (data || []).map(p => ({
                id: p.id, name: p.title, categories: p.categories || [], ais: p.ais || [],
                template: p.content, pinned: p.pinned || false, locked: p.locked || false,
                description: p.description || '', created_at: p.created_at, updated_at: p.updated_at
            }));
            return tavioPrompts;
        } catch (e) { console.error('Fetch prompts error:', e); return []; }
    }

    async function createTavioPrompt(name, categories, ais, template, pinned = false, locked = false, description = '') {
        if (!currentUser) { showToast('Please sign in to create prompts.'); return null; }
        const payload = { user_id: currentUser.id, title: name.trim(), content: template.trim(), categories: categories.filter(Boolean), ais: ais || [], pinned, locked, description: description.trim() };
        try {
            const { data, error } = await sbClient.from('tavio_prompts').insert([payload]).select();
            if (error) { console.error('Create prompt error:', error); showToast('Error creating prompt: ' + error.message); return null; }
            const newPrompt = data?.[0];
            if (newPrompt) {
                const formatted = { id: newPrompt.id, name: newPrompt.title, categories: newPrompt.categories || [], ais: newPrompt.ais || [], template: newPrompt.content, pinned: newPrompt.pinned || false, locked: newPrompt.locked || false, description: newPrompt.description || '', created_at: newPrompt.created_at, updated_at: newPrompt.updated_at };
                tavioPrompts.unshift(formatted);
                showToast('Prompt created successfully!');
                return formatted;
            }
            return null;
        } catch (e) { console.error('Create prompt error:', e); showToast('Error creating prompt'); return null; }
    }

    async function updateTavioPrompt(id, updates) {
        if (!currentUser) return false;
        try {
            const { error } = await sbClient.from('tavio_prompts').update({ title: updates.name, content: updates.template, categories: updates.categories || [], ais: updates.ais || [], pinned: updates.pinned || false, locked: updates.locked || false, description: updates.description || '', updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', currentUser.id);
            if (error) { console.error('Update prompt error:', error); showToast('Error updating prompt: ' + error.message); return false; }
            const idx = tavioPrompts.findIndex(p => p.id === id);
            if (idx !== -1) tavioPrompts[idx] = { ...tavioPrompts[idx], ...updates };
            showToast('Prompt updated successfully!');
            return true;
        } catch (e) { console.error('Update prompt error:', e); showToast('Error updating prompt'); return false; }
    }

    async function deleteTavioPrompt(id) {
        if (!currentUser) return false;
        try {
            const { error } = await sbClient.from('tavio_prompts').delete().eq('id', id).eq('user_id', currentUser.id);
            if (error) { console.error('Delete prompt error:', error); showToast('Error deleting prompt: ' + error.message); return false; }
            tavioPrompts = tavioPrompts.filter(p => p.id !== id);
            showToast('Prompt deleted successfully!');
            return true;
        } catch (e) { console.error('Delete prompt error:', e); showToast('Error deleting prompt'); return false; }
    }

    async function togglePinPrompt(id) {
        const prompt = tavioPrompts.find(p => p.id === id);
        if (!prompt) return false;
        const success = await updateTavioPrompt(id, { ...prompt, pinned: !prompt.pinned });
        if (success) { tavioPrompts.sort((a, b) => (a.pinned === b.pinned) ? 0 : a.pinned ? -1 : 1); renderAll(); }
        return success;
    }

    async function fetchTavioCategories() {
        if (!currentUser) { tavioCategories = []; return []; }
        try {
            const { data, error } = await sbClient.from('tavio_categories').select('*').eq('user_id', currentUser.id).order('name', { ascending: true });
            if (error) { console.error('Error fetching categories:', error); return []; }
            tavioCategories = data || [];
            return tavioCategories;
        } catch (e) { console.error('Fetch categories error:', e); return []; }
    }

    async function createTavioCategory(name, color = '#B0FFA5') {
        if (!currentUser) return null;
        try {
            const { data, error } = await sbClient.from('tavio_categories').insert([{ user_id: currentUser.id, name: name.trim(), color }]).select();
            if (error) { console.error('Create category error:', error); showToast('Error creating category: ' + error.message); return null; }
            const newCat = data?.[0];
            if (newCat) { tavioCategories.push(newCat); showToast('Category created successfully!'); return newCat; }
            return null;
        } catch (e) { console.error('Create category error:', e); showToast('Error creating category'); return null; }
    }

    async function deleteTavioCategory(id) {
        if (!currentUser) return false;
        try {
            for (const prompt of tavioPrompts) { if (prompt.categories?.includes(id)) { const newCats = prompt.categories.filter(c => c !== id); await updateTavioPrompt(prompt.id, { ...prompt, categories: newCats }); } }
            const { error } = await sbClient.from('tavio_categories').delete().eq('id', id).eq('user_id', currentUser.id);
            if (error) { console.error('Delete category error:', error); showToast('Error deleting category: ' + error.message); return false; }
            tavioCategories = tavioCategories.filter(c => c.id !== id);
            showToast('Category deleted successfully!');
            return true;
        } catch (e) { console.error('Delete category error:', e); showToast('Error deleting category'); return false; }
    }

    async function fetchConnections() {
        if (!currentUser) return [];
        try {
            const { data, error } = await sbClient.from('dashboard_connectionrequests').select('from_id, to_id, status').or(`from_id.eq.${currentUser.id},to_id.eq.${currentUser.id}`).eq('status', 'accepted');
            if (error || !data.length) return [];
            const userIds = data.map(conn => conn.from_id === currentUser.id ? conn.to_id : conn.from_id);
            const { data: profiles } = await sbClient.from('profiles').select('id, first_name, last_name, photo_url').in('id', userIds);
            return profiles || [];
        } catch (e) { console.error('Fetch connections error:', e); return []; }
    }

    async function shareTavioPrompt(promptId, receiverId) {
        if (!currentUser) { showToast('Please sign in to share prompts.'); return false; }
        try {
            const { error } = await sbClient.from('tavio_shared_prompts').insert([{ prompt_id: promptId, sender_id: currentUser.id, receiver_id: receiverId, status: 'pending' }]);
            if (error) { console.error('Share prompt error:', error); showToast('Error sharing prompt: ' + error.message); return false; }
            const prompt = tavioPrompts.find(p => p.id === promptId);
            await addNotificationToUser(receiverId, 'share', 'New shared prompt', `${currentProfile?.first_name || 'Someone'} shared a prompt with you: "${prompt?.name || 'Untitled'}"`, '#');
            showToast('Prompt shared successfully!');
            return true;
        } catch (e) { console.error('Share prompt error:', e); showToast('Error sharing prompt'); return false; }
    }

    async function fetchSharedPrompts() {
        if (!currentUser) return [];
        try {
            const { data, error } = await sbClient.from('tavio_shared_prompts').select(`*, sender:sender_id(id, first_name, last_name, photo_url), prompt:prompt_id(*)`).eq('receiver_id', currentUser.id).eq('status', 'pending');
            if (error) { console.error('Error fetching shared prompts:', error); return []; }
            tavioSharedPrompts = data || [];
            return tavioSharedPrompts;
        } catch (e) { console.error('Fetch shared prompts error:', e); return []; }
    }

    async function respondToSharedPrompt(shareId, accept) {
        if (!currentUser) return false;
        try {
            const status = accept ? 'accepted' : 'rejected';
            const { error } = await sbClient.from('tavio_shared_prompts').update({ status, responded_at: new Date().toISOString() }).eq('id', shareId).eq('receiver_id', currentUser.id);
            if (error) { console.error('Respond to share error:', error); showToast('Error responding to share: ' + error.message); return false; }
            if (accept) { const share = tavioSharedPrompts.find(s => s.id === shareId); if (share?.prompt) { await createTavioPrompt(share.prompt.title || 'Untitled', share.prompt.categories || [], share.prompt.ais || [], share.prompt.content || '', false, false, share.prompt.description || ''); showToast('Prompt added to your library!'); } }
            tavioSharedPrompts = tavioSharedPrompts.filter(s => s.id !== shareId);
            updateSharedBadge();
            return true;
        } catch (e) { console.error('Respond to share error:', e); showToast('Error responding to share'); return false; }
    }

    async function addNotificationToUser(userId, type, title, body, link) {
        try { await sbClient.from('notifications').insert({ user_id: userId, type, title, body, link }); } catch (e) { console.warn('Notification failed:', e); }
    }

    /* =========================== RENDER FUNCTIONS ============================ */
    function updateSharedBadge() { const badge = document.getElementById('tavio-shared-count'); if (badge) badge.textContent = tavioSharedPrompts.length; }

    function renderCategoryFilters() {
        const categories = getAllCategories();
        let html = '<button class="filter-chip active" data-category="all">All</button>';
        categories.forEach(cat => html += `<button class="filter-chip" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`);
        categoryFilters.innerHTML = html;
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.category === currentFilterCategory));
    }

    function renderLibrary() {
        let filtered = tavioPrompts.filter(p => (currentFilterCategory === 'all' || (p.categories || []).includes(currentFilterCategory)) && (!currentSearchTerm || p.name.toLowerCase().includes(currentSearchTerm.toLowerCase())));
        filtered = sortPrompts(filtered);
        if (filtered.length === 0) { promptList.innerHTML = '<p style="text-align:center; opacity:0.5; padding:40px;">No prompts found. Create your first prompt!</p>'; return; }

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
                aiBadgesHtml = visible.map(ai => `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`).join('') + `<span class="ai-badge">+${hiddenCount} more</span>`;
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
                            <button class="card-share" data-action="share" data-id="${p.id}" title="Share prompt">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                    <polyline points="16 6 12 2 8 6"/>
                                    <line x1="12" y1="2" x2="12" y2="15"/>
                                </svg>
                            </button>
                            <button class="card-edit" data-action="edit" data-id="${p.id}" title="Edit prompt">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                            </button>
                            <button class="card-delete" data-action="delete" data-id="${p.id}" title="Delete prompt">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
                if (e.target.closest('[data-action]')) return;
                const id = card.dataset.id;
                const prompt = tavioPrompts.find(p => p.id === id);
                if (prompt && prompt.locked) {
                    convertCardToPasswordInput(card, id);
                } else {
                    openBuilder(id);
                }
            });
        });
        document.querySelectorAll('[data-action="pin"]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); togglePinPrompt(btn.dataset.id); });
        });
        document.querySelectorAll('[data-action="share"]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); openShareModal(btn.dataset.id); });
        });
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(btn.dataset.id); });
        });
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); openConfirmModal('Delete this prompt?', async () => { await deleteTavioPrompt(btn.dataset.id); renderAll(); }); });
        });
    }

    function renderAll() { renderCategoryFilters(); renderLibrary(); updateCategoryDatalist(); updateSharedBadge(); }
    function updateCategoryDatalist() { categorySuggestions.innerHTML = getAllCategories().map(c => `<option value="${escapeHtml(c)}">`).join(''); }

    /* =========================== PASSWORD ============================ */
    const MASTER_PASSWORD = '1320';
    function convertCardToPasswordInput(cardElement, promptId) {
        if (cardElement.classList.contains('password-active')) return;
        cardElement.classList.add('password-active');
        const passwordForm = cardElement.querySelector('.card-password-form');
        const input = passwordForm.querySelector('.card-password-input');
        const submitBtn = passwordForm.querySelector('.card-password-submit');
        const cancelBtn = passwordForm.querySelector('.card-password-cancel');
        const errorDiv = passwordForm.querySelector('.card-password-error');
        input.focus();
        const handleSubmit = () => { if (input.value === MASTER_PASSWORD) openBuilder(promptId); else { errorDiv.textContent = 'Incorrect password.'; input.select(); } };
        const handleCancel = () => { cardElement.classList.remove('password-active'); input.value = ''; errorDiv.textContent = ''; };
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });
        submitBtn.addEventListener('click', (e) => e.stopPropagation());
        cancelBtn.addEventListener('click', (e) => e.stopPropagation());
    }

    /* =========================== BUILDER ============================ */
    function openBuilder(id) {
        const prompt = tavioPrompts.find(p => p.id === id);
        if (!prompt) { showToast('Prompt not found.'); return; }
        currentPromptId = id;
        builderTitle.textContent = prompt.name;
        promptDescription.textContent = prompt.description || '';
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
                return `<div class="placeholder-field"><label for="input_${escapeHtml(ph)}">${escapeHtml(ph)}</label><${tag}${extra} id="input_${escapeHtml(ph)}" placeholder="Enter ${escapeHtml(ph)}" autocomplete="off"></${tag}></div>`;
            }).join('');
        }
        placeholderInputs.innerHTML = fieldsHtml;
        document.querySelector('.container').classList.add('builder-mode');
        generatedPrompt.value = '';
        libraryView.classList.add('hidden');
        builderView.classList.remove('hidden');
    }

    function generatePrompt() {
        const prompt = tavioPrompts.find(p => p.id === currentPromptId);
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
            if (i < chars.length) { generatedPrompt.value += chars[i]; generatedPrompt.scrollTop = generatedPrompt.scrollHeight; i++; }
            else { clearInterval(typingTimer); generatedPrompt.classList.remove('typing'); }
        }, speed);
    }

    function copyToClipboard() {
        generatedPrompt.select();
        document.execCommand('copy');
        btnCopyPrompt.style.color = 'var(--accent)';
        setTimeout(() => { btnCopyPrompt.style.color = ''; }, 1000);
        showToast('Copied to clipboard!');
    }

    function clearBuilder() {
        const inputs = document.querySelectorAll('#placeholderInputs input, #placeholderInputs textarea');
        inputs.forEach(input => { input.value = ''; });
        generatedPrompt.value = '';
        if (typingTimer) { clearInterval(typingTimer); generatedPrompt.classList.remove('typing'); }
    }

    /* =========================== MODALS ============================ */
    function openModal(id) { const el = document.getElementById(id); if (el) { el.classList.add('open'); el.style.display = 'flex'; document.body.classList.add('modal-open'); } }
    function closeModal(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); el.style.display = 'none'; document.body.classList.remove('modal-open'); } }

    function openConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-modal-message');
        if (!modal || !msgEl) return;
        msgEl.textContent = message;
        openModal('confirm-modal');
        const yesBtn = document.getElementById('confirm-modal-yes');
        const noBtn = document.getElementById('confirm-modal-no');
        function cleanup() { closeModal('confirm-modal'); yesBtn.removeEventListener('click', handleYes); noBtn.removeEventListener('click', handleNo); }
        function handleYes() { cleanup(); if (typeof onConfirm === 'function') onConfirm(); }
        function handleNo() { cleanup(); }
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
        modal.addEventListener('click', function(e) { if (e.target === modal) cleanup(); });
    }

    function openEditModal(id) {
        const prompt = tavioPrompts.find(p => p.id === id);
        if (!prompt) return;
        editingPromptId = id;
        document.getElementById('tavio-edit-modal-title').textContent = 'Edit Prompt';
        document.getElementById('tavio-edit-prompt-title').value = prompt.name;
        document.getElementById('tavio-edit-prompt-content').value = prompt.template;
        document.getElementById('tavio-edit-prompt-pinned').checked = prompt.pinned;
        const catSelect = document.getElementById('tavio-edit-prompt-category');
        catSelect.innerHTML = '<option value="">No Category</option>';
        tavioCategories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            if (prompt.categories && prompt.categories.includes(cat.id)) opt.selected = true;
            catSelect.appendChild(opt);
        });
        openModal('tavio-edit-modal');
    }

    async function openShareModal(promptId) {
        const prompt = tavioPrompts.find(p => p.id === promptId);
        if (!prompt) return;
        document.getElementById('tavio-share-prompt-title').textContent = `Sharing: ${prompt.name}`;
        document.getElementById('tavio-share-confirm-btn').dataset.promptId = promptId;
        const select = document.getElementById('tavio-share-user-select');
        select.innerHTML = '<option value="">Select a connection...</option>';
        const connections = await fetchConnections();
        if (connections.length === 0) { select.innerHTML = '<option value="">No connections found. Connect with others first.</option>'; }
        else { connections.forEach(conn => { const opt = document.createElement('option'); opt.value = conn.id; opt.textContent = [conn.first_name, conn.last_name].filter(Boolean).join(' ') || conn.id; select.appendChild(opt); }); }
        openModal('tavio-share-modal');
    }

    /* =========================== SIDEBAR COMPONENT INTEGRATION ============================ */
    let sidebarComponent = null;

    function getSidebarComponent() {
        if (!sidebarComponent) sidebarComponent = document.querySelector('sidebar-component');
        return sidebarComponent;
    }

    customElements.whenDefined('sidebar-component').then(() => {
        const comp = getSidebarComponent();
        if (!comp) return;
        comp.addEventListener('login-request', () => openAuthOverlay());
        comp.addEventListener('logout-request', async () => await sbClient.auth.signOut());
    });

    /* =========================== SIDEBAR COMPONENT INTEGRATION ============================ */
async function restoreSessionAndSidebar() {
    const comp = getSidebarComponent(); // ممکن است null برگرداند

    try {
        const { data: { session } } = await sbClient.auth.getSession();
        if (session?.user) {
            currentUser = session.user;
            currentProfile = await fetchProfile(session.user.id);
            currentUserRole = currentProfile?.role || 'recruit';

            // اگر کامپوننت موجود باشد، user را به آن بده
            if (comp && comp.setUser) {
                comp.setUser(currentUser, currentProfile);
            }

            await fetchTavioCategories();
            await fetchTavioPrompts();
            await fetchSharedPrompts();
            renderAll(); // رندر اولیه بعد از احراز هویت
        }
    } catch (e) {
        console.warn('Session restore failed:', e);
    }
}

    async function fetchProfile(userId) {
        try {
            const { data, error } = await sbClient.from('profiles').select('*').eq('id', userId).single();
            if (error || !data) {
                const { data: { user } } = await sbClient.auth.getUser();
                const md = user?.user_metadata || {};
                return { id: userId, role: md.role || 'recruit', first_name: md.first_name || '', last_name: md.last_name || '', photo_url: md.photo_url || '', email: user?.email || '' };
            }
            return data;
        } catch (e) { return { id: userId, role: 'recruit', first_name: '', last_name: '', photo_url: '' }; }
    }

    async function applyUserProfile(user) {
        if (!user) { setLoggedOutUI(); return; }
        currentUser = user;
        if (!currentProfile || currentProfile.id !== user.id) currentProfile = await fetchProfile(user.id);
        currentUserRole = currentProfile?.role || 'recruit';
        const comp = getSidebarComponent();
        if (comp && comp.setUser) comp.setUser(currentUser, currentProfile);
        await fetchTavioCategories(); await fetchTavioPrompts(); await fetchSharedPrompts();
        renderAll();
    }

    function setLoggedOutUI() {
        currentUser = null; currentProfile = null; currentUserRole = 'public';
        tavioPrompts = []; tavioCategories = []; tavioSharedPrompts = [];
        const comp = getSidebarComponent();
        if (comp && comp.clearUser) comp.clearUser();
        renderAll();
    }

    /* =========================== AUTH ============================ */
    let authEmail = '';
    const authOverlay = document.getElementById('auth-overlay');

    function showStep(stepId) {
        ['step-1', 'step-2-login', 'step-2-register', 'step-forgot'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const stepEl = document.getElementById(stepId);
        if (stepEl) stepEl.classList.remove('hidden');
    }

    function openAuthOverlay() {
        if (authOverlay) {
            authOverlay.classList.remove('hidden');
            authOverlay.style.display = 'flex';
            showStep('step-1');
            document.getElementById('auth-email').value = '';
            const errEl = document.getElementById('auth-error');
            if (errEl) errEl.textContent = '';
        }
    }

    function closeAuthOverlay() {
        if (authOverlay) { authOverlay.classList.add('hidden'); authOverlay.style.display = 'none'; }
    }

    document.getElementById('auth-continue-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value.trim();
        const errEl = document.getElementById('auth-error');
        if (!email) { errEl.textContent = 'Please enter an email address.'; return; }
        errEl.textContent = '';
        authEmail = email;
        try {
            const { data: exists, error } = await sbClient.rpc('check_email_exists', { email_to_check: email });
            if (error) { errEl.textContent = 'Service unavailable.'; return; }
            if (exists) { document.getElementById('auth-user-email').textContent = email; showStep('step-2-login'); }
            else { showStep('step-2-register'); document.getElementById('reg-form-fields').style.display = ''; document.getElementById('reg-success').style.display = 'none'; }
        } catch { errEl.textContent = 'Network error.'; }
    });

    document.getElementById('auth-signin-btn')?.addEventListener('click', async () => {
        const password = document.getElementById('auth-password').value;
        const errEl = document.getElementById('auth-error-login');
        if (!password) { errEl.textContent = 'Password is required.'; return; }
        errEl.textContent = '';
        const { error } = await sbClient.auth.signInWithPassword({ email: authEmail, password });
        if (error) { errEl.textContent = error.message; return; }
        closeAuthOverlay();
    });

    document.getElementById('auth-register-btn')?.addEventListener('click', async () => {
        const first = document.getElementById('reg-firstname').value.trim();
        const last = document.getElementById('reg-lastname').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const errEl = document.getElementById('auth-error-register');
        if (!first || !last) { errEl.textContent = 'All fields are required.'; return; }
        if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }
        if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
        errEl.textContent = '';
        const { error } = await sbClient.auth.signUp({ email: authEmail, password, options: { data: { first_name: first, last_name: last } } });
        if (error) { errEl.textContent = error.message; return; }
        document.getElementById('reg-form-fields').style.display = 'none';
        document.getElementById('reg-success').style.display = 'block';
    });

    document.getElementById('reg-to-login-btn')?.addEventListener('click', () => {
        document.getElementById('reg-success').style.display = 'none';
        document.getElementById('reg-form-fields').style.display = '';
        showStep('step-1');
        document.getElementById('auth-email').value = '';
        document.getElementById('reg-firstname').value = '';
        document.getElementById('reg-lastname').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm').value = '';
    });

    document.getElementById('auth-forgot-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('forgot-email').value = authEmail;
        showStep('step-forgot');
    });

    document.getElementById('auth-send-reset-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value.trim();
        const msgEl = document.getElementById('auth-success-msg');
        if (!email) { msgEl.textContent = 'Please enter your email.'; return; }
        const { error } = await sbClient.auth.resetPasswordForEmail(email);
        msgEl.textContent = error ? 'Error: ' + error.message : 'If an account exists, a reset link has been sent.';
    });

    document.getElementById('auth-back-to-login')?.addEventListener('click', (e) => { e.preventDefault(); showStep('step-2-login'); });

    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.getAttribute('data-target'));
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    authOverlay?.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuthOverlay(); });

    /* =========================== AUTH STATE ============================ */
    sbClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) { await applyUserProfile(session.user); }
        else { setLoggedOutUI(); }
        if (event === 'SIGNED_IN') { closeAuthOverlay(); showToast('Signed in successfully!'); }
        else if (event === 'SIGNED_OUT') { showToast('Signed out.'); }
    });

    /* =========================== OTHER EVENT LISTENERS ============================ */
    document.getElementById('tavio-edit-save-btn')?.addEventListener('click', async function() {
        const title = document.getElementById('tavio-edit-prompt-title').value.trim();
        const content = document.getElementById('tavio-edit-prompt-content').value.trim();
        const pinned = document.getElementById('tavio-edit-prompt-pinned').checked;
        const catSelect = document.getElementById('tavio-edit-prompt-category');
        const categoryId = catSelect.value || null;
        if (!title || !content) { showToast('Title and content are required.'); return; }
        const prompt = tavioPrompts.find(p => p.id === editingPromptId);
        if (!prompt) return;
        let categories = prompt.categories || [];
        if (categoryId && !categories.includes(categoryId)) categories.push(categoryId);
        const success = await updateTavioPrompt(editingPromptId, { name: title, template: content, categories, pinned, ais: prompt.ais || [], locked: prompt.locked || false, description: prompt.description || '' });
        if (success) { closeModal('tavio-edit-modal'); renderAll(); }
    });
    document.getElementById('tavio-edit-cancel-btn')?.addEventListener('click', () => closeModal('tavio-edit-modal'));
    document.getElementById('tavio-edit-modal-close')?.addEventListener('click', () => closeModal('tavio-edit-modal'));

    document.getElementById('tavio-categories-btn')?.addEventListener('click', async () => { await renderCategoriesModal(); openModal('tavio-categories-modal'); });
    async function renderCategoriesModal() {
        const container = document.getElementById('tavio-categories-list');
        if (!container) return;
        await fetchTavioCategories();
        if (tavioCategories.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary);">No categories yet.</p>'; return; }
        container.innerHTML = tavioCategories.map(cat => `<div class="tavio-category-item" data-id="${cat.id}"><span class="cat-color" style="background:${cat.color || '#B0FFA5'}"></span><span class="cat-name">${escapeHtml(cat.name)}</span><button class="cat-delete" data-action="delete-category" data-id="${cat.id}">✕</button></div>`).join('');
        container.querySelectorAll('[data-action="delete-category"]').forEach(btn => btn.addEventListener('click', async function() { openConfirmModal('Delete this category?', async () => { await deleteTavioCategory(this.dataset.id); await renderCategoriesModal(); renderAll(); }); }));
    }
    document.getElementById('tavio-add-category-btn')?.addEventListener('click', async function() {
        const input = document.getElementById('tavio-new-category-input');
        const colorInput = document.getElementById('tavio-new-category-color');
        const name = input.value.trim();
        if (!name) { showToast('Please enter a category name.'); return; }
        await createTavioCategory(name, colorInput.value);
        input.value = '';
        await renderCategoriesModal();
        renderAll();
    });
    document.getElementById('tavio-categories-modal-close')?.addEventListener('click', () => closeModal('tavio-categories-modal'));
    document.getElementById('tavio-share-confirm-btn')?.addEventListener('click', async function() {
        const promptId = this.dataset.promptId;
        const receiverId = document.getElementById('tavio-share-user-select').value;
        if (!receiverId) { showToast('Please select a user to share with.'); return; }
        await shareTavioPrompt(promptId, receiverId);
        closeModal('tavio-share-modal');
    });
    document.getElementById('tavio-share-modal-close')?.addEventListener('click', () => closeModal('tavio-share-modal'));
    document.getElementById('tavio-shared-btn')?.addEventListener('click', async () => { await openSharedRequestsModal(); });
    async function openSharedRequestsModal() {
        const requests = await fetchSharedPrompts();
        const container = document.getElementById('tavio-shared-requests-list');
        if (requests.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:20px;">No pending requests.</p>'; }
        else {
            container.innerHTML = requests.map(req => `<div class="tavio-shared-request" data-id="${req.id}"><div class="tavio-shared-request-info"><strong>${escapeHtml(req.sender?.first_name || 'Someone')}</strong><span>shared: ${escapeHtml(req.prompt?.title || 'Untitled')}</span></div><div class="tavio-shared-request-actions"><button class="btn btn-accent btn-sm" data-action="accept-share" data-id="${req.id}">Accept</button><button class="btn btn-outline btn-sm" data-action="reject-share" data-id="${req.id}">Reject</button></div></div>`).join('');
            container.querySelectorAll('[data-action="accept-share"]').forEach(btn => btn.addEventListener('click', async function() { await respondToSharedPrompt(this.dataset.id, true); await openSharedRequestsModal(); renderAll(); }));
            container.querySelectorAll('[data-action="reject-share"]').forEach(btn => btn.addEventListener('click', async function() { await respondToSharedPrompt(this.dataset.id, false); await openSharedRequestsModal(); renderAll(); }));
        }
        updateSharedBadge();
        openModal('tavio-shared-requests-modal');
    }
    document.getElementById('tavio-shared-requests-close')?.addEventListener('click', () => closeModal('tavio-shared-requests-modal'));

    document.getElementById('tavio-new-prompt-btn')?.addEventListener('click', () => {
        if (!currentUser) { openAuthOverlay(); showToast('Please sign in to create prompts.'); return; }
        promptFormContainer.classList.remove('hidden');
        promptNameInput.value = ''; promptCategoryInput.value = ''; promptTemplateInput.value = ''; promptLockedCheckbox.checked = false;
        Array.from(promptAiSelect.options).forEach(opt => opt.selected = false); promptAiSelect.selectedIndex = -1;
    });
    savePromptBtn?.addEventListener('click', async function() {
        const name = promptNameInput.value.trim(); const catRaw = promptCategoryInput.value.trim(); const template = promptTemplateInput.value.trim();
        const selected = Array.from(promptAiSelect.selectedOptions).map(opt => opt.value);
        const locked = promptLockedCheckbox ? promptLockedCheckbox.checked : false;
        if (!name || !catRaw || !template) { showToast('Please fill in all fields.'); return; }
        const categories = catRaw.split(',').map(c => c.trim()).filter(Boolean);
        const result = await createTavioPrompt(name, categories, selected, template, false, locked);
        if (result) { promptFormContainer.classList.add('hidden'); renderAll(); }
    });
    cancelPromptBtn?.addEventListener('click', () => { promptFormContainer.classList.add('hidden'); });

    searchInput?.addEventListener('input', (e) => { currentSearchTerm = e.target.value; renderLibrary(); });
    categoryFilters?.addEventListener('click', (e) => { const chip = e.target.closest('.filter-chip'); if (!chip) return; currentFilterCategory = chip.dataset.category; document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active')); chip.classList.add('active'); renderLibrary(); });

    btnBackToLibrary?.addEventListener('click', () => { builderView.classList.add('hidden'); libraryView.classList.remove('hidden'); currentPromptId = null; placeholderInputs.innerHTML = ''; aiModelsFull.innerHTML = ''; generatedPrompt.value = ''; document.querySelector('.container').classList.remove('builder-mode'); if (typingTimer) { clearInterval(typingTimer); generatedPrompt.classList.remove('typing'); } });
    btnGeneratePrompt?.addEventListener('click', generatePrompt);
    btnCopyPrompt?.addEventListener('click', copyToClipboard);
    btnClearBuilder?.addEventListener('click', clearBuilder);

/* =========================== INIT (مطابق معماری Ravlo) ============================ */
/* =========================== INIT (نسخه نهایی با لاگ‌های کامل) ============================ */
async function initApp() {
    console.log('🚀 [Tavio] شروع راه‌اندازی...');

    const container = document.getElementById('app-container');
    const loader = document.getElementById('initial-loader');

    if (!container) {
        console.error('❌ container با id "app-container" پیدا نشد!');
        return;
    }

    console.log('📦 container پیدا شد، کلاس فعلی:', container.className);

    try {
        // بررسی sbClient
        console.log('🔍 بررسی sbClient...');
        if (!sbClient) {
            console.error('❌ sbClient تعریف نشده است!');
            throw new Error('sbClient is null');
        }
        console.log('✅ sbClient موجود است');

        // ۱. احراز هویت
        console.log('🔑 دریافت نشست از Supabase...');
        const { data: { session }, error } = await sbClient.auth.getSession();
        if (error) {
            console.error('⚠️ خطا در دریافت نشست:', error);
        } else {
            console.log('✅ نشست دریافت شد، کاربر:', session?.user?.email || 'مهمان');
        }

        if (session?.user) {
            currentUser = session.user;
            console.log('👤 کاربر وارد شد:', currentUser.email);

            console.log('👤 دریافت پروفایل...');
            currentProfile = await fetchProfile(session.user.id);
            currentUserRole = currentProfile?.role || 'recruit';
            console.log('✅ پروفایل:', currentProfile?.first_name, currentProfile?.last_name);

            console.log('📂 دریافت دسته‌بندی‌ها...');
            await fetchTavioCategories();
            console.log('✅ تعداد دسته‌بندی‌ها:', tavioCategories.length);

            console.log('📄 دریافت پرامپت‌ها...');
            await fetchTavioPrompts();
            console.log('✅ تعداد پرامپت‌ها:', tavioPrompts.length);

            console.log('📨 دریافت درخواست‌های اشتراک...');
            await fetchSharedPrompts();
            console.log('✅ تعداد اشتراک‌ها:', tavioSharedPrompts.length);

            // اتصال به سایدبار (اختیاری)
            try {
                const comp = getSidebarComponent();
                if (comp && typeof comp.setUser === 'function') {
                    comp.setUser(currentUser, currentProfile);
                    console.log('✅ سایدبار به‌روز شد');
                } else {
                    console.log('ℹ️ سایدبار در دسترس نیست (اختیاری)');
                }
            } catch (e) {
                console.warn('⚠️ خطای غیربحرانی در سایدبار:', e);
            }

        } else {
            console.log('👤 کاربر مهمان');
            currentUser = null;
            currentProfile = null;
            tavioPrompts = [];
            tavioCategories = [];
            tavioSharedPrompts = [];
        }

    } catch (e) {
        console.error('❌ خطای بحرانی در راه‌اندازی:', e);
        console.error('📋 جزئیات خطا:', e.stack);
    }

    // ۲. نمایش اپلیکیشن و مخفی کردن لودینگ (حتی اگر خطا باشد)
    console.log('🔄 مرحله نهایی: نمایش اپلیکیشن');
    if (container) {
        container.classList.remove('app-hidden');
        console.log('✅ کلاس app-hidden حذف شد');
    }
    if (loader) {
        loader.classList.add('hidden');
        loader.style.display = 'none';
        console.log('✅ لودینگ مخفی شد');
    }
    renderAll();
    console.log('✅ [Tavio] راه‌اندازی کامل شد.');
}

// ======= تضمین اجرا در هر شرایطی =======
console.log('🔄 [Tavio] راه‌اندازی برنامه...');

// اجرای مستقیم اگر DOM آماده باشد
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ضربه‌گیر امنیتی برای مواقعی که initApp به هر دلیل اجرا نشود
setTimeout(() => {
    const container = document.getElementById('app-container');
    if (container && container.classList.contains('app-hidden')) {
        console.warn('⚠️ برنامه هنوز شروع نشده، اجرای مجدد...');
        initApp();
    }
}, 3000);
});