// Theme Management System for v0.0.2

class ThemeManager {
    constructor() {
        this.currentTheme = 'light'; // Default to light theme
        this.themes = {
            'dark': 'Dark',
            'light': 'Light', 
            'light-minimal': 'Light Minimal'
        };
        this.init();
    }

    async init() {
        try {
            // Load saved theme
            const savedTheme = await this.loadTheme();
            this.currentTheme = savedTheme;
            
            // Apply theme
            this.applyTheme(this.currentTheme);
            
            // Setup theme selector
            this.setupThemeSelector();
            
            console.log('Theme manager initialized with theme:', this.currentTheme);
        } catch (error) {
            console.error('Error initializing theme manager:', error);
            // Fallback to default theme
            this.applyTheme(this.currentTheme);
        }
    }

    async loadTheme() {
        try {
            const result = await chrome.storage.local.get('selectedTheme');
            return result.selectedTheme || 'light';
        } catch (error) {
            console.error('Error loading theme:', error);
            return 'light';
        }
    }

    async saveTheme(theme) {
        try {
            await chrome.storage.local.set({ selectedTheme: theme });
            return true;
        } catch (error) {
            console.error('Error saving theme:', error);
            return false;
        }
    }

    applyTheme(theme) {
        // Remove existing theme classes
        Object.keys(this.themes).forEach(themeKey => {
            document.documentElement.removeAttribute('data-theme');
        });
        
        // Apply new theme
        if (theme !== 'dark') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        this.currentTheme = theme;
        
        // Update theme selector if it exists
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = theme;
        }
        
        // Trigger theme change event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }

    setupThemeSelector() {
        // Create theme selector dropdown if it doesn't exist
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;
        
        // Check if theme selector already exists
        if (document.getElementById('theme-selector-container')) return;
        
        const themeContainer = document.createElement('div');
        themeContainer.className = 'theme-selector';
        themeContainer.id = 'theme-selector-container';
        
        const themeSelect = document.createElement('select');
        themeSelect.className = 'theme-dropdown';
        themeSelect.id = 'theme-selector';
        
        // Add theme options
        Object.entries(this.themes).forEach(([key, label]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = label;
            option.selected = key === this.currentTheme;
            themeSelect.appendChild(option);
        });
        
        // Add change event listener
        themeSelect.addEventListener('change', async (e) => {
            const newTheme = e.target.value;
            this.applyTheme(newTheme);
            await this.saveTheme(newTheme);
        });
        
        themeContainer.appendChild(themeSelect);
        
        // Insert before the settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            headerActions.insertBefore(themeContainer, settingsBtn);
        } else {
            headerActions.appendChild(themeContainer);
        }
    }

    // Get theme-aware colors for dynamic elements
    getThemedColor(colorName, shade = 500) {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        // Get CSS variable values based on current theme
        switch (colorName) {
            case 'primary':
                return computedStyle.getPropertyValue('--text-primary').trim();
            case 'secondary':
                return computedStyle.getPropertyValue('--text-secondary').trim();
            case 'muted':
                return computedStyle.getPropertyValue('--text-muted').trim();
            case 'bg-primary':
                return computedStyle.getPropertyValue('--bg-primary').trim();
            case 'bg-secondary':
                return computedStyle.getPropertyValue('--bg-secondary').trim();
            case 'border':
                return computedStyle.getPropertyValue('--border-primary').trim();
            default:
                // For standard Tailwind colors, return as is
                return `var(--${colorName}-${shade})`;
        }
    }

    // Update icon colors based on theme
    updateIconColors() {
        const icons = document.querySelectorAll('svg');
        icons.forEach(icon => {
            // Only update icons that don't have specific color classes
            if (!icon.className.baseVal.includes('text-')) {
                icon.style.color = this.getThemedColor('muted');
            }
        });
    }

    // Get appropriate text color for backgrounds
    getContrastTextColor(backgroundColor) {
        // Simple contrast calculation - in a real app you'd use a more sophisticated method
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return this.getThemedColor('primary');
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#1e293b' : '#f1f5f9';
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Theme-specific adjustments for different components
    applyThemeSpecificStyles() {
        const theme = this.currentTheme;
        
        // Adjust gradient styles for light minimal theme
        if (theme === 'light-minimal') {
            const brandTitle = document.querySelector('.brand-title');
            if (brandTitle) {
                brandTitle.style.background = 'linear-gradient(to right, #334155, #64748b)';
                brandTitle.style.webkitBackgroundClip = 'text';
                brandTitle.style.backgroundClip = 'text';
                brandTitle.style.color = 'transparent';
            }
        }
    }

    // Initialize theme system when DOM is ready
    static initializeThemeSystem() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.themeManager = new ThemeManager();
            });
        } else {
            window.themeManager = new ThemeManager();
        }
    }
}

// Enhanced Color Picker for all Tailwind colors
class EnhancedColorPicker {
    constructor() {
        this.colorGroups = {
            'slate': { name: 'Slate', primary: '#64748b' },
            'gray': { name: 'Gray', primary: '#6b7280' },
            'zinc': { name: 'Zinc', primary: '#71717a' },
            'neutral': { name: 'Neutral', primary: '#737373' },
            'stone': { name: 'Stone', primary: '#78716c' },
            'red': { name: 'Red', primary: '#ef4444' },
            'orange': { name: 'Orange', primary: '#f97316' },
            'amber': { name: 'Amber', primary: '#f59e0b' },
            'yellow': { name: 'Yellow', primary: '#eab308' },
            'lime': { name: 'Lime', primary: '#84cc16' },
            'green': { name: 'Green', primary: '#22c55e' },
            'emerald': { name: 'Emerald', primary: '#10b981' },
            'teal': { name: 'Teal', primary: '#14b8a6' },
            'cyan': { name: 'Cyan', primary: '#06b6d4' },
            'sky': { name: 'Sky', primary: '#0ea5e9' },
            'blue': { name: 'Blue', primary: '#3b82f6' },
            'indigo': { name: 'Indigo', primary: '#6366f1' },
            'violet': { name: 'Violet', primary: '#8b5cf6' },
            'purple': { name: 'Purple', primary: '#a855f7' },
            'fuchsia': { name: 'Fuchsia', primary: '#d946ef' },
            'pink': { name: 'Pink', primary: '#ec4899' },
            'rose': { name: 'Rose', primary: '#f43f5e' }
        };
        
        this.shades = {
            50: { slate: '#f8fafc', gray: '#f9fafb', zinc: '#fafafa', neutral: '#fafafa', stone: '#fafaf9', red: '#fef2f2', orange: '#fff7ed', amber: '#fffbeb', yellow: '#fefce8', lime: '#f7fee7', green: '#f0fdf4', emerald: '#ecfdf5', teal: '#f0fdfa', cyan: '#ecfeff', sky: '#f0f9ff', blue: '#eff6ff', indigo: '#eef2ff', violet: '#f5f3ff', purple: '#faf5ff', fuchsia: '#fdf4ff', pink: '#fdf2f8', rose: '#fff1f2' },
            100: { slate: '#f1f5f9', gray: '#f3f4f6', zinc: '#f4f4f5', neutral: '#f5f5f5', stone: '#f5f5f4', red: '#fee2e2', orange: '#fed7aa', amber: '#fef3c7', yellow: '#fef9c3', lime: '#ecfccb', green: '#dcfce7', emerald: '#d1fae5', teal: '#ccfbf1', cyan: '#cffafe', sky: '#e0f2fe', blue: '#dbeafe', indigo: '#e0e7ff', violet: '#ede9fe', purple: '#f3e8ff', fuchsia: '#fae8ff', pink: '#fce7f3', rose: '#ffe4e6' },
            200: { slate: '#e2e8f0', gray: '#e5e7eb', zinc: '#e4e4e7', neutral: '#e5e5e5', stone: '#e7e5e4', red: '#fecaca', orange: '#fed7aa', amber: '#fde68a', yellow: '#fef08a', lime: '#d9f99d', green: '#bbf7d0', emerald: '#a7f3d0', teal: '#99f6e4', cyan: '#a5f3fc', sky: '#bae6fd', blue: '#bfdbfe', indigo: '#c7d2fe', violet: '#ddd6fe', purple: '#e9d5ff', fuchsia: '#f5d0fe', pink: '#fbcfe8', rose: '#fecdd3' },
            300: { slate: '#cbd5e1', gray: '#d1d5db', zinc: '#d4d4d8', neutral: '#d4d4d4', stone: '#d6d3d1', red: '#fca5a5', orange: '#fdba74', amber: '#fcd34d', yellow: '#fde047', lime: '#bef264', green: '#86efac', emerald: '#6ee7b7', teal: '#5eead4', cyan: '#67e8f9', sky: '#7dd3fc', blue: '#93c5fd', indigo: '#a5b4fc', violet: '#c4b5fd', purple: '#d8b4fe', fuchsia: '#f0abfc', pink: '#f9a8d4', rose: '#fda4af' },
            400: { slate: '#94a3b8', gray: '#9ca3af', zinc: '#a1a1aa', neutral: '#a3a3a3', stone: '#a8a29e', red: '#f87171', orange: '#fb923c', amber: '#fbbf24', yellow: '#facc15', lime: '#a3e635', green: '#4ade80', emerald: '#34d399', teal: '#2dd4bf', cyan: '#22d3ee', sky: '#38bdf8', blue: '#60a5fa', indigo: '#818cf8', violet: '#a78bfa', purple: '#c084fc', fuchsia: '#e879f9', pink: '#f472b6', rose: '#fb7185' },
            500: { slate: '#64748b', gray: '#6b7280', zinc: '#71717a', neutral: '#737373', stone: '#78716c', red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef', pink: '#ec4899', rose: '#f43f5e' },
            600: { slate: '#475569', gray: '#4b5563', zinc: '#52525b', neutral: '#525252', stone: '#57534e', red: '#dc2626', orange: '#ea580c', amber: '#d97706', yellow: '#ca8a04', lime: '#65a30d', green: '#16a34a', emerald: '#059669', teal: '#0d9488', cyan: '#0891b2', sky: '#0284c7', blue: '#2563eb', indigo: '#4f46e5', violet: '#7c3aed', purple: '#9333ea', fuchsia: '#c026d3', pink: '#db2777', rose: '#e11d48' },
            700: { slate: '#334155', gray: '#374151', zinc: '#3f3f46', neutral: '#404040', stone: '#44403c', red: '#b91c1c', orange: '#c2410c', amber: '#b45309', yellow: '#a16207', lime: '#4d7c0f', green: '#15803d', emerald: '#047857', teal: '#0f766e', cyan: '#0e7490', sky: '#0369a1', blue: '#1d4ed8', indigo: '#3730a3', violet: '#6d28d9', purple: '#7e22ce', fuchsia: '#a21caf', pink: '#be185d', rose: '#be123c' },
            800: { slate: '#1e293b', gray: '#1f2937', zinc: '#27272a', neutral: '#262626', stone: '#292524', red: '#991b1b', orange: '#9a3412', amber: '#92400e', yellow: '#854d0e', lime: '#365314', green: '#166534', emerald: '#065f46', teal: '#115e59', cyan: '#155e75', sky: '#075985', blue: '#1e40af', indigo: '#312e81', violet: '#5b21b6', purple: '#6b21a8', fuchsia: '#86198f', pink: '#9d174d', rose: '#9f1239' },
            900: { slate: '#0f172a', gray: '#111827', zinc: '#18181b', neutral: '#171717', stone: '#1c1917', red: '#7f1d1d', orange: '#7c2d12', amber: '#78350f', yellow: '#713f12', lime: '#1a2e05', green: '#14532d', emerald: '#064e3b', teal: '#134e4a', cyan: '#164e63', sky: '#0c4a6e', blue: '#1e3a8a', indigo: '#1e1b4b', violet: '#4c1d95', purple: '#581c87', fuchsia: '#701a75', pink: '#831843', rose: '#881337' },
            950: { slate: '#020617', gray: '#030712', zinc: '#09090b', neutral: '#0a0a0a', stone: '#0c0a09', red: '#450a0a', orange: '#431407', amber: '#451a03', yellow: '#422006', lime: '#0a0f02', green: '#052e16', emerald: '#022c22', teal: '#042f2e', cyan: '#083344', sky: '#082f49', blue: '#172554', indigo: '#0f0f23', violet: '#2e1065', purple: '#3b0764', fuchsia: '#4a044e', pink: '#500724', rose: '#4c0519' }
        };
        
        this.currentGroup = 'blue';
        this.currentShade = 500;
        this.selectedCallback = null;
    }

    // Create enhanced color picker modal
    createColorPickerModal(selectedColor = 'blue-500', callback) {
        this.selectedCallback = callback;
        
        // Parse current color
        const [group, shade] = selectedColor.split('-');
        this.currentGroup = group || 'blue';
        this.currentShade = parseInt(shade) || 500;
        
        // Create modal
        const modal = this.createModal();
        document.body.appendChild(modal);
        
        // Setup initial display
        this.populateColorGroups();
        this.populateShades();
        
        // Show modal
        modal.classList.remove('hidden');
        
        return modal;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal color-picker-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Choose Color</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="color-group-container">
                        <label class="form-label">Color Family</label>
                        <div class="color-group-grid" id="color-group-grid">
                            <!-- Color groups will be populated here -->
                        </div>
                    </div>
                    <div class="shade-container" style="margin-top: 20px;">
                        <label class="form-label">Shade</label>
                        <div class="shade-picker" id="shade-picker">
                            <!-- Shades will be populated here -->
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-color">Cancel</button>
                        <button type="button" class="btn btn-primary" id="select-color">Select Color</button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners
        this.setupColorModalEvents(modal);
        
        return modal;
    }

    setupColorModalEvents(modal) {
        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('#cancel-color').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        // Select color event
        modal.querySelector('#select-color').addEventListener('click', () => {
            const selectedColor = `${this.currentGroup}-${this.currentShade}`;
            if (this.selectedCallback) {
                this.selectedCallback(selectedColor);
            }
            this.closeModal(modal);
        });
    }

    populateColorGroups() {
        const container = document.getElementById('color-group-grid');
        container.innerHTML = '';
        
        Object.entries(this.colorGroups).forEach(([groupKey, groupData]) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = `color-group-option ${this.currentGroup === groupKey ? 'selected' : ''}`;
            groupDiv.style.backgroundColor = groupData.primary;
            groupDiv.title = groupData.name;
            groupDiv.dataset.group = groupKey;
            
            groupDiv.addEventListener('click', () => {
                // Remove selected class from all
                container.querySelectorAll('.color-group-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class
                groupDiv.classList.add('selected');
                
                // Update current group and refresh shades
                this.currentGroup = groupKey;
                this.populateShades();
            });
            
            container.appendChild(groupDiv);
        });
    }

    populateShades() {
        const container = document.getElementById('shade-picker');
        container.innerHTML = '';
        
        Object.entries(this.shades).forEach(([shadeKey, shadeColors]) => {
            const shadeDiv = document.createElement('div');
            shadeDiv.className = `shade-option ${this.currentShade == shadeKey ? 'selected' : ''}`;
            shadeDiv.style.backgroundColor = shadeColors[this.currentGroup];
            shadeDiv.title = `${this.currentGroup}-${shadeKey}`;
            shadeDiv.dataset.shade = shadeKey;
            
            shadeDiv.addEventListener('click', () => {
                // Remove selected class from all
                container.querySelectorAll('.shade-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class
                shadeDiv.classList.add('selected');
                
                // Update current shade
                this.currentShade = parseInt(shadeKey);
            });
            
            container.appendChild(shadeDiv);
        });
    }

    closeModal(modal) {
        modal.classList.add('hidden');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Static helper to get color hex from color name
    static getColorHex(colorName) {
        const [group, shade] = colorName.split('-');
        const picker = new EnhancedColorPicker();
        return picker.shades[shade] && picker.shades[shade][group] || '#3b82f6';
    }
}

// Initialize theme system
ThemeManager.initializeThemeSystem();

// Export for global use
window.ThemeManager = ThemeManager;
window.EnhancedColorPicker = EnhancedColorPicker;
