/* :::::::::::::::::::::::::: IMPORTS AND CONFIGURATION :::::::::::::::::::::::::: */
const SUPABASE_URL = "https://vzqicidepdmraygulrey.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kqRWgOmLISOE2EuLL1s8fw_WN6FJRTI";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { ALL_AI_MODELS, COMPANY_LOGOS } from "./ai-models-data.js";

function countTokens(text) {
    const enc = window.__tokEncode;
    if (typeof enc === "function") {
        try {
            return enc(text).length;
        } catch (e) {}
    }
    return Math.ceil(String(text || "").length / 4);
}

/* :::::::::::::::::::::::::: GLOBAL CONSTANTS :::::::::::::::::::::::::: */
const ALL_CATEGORIES = [
    {
        id: "writing",
        label: "Writing",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>`,
    },
    {
        id: "coding",
        label: "Coding",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>`,
    },
    {
        id: "marketing",
        label: "Marketing",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /></svg>`,
    },
    {
        id: "analysis",
        label: "Analysis",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`,
    },
    {
        id: "education",
        label: "Education / Learning",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>`,
    },
    {
        id: "productivity",
        label: "Productivity",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>`,
    },
    {
        id: "creative",
        label: "Creative",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>`,
    },
    {
        id: "image_media",
        label: "Image / Media",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`,
    },
];

const ALL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`;

const MODALITY_CAPSULES = [
    "general",
    "reasoning",
    "coding",
    "agentic",
    "vision",
    "search",
    "image",
    "image-edit",
    "text-to-video",
    "image-to-video",
    "video-edit",
    "audio",
    "multimodal",
    "document",
];

/* :::::::::::::::::::::::::: APPLICATION STATE :::::::::::::::::::::::::: */
let currentUser = null;
let currentProfile = null;
let currentUserRole = "public";
let sidebarComponent = null;
let editingPromptId = null;

let prompts = [];
let currentPrompt = null;
let currentVariables = {};
let shareTargetPromptId = null;
let selectedShareUsers = [];
let generateInterval = null;
let deletingPromptId = null;

let fieldDefinitions = [];

let selectedAIModels = [];

let modalSelectedAIModels = [];
let modalSelectedCategories = [];

let activeCategoryFilters = [];

let aiModelsExpanded = false;
let aiDropdownOpen = false;
let aiFilterAreaVisible = false;
let aiCompanyExpanded = {};

let modalAIModalityFilters = [];

let selectedPartsCount = null;
let lastComputedTotalTokens = 0;
let lastMinParts = 1;
let lastMaxParts = 1;
let tokenPreviewDebounce = null;
let userTouchedPartsSlider = false;

/* :::::::::::::::::::::::::: ACCESS CONTROL :::::::::::::::::::::::::: */
const ROLE_HIERARCHY = ["recruit", "sergeant", "commander", "general"];
const APP_MIN_ROLE = "commander";

function hasMinRole(userRole) {
    const normalized = String(userRole || "")
        .trim()
        .toLowerCase();
    const userIndex = ROLE_HIERARCHY.indexOf(normalized);
    const minIndex = ROLE_HIERARCHY.indexOf(APP_MIN_ROLE);
    return userIndex >= minIndex;
}

function showAccessDenied(message = "Access denied.") {
    const overlay = document.createElement("div");
    overlay.id = "access-denied-overlay";
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    const box = document.createElement("div");
    box.style.cssText = `
        background: rgba(20, 20, 20, 0.9);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 32px 40px;
        text-align: center;
        color: #FFF;
        font-family: inherit;
        font-size: 16px;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        transform: scale(0.9);
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    `;
    box.innerHTML = `
        <div style="margin-bottom:12px; display:flex; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px; height:40px; color: var(--accent, #FF6F91);">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
        </div>
        <p style="margin:0; line-height:1.5;">${message}</p>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    if (!document.getElementById("access-denied-styles")) {
        const style = document.createElement("style");
        style.id = "access-denied-styles";
        style.textContent = `
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes popIn { 0% { transform: scale(0.8); opacity:0; } 100% { transform: scale(1); opacity:1; } }
        `;
        document.head.appendChild(style);
    }
}

/* :::::::::::::::::::::::::: TOAST NOTIFICATIONS :::::::::::::::::::::::::: */
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "ravlo-toast";

    const radius = 10;
    const circumference = 2 * Math.PI * radius;

    toast.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" class="toast-ring">
            <circle cx="12" cy="12" r="${radius}" fill="none"
                    stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <circle cx="12" cy="12" r="${radius}" fill="none"
                    stroke="#0D0D0D" stroke-width="2"
                    stroke-dasharray="${circumference}" stroke-dashoffset="0"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 4s linear;"/>
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        const ring = toast.querySelector(".toast-ring circle:last-child");
        if (ring) {
            ring.style.strokeDashoffset = circumference;
        }
    });

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 4000);
}

/* :::::::::::::::::::::::::: UTILITY FUNCTIONS :::::::::::::::::::::::::: */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCategoryArray(category_id) {
    if (!category_id) return [];
    try {
        if (typeof category_id === "string") return JSON.parse(category_id);
        if (Array.isArray(category_id)) return category_id;
    } catch (e) {}
    return [];
}

function getCompanyLogo(company) {
    const filename = COMPANY_LOGOS[company] || "default.png";
    return `assets/logo/${filename}`;
}

/* :::::::::::::::::::::::::: FIELD DEFINITION MANAGEMENT :::::::::::::::::::::::::: */
function parsePromptFields(template) {
    const fields = [];
    const safe = template
        .replace(/\\\{\{/g, "\u0000")
        .replace(/\\\}\}/g, "\u0001");
    const regex = /\{\{(.+?)\}\}/g;
    let match;

    while ((match = regex.exec(safe)) !== null) {
        const content = match[1].trim();
        let type = "text";
        let options = [];
        let name = content;
        let inputType = "text";
        let label = content;

        const colonIndex = content.indexOf(":");
        let payload = content;
        if (colonIndex > -1) {
            label = content.slice(0, colonIndex).trim();
            payload = content.slice(colonIndex + 1).trim();
        }

        if (payload.includes(".")) {
            type = "single-select";
            options = payload
                .split(".")
                .map((s) => s.trim())
                .filter((s) => s);
            name = label;
        } else if (payload.includes("/")) {
            type = "multi-select";
            options = payload
                .split("/")
                .map((s) => s.trim())
                .filter((s) => s);
            name = label;
        } else {
            const textColonIndex = content.lastIndexOf(":");
            if (textColonIndex > -1) {
                const possibleType = content
                    .slice(textColonIndex + 1)
                    .trim()
                    .toLowerCase();
                if (possibleType === "textarea" || possibleType === "number") {
                    inputType = possibleType;
                    name = content.slice(0, textColonIndex).trim();
                    label = name;
                }
            } else {
                name = content;
                label = content;
            }
        }

        const existing = fields.find(
            (f) => f.name === name && f.type === type,
        );
        if (!existing) {
            fields.push({
                name: name,
                type: type,
                options: options,
                description: "",
                raw: match[1],
                inputType: type === "text" ? inputType : undefined,
                label: label,
            });
        } else {
            existing.options = options;
        }
    }
    return fields;
}

function renderPromptInputFields() {
    const container = document.getElementById("prompt-input-fields");
    if (!container) return;
    container.innerHTML = "";

    if (!fieldDefinitions || fieldDefinitions.length === 0) {
        container.innerHTML =
            '<p style="color:#666;">No fields to fill. This prompt has no dynamic parameters.</p>';
        updateTokenSplitPreview();
        return;
    }

    fieldDefinitions.forEach((field, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "prompt-field-item";

        const label = document.createElement("label");
        label.textContent = field.name || "Field " + (index + 1);
        wrapper.appendChild(label);

        let input;

        if (
            field.type === "single-select" &&
            field.options &&
            field.options.length > 0
        ) {
            input = document.createElement("select");
            field.options.forEach((opt) => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                if (field.value === opt) option.selected = true;
                input.appendChild(option);
            });

            input.addEventListener("input", (e) => {
                fieldDefinitions[index].value = e.target.value;
            });
        } else if (
            field.type === "multi-select" &&
            field.options &&
            field.options.length > 0
        ) {
            const group = document.createElement("div");
            group.className = "multi-checkbox-group";

            if (!Array.isArray(fieldDefinitions[index].value)) {
                fieldDefinitions[index].value = [];
            }

            field.options.forEach((opt) => {
                const item = document.createElement("label");
                item.className = "multi-checkbox-item";
                if (fieldDefinitions[index].value.includes(opt)) {
                    item.classList.add("checked");
                }

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.classList.add("neon-checkbox");
                checkbox.value = opt;
                checkbox.checked = fieldDefinitions[index].value.includes(opt);

                checkbox.addEventListener("change", () => {
                    const arr = fieldDefinitions[index].value;
                    const idx = arr.indexOf(opt);
                    if (checkbox.checked) {
                        if (idx === -1) arr.push(opt);
                        item.classList.add("checked");
                    } else {
                        if (idx > -1) arr.splice(idx, 1);
                        item.classList.remove("checked");
                    }
                });

                item.appendChild(checkbox);
                item.appendChild(document.createTextNode(opt));
                group.appendChild(item);
            });

            input = group;
        } else {
            const inputType = field.inputType || "text";
            const fieldName = field.name || "value";

            if (inputType === "textarea") {
                input = document.createElement("textarea");
                input.rows = 4;
                input.placeholder = "Enter your " + fieldName + " here…";
                input.style.width = "100%";
                input.style.resize = "vertical";
                if (field.value) input.value = field.value;
            } else if (inputType === "number") {
                input = document.createElement("input");
                input.type = "number";
                input.placeholder = "Enter " + fieldName;
                if (field.value) input.value = field.value;
            } else {
                input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Enter " + fieldName;
                if (field.value) input.value = field.value;
            }

            input.addEventListener("input", (e) => {
                fieldDefinitions[index].value = e.target.value;
            });
        }

        if (field.description) {
            const desc = document.createElement("span");
            desc.style.fontSize = "11px";
            desc.style.color = "#888";
            desc.textContent = field.description;
            wrapper.appendChild(desc);
        }

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    });

    updateTokenSplitPreview();
}

/* :::::::::::::::::::::::::: TOKEN DISTRIBUTION PREVIEW :::::::::::::::::::::::::: */
function buildFullPromptFromFields() {
    const template = document.getElementById("template-textarea")?.value || "";
    let fullOutput = template;

    fieldDefinitions.forEach((field) => {
        const escapedName = escapeRegExp(field.name);
        const regex = new RegExp(
            `\\{\\{\\s*${escapedName}\\s*(?::[^}]*)?\\}\\}`,
            "g",
        );
        let value;
        if (field.type === "multi-select" && Array.isArray(field.value)) {
            value =
                field.value.length > 0
                    ? field.value.join(", ")
                    : `[${field.name}]`;
        } else {
            value =
                field.value !== undefined && field.value !== ""
                    ? field.value
                    : `[${field.name}]`;
        }
        fullOutput = fullOutput.replace(regex, () => value);
    });

    Object.keys(currentVariables).forEach((key) => {
        const val = currentVariables[key] || `[${key}]`;
        const escapedKey = escapeRegExp(key);
        const regex = new RegExp(
            `\\{\\{\\s*${escapedKey}\\s*(?::[^}]*)?\\}\\}`,
            "g",
        );
        fullOutput = fullOutput.replace(regex, () => val);
    });

    return fullOutput;
}

function computePartsRange(totalTokens) {
    const TOKEN_LIMIT = 10000;

    const minParts = 1;

    const maxParts = Math.max(1, Math.ceil(totalTokens / TOKEN_LIMIT));

    return { minParts, maxParts };
}

function splitIntoExactParts(text, numParts) {
    if (numParts <= 1) return [text];

    let units = text.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
    let separator = "\n\n";

    if (units.length < numParts) {
        const lines = text.split(/\n/).filter((s) => s.trim().length > 0);
        if (lines.length >= numParts) {
            units = lines;
            separator = "\n";
        }
    }

    if (units.length < numParts) {
        return forceSplitByChars(text, numParts);
    }

    return distributeEvenly(units, numParts, separator);
}

function distributeEvenly(units, nParts, sep) {
    const totalTokens = units.reduce((sum, u) => sum + countTokens(u), 0);
    const targetPerPart = totalTokens / nParts;

    const parts = [];
    let current = [];
    let currentTokens = 0;

    for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const uTokens = countTokens(u);
        const remainingParts = nParts - parts.length;

        if (
            currentTokens + uTokens > targetPerPart &&
            current.length > 0 &&
            remainingParts > 1
        ) {
            parts.push(current.join(sep));
            current = [u];
            currentTokens = uTokens;
        } else {
            current.push(u);
            currentTokens += uTokens;
        }
    }
    if (current.length) parts.push(current.join(sep));

    while (parts.length < nParts) {
        let maxIdx = -1;
        let maxLen = 0;
        parts.forEach((p, i) => {
            if (p.length > maxLen && p.split(/\n\s*\n/).length > 1) {
                maxLen = p.length;
                maxIdx = i;
            }
        });
        if (maxIdx === -1) break;

        const big = parts[maxIdx];
        const segments = big.split(/\n\s*\n/);
        const mid = Math.floor(segments.length / 2);
        if (mid === 0 || mid >= segments.length) break;

        const first = segments.slice(0, mid).join("\n\n");
        const second = segments.slice(mid).join("\n\n");
        parts.splice(maxIdx, 1, first, second);
    }

    return parts;
}

function forceSplitByChars(text, nParts) {
    const len = text.length;
    const target = Math.ceil(len / nParts);
    const parts = [];
    let start = 0;

    for (let i = 0; i < nParts; i++) {
        if (start >= len) break;
        let end = Math.min(len, start + target);

        if (end < len) {
            const slice = text.slice(end - 80, end + 80);
            const breakChars = ["\n\n", "\n", ". ", "! ", "? ", " "];
            for (const bc of breakChars) {
                const idx = slice.indexOf(bc);
                if (idx !== -1 && idx < 80) {
                    end = end - 80 + idx + bc.length;
                    break;
                }
            }
        }
        parts.push(text.slice(start, end));
        start = end;
    }
    if (start < len) parts.push(text.slice(start));
    return parts;
}

function updateTokenSplitPreview() {
    const section = document.getElementById("token-split-section");
    const inner = document.getElementById("token-split-inner");
    const totalEl = document.getElementById("token-split-total");
    const slider = document.getElementById("token-split-slider");
    const sliderValue = document.getElementById("token-split-slider-value");
    const hintMin = document.getElementById("token-split-hint-min");
    const hintMax = document.getElementById("token-split-hint-max");

    if (!section || !inner || !totalEl || !slider) return;

    const fullOutput = buildFullPromptFromFields();
    if (!fullOutput.trim()) {
        section.classList.add("hidden");
        return;
    }

    const totalTokens = countTokens(fullOutput);
    lastComputedTotalTokens = totalTokens;

    if (totalTokens === 0) {
        section.classList.add("hidden");
        return;
    }

    section.classList.remove("hidden");

    const { minParts, maxParts } = computePartsRange(totalTokens);
    lastMinParts = minParts;
    lastMaxParts = maxParts;

    if (
        !userTouchedPartsSlider ||
        selectedPartsCount === null ||
        selectedPartsCount < minParts ||
        selectedPartsCount > maxParts
    ) {
        selectedPartsCount = maxParts;
    }

    slider.min = String(minParts);
    slider.max = String(maxParts);
    slider.value = String(selectedPartsCount);
    slider.disabled = minParts === maxParts;

    const fillPercent =
        maxParts === minParts
            ? 100
            : ((selectedPartsCount - minParts) / (maxParts - minParts)) * 100;
    slider.style.setProperty("--slider-fill", `${fillPercent}%`);

    const partsWord = selectedPartsCount === 1 ? "part" : "parts";
    sliderValue.textContent = `${selectedPartsCount} ${partsWord}`;
    if (hintMin) hintMin.textContent = `min: ${minParts}`;
    if (hintMax) hintMax.textContent = `max: ${maxParts}`;

    totalEl.textContent = `${totalTokens.toLocaleString()} tokens`;

    const chunks = splitIntoExactParts(fullOutput, selectedPartsCount);
    const chunkTokens = chunks.map((c) => countTokens(c));

    inner.innerHTML = "";
    chunks.forEach((chunk, idx) => {
        const t = chunkTokens[idx];
        const percent = Math.min(100, (t / 10000) * 100);
        const over = t > 10000;

        const seg = document.createElement("div");
        seg.className = "token-split-segment" + (over ? " over-limit" : "");
        seg.innerHTML = `
            <span class="token-split-segment-label">Part ${idx + 1}</span>
            <span class="token-split-segment-count">${t.toLocaleString()}<small>tokens</small></span>
            <div class="token-split-segment-bar" style="width:${percent}%"></div>
        `;
        inner.appendChild(seg);
    });

    requestAnimationFrame(updateTokenSplitArrows);
}

function updateTokenSplitArrows() {
    const track = document.getElementById("token-split-track");
    const left = document.getElementById("token-split-arrow-left");
    const right = document.getElementById("token-split-arrow-right");
    if (!track || !left || !right) return;

    const canLeft = track.scrollLeft > 2;
    const canRight =
        track.scrollLeft + track.clientWidth < track.scrollWidth - 2;

    left.classList.toggle("hidden", !canLeft);
    right.classList.toggle("hidden", !canRight);
}

function debouncedUpdateTokenSplitPreview() {
    if (tokenPreviewDebounce) clearTimeout(tokenPreviewDebounce);
    tokenPreviewDebounce = setTimeout(updateTokenSplitPreview, 180);
}

/* :::::::::::::::::::::::::: AI MODEL SELECTION (EDITOR) :::::::::::::::::::::::::: */
function renderAIModels() {
    const container = document.getElementById("ai-models-container");
    if (!container) return;

    container.innerHTML = "";

    const validModels = (selectedAIModels || []).filter((id) =>
        ALL_AI_MODELS.some((m) => m.id === id),
    );

    if (validModels.length === 0) {
        container.innerHTML =
            '<p style="color:#666; font-size:13px;">No AI models selected.</p>';
        return;
    }

    const maxVisible = 3;
    const total = validModels.length;
    const modelsToShow = aiModelsExpanded
        ? validModels
        : validModels.slice(0, maxVisible);

    modelsToShow.forEach((modelId) => {
        const modelInfo = ALL_AI_MODELS.find((m) => m.id === modelId);
        const companyName = modelInfo ? modelInfo.company : "Unknown";
        const displayName = modelInfo ? modelInfo.name : modelId;

        const tag = document.createElement("div");
        tag.className = "ai-model-tag";

        const logo = document.createElement("img");
        logo.src = getCompanyLogo(companyName);
        logo.alt = companyName;
        logo.className = "model-logo";
        logo.onerror = function () {
            this.style.display = "none";
        };
        tag.appendChild(logo);

        const nameSpan = document.createElement("span");
        nameSpan.textContent = displayName;
        tag.appendChild(nameSpan);

        container.appendChild(tag);
    });

    if (total > maxVisible) {
        const btn = document.createElement("button");
        btn.className = "ai-show-more-btn";
        const remaining = total - maxVisible;
        if (!aiModelsExpanded) {
            btn.textContent = `+ ${remaining} models`;
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                aiModelsExpanded = true;
                renderAIModels();
            });
        } else {
            btn.textContent = "Show less";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                aiModelsExpanded = false;
                renderAIModels();
            });
        }
        container.appendChild(btn);
    }
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
    const input = document.getElementById("ai-model-input");
    const model = input.value.trim();
    if (!model) return;
    if (!selectedAIModels.includes(model)) {
        selectedAIModels.push(model);
        const container = document.getElementById("ai-models-container");
        const tag = document.createElement("div");
        tag.className = "ai-model-tag selected";
        tag.dataset.model = model;
        tag.textContent = model;
        tag.onclick = () => toggleAIModel(model);
        container.insertBefore(tag, input);
        renderAIModels();
    }
    input.value = "";
}

/* :::::::::::::::::::::::::: AI MODEL DROPDOWN (MODAL) :::::::::::::::::::::::::: */
function renderModalAIDropdown() {
    const container = document.getElementById("ai-companies-list");
    if (!container) return;
    const searchTerm =
        document.getElementById("ai-search-input")?.value.toLowerCase() || "";

    let filteredModels = ALL_AI_MODELS.filter((m) => {
        if (
            searchTerm &&
            !m.name.toLowerCase().includes(searchTerm) &&
            !m.company.toLowerCase().includes(searchTerm)
        )
            return false;
        if (
            modalAIModalityFilters.length &&
            !m.modality.some((mod) => modalAIModalityFilters.includes(mod))
        )
            return false;
        return true;
    });

    const grouped = {};
    filteredModels.forEach((m) => {
        if (!grouped[m.company]) grouped[m.company] = [];
        grouped[m.company].push(m);
    });

    container.innerHTML = "";
    if (Object.keys(grouped).length === 0) {
        container.innerHTML =
            '<div style="padding:12px; color:#666;">No models found.</div>';
        return;
    }

    for (const [company, models] of Object.entries(grouped)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "ai-company-group";
        const header = document.createElement("div");
        header.className = "ai-company-header";

        const logo = document.createElement("img");
        logo.src = getCompanyLogo(company);
        logo.alt = company;
        logo.className = "ai-company-logo";
        logo.onerror = function () {
            this.style.display = "none";
        };
        header.appendChild(logo);
        const nameSpan = document.createElement("span");
        nameSpan.className = "ai-company-name";
        nameSpan.textContent = company;
        header.appendChild(nameSpan);
        groupDiv.appendChild(header);

        const showAll = aiCompanyExpanded[company] || false;
        const visibleModels = showAll ? models : models.slice(0, 3);
        visibleModels.forEach((model) => {
            const label = document.createElement("label");
            label.className = "ai-model-checkbox";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("neon-checkbox");
            checkbox.value = model.id;
            checkbox.checked = modalSelectedAIModels.includes(model.id);
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    modalSelectedAIModels.push(model.id);
                } else {
                    modalSelectedAIModels = modalSelectedAIModels.filter(
                        (id) => id !== model.id,
                    );
                }
                updateSelectedCountDisplay();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(model.name));

            if (model.isNew) {
                const badge = document.createElement("span");
                badge.className = "ai-new-badge";
                badge.textContent = "NEW";
                label.appendChild(badge);
            }

            groupDiv.appendChild(label);
        });

        if (models.length > 3) {
            const showMoreBtn = document.createElement("button");
            showMoreBtn.className = "show-more-btn";
            showMoreBtn.textContent = showAll
                ? "Show less"
                : `Show all (${models.length})`;
            showMoreBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                aiCompanyExpanded[company] = !aiCompanyExpanded[company];
                renderModalAIDropdown();
            });
            groupDiv.appendChild(showMoreBtn);
        }

        container.appendChild(groupDiv);
    }
}

function toggleAIDropdown() {
    const dropdown = document.getElementById("ai-select-dropdown");
    const button = document.getElementById("ai-select-button");
    if (!dropdown) return;

    aiDropdownOpen = !aiDropdownOpen;

    if (aiDropdownOpen) {
        dropdown.classList.remove("hidden");
        requestAnimationFrame(() => {
            dropdown.classList.add("open");
        });

        if (button) {
            button.classList.add("invisible");
            button.classList.add("open");
        }

        aiFilterAreaVisible = false;
        const filterArea = document.getElementById("ai-filter-area");
        if (filterArea) filterArea.classList.add("hidden");
        const toggleBtn = document.getElementById("ai-filter-toggle-btn");
        if (toggleBtn) toggleBtn.classList.remove("active");

        const searchInput = document.getElementById("ai-search-input");
        if (searchInput) {
            searchInput.value = "";
            setTimeout(() => searchInput.focus(), 50);
        }

        renderModalAIDropdown();
    } else {
        dropdown.classList.remove("open");
        if (button) {
            button.classList.remove("invisible");
            button.classList.remove("open");
        }

        dropdown.addEventListener(
            "transitionend",
            function onTransitionEnd() {
                if (!aiDropdownOpen) {
                    dropdown.classList.add("hidden");
                }
                dropdown.removeEventListener("transitionend", onTransitionEnd);
            },
            { once: true },
        );
    }
}

function toggleAIFilterArea() {
    aiFilterAreaVisible = !aiFilterAreaVisible;
    const filterArea = document.getElementById("ai-filter-area");
    const toggleBtn = document.getElementById("ai-filter-toggle-btn");
    if (filterArea) {
        if (aiFilterAreaVisible) {
            filterArea.classList.remove("hidden");
            toggleBtn?.classList.add("active");
            renderModalityCapsules();
            setTimeout(() => updateRowArrows("modality-scroll-inner"), 50);
        } else {
            filterArea.classList.add("hidden");
            toggleBtn?.classList.remove("active");
        }
        const dropdown = document.getElementById("ai-select-dropdown");
        if (dropdown)
            dropdown.style.maxHeight = aiFilterAreaVisible ? "400px" : "320px";
    }
}

function updateSelectedCountDisplay() {
    const btn = document.getElementById("ai-select-placeholder");
    if (!btn) return;
    if (modalSelectedAIModels.length === 0) {
        btn.textContent = "Select AI models";
    } else {
        btn.textContent = `${modalSelectedAIModels.length} model(s) selected`;
    }
}

function renderModalityCapsules() {
    const row = document.getElementById("dropdown-modality-capsules");
    if (!row) return;
    row.innerHTML = "";
    MODALITY_CAPSULES.forEach((mod, index) => {
        if (index > 0) {
            const sep = document.createElement("span");
            sep.className = "filter-text-separator";
            sep.textContent = "|";
            row.appendChild(sep);
        }
        const item = document.createElement("span");
        item.className =
            "filter-text-item" +
            (modalAIModalityFilters.includes(mod) ? " active" : "");
        item.textContent = mod;
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = modalAIModalityFilters.indexOf(mod);
            if (idx > -1) modalAIModalityFilters.splice(idx, 1);
            else modalAIModalityFilters.push(mod);
            renderModalityCapsules();
            if (aiDropdownOpen) renderModalAIDropdown();
        });
        row.appendChild(item);
    });
    setTimeout(() => updateRowArrows("modality-scroll-inner"), 10);
}

/* :::::::::::::::::::::::::: MODAL CATEGORIES :::::::::::::::::::::::::: */
function renderModalCategories() {
    const row = document.getElementById("modal-categories-text-row");
    if (!row) return;
    row.innerHTML = "";
    ALL_CATEGORIES.forEach((cat, index) => {
        if (index > 0) {
            const sep = document.createElement("span");
            sep.className = "filter-text-separator";
            sep.textContent = "|";
            row.appendChild(sep);
        }
        const item = document.createElement("span");
        item.className =
            "filter-text-item" +
            (modalSelectedCategories.includes(cat.id) ? " active" : "");
        item.textContent = cat.label;
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = modalSelectedCategories.indexOf(cat.id);
            if (idx > -1) modalSelectedCategories.splice(idx, 1);
            else modalSelectedCategories.push(cat.id);
            renderModalCategories();
            setTimeout(() => updateRowArrows("modal-categories-scroll-inner"), 10);
        });
        row.appendChild(item);
    });
    setTimeout(() => updateRowArrows("modal-categories-scroll-inner"), 10);
}

/* :::::::::::::::::::::::::: BOOKMARKS :::::::::::::::::::::::::: */
async function toggleBookmark(promptId) {
    if (!currentUser) {
        showToast("Please sign in to bookmark prompts.");
        return;
    }
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    const newPinned = !prompt.pinned;
    const { error } = await sb
        .from("tavio_prompts")
        .update({ pinned: newPinned })
        .eq("id", promptId)
        .eq("user_id", currentUser.id);

    if (error) {
        console.error("Error toggling bookmark:", error);
        showToast("Failed to update bookmark. Please try again.");
    } else {
        prompt.pinned = newPinned;
        applyCategoryFilters();
    }
}

/* :::::::::::::::::::::::::: PROMPT FETCHING :::::::::::::::::::::::::: */
async function fetchPromptsWithAuthors() {
    if (!currentUser) return [];
    try {
        const { data: promptsData, error: promptsError } = await sb
            .from("tavio_prompts")
            .select("*")
            .or(`user_id.eq.${currentUser.id},is_global.eq.true`)
            .order("created_at", { ascending: false });

        if (promptsError) {
            console.error("Error fetching prompts:", promptsError);
            return [];
        }

        if (!promptsData || promptsData.length === 0) return [];

        const userIds = [...new Set(promptsData.map((p) => p.user_id))];
        const { data: profilesData } = await sb
            .from("profiles")
            .select("id, first_name, last_name, username")
            .in("id", userIds);

        const authorMap = {};
        if (profilesData) {
            profilesData.forEach((prof) => {
                const name =
                    `${prof.first_name || ""} ${prof.last_name || ""}`.trim() ||
                    prof.username ||
                    "Unknown";
                authorMap[prof.id] = name;
            });
        }

        return promptsData.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            categories: parseCategoryArray(p.category_id),
            template: p.content || "",
            user_id: p.user_id,
            pinned: p.pinned || false,
            created_at: p.created_at,
            updated_at: p.updated_at,
            author_name: authorMap[p.user_id] || "Unknown",
            field_definitions: p.field_definitions || [],
            ai_models: p.ai_models || [],
            is_global: p.is_global || false,
            is_readonly: p.is_readonly || false,
            source_prompt_id: p.source_prompt_id || null,
            source_synced_at: p.source_synced_at || null,
        }));
    } catch (e) {
        console.error("Error in fetchPromptsWithAuthors:", e);
        return [];
    }
}

async function syncPrompts() {
    const fetched = await fetchPromptsWithAuthors();
    prompts = fetched.length > 0 ? fetched : [];
    applyCategoryFilters();
}

/* :::::::::::::::::::::::::: PROMPT SHARING :::::::::::::::::::::::::: */
async function fetchConnectedUsers() {
    if (!currentUser) return [];
    try {
        const { data, error } = await sb
            .from("dashboard_connectionrequests")
            .select("from_id, to_id")
            .or(`from_id.eq.${currentUser.id},to_id.eq.${currentUser.id}`)
            .eq("status", "accepted");

        if (error) return [];

        if (!data || data.length === 0) return [];

        const connectedIds = data
            .map((row) => {
                if (row.from_id === currentUser.id) return row.to_id;
                else if (row.to_id === currentUser.id) return row.from_id;
                return null;
            })
            .filter((id) => id && id !== currentUser.id);

        if (connectedIds.length === 0) return [];

        const uniqueIds = [...new Set(connectedIds)];
        const { data: profiles } = await sb
            .from("profiles")
            .select("id, first_name, last_name, username, photo_url")
            .in("id", uniqueIds);

        return profiles || [];
    } catch (e) {
        console.error("Error in fetchConnectedUsers:", e);
        return [];
    }
}

async function openShareModal(promptId) {
    shareTargetPromptId = promptId;
    selectedShareUsers = [];

    const modal = document.getElementById("share-modal");
    const userList = document.getElementById("share-user-list");
    userList.innerHTML = `
        <div class="share-search-wrapper">
          <div class="share-search-overlay" id="share-search-overlay">
            <img class="share-search-avatar hidden" id="share-search-avatar" />
            <span class="share-search-initial hidden" id="share-search-initial"></span>
            <span class="share-search-typed" id="share-search-typed"></span>
            <span class="share-search-suggestion" id="share-search-suggestion"></span>
          </div>
          <input
            type="text"
            id="share-user-search"
            class="share-search-real-input"
            placeholder="Search user..."
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <div id="share-selected-users" class="share-selected-list"></div>
    `;

    const searchInput = document.getElementById("share-user-search");
    const selectedDiv = document.getElementById("share-selected-users");
    const overlayTyped = document.getElementById("share-search-typed");
    const overlaySuggestion = document.getElementById("share-search-suggestion");
    const overlayAvatar = document.getElementById("share-search-avatar");
    const overlayInitial = document.getElementById("share-search-initial");
    const sendBtn = document.getElementById("share-send-btn");
    if (sendBtn) sendBtn.disabled = true;

    let currentSuggestion = null;
    let searchDebounce = null;

    const getLabel = (u) =>
        u.username ||
        `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
        u.id;

    let connectedIds = [];
    try {
        const { data } = await sb
            .from("dashboard_connectionrequests")
            .select("from_id, to_id")
            .or(`from_id.eq.${currentUser.id},to_id.eq.${currentUser.id}`)
            .eq("status", "accepted");
        if (data) {
            connectedIds = data.map((r) =>
                r.from_id === currentUser.id ? r.to_id : r.from_id,
            );
        }
    } catch (e) {}

    const renderSelected = () => {
        if (selectedShareUsers.length === 0) {
            selectedDiv.innerHTML = "";
            return;
        }
        selectedDiv.innerHTML = selectedShareUsers
            .map((u) => {
                const avatar = u.photo_url
                    ? `<img src="${u.photo_url}" class="share-selected-avatar">`
                    : `<span class="share-selected-initial">${(u.label || "?").charAt(0).toUpperCase()}</span>`;
                return `
          <div class="share-selected-row" data-userid="${u.id}">
            ${avatar}
            <span class="share-selected-name">${u.label}</span>
            <input
              type="checkbox"
              class="neon-checkbox share-edit-cb"
              data-userid="${u.id}"
              title="Allow recipient to edit this prompt"
              ${u.canEdit ? "checked" : ""}
            />
            <button class="share-selected-remove" data-userid="${u.id}" title="Remove">×</button>
          </div>
        `;
            })
            .join("");

        selectedDiv.querySelectorAll(".share-edit-cb").forEach((cb) => {
            cb.addEventListener("change", function () {
                const uid = this.dataset.userid;
                const u = selectedShareUsers.find((x) => x.id === uid);
                if (u) u.canEdit = this.checked;
            });
        });

        selectedDiv.querySelectorAll(".share-selected-remove").forEach((btn) => {
            btn.addEventListener("click", () => {
                const uid = btn.dataset.userid;
                selectedShareUsers = selectedShareUsers.filter((x) => x.id !== uid);
                renderSelected();
                if (sendBtn) sendBtn.disabled = selectedShareUsers.length === 0;
                if (searchInput.value.trim()) {
                    searchInput.dispatchEvent(new Event("input"));
                }
            });
        });
    };

    const findSuggestion = (typed, users) => {
        if (!typed) return null;
        const t = typed.toLowerCase();
        return (
            users.find((u) => {
                const label = getLabel(u).toLowerCase();
                return (
                    label.startsWith(t) &&
                    label.length > t.length &&
                    !selectedShareUsers.some((s) => s.id === u.id)
                );
            }) || null
        );
    };

    const updateOverlay = (typed, suggestion) => {
        overlayTyped.textContent = typed;

        if (suggestion) {
            const fullLabel = getLabel(suggestion);
            overlaySuggestion.textContent = fullLabel.slice(typed.length);
            searchInput.classList.add("has-avatar");

            if (suggestion.photo_url) {
                overlayAvatar.src = suggestion.photo_url;
                overlayAvatar.classList.remove("hidden");
                overlayInitial.classList.add("hidden");
            } else {
                overlayAvatar.classList.add("hidden");
                overlayInitial.textContent = (fullLabel.charAt(0) || "?").toUpperCase();
                overlayInitial.classList.remove("hidden");
            }
        } else {
            overlaySuggestion.textContent = "";
            overlayAvatar.classList.add("hidden");
            overlayInitial.classList.add("hidden");
            searchInput.classList.remove("has-avatar");
        }
    };

    const clearOverlay = () => {
        overlayTyped.textContent = "";
        overlaySuggestion.textContent = "";
        overlayAvatar.classList.add("hidden");
        overlayInitial.classList.add("hidden");
        searchInput.classList.remove("has-avatar");
        currentSuggestion = null;
    };

    searchInput.addEventListener("input", () => {
        const raw = searchInput.value;
        const typed = raw.trim();

        overlayTyped.textContent = raw;

        if (!typed) {
            clearOverlay();
            return;
        }

        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(async () => {
            const users = await searchUsers(typed);
            const connectedOnly = users.filter((u) => connectedIds.includes(u.id));
            const suggestion = findSuggestion(typed, connectedOnly);
            currentSuggestion = suggestion;
            updateOverlay(raw, suggestion);
        }, 180);
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!currentSuggestion) return;

            const u = currentSuggestion;
            selectedShareUsers.push({
                id: u.id,
                label: getLabel(u),
                photo_url: u.photo_url || "",
                canEdit: false,
            });
            renderSelected();
            if (sendBtn) sendBtn.disabled = selectedShareUsers.length === 0;

            searchInput.value = "";
            clearOverlay();
            searchInput.focus();
        }
    });

    renderSelected();
    openModal(modal);
}

async function searchUsers(query) {
    if (!currentUser || query.length < 3) return [];
    const { data, error } = await sb
        .from("profiles")
        .select("id, first_name, last_name, username, photo_url")
        .or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`,
        )
        .limit(20);
    if (error || !data) return [];
    return data.filter((u) => u.id !== currentUser.id);
}

async function sendConnectionRequest(targetUserId) {
    const { error } = await sb.from("dashboard_connectionrequests").insert({
        from_id: currentUser.id,
        to_id: targetUserId,
        status: "pending",
    });
    if (error) {
        showToast("Connection request failed");
        console.error(error);
    } else {
        showToast("Connection request sent");
    }
}

function closeShareModal() {
    document.getElementById("share-modal").classList.add("hidden");
    selectedShareUsers = [];
    shareTargetPromptId = null;
}

async function sendShareRequest() {
    if (!shareTargetPromptId || selectedShareUsers.length === 0) return;
    const prompt = prompts.find((p) => p.id === shareTargetPromptId);
    if (!prompt) return;

    let successCount = 0;
    let failCount = 0;

    for (const user of selectedShareUsers) {
        const allowEdit = !!user.canEdit;

        const { error: shareErr } = await sb.from("tavio_shares").upsert(
            {
                original_prompt_id: prompt.id,
                owner_id: currentUser.id,
                recipient_id: user.id,
                can_edit: allowEdit,
            },
            { onConflict: "original_prompt_id,recipient_id" },
        );

        if (shareErr) {
            console.error("share register error", shareErr);
            failCount++;
            continue;
        }

        const { error } = await sb.from("notifications").insert({
            user_id: user.id,
            sender_id: currentUser.id,
            type: "share_prompt",
            title: "Shared Prompt: " + prompt.title,
            data: {
                prompt_id: prompt.id,
                prompt_title: prompt.title,
                prompt_description: prompt.description || "",
                prompt_category: JSON.stringify(prompt.categories),
                prompt_template: prompt.template,
                author_id: prompt.user_id,
                author_name: prompt.author_name,
                field_definitions: prompt.field_definitions || [],
                ai_models: prompt.ai_models || [],
                can_edit: allowEdit,
            },
            is_read: false,
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error("notif insert error", error);
            failCount++;
        } else {
            successCount++;
        }
    }

    if (failCount === 0) {
        showToast(`Prompt shared with ${successCount} user(s).`);
    } else if (successCount === 0) {
        showToast("Failed to share prompt.");
    } else {
        showToast(`Shared with ${successCount}, failed for ${failCount}.`);
    }

    closeShareModal();
    loadTavioSidebarNotifications();
}

/* :::::::::::::::::::::::::: SHARE NOTIFICATIONS :::::::::::::::::::::::::: */
function handleShareNotification(notification) {
    const data = notification.data;
    if (!data) return;

    const sidebar = getSidebarComponent();
    if (sidebar && sidebar.shadowRoot) {
        const sidebarEl = sidebar.shadowRoot.querySelector(".sidebar");
        if (sidebarEl) sidebarEl.style.transform = "translateX(-100%)";
        const overlay = sidebar.shadowRoot.querySelector(".sidebar-overlay");
        if (overlay) {
            overlay.classList.remove("open");
            overlay.style.display = "none";
        }
        const hamburger = sidebar.shadowRoot.querySelector(".hamburger-btn");
        if (hamburger) hamburger.classList.remove("open");
    }

    const modal = document.getElementById("prompt-preview-modal");
    document.getElementById("preview-prompt-title").textContent =
        data.prompt_title || "Shared Prompt";

    const catsContainer = document.getElementById("preview-prompt-categories");
    catsContainer.innerHTML = "";
    const categoriesArray = parseCategoryArray(data.prompt_category);
    categoriesArray.forEach((catId) => {
        const label = ALL_CATEGORIES.find((c) => c.id === catId)?.label || catId;
        const chip = document.createElement("span");
        chip.className = "category-chip";
        chip.textContent = label;
        chip.style.pointerEvents = "none";
        chip.style.marginRight = "4px";
        catsContainer.appendChild(chip);
    });

    const templateContainer = document.getElementById("preview-prompt-template");
    if (data.prompt_description) {
        templateContainer.innerHTML = `<em>${data.prompt_description}</em>`;
    } else {
        templateContainer.innerHTML = "";
    }

    modal.dataset.notificationId = notification.id;
    modal.dataset.promptData = JSON.stringify(data);
    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

async function acceptSharedPrompt() {
    const modal = document.getElementById("prompt-preview-modal");
    const notifId = modal.dataset.notificationId;
    const promptData = JSON.parse(modal.dataset.promptData || "{}");
    if (!promptData.prompt_title) return;

    const canEdit = promptData.can_edit === true;
    const sourceId = promptData.prompt_id || null;
    const categoriesArray = parseCategoryArray(promptData.prompt_category);

    const { data, error } = await sb
        .from("tavio_prompts")
        .insert({
            title: promptData.prompt_title,
            description: promptData.prompt_description || "",
            content: promptData.prompt_template,
            category_id: JSON.stringify(categoriesArray),
            user_id: currentUser.id,
            pinned: false,
            field_definitions: promptData.field_definitions || [],
            ai_models: promptData.ai_models || [],
            is_readonly: !canEdit,
            source_prompt_id: sourceId,
            source_synced_at: new Date().toISOString(),
        })
        .select("id, created_at, updated_at")
        .single();

    if (error) {
        showToast("Failed to save prompt. Please try again.");
        console.error(error);
        return;
    }

    if (sourceId) {
        await sb
            .from("tavio_shares")
            .update({ recipient_prompt_id: data.id })
            .eq("original_prompt_id", sourceId)
            .eq("recipient_id", currentUser.id);
    }

    prompts.unshift({
        id: data.id,
        title: promptData.prompt_title,
        description: promptData.prompt_description || "",
        categories: categoriesArray,
        template: promptData.prompt_template,
        user_id: currentUser.id,
        pinned: false,
        author_name: promptData.author_name || "Unknown",
        field_definitions: promptData.field_definitions || [],
        ai_models: promptData.ai_models || [],
        is_readonly: !canEdit,
        source_prompt_id: sourceId,
        source_synced_at: new Date().toISOString(),
        created_at: data.created_at,
        updated_at: data.updated_at,
    });
    applyCategoryFilters();

    await sb.from("notifications").update({ is_read: true }).eq("id", notifId);

    const { data: notification } = await sb
        .from("notifications")
        .select("sender_id")
        .eq("id", notifId)
        .single();

    if (notification?.sender_id) {
        await sb.from("notifications").insert({
            user_id: notification.sender_id,
            sender_id: currentUser.id,
            type: "share_accepted",
            title: "Prompt Accepted: " + (promptData.prompt_title || "Untitled"),
            data: { prompt_id: promptData.prompt_id },
            is_read: false,
        });
    }

    modal.classList.add("hidden");
    modal.style.display = "none";
    loadTavioSidebarNotifications();
    updateNotificationDot();
}

async function rejectSharedPrompt() {
    const modal = document.getElementById("prompt-preview-modal");
    const promptData = JSON.parse(modal.dataset.promptData || "{}");
    await sb.from("notifications").insert({
        user_id: currentUser.id,
        sender_id: currentUser.id,
        type: "share_rejected",
        title: "Prompt Rejected: " + (promptData.prompt_title || "Untitled"),
        data: { prompt_id: promptData.prompt_id },
        is_read: false,
    });
    modal.classList.add("hidden");
    modal.style.display = "none";
    loadTavioSidebarNotifications();
    updateNotificationDot();
}

async function rejectSharedPromptViaNotif(notifId) {
    const { data: notif } = await sb
        .from("notifications")
        .select("sender_id, data")
        .eq("id", notifId)
        .single();
    await sb.from("notifications").update({ is_read: true }).eq("id", notifId);
    if (notif?.sender_id) {
        await sb.from("notifications").insert({
            user_id: notif.sender_id,
            sender_id: currentUser.id,
            type: "share_rejected",
            title: "Prompt Rejected: " + (notif.data?.prompt_title || "Untitled"),
            data: notif.data,
            is_read: false,
        });
    }
    loadTavioSidebarNotifications();
    updateNotificationDot();
}

/* :::::::::::::::::::::::::: SHARE MANAGEMENT :::::::::::::::::::::::::: */
async function loadSharesForPrompt(promptId) {
    if (!promptId) return [];
    const { data, error } = await sb
        .from("tavio_shares")
        .select("id, recipient_id, can_edit")
        .eq("original_prompt_id", promptId);

    if (error || !data || data.length === 0) return [];

    const ids = [...new Set(data.map((d) => d.recipient_id))];
    const { data: profiles } = await sb
        .from("profiles")
        .select("id, first_name, last_name, username, photo_url")
        .in("id", ids);

    const map = {};
    (profiles || []).forEach((p) => {
        map[p.id] = p;
    });

    return data.map((d) => ({
        share_id: d.id,
        can_edit: d.can_edit,
        recipient:
            map[d.recipient_id] || { id: d.recipient_id, username: "Unknown" },
    }));
}

function renderShareManagement(shares) {
    const section = document.getElementById("share-management-section");
    const list = document.getElementById("share-management-list");
    if (!section || !list) return;

    if (!shares || shares.length === 0) {
        section.style.display = "none";
        list.innerHTML = "";
        return;
    }

    section.style.display = "block";
    list.innerHTML = shares
        .map((s) => {
            const r = s.recipient || {};
            const name =
                r.username ||
                `${r.first_name || ""} ${r.last_name || ""}`.trim() ||
                "Unknown";
            return `
        <div class="share-mgmt-row">
          <span class="share-mgmt-name">${name}</span>
          <label class="global-check-label">
            <input
              type="checkbox"
              class="neon-checkbox share-edit-toggle"
              data-share-id="${s.share_id}"
              ${s.can_edit ? "checked" : ""}
            />
            <span>Allow edit</span>
          </label>
        </div>
      `;
        })
        .join("");

    list.querySelectorAll(".share-edit-toggle").forEach((cb) => {
        cb.addEventListener("change", async function () {
            const shareId = this.dataset.shareId;
            const canEdit = this.checked;
            const { error } = await sb.rpc("toggle_share_edit_permission", {
                p_share_id: shareId,
                p_can_edit: canEdit,
            });
            if (error) {
                showToast("Failed to update permission.");
                console.error(error);
                this.checked = !canEdit;
            } else {
                showToast(
                    canEdit ? "Recipient can now edit." : "Recipient is read-only.",
                );
            }
        });
    });
}

/* :::::::::::::::::::::::::: SOURCE SYNC :::::::::::::::::::::::::: */
async function checkSourceUpdate(prompt) {
    const syncBtn = document.getElementById("sync-prompt-btn");
    if (!syncBtn) return;

    syncBtn.classList.add("hidden");
    syncBtn.classList.remove("btn-disabled");

    if (!prompt || !prompt.source_prompt_id) return;

    const { data: source, error } = await sb
        .from("tavio_prompts")
        .select("id, updated_at")
        .eq("id", prompt.source_prompt_id)
        .maybeSingle();

    if (error || !source) return;

    const sourceTime = new Date(source.updated_at).getTime();
    const syncedTime = prompt.source_synced_at
        ? new Date(prompt.source_synced_at).getTime()
        : 0;

    if (sourceTime > syncedTime) {
        syncBtn.classList.remove("hidden");
    }
}

async function syncPromptFromSource() {
    if (!currentPrompt || !currentPrompt.source_prompt_id) {
        showToast("No source prompt to sync with.");
        return;
    }

    const syncBtn = document.getElementById("sync-prompt-btn");
    if (syncBtn) syncBtn.classList.add("btn-disabled");

    const { data: source, error } = await sb
        .from("tavio_prompts")
        .select("*")
        .eq("id", currentPrompt.source_prompt_id)
        .maybeSingle();

    if (error || !source) {
        showToast("Failed to fetch source prompt.");
        if (syncBtn) syncBtn.classList.remove("btn-disabled");
        return;
    }

    const nowIso = new Date().toISOString();

    const { error: updErr } = await sb
        .from("tavio_prompts")
        .update({
            title: source.title,
            description: source.description || "",
            content: source.content || "",
            category_id: source.category_id,
            ai_models: source.ai_models || [],
            field_definitions: source.field_definitions || [],
            source_synced_at: nowIso,
        })
        .eq("id", currentPrompt.id)
        .eq("user_id", currentUser.id);

    if (updErr) {
        showToast("Failed to sync prompt.");
        console.error(updErr);
        if (syncBtn) syncBtn.classList.remove("btn-disabled");
        return;
    }

    const idx = prompts.findIndex((p) => p.id === currentPrompt.id);
    if (idx !== -1) {
        prompts[idx] = {
            ...prompts[idx],
            title: source.title,
            description: source.description || "",
            template: source.content || "",
            categories: parseCategoryArray(source.category_id),
            ai_models: source.ai_models || [],
            field_definitions: source.field_definitions || [],
            source_synced_at: nowIso,
        };
        currentPrompt = { ...prompts[idx] };
    }

    showToast("Prompt synced successfully.");
    loadPromptIntoEditor(currentPrompt);
    applyCategoryFilters();
}

/* :::::::::::::::::::::::::: MODAL HELPERS :::::::::::::::::::::::::: */
function showGlobalLoader() {
    const loader = document.getElementById("initial-loader");
    if (loader) loader.classList.remove("hidden");
}

function hideGlobalLoader() {
    const loader = document.getElementById("initial-loader");
    if (loader) loader.classList.add("hidden");
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = "none";
}

function showStep(stepId) {
    document
        .querySelectorAll(".auth-step")
        .forEach((s) => s.classList.remove("active"));
    document.getElementById(stepId).classList.add("active");
}

/* :::::::::::::::::::::::::: SIDEBAR :::::::::::::::::::::::::: */
function getSidebarComponent() {
    if (!sidebarComponent) {
        sidebarComponent = document.querySelector("sidebar-component");
        if (sidebarComponent) {
            sidebarComponent.addEventListener("login-request", () => {
                openModal(document.getElementById("auth-overlay"));
            });
            sidebarComponent.addEventListener("logout-request", () => {
                logout();
            });
        }
    }
    return sidebarComponent;
}

/* :::::::::::::::::::::::::: USER PROFILE :::::::::::::::::::::::::: */
async function buildCurrentProfile(user) {
    const { data: profileRow } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const md = user.user_metadata || {};
    return {
        id: user.id,
        first_name: profileRow?.first_name ?? md.first_name ?? "",
        last_name: profileRow?.last_name ?? md.last_name ?? "",
        photo_url: profileRow?.photo_url ?? md.photo_url ?? "",
        username: profileRow?.username ?? md.username ?? "",
        role: profileRow?.role ?? md.role ?? "recruit",
    };
}

/* :::::::::::::::::::::::::: SIDEBAR SYNC :::::::::::::::::::::::::: */
function syncSidebarComponent() {
    const comp = getSidebarComponent();
    if (!comp || typeof comp.setUser !== "function") return;

    if (currentUser) {
        comp.setUser(currentUser, currentProfile);
    } else {
        comp.clearUser();
    }

    comp.setTodayList([], []);
    comp.setEvents([]);

    const nav = comp.shadowRoot?.getElementById("sidebar-nav");
    if (nav) nav.style.display = "block";

    const todayList = comp.shadowRoot?.getElementById("sidebar-today-list");
    if (todayList) todayList.style.display = "none";

    const overdueList = comp.shadowRoot?.getElementById("sidebar-overdue-list");
    if (overdueList) overdueList.style.display = "none";

    loadTavioSidebarNotifications();

    if (!comp.shadowRoot.getElementById("hamburger-mobile-fix")) {
        const style = document.createElement("style");
        style.id = "hamburger-mobile-fix";
        style.textContent = `
            @media (max-width: 768px) {
                .hamburger-btn {
                    margin-left: -10px !important;
                }
            }
        `;
        comp.shadowRoot.appendChild(style);
    }
}

async function updateNotificationDot() {
    const comp = getSidebarComponent();
    if (!comp || !comp.shadowRoot) return;

    if (!currentUser || !currentUser.id) return;

    let hasUnread = false;

    const { data: notifs } = await sb
        .from("notifications")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("is_read", false)
        .limit(1);

    if (notifs && notifs.length > 0) {
        hasUnread = true;
    }

    if (!hasUnread) {
        const today = new Date().toISOString().split("T")[0];

        const { data: events } = await sb
            .from("ravlo")
            .select("id")
            .eq("user_id", currentUser.id)
            .gte("start_date", today)
            .limit(1);

        if (events && events.length > 0) {
            hasUnread = true;
        }
    }

    const dot = comp.shadowRoot.getElementById("avatar-notif-dot");
    if (dot) {
        dot.style.display = hasUnread ? "block" : "none";
    }
}

/* :::::::::::::::::::::::::: NOTIFICATIONS SIDEBAR :::::::::::::::::::::::::: */
async function loadTavioSidebarNotifications() {
    const container = document.getElementById("tavio-notif-list");
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = "";
        return;
    }

    try {
        const { data, error } = await sb
            .from("notifications")
            .select("*")
            .eq("user_id", currentUser.id)
            .in("type", ["share_prompt", "share_accepted", "share_rejected"])
            .order("created_at", { ascending: false })
            .limit(10);

        if (error || !data || data.length === 0) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = data
            .map((n) => {
                let actionsHtml = "";
                let bodyHtml = "";
                if (n.type === "share_prompt") {
                    const promptData = n.data || {};
                    const description = promptData.prompt_description || "";
                    const words = description.split(" ").slice(0, 50).join(" ");
                    const senderName = promptData.author_name || "Someone";
                    bodyHtml = `
                    <div class="notif-subtitle">${senderName} shared a prompt with you.</div>
                    <div class="notif-prompt-title">${promptData.prompt_title || "Untitled"}</div>
                    <div class="notif-prompt-desc">${words}${description.split(" ").length > 50 ? "..." : ""}</div>
                `;
                    if (!n.is_read) {
                        actionsHtml = `
                        <div class="notif-actions">
                            <button class="accept-btn" data-notif-id="${n.id}">Accept</button>
                            <button class="reject-btn" data-notif-id="${n.id}">Reject</button>
                        </div>
                    `;
                    }
                }
                return `
                <div class="tavio-notif-item" data-id="${n.id}" data-type="${n.type}" data-notif-data='${JSON.stringify(n).replace(/'/g, "&#39;")}' style="${n.is_read ? "opacity:0.6;" : ""}">
                    ${bodyHtml}
                    <div class="notif-time">${new Date(n.created_at).toLocaleDateString("en-US")}</div>
                    ${actionsHtml}
                </div>
            `;
            })
            .join("");

        container.querySelectorAll(".tavio-notif-item").forEach((item) => {
            item.addEventListener("click", function (e) {
                if (e.target.closest(".notif-actions") || e.target.closest("button"))
                    return;
                const notifData = JSON.parse(this.dataset.notifData);
                if (notifData.type === "share_prompt") {
                    handleShareNotification(notifData);
                }
            });

            const acceptBtn = item.querySelector(".accept-btn");
            const rejectBtn = item.querySelector(".reject-btn");

            if (acceptBtn) {
                acceptBtn.addEventListener("click", async function (e) {
                    e.stopPropagation();
                    const notifId = this.dataset.notifId;
                    const notifData = JSON.parse(item.dataset.notifData);
                    await acceptSharedPromptDirect(notifData);
                });
            }

            if (rejectBtn) {
                rejectBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    const notifId = this.dataset.notifId;
                    rejectSharedPromptViaNotif(notifId);
                });
            }
        });
    } catch (e) {
        console.error("Error loading notifications:", e);
        container.innerHTML = "";
    }
    updateNotificationDot();
}

/* :::::::::::::::::::::::::: AUTHENTICATION :::::::::::::::::::::::::: */
async function logout() {
    await sb.auth.signOut();
    currentUser = null;
    currentProfile = null;
    currentUserRole = "public";
    syncSidebarComponent();

    document.getElementById("app-container").classList.add("app-hidden");
    const authOverlay = document.getElementById("auth-overlay");
    authOverlay.querySelector("#auth-email").value = "";
    authOverlay.querySelector("#auth-password-login").value = "";
    authOverlay.querySelector("#auth-password-register").value = "";
    showStep("step-1");
    openModal(authOverlay);
}

async function restoreSession() {
    showGlobalLoader();

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    if (accessToken && refreshToken) {
        try {
            await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
    }

    const {
        data: { session },
    } = await sb.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        currentProfile = await buildCurrentProfile(currentUser);
        currentUserRole = currentProfile?.role || "recruit";
        if (!hasMinRole(currentUserRole)) {
            await sb.auth.signOut();
            currentUser = null;
            currentProfile = null;
            currentUserRole = "public";
            hideGlobalLoader();
            showAccessDenied(
                "Access denied. You need at least " +
                    APP_MIN_ROLE +
                    " role to use this tool.",
            );
            return;
        }
        document.getElementById("app-container").classList.remove("app-hidden");
        closeModal(document.getElementById("auth-overlay"));
        syncSidebarComponent();
        await updateNotificationDot();
        await syncPrompts();
    } else {
        document.getElementById("app-container").classList.add("app-hidden");
        openModal(document.getElementById("auth-overlay"));
        showStep("step-1");
    }
    hideGlobalLoader();
}

function setupAuthListeners() {
    const continueBtn = document.getElementById("auth-continue-btn");
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            const email = document.getElementById("auth-email").value.trim();
            if (!email) {
                document.getElementById("auth-error-1").style.display = "block";
                document.getElementById("auth-error-1").textContent =
                    "Please enter your email.";
                return;
            }
            document.getElementById("login-email-display").textContent = email;
            document.getElementById("register-email-display").textContent = email;
            showStep("step-2-login");
            document.getElementById("auth-error-1").style.display = "none";
        });
    }

    const signinBtn = document.getElementById("auth-signin-btn");
    if (signinBtn) {
        signinBtn.addEventListener("click", async function (e) {
            try {
                const emailInput = document.getElementById("auth-email");
                const passwordInput = document.getElementById("auth-password-login");
                const errorDisplay = document.getElementById("auth-error-login");

                if (!emailInput || !passwordInput) {
                    console.error("Email or password input not found in DOM");
                    return;
                }

                const email = emailInput.value.trim();
                const password = passwordInput.value;

                if (!email || !password) {
                    errorDisplay.textContent = "Please enter email and password.";
                    errorDisplay.style.display = "block";
                    return;
                }

                errorDisplay.style.display = "none";
                const { data, error } = await sb.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    console.error("Sign in error:", error);
                    errorDisplay.textContent = error.message;
                    errorDisplay.style.display = "block";
                    return;
                }

                currentUser = data.user;
                currentProfile = await buildCurrentProfile(data.user);
                currentUserRole = currentProfile?.role || "recruit";

                if (!hasMinRole(currentUserRole)) {
                    await sb.auth.signOut();
                    currentUser = null;
                    currentProfile = null;
                    currentUserRole = "public";
                    closeModal(document.getElementById("auth-overlay"));
                    showAccessDenied(
                        "Access denied. You need at least " +
                            APP_MIN_ROLE +
                            " role to use this tool.",
                    );
                    return;
                }

                closeModal(document.getElementById("auth-overlay"));
                document.getElementById("app-container").classList.remove("app-hidden");
                syncSidebarComponent();
                await syncPrompts();
            } catch (err) {
                console.error("Unhandled sign in error:", err);
                showToast(
                    "An error occurred during sign in. Check console for details.",
                );
            }
        });
    }

    const registerBtn = document.getElementById("auth-register-btn");
    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            const email = document.getElementById("auth-email").value.trim();
            const password = document.getElementById("auth-password-register").value;
            const firstName = document.getElementById("auth-first-name").value.trim();
            const lastName = document.getElementById("auth-last-name").value.trim();
            document.getElementById("auth-error-register").style.display = "none";
            if (password.length < 6) {
                document.getElementById("auth-error-register").textContent =
                    "Password must be at least 6 characters.";
                document.getElementById("auth-error-register").style.display = "block";
                return;
            }
            const { error } = await sb.auth.signUp({
                email,
                password,
                options: {
                    data: { first_name: firstName, last_name: lastName },
                    emailRedirectTo: window.location.origin + window.location.pathname,
                },
            });
            if (error) {
                document.getElementById("auth-error-register").textContent =
                    error.message;
                document.getElementById("auth-error-register").style.display = "block";
                return;
            }
            showToast(
                "Registration successful! Please check your email to confirm your account.",
            );
            closeModal(document.getElementById("auth-overlay"));
        });
    }

    const back1 = document.getElementById("auth-back-to-email");
    if (back1) back1.addEventListener("click", () => showStep("step-1"));
    const back2 = document.getElementById("auth-back-to-email-2");
    if (back2) back2.addEventListener("click", () => showStep("step-2-register"));

    const forgotLink = document.getElementById("forgot-link");
    if (forgotLink) {
        forgotLink.addEventListener("click", (e) => {
            e.preventDefault();
            showStep("step-forgot");
            document.getElementById("forgot-email").value = document
                .getElementById("auth-email")
                .value.trim();
        });
    }

    const resetBtn = document.getElementById("auth-reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
            const email = document.getElementById("forgot-email").value.trim();
            if (!email) return;
            const { error } = await sb.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname,
            });
            const msg = document.getElementById("forgot-message");
            msg.style.display = "block";
            if (error) {
                msg.textContent = error.message;
                msg.style.color = "#FF6B6B";
            } else {
                msg.textContent = "Reset link sent! Check your email.";
                msg.style.color = "var(--accent)";
            }
        });
    }

    const backToLogin = document.getElementById("auth-back-to-login");
    if (backToLogin)
        backToLogin.addEventListener("click", () => showStep("step-2-login"));

    document.querySelectorAll(".toggle-password-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const inputId = btn.getAttribute("data-target");
            const input = document.getElementById(inputId);
            if (!input) return;
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            const svg = btn.querySelector("svg");
            if (isPassword) {
                svg.innerHTML =
                    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
            } else {
                svg.innerHTML =
                    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
            }
        });
    });
}

/* :::::::::::::::::::::::::: PROMPT LIBRARY :::::::::::::::::::::::::: */
function renderPromptGrid(filteredPrompts) {
    const grid = document.getElementById("prompt-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const sorted = [...filteredPrompts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    sorted.forEach((prompt) => {
        const card = document.createElement("div");
        card.className = "prompt-card" + (prompt.pinned ? " pinned-card" : "");

        const categoryChips = (prompt.categories || [])
            .map((catId) => {
                const label =
                    ALL_CATEGORIES.find((c) => c.id === catId)?.label || catId;
                return `<span class="category-chip" style="pointer-events:none;">${label}</span>`;
            })
            .join("");

        const descHtml = prompt.description
            ? `<p class="prompt-desc">${prompt.description}</p>`
            : "";

        let aiModelsHtml = "";
        if (prompt.ai_models && prompt.ai_models.length > 0) {
            const seenCompanies = new Set();
            const logos = prompt.ai_models
                .map((modelId) => {
                    const modelInfo = ALL_AI_MODELS.find((m) => m.id === modelId);
                    if (!modelInfo) return null;
                    const company = modelInfo.company;
                    if (seenCompanies.has(company)) return null;
                    seenCompanies.add(company);
                    const logoFile = getCompanyLogo(company);
                    return `<img src="${logoFile}" alt="${company}" class="card-ai-logo">`;
                })
                .filter(Boolean)
                .join("");
            aiModelsHtml = logos;
        }

        card.innerHTML = `
            <div class="action-buttons">
                <button class="pin-btn ${prompt.pinned ? "pinned" : ""}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="${prompt.pinned ? "currentColor" : "none"}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                </button>
                <button class="share-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                    </svg>
                </button>
            </div>
            <div class="category-chips-inline">${categoryChips}</div>
            <h4>${prompt.title}</h4>
            ${descHtml}
            <div class="card-ai-models">${aiModelsHtml}</div>
            <div class="prompt-author">by ${prompt.author_name || "Unknown"}</div>
        `;

        card.addEventListener("click", () => loadPromptIntoEditor(prompt));

        const pinBtn = card.querySelector(".pin-btn");
        const shareBtn = card.querySelector(".share-btn");
        if (pinBtn) {
            pinBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleBookmark(prompt.id);
            });
        }
        if (shareBtn) {
            shareBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                openShareModal(prompt.id);
            });
        }

        grid.appendChild(card);
    });
}

function applyCategoryFilters() {
    const searchTerm = document
        .getElementById("search-input")
        .value.toLowerCase();
    let filtered = prompts;
    if (searchTerm) {
        filtered = filtered.filter(
            (p) =>
                p.title.toLowerCase().includes(searchTerm) ||
                (p.template && p.template.toLowerCase().includes(searchTerm)) ||
                (p.description && p.description.toLowerCase().includes(searchTerm)),
        );
    }
    if (activeCategoryFilters.length > 0) {
        filtered = filtered.filter((p) =>
            p.categories.some((cat) => activeCategoryFilters.includes(cat)),
        );
    }
    renderPromptGrid(filtered);
}

function filterPrompts() {
    applyCategoryFilters();
}

function setCategoryFilter(category) {
    if (category === "all") {
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
    document
        .querySelectorAll("#category-filters .category-chip")
        .forEach((chip) => {
            const cat = chip.dataset.category;
            if (cat === "all") {
                chip.classList.toggle("active", activeCategoryFilters.length === 0);
            } else {
                chip.classList.toggle("active", activeCategoryFilters.includes(cat));
            }
        });
}

/* :::::::::::::::::::::::::: PROMPT EDITOR :::::::::::::::::::::::::: */
function loadPromptIntoEditor(prompt) {
    try {
        currentPrompt = { ...prompt };

        const libraryView = document.getElementById("library-view");
        const editorView = document.getElementById("editor-view");
        const titleEl = document.getElementById("current-prompt-title");
        const descEl = document.getElementById("prompt-description-display");
        const templateTextarea = document.getElementById("template-textarea");
        const copyBtn = document.getElementById("copy-prompt-btn");
        const deleteBtn = document.getElementById("delete-prompt-btn");
        const saveBtn = document.getElementById("save-prompt-btn");

        if (!libraryView || !editorView || !titleEl) {
            console.warn("Editor DOM not ready, retrying...");
            setTimeout(() => loadPromptIntoEditor(prompt), 50);
            return;
        }

        libraryView.classList.remove("active");
        editorView.classList.add("active");
        titleEl.textContent = prompt.title;

        if (descEl) {
            descEl.textContent = prompt.description || "No description provided.";
        }
        if (templateTextarea) {
            templateTextarea.value = prompt.template || "";
        }

        const parsedFields = parsePromptFields(prompt.template || "");
        const savedFields = Array.isArray(prompt.field_definitions)
            ? prompt.field_definitions
            : [];

        parsedFields.forEach((pf) => {
            const saved = savedFields.find(
                (s) => s.name === pf.name && s.type === pf.type,
            );
            if (saved && saved.description) pf.description = saved.description;
            pf.value = "";
        });

        fieldDefinitions = parsedFields;

        if (
            fieldDefinitions.length === 0 &&
            prompt.template &&
            prompt.template.includes("{{")
        ) {
            fieldDefinitions = parsePromptFields(prompt.template);
        }

        fieldDefinitions.forEach((f) => {
            if (f.value === undefined) f.value = "";
        });

        selectedPartsCount = null;
        userTouchedPartsSlider = false;

        renderPromptInputFields();

        selectedAIModels = prompt.ai_models || [];
        renderAIModels();

        if (saveBtn) {
            const saveLabel = saveBtn.querySelector(".btn-label");
            const isReadonly = !!prompt.is_readonly;
            const isOwner = currentUser && prompt.user_id === currentUser.id;

            if (isReadonly) {
                saveBtn.disabled = true;
                saveBtn.classList.add("btn-disabled");
                if (saveLabel) saveLabel.textContent = "Read-only";
            } else if (isOwner) {
                saveBtn.disabled = false;
                saveBtn.classList.remove("btn-disabled");
                if (saveLabel) saveLabel.textContent = "Edit Prompt";
            } else {
                saveBtn.disabled = true;
                saveBtn.classList.add("btn-disabled");
                if (saveLabel) saveLabel.textContent = "Edit Prompt";
            }
        }

        if (copyBtn) {
            copyBtn.disabled = true;
            copyBtn.classList.remove("blink", "success");
        }

        if (deleteBtn) {
            const isOwner = currentUser && prompt.user_id === currentUser.id;
            deleteBtn.disabled = !isOwner;
        }
        checkSourceUpdate(prompt);
    } catch (error) {
        console.error("Error loading prompt into editor:", error);
        setTimeout(() => {
            if (currentPrompt) loadPromptIntoEditor(currentPrompt);
        }, 100);
    }
}

function backToLibrary() {
    document.getElementById("editor-view").classList.remove("active");
    document.getElementById("library-view").classList.add("active");
    resetAll();
    deletingPromptId = null;
}

function detectVariables() {
    const template = document.getElementById("template-textarea").value;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    const vars = new Set();
    while ((match = regex.exec(template)) !== null) {
        vars.add(match[1].trim());
    }
    currentVariables = {};
    const container = document.getElementById("variables-container");
    if (container) {
        container.innerHTML = "";
        if (vars.size === 0 && fieldDefinitions.length === 0) {
            container.innerHTML = `<p style="color:#666; grid-column:1/-1;">No fields detected. Use {field} or {{variable}} in your template.</p>`;
            return;
        }
        vars.forEach((v) => {
            currentVariables[v] = "";
            const div = document.createElement("div");
            div.className = "variable-field";
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
    let fullOutput = buildFullPromptFromFields();

    if (generateInterval) {
        clearInterval(generateInterval);
        generateInterval = null;
    }

    const display = document.getElementById("result-display");
    const copyBtn = document.getElementById("copy-prompt-btn");

    const tokenCount = countTokens(fullOutput);
    const TOKEN_LIMIT = 10000;

    const maxParts = Math.max(1, Math.ceil(tokenCount / TOKEN_LIMIT));

    let numParts;
    if (selectedPartsCount && selectedPartsCount >= 1) {
        numParts = selectedPartsCount;
    } else {
        numParts = maxParts;
    }

    if (numParts <= 1 && tokenCount <= TOKEN_LIMIT) {
        const STREAM_CHAR_LIMIT = 4000;

        if (fullOutput.length > STREAM_CHAR_LIMIT) {
            display.classList.remove("multipart-active");
            display.textContent = fullOutput;
            display.scrollTop = 0;
            if (copyBtn) {
                copyBtn.disabled = false;
                copyBtn.classList.add("blink");
            }
            return;
        }

        display.classList.remove("multipart-active");
        display.textContent = "";
        if (copyBtn) {
            copyBtn.disabled = true;
            copyBtn.classList.remove("blink");
        }

        let i = 0;
        generateInterval = setInterval(() => {
            if (i < fullOutput.length) {
                display.textContent += fullOutput.charAt(i);
                i++;
                display.scrollTop = display.scrollHeight;
            } else {
                clearInterval(generateInterval);
                generateInterval = null;
                if (copyBtn) {
                    copyBtn.disabled = false;
                    copyBtn.classList.add("blink");
                }
            }
        }, 12);
        return;
    }

    const parts = splitIntoExactParts(fullOutput, numParts);
    const totalParts = parts.length;

    const messages = parts.map((part, idx) => {
        const header = `[MULTI-PART PROMPT — PART ${idx + 1} of ${totalParts}]

⚠️ PART ${idx + 1} of ${totalParts} — total ${tokenCount.toLocaleString()} tokens split into ${totalParts} parts.

STRICT RULES:
1. Process ONLY the content in this message.
2. Do NOT ask for or reference other parts.
3. Do NOT add introductions, summaries, or closing remarks.
4. Output ONLY the transformed content — nothing before or after.
5. Preserve exact paragraph boundaries.

═══════════════════════════════════════

`;
        return header + part;
    });

    renderMultipartMessages(messages);
}

function copyPrompt() {
    const resultDisplay = document.getElementById("result-display");
    if (!resultDisplay) return;

    const text = resultDisplay.textContent;
    if (!text) return;

    const copyBtn = document.getElementById("copy-prompt-btn");

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                handleCopySuccess(copyBtn);
            })
            .catch(() => {
                fallbackCopy(text, copyBtn);
            });
    } else {
        fallbackCopy(text, copyBtn);
    }
}

function handleCopySuccess(btn) {
    if (!btn) return;
    btn.classList.remove("blink");
    btn.classList.add("success");

    const btnText = btn.querySelector(".btn-text");
    if (btnText) btnText.textContent = "Copied";

    setTimeout(() => {
        btn.classList.remove("success");
        if (btnText) btnText.textContent = "Copy";
    }, 2000);
}

async function confirmDeletePrompt() {
    if (!deletingPromptId) return;

    try {
        const { error } = await sb
            .from("tavio_prompts")
            .delete()
            .eq("id", deletingPromptId);

        if (error) {
            showToast("Failed to delete prompt.");
            console.error(error);
        } else {
            prompts = prompts.filter((p) => p.id !== deletingPromptId);
            applyCategoryFilters();
        }
    } catch (e) {
        console.error(e);
    } finally {
        closeModal(document.getElementById("delete-confirm-modal"));
        backToLibrary();
        deletingPromptId = null;
    }
}

function fallbackCopy(text, btn) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand("copy");
        if (successful) {
            handleCopySuccess(btn);
        } else {
            showToast("Copy failed. Please copy manually.");
        }
    } catch (err) {
        showToast("Copy failed. Please copy manually.");
    }
    document.body.removeChild(textarea);
}

function resetAll() {
    if (generateInterval) {
        clearInterval(generateInterval);
        generateInterval = null;
    }

    const resultDisplay = document.getElementById("result-display");
    const copyBtn = document.getElementById("copy-prompt-btn");

    if (resultDisplay) resultDisplay.textContent = "";

    if (copyBtn) {
        copyBtn.disabled = true;
        copyBtn.classList.remove("blink", "success");
    }

    if (fieldDefinitions && fieldDefinitions.length > 0) {
        fieldDefinitions.forEach((f) => {
            if (f.type === "multi-select") {
                f.value = [];
            } else {
                f.value = "";
            }
        });
        renderPromptInputFields();
    }

    aiModelsExpanded = false;

    const editorView = document.getElementById("editor-view");
    if (editorView) {
        editorView.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    updateTokenSplitPreview();
}

/* :::::::::::::::::::::::::: PROMPT MODAL :::::::::::::::::::::::::: */
function showNewPromptModal() {
    editingPromptId = null;
    renderShareManagement([]);
    document.getElementById("modal-title").value = "";
    document.getElementById("modal-description").value = "";
    document.getElementById("modal-template").value = "";
    modalSelectedAIModels = [];
    modalSelectedCategories = [];
    modalAIModalityFilters = [];
    aiCompanyExpanded = {};
    updateSelectedCountDisplay();
    document.getElementById("add-prompt-btn").textContent = "Add to Library";

    const globalToggle = document.getElementById("modal-global-toggle-wrapper");
    if (globalToggle) {
        if (currentUserRole === "General") {
            globalToggle.style.display = "block";
            document.getElementById("modal-is-global").checked = false;
        } else {
            globalToggle.style.display = "none";
        }
    }

    const dropdown = document.getElementById("ai-select-dropdown");
    const button = document.getElementById("ai-select-button");
    if (dropdown) {
        dropdown.classList.remove("open");
        dropdown.classList.add("hidden");
    }
    if (button) button.classList.remove("invisible");
    aiDropdownOpen = false;
    aiFilterAreaVisible = false;
    const filterArea = document.getElementById("ai-filter-area");
    if (filterArea) filterArea.classList.add("hidden");
    const toggleBtn = document.getElementById("ai-filter-toggle-btn");
    if (toggleBtn) toggleBtn.classList.remove("active");

    renderModalCategories();
    openModal(document.getElementById("new-prompt-modal"));
}

function openEditPromptModal() {
    if (!currentPrompt) return;
    editingPromptId = currentPrompt.id;

    const titleInput = document.getElementById("modal-title");
    const descTextarea = document.getElementById("modal-description");
    const templateTextarea = document.getElementById("modal-template");

    if (!titleInput || !templateTextarea) {
        setTimeout(() => openEditPromptModal(), 50);
        return;
    }

    titleInput.value = currentPrompt.title || "";
    descTextarea.value = currentPrompt.description || "";
    templateTextarea.value = currentPrompt.template || "";

    modalSelectedCategories = [...(currentPrompt.categories || [])];
    modalSelectedAIModels = [...(currentPrompt.ai_models || [])];
    updateSelectedCountDisplay();

    modalAIModalityFilters = [];
    aiCompanyExpanded = {};

    const globalToggle = document.getElementById("modal-global-toggle-wrapper");
    if (globalToggle) {
        if (currentUserRole === "General") {
            globalToggle.style.display = "block";
            document.getElementById("modal-is-global").checked =
                currentPrompt.is_global || false;
        } else {
            globalToggle.style.display = "none";
        }
    }

    document.getElementById("add-prompt-btn").textContent = "Save Changes";

    const dropdown = document.getElementById("ai-select-dropdown");
    const button = document.getElementById("ai-select-button");
    if (dropdown) {
        dropdown.classList.remove("open");
        dropdown.classList.add("hidden");
    }
    if (button) button.classList.remove("invisible");
    aiDropdownOpen = false;
    aiFilterAreaVisible = false;
    const filterArea = document.getElementById("ai-filter-area");
    if (filterArea) filterArea.classList.add("hidden");
    const toggleBtn = document.getElementById("ai-filter-toggle-btn");
    if (toggleBtn) toggleBtn.classList.remove("active");

    renderModalCategories();
    loadSharesForPrompt(editingPromptId).then(renderShareManagement);
    openModal(document.getElementById("new-prompt-modal"));
}

function hideNewPromptModal() {
    const modal = document.getElementById("new-prompt-modal");
    if (modal) {
        modal.style.removeProperty("display");
        modal.classList.add("hidden");
    }
    editingPromptId = null;
    document.getElementById("add-prompt-btn").textContent = "Add to Library";
    const globalCheckbox = document.getElementById("modal-is-global");
    if (globalCheckbox) globalCheckbox.checked = false;
}

async function savePromptFromModal() {
    const title = document.getElementById("modal-title").value.trim();
    const description = document
        .getElementById("modal-description")
        .value.trim()
        .substring(0, 150);
    const template = document.getElementById("modal-template").value.trim();

    if (!title || !template) {
        showToast("Title and template are required.");
        return;
    }
    if (modalSelectedCategories.length === 0) {
        showToast("Please select at least one category.");
        return;
    }

    const isGlobal = document.getElementById("modal-is-global")?.checked || false;
    const fields = parsePromptFields(template);

    const promptData = {
        title,
        description,
        category_id: JSON.stringify(modalSelectedCategories),
        content: template,
        field_definitions: fields,
        ai_models: modalSelectedAIModels,
        is_global: isGlobal,
    };

    try {
        if (editingPromptId) {
            const { error } = await sb
                .from("tavio_prompts")
                .update(promptData)
                .eq("id", editingPromptId)
                .eq("user_id", currentUser.id);

            if (error) throw error;

            const index = prompts.findIndex((p) => p.id === editingPromptId);
            if (index !== -1) {
                prompts[index] = {
                    ...prompts[index],
                    ...promptData,
                    categories: modalSelectedCategories,
                    template: template,
                    ai_models: modalSelectedAIModels,
                    field_definitions: fields,
                    description: description,
                };
            }

            if (currentPrompt && currentPrompt.id === editingPromptId) {
                currentPrompt = { ...prompts[index] };
                loadPromptIntoEditor(currentPrompt);
            }

            showToast("Prompt updated successfully.");
        } else {
            const { data, error } = await sb
                .from("tavio_prompts")
                .insert({
                    ...promptData,
                    user_id: currentUser.id,
                    pinned: false,
                })
                .select("id, created_at, updated_at")
                .single();

            if (error) throw error;

            const newPrompt = {
                ...promptData,
                id: data.id,
                user_id: currentUser.id,
                pinned: false,
                created_at: data.created_at,
                updated_at: data.updated_at,
                author_name: currentProfile
                    ? (
                          currentProfile.first_name +
                          " " +
                          currentProfile.last_name
                      ).trim() ||
                      currentProfile.username ||
                      "Unknown"
                    : "Unknown",
                categories: modalSelectedCategories,
            };
            prompts.unshift(newPrompt);
            showToast("Prompt added to library!");
        }

        hideNewPromptModal();
        applyCategoryFilters();
        editingPromptId = null;
        document.getElementById("add-prompt-btn").textContent = "Add to Library";
    } catch (error) {
        console.error("Error saving prompt:", error);
        showToast("Failed to save prompt. Please try again.");
    }
}

async function saveCurrentPrompt() {
    if (!currentPrompt) return;
    const template = document.getElementById("template-textarea").value.trim();
    if (!template) return;
    currentPrompt.template = template;
    currentPrompt.field_definitions = fieldDefinitions;
    currentPrompt.ai_models = selectedAIModels;

    const { error } = await sb
        .from("tavio_prompts")
        .update({
            description: currentPrompt.description,
            content: template,
            field_definitions: fieldDefinitions,
            ai_models: selectedAIModels,
        })
        .eq("id", currentPrompt.id)
        .eq("user_id", currentUser.id);

    if (error) {
        alert("Failed to save prompt. Please try again.");
        console.error(error);
        return;
    }

    const index = prompts.findIndex((p) => p.id === currentPrompt.id);
    if (index !== -1) prompts[index] = { ...currentPrompt };
    alert("Prompt saved to library!");
    applyCategoryFilters();
}

/* :::::::::::::::::::::::::: UI EVENT LISTENERS :::::::::::::::::::::::::: */
function updateRowArrows(rowId) {
    const inner = document.getElementById(rowId);
    if (!inner) return;
    const leftArrow = document.getElementById(
        rowId.replace("scroll-inner", "arrow-left"),
    );
    const rightArrow = document.getElementById(
        rowId.replace("scroll-inner", "arrow-right"),
    );
    if (!leftArrow || !rightArrow) return;

    const canScrollLeft = inner.scrollLeft > 0;
    const canScrollRight =
        inner.scrollLeft + inner.clientWidth < inner.scrollWidth - 1;

    leftArrow.classList.toggle("hidden", !canScrollLeft);
    rightArrow.classList.toggle("hidden", !canScrollRight);
}

function scrollRow(targetId, direction) {
    const inner = document.getElementById(targetId);
    if (!inner) return;
    const scrollAmount = 120;
    inner.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
    });
}

function setupFilterScrollArrows() {
    const rows = [
        {
            innerId: "modality-scroll-inner",
            leftId: "modality-arrow-left",
            rightId: "modality-arrow-right",
        },
        {
            innerId: "modal-categories-scroll-inner",
            leftId: "modal-categories-arrow-left",
            rightId: "modal-categories-arrow-right",
        },
    ];

    rows.forEach((row) => {
        const inner = document.getElementById(row.innerId);
        if (!inner) return;

        inner.addEventListener("scroll", () => updateRowArrows(row.innerId));

        document
            .getElementById(row.leftId)
            ?.addEventListener("click", () => scrollRow(row.innerId, "left"));
        document
            .getElementById(row.rightId)
            ?.addEventListener("click", () => scrollRow(row.innerId, "right"));
    });
}

function setupUIListeners() {
    document
        .getElementById("search-input")
        .addEventListener("input", filterPrompts);

    document
        .querySelectorAll("#category-filters .category-chip")
        .forEach((chip) => {
            chip.addEventListener("click", () => {
                setCategoryFilter(chip.dataset.category);
            });
        });

    document.getElementById("cat-scroll-left").addEventListener("click", () => {
        document
            .getElementById("category-filters")
            .scrollBy({ left: -200, behavior: "smooth" });
    });
    document.getElementById("cat-scroll-right").addEventListener("click", () => {
        document
            .getElementById("category-filters")
            .scrollBy({ left: 200, behavior: "smooth" });
    });

    const modalCatLeft = document.getElementById("modal-categories-arrow-left");
    if (modalCatLeft)
        modalCatLeft.addEventListener("click", () => {
            document
                .getElementById("modal-categories-scroll-inner")
                .scrollBy({ left: -200, behavior: "smooth" });
        });
    const modalCatRight = document.getElementById("modal-categories-arrow-right");
    if (modalCatRight)
        modalCatRight.addEventListener("click", () => {
            document
                .getElementById("modal-categories-scroll-inner")
                .scrollBy({ left: 200, behavior: "smooth" });
        });

    document
        .getElementById("new-prompt-btn")
        .addEventListener("click", showNewPromptModal);

    const cancelBtn = document.getElementById("cancel-modal-btn");
    if (cancelBtn) cancelBtn.addEventListener("click", hideNewPromptModal);
    const addBtn = document.getElementById("add-prompt-btn");
    if (addBtn) addBtn.addEventListener("click", savePromptFromModal);
    const newPromptModal = document.getElementById("new-prompt-modal");
    if (newPromptModal)
        newPromptModal.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) hideNewPromptModal();
        });

    const aiSelectBtn = document.getElementById("ai-select-button");
    if (aiSelectBtn) aiSelectBtn.addEventListener("click", toggleAIDropdown);
    const aiSearchInput = document.getElementById("ai-search-input");
    if (aiSearchInput)
        aiSearchInput.addEventListener("input", renderModalAIDropdown);
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".ai-select-wrapper") && aiDropdownOpen) {
            toggleAIDropdown();
        }
    });

    const closeDropdownBtn = document.getElementById("ai-close-dropdown-btn");
    if (closeDropdownBtn)
        closeDropdownBtn.addEventListener("click", toggleAIDropdown);

    const filterToggleBtn = document.getElementById("ai-filter-toggle-btn");
    if (filterToggleBtn) {
        filterToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleAIFilterArea();
        });
    }

    const backBtn = document.getElementById("back-to-library-btn");
    if (backBtn) backBtn.addEventListener("click", backToLibrary);
    const genBtn = document.getElementById("generate-prompt-btn");
    if (genBtn) genBtn.addEventListener("click", generatePrompt);
    const copyBtn = document.getElementById("copy-prompt-btn");
    if (copyBtn) copyBtn.addEventListener("click", copyPrompt);
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", resetAll);
    const saveBtn = document.getElementById("save-prompt-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (currentPrompt?.is_readonly) {
                showToast("This prompt is read-only.");
                return;
            }
            if (
                currentPrompt &&
                currentUser &&
                currentPrompt.user_id === currentUser.id
            ) {
                openEditPromptModal();
            } else {
                showToast("You can only edit your own prompts.");
            }
        });
    }

    const syncBtn = document.getElementById("sync-prompt-btn");
    if (syncBtn) {
        syncBtn.addEventListener("click", () => {
            syncPromptFromSource();
        });
    }

    const deleteBtn = document.getElementById("delete-prompt-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!deleteBtn.disabled && currentPrompt) {
                deletingPromptId = currentPrompt.id;
                openModal(document.getElementById("delete-confirm-modal"));
            }
        });
    }

    const confirmYesBtn = document.getElementById("confirm-yes-btn");
    const confirmNoBtn = document.getElementById("confirm-no-btn");
    const deleteConfirmModal = document.getElementById("delete-confirm-modal");

    if (confirmYesBtn) {
        confirmYesBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            confirmDeletePrompt();
        });
    }
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeModal(deleteConfirmModal);
            deletingPromptId = null;
        });
    }
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) {
                closeModal(deleteConfirmModal);
                deletingPromptId = null;
            }
        });
    }

    const sidebarNewPrompt = document.getElementById("tavio-new-prompt-item");
    if (sidebarNewPrompt)
        sidebarNewPrompt.addEventListener("click", showNewPromptModal);

    const shareCancel = document.getElementById("share-cancel-btn");
    if (shareCancel) shareCancel.addEventListener("click", closeShareModal);
    const shareSend = document.getElementById("share-send-btn");
    if (shareSend) shareSend.addEventListener("click", sendShareRequest);
    const shareModal = document.getElementById("share-modal");
    if (shareModal)
        shareModal.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) closeShareModal();
        });

    const previewAccept = document.getElementById("preview-accept-btn");
    if (previewAccept)
        previewAccept.addEventListener("click", acceptSharedPrompt);
    const previewReject = document.getElementById("preview-reject-btn");
    if (previewReject)
        previewReject.addEventListener("click", rejectSharedPrompt);
    const previewModal = document.getElementById("prompt-preview-modal");
    if (previewModal)
        previewModal.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) {
                document.getElementById("prompt-preview-modal").classList.add("hidden");
            }
        });

    setupFilterScrollArrows();

    const promptInputsContainer = document.getElementById("prompt-input-fields");
    if (promptInputsContainer && !promptInputsContainer.dataset.tokenPreviewAttached) {
        promptInputsContainer.dataset.tokenPreviewAttached = "true";
        promptInputsContainer.addEventListener(
            "input",
            debouncedUpdateTokenSplitPreview,
        );
        promptInputsContainer.addEventListener(
            "change",
            debouncedUpdateTokenSplitPreview,
        );
    }

    const tokenSlider = document.getElementById("token-split-slider");
    if (tokenSlider) {
        tokenSlider.addEventListener("input", (e) => {
            selectedPartsCount = parseInt(e.target.value, 10) || 1;
            userTouchedPartsSlider = true;

            const min = parseInt(tokenSlider.min, 10) || 1;
            const max = parseInt(tokenSlider.max, 10) || 1;
            const fillPercent =
                max === min
                    ? 100
                    : ((selectedPartsCount - min) / (max - min)) * 100;
            tokenSlider.style.setProperty("--slider-fill", `${fillPercent}%`);

            const partsWord = selectedPartsCount === 1 ? "part" : "parts";
            const sliderValue = document.getElementById(
                "token-split-slider-value",
            );
            if (sliderValue)
                sliderValue.textContent = `${selectedPartsCount} ${partsWord}`;

            updateTokenSplitPreview();
        });
    }

    const tokenTrack = document.getElementById("token-split-track");
    const tokenLeft = document.getElementById("token-split-arrow-left");
    const tokenRight = document.getElementById("token-split-arrow-right");

    if (tokenTrack) {
        tokenTrack.addEventListener("scroll", updateTokenSplitArrows);
    }
    if (tokenLeft) {
        tokenLeft.addEventListener("click", () => {
            tokenTrack?.scrollBy({ left: -260, behavior: "smooth" });
        });
    }
    if (tokenRight) {
        tokenRight.addEventListener("click", () => {
            tokenTrack?.scrollBy({ left: 260, behavior: "smooth" });
        });
    }
}

/* :::::::::::::::::::::::::: SEARCH INPUT LISTENERS :::::::::::::::::::::::::: */
const searchInput = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear-btn");

searchInput.addEventListener("input", () => {
    if (searchInput.value.length > 0) {
        searchClearBtn.classList.remove("hidden");
    } else {
        searchClearBtn.classList.add("hidden");
    }
    filterPrompts();
});

searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchClearBtn.classList.add("hidden");
    searchInput.focus();
    filterPrompts();
});

/* :::::::::::::::::::::::::: MULTIPART PROMPTS :::::::::::::::::::::::::: */
function renderMultipartMessages(messages) {
    if (generateInterval) {
        clearInterval(generateInterval);
        generateInterval = null;
    }

    const display = document.getElementById("result-display");
    const copyBtn = document.getElementById("copy-prompt-btn");
    if (copyBtn) {
        copyBtn.disabled = true;
        copyBtn.classList.remove("blink");
    }

    display.classList.add("multipart-active");

    const total = messages.length;

    display.innerHTML = `
    <div class="multipart-banner">
      ⚠️ This prompt has been split into <b>${total} parts</b>.
      Send each part separately to the AI. Each part will be processed <b>independently</b>.
      Then paste the outputs one after another to assemble the final result.
    </div>
  `;

    let chunkIdx = 0;
    let currentBody = null;
    let currentChunkEl = null;
    let charIdx = 0;

    const escapedMessages = messages.map((m) =>
        String(m)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
    );

    const createChunkBox = (idx) => {
        const el = document.createElement("div");
        el.className = "multipart-chunk entering";
        el.dataset.idx = String(idx);

        el.innerHTML = `
      <div class="multipart-chunk-header">
        <span>Part ${idx + 1} / ${total}</span>
        <button class="action-icon-btn copy-chunk-btn" data-idx="${idx}" title="Copy this part" disabled>
          <span class="btn-text">Copy</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
        </button>
      </div>
      <div class="multipart-chunk-body"></div>
    `;

        const cb = el.querySelector(".copy-chunk-btn");
        cb.addEventListener("click", () => {
            if (cb.disabled) return;
            const onSuccess = () => {
                const t = cb.querySelector(".btn-text");
                if (t) {
                    t.textContent = "Copied";
                    setTimeout(() => (t.textContent = "Copy"), 1500);
                }
            };
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(messages[idx]).then(onSuccess).catch(() => {
                    fallbackCopyMultipart(messages[idx], onSuccess);
                });
            } else {
                fallbackCopyMultipart(messages[idx], onSuccess);
            }
        });

        display.appendChild(el);
        setTimeout(() => el.classList.remove("entering"), 400);

        return {
            el,
            body: el.querySelector(".multipart-chunk-body"),
            copyBtn: cb,
        };
    };

    const typeNext = () => {
        if (chunkIdx >= escapedMessages.length) {
            if (generateInterval) {
                clearInterval(generateInterval);
                generateInterval = null;
            }
            if (copyBtn) {
                copyBtn.disabled = false;
                copyBtn.classList.add("blink");
            }
            if (currentChunkEl) currentChunkEl.classList.remove("typing");
            return;
        }

        if (!currentBody) {
            const { el, body, copyBtn: cb } = createChunkBox(chunkIdx);
            currentChunkEl = el;
            currentBody = body;
            currentChunkEl.classList.add("typing");
            requestAnimationFrame(() => {
                currentChunkEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
            return;
        }

        const full = escapedMessages[chunkIdx];

        if (charIdx < full.length) {
            const batchSize = full.length > 8000 ? 14 : full.length > 4000 ? 9 : 4;
            currentBody.innerHTML += full.slice(charIdx, charIdx + batchSize);
            charIdx += batchSize;
            currentBody.scrollTop = currentBody.scrollHeight;
        } else {
            if (currentChunkEl) currentChunkEl.classList.remove("typing");
            if (currentBody?.parentElement) {
                const inner = currentBody.parentElement.querySelector(".copy-chunk-btn");
                if (inner) inner.disabled = false;
            }
            chunkIdx++;
            charIdx = 0;
            currentBody = null;
            currentChunkEl = null;
        }
    };

    generateInterval = setInterval(typeNext, 16);
}

function fallbackCopyMultipart(text, onSuccess) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand("copy");
        onSuccess();
    } catch (e) {}
    document.body.removeChild(ta);
}

/* :::::::::::::::::::::::::: INITIALIZATION :::::::::::::::::::::::::: */
document.addEventListener("DOMContentLoaded", async () => {
    setupAuthListeners();
    setupUIListeners();

    customElements.whenDefined("sidebar-component").then(() => {
        getSidebarComponent();
        syncSidebarComponent();
    });

    await restoreSession();
});