(function() {
    'use strict';

    // ---------- DATA: Categorized prompt templates ----------
    const library = [
        {
            category: 'Marketing',
            templates: [
                {
                    name: 'Ad Copy',
                    text: 'Write a catchy ad for {product} targeting {audience} that highlights {benefit}.'
                },
                {
                    name: 'Email Subject',
                    text: 'Create 5 email subject lines about {topic} for a {brand} audience.'
                },
                {
                    name: 'Social Post',
                    text: 'Generate a {platform} post about {event} using a {tone} tone.'
                }
            ]
        },
        {
            category: 'Coding',
            templates: [
                {
                    name: 'Function Skeleton',
                    text: 'Write a {language} function named {function_name} that {description}. Include error handling.'
                },
                {
                    name: 'Code Review',
                    text: 'Review the following {language} code for {focus_area}:\n```\n{code_snippet}\n```'
                },
                {
                    name: 'Unit Test',
                    text: 'Generate unit tests for the {function_name} function in {framework}.'
                }
            ]
        },
        {
            category: 'Creative',
            templates: [
                {
                    name: 'Story Starter',
                    text: 'Begin a {genre} story set in {setting} with a character who {character_trait}.'
                },
                {
                    name: 'Poem Prompt',
                    text: 'Write a {poem_type} about {theme} inspired by {inspiration}.'
                }
            ]
        }
    ];

    // ---------- DOM elements ----------
    const categoryList = document.getElementById('categoryList');
    const templateList = document.getElementById('templateList');
    const templatePreview = document.getElementById('templatePreview');
    const formSection = document.getElementById('formSection');
    const outputDisplay = document.getElementById('outputDisplay');
    const outputActions = document.getElementById('outputActions');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    // ---------- State ----------
    let currentCategoryIndex = 0;
    let selectedTemplate = null;        // template object from library
    let placeholderFields = [];         // { name, inputElement }
    let isTyping = false;
    let typingInterval = null;
    let generatedText = '';

    // ---------- Helpers ----------
    function extractPlaceholders(templateText) {
        const regex = /\{([^}]+)\}/g;
        const names = [];
        let match;
        while ((match = regex.exec(templateText)) !== null) {
            if (!names.includes(match[1])) names.push(match[1]);
        }
        return names;
    }

    function highlightPlaceholders(text) {
        return text.replace(/\{([^}]+)\}/g, '<span class="placeholder-highlight">$1</span>');
    }

    function buildFinalPrompt(templateText, fieldMap) {
        return templateText.replace(/\{([^}]+)\}/g, (match, name) => {
            const value = fieldMap[name] || '';
            return value;
        });
    }

    function resetUI(keepTemplate = false) {
        stopTyping();
        outputDisplay.textContent = '';
        outputDisplay.classList.remove('typing-cursor');
        outputActions.classList.remove('visible');
        generatedText = '';

        if (!keepTemplate) {
            selectedTemplate = null;
            placeholderFields = [];
            formSection.innerHTML = '';
            templatePreview.innerHTML = '';
            templateList.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
        } else {
            // keep template but clear input values and output
            if (placeholderFields.length) {
                placeholderFields.forEach(f => {
                    if (f.inputElement) f.inputElement.value = '';
                });
                updateGenerateButton();
            }
        }
    }

    function stopTyping() {
        if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
        }
        isTyping = false;
    }

    function typewriterEffect(text, targetElement, onComplete) {
        stopTyping();
        targetElement.textContent = '';
        targetElement.classList.add('typing-cursor');
        let index = 0;
        isTyping = true;

        typingInterval = setInterval(() => {
            if (index < text.length) {
                targetElement.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typingInterval);
                typingInterval = null;
                isTyping = false;
                targetElement.classList.remove('typing-cursor');
                if (onComplete) onComplete();
            }
        }, 25);
    }

    function updateGenerateButton() {
        const btn = document.getElementById('generateBtn');
        if (!btn) return;
        const allFilled = placeholderFields.every(f => f.inputElement && f.inputElement.value.trim() !== '');
        btn.disabled = !allFilled;
    }

    // ---------- Render categories ----------
    function renderCategories() {
        categoryList.innerHTML = '';
        library.forEach((cat, idx) => {
            const btn = document.createElement('button');
            btn.className = 'category-btn' + (idx === currentCategoryIndex ? ' active' : '');
            btn.textContent = cat.category;
            btn.addEventListener('click', () => {
                if (isTyping) return;
                currentCategoryIndex = idx;
                renderCategories();
                renderTemplates();
                resetUI(false);
            });
            categoryList.appendChild(btn);
        });
    }

    // ---------- Render templates for current category ----------
    function renderTemplates() {
        templateList.innerHTML = '';
        const cat = library[currentCategoryIndex];
        cat.templates.forEach((tmpl, idx) => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.textContent = tmpl.name;
            item.addEventListener('click', () => {
                if (isTyping) return;
                selectTemplate(tmpl, item);
            });
            if (selectedTemplate === tmpl) {
                item.classList.add('selected');
            }
            templateList.appendChild(item);
        });
    }

    // ---------- Select template ----------
    function selectTemplate(tmpl, element) {
        stopTyping();
        resetUI(false);
        selectedTemplate = tmpl;

        // highlight in list
        templateList.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
        if (element) element.classList.add('selected');

        // show preview with highlighted placeholders
        templatePreview.innerHTML = highlightPlaceholders(tmpl.text);

        // build form fields
        const placeholders = extractPlaceholders(tmpl.text);
        placeholderFields = [];
        formSection.innerHTML = '';

        placeholders.forEach(name => {
            const group = document.createElement('div');
            group.className = 'input-group';

            const label = document.createElement('label');
            label.textContent = name.replace(/_/g, ' ');
            label.setAttribute('for', 'field_' + name);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'field_' + name;
            input.placeholder = 'Enter ' + name.replace(/_/g, ' ');
            input.addEventListener('input', updateGenerateButton);

            group.appendChild(label);
            group.appendChild(input);
            formSection.appendChild(group);

            placeholderFields.push({ name, inputElement: input });
        });

        // generate button
        const generateBtn = document.createElement('button');
        generateBtn.className = 'btn-generate';
        generateBtn.id = 'generateBtn';
        generateBtn.textContent = 'Generate Prompt';
        generateBtn.disabled = true;
        generateBtn.addEventListener('click', handleGenerate);
        formSection.appendChild(generateBtn);

        updateGenerateButton();
        // clear output
        outputDisplay.textContent = '';
        outputActions.classList.remove('visible');
    }

    // ---------- Handle generate ----------
    function handleGenerate() {
        if (!selectedTemplate || isTyping) return;
        const fieldMap = {};
        placeholderFields.forEach(f => {
            fieldMap[f.name] = f.inputElement ? f.inputElement.value.trim() : '';
        });

        const finalPrompt = buildFinalPrompt(selectedTemplate.text, fieldMap);
        generatedText = finalPrompt;

        // hide actions while typing
        outputActions.classList.remove('visible');
        typewriterEffect(finalPrompt, outputDisplay, () => {
            // typing finished, show copy & clear
            outputActions.classList.add('visible');
        });
    }

    // ---------- Copy ----------
    copyBtn.addEventListener('click', async () => {
        if (!generatedText) return;
        try {
            await navigator.clipboard.writeText(generatedText);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
        } catch (err) {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = generatedText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
        }
    });

    // ---------- Clear ----------
    clearBtn.addEventListener('click', () => {
        resetUI(true); // keep selected template, clear fields & output
        // re-focus first input if exists
        const firstInput = document.querySelector('.input-group input');
        if (firstInput) firstInput.focus();
    });

    // ---------- Init ----------
    renderCategories();
    renderTemplates();
    resetUI(false);
})();