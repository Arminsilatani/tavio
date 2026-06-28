document.addEventListener('DOMContentLoaded', () => {
    const templateInput = document.getElementById('template-input');
    const fieldsSection = document.getElementById('fields-section');
    const fieldsContainer = document.getElementById('fields-container');
    const generateBtn = document.getElementById('generate-btn');
    
    const outputSection = document.getElementById('output-section');
    const outputText = document.getElementById('output-text');
    const typeCursor = document.getElementById('type-cursor');
    const actionButtons = document.getElementById('action-buttons');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');

    let variables = [];
    let finalPrompt = "";
    let isTyping = false;
    let typingTimeout;

    // Regex to match [variable] or {variable}
    const varRegex = /\[([^\]]+)\]|\{([^}]+)\}/g;

    templateInput.addEventListener('input', handleTemplateInput);
    generateBtn.addEventListener('click', generatePrompt);
    copyBtn.addEventListener('click', copyToClipboard);
    resetBtn.addEventListener('click', resetTool);

    function handleTemplateInput() {
        const text = templateInput.value;
        const matches = [...text.matchAll(varRegex)];
        
        // Extract unique variable names, removing brackets/braces
        const foundVars = [...new Set(matches.map(m => m[1] || m[2]))];

        if (foundVars.length > 0) {
            if (JSON.stringify(variables) !== JSON.stringify(foundVars)) {
                variables = foundVars;
                renderFields();
            }
            fieldsSection.style.display = 'block';
        } else {
            variables = [];
            fieldsContainer.innerHTML = '';
            fieldsSection.style.display = 'none';
        }
    }

    function renderFields() {
        fieldsContainer.innerHTML = '';
        variables.forEach(v => {
            const group = document.createElement('div');
            group.className = 'field-group';
            
            const label = document.createElement('label');
            label.textContent = v.replace(/[_]/g, ' ');
            label.setAttribute('for', `field-${v}`);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `field-${v}`;
            input.placeholder = `Enter ${v.replace(/[_]/g, ' ')}...`;
            input.dataset.varName = v;

            group.appendChild(label);
            group.appendChild(input);
            fieldsContainer.appendChild(group);
        });
    }

    function generatePrompt() {
        if (isTyping) return;

        let promptTemplate = templateInput.value;
        
        // Replace all variables with user input
        variables.forEach(v => {
            const inputEl = document.getElementById(`field-${v}`);
            const val = inputEl && inputEl.value.trim() !== '' ? inputEl.value : `[${v}]`;
            
            // Replace globally for this specific variable
            const specificRegex = new RegExp(`\\[${v}\\]|\\{${v}\\}`, 'g');
            promptTemplate = promptTemplate.replace(specificRegex, val);
        });

        finalPrompt = promptTemplate;
        
        // Setup UI for typing
        outputSection.style.display = 'block';
        actionButtons.style.display = 'none';
        outputText.textContent = '';
        typeCursor.style.display = 'inline-block';
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        typeWriterEffect(finalPrompt, 0);
    }

    function typeWriterEffect(text, index) {
        isTyping = true;
        if (index < text.length) {
            outputText.textContent += text.charAt(index);
            // Randomize typing speed slightly for realism (10ms to 30ms)
            const speed = Math.floor(Math.random() * 20) + 10;
            typingTimeout = setTimeout(() => typeWriterEffect(text, index + 1), speed);
        } else {
            isTyping = false;
            typeCursor.style.display = 'none';
            actionButtons.style.display = 'flex';
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(finalPrompt).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#fff';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'var(--accent)';
            }, 2000);
        });
    }

    function resetTool() {
        // Clear all dynamic inputs
        const inputs = fieldsContainer.querySelectorAll('input');
        inputs.forEach(input => input.value = '');

        // Hide output section
        outputSection.style.display = 'none';
        outputText.textContent = '';
        actionButtons.style.display = 'none';
        
        // Clear timeouts if any
        clearTimeout(typingTimeout);
        isTyping = false;

        // Scroll back to fields
        fieldsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus first input
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }
});
