// assets/tavio.js
let prompts = [
    {
        id: 1,
        title: "Story Writer",
        category: "writing",
        template: "Write an engaging short story about {{character}} who lives in {{setting}}. The main conflict involves {{conflict}}."
    },
    {
        id: 2,
        title: "Code Explainer",
        category: "coding",
        template: "Explain this {{language}} code snippet in simple terms: {{code}}"
    },
    {
        id: 3,
        title: "Email Marketer",
        category: "marketing",
        template: "Write a cold outreach email for {{product}} targeting {{audience}}. Highlight the key benefit: {{benefit}}."
    },
    {
        id: 4,
        title: "Business Idea Validator",
        category: "business",
        template: "Evaluate this business idea: {{idea}}. Provide pros, cons, and market potential."
    }
];

let currentPrompt = null;
let currentVariables = {};

function renderPromptGrid(filteredPrompts) {
    const grid = document.getElementById('prompt-grid');
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
    const activeCat = document.querySelector('.category-chip.active').id.replace('cat-', '');
    
    let filtered = prompts;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchTerm) || 
            p.template.toLowerCase().includes(searchTerm)
        );
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
    
    const newPrompt = {
        id: Date.now(),
        title,
        category,
        template
    };
    
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
    if (index !== -1) {
        prompts[index] = currentPrompt;
    } else {
        prompts.unshift(currentPrompt);
    }
    
    alert("Prompt saved to library!");
    filterPrompts();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderPromptGrid(prompts);
    filterByCategory('all');
});