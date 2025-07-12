// Enhanced Icon Picker with Search and Categories for v0.0.2

class EnhancedIconPicker {
    constructor() {
        this.recentlyUsed = [];
        this.maxRecentlyUsed = 10;
        this.selectedCallback = null;
        this.currentSearch = '';
        this.expandedCategories = new Set(['recently-used']); // Recently used starts expanded
        
        // Organize icons into categories
        this.iconCategories = {
            'communication': {
                name: 'Communication',
                icons: ['mail', 'chat-bubble-left-right', 'phone', 'video-camera', 'users', 'user', 'user-group']
            },
            'files': {
                name: 'Files & Documents', 
                icons: ['folder', 'document-text', 'table', 'photo', 'musical-note']
            },
            'technology': {
                name: 'Technology',
                icons: ['code-bracket', 'code-bracket-square', 'cpu-chip', 'server', 'globe-alt', 'cloud']
            },
            'business': {
                name: 'Business & Finance',
                icons: ['chart-bar', 'currency-dollar', 'building-office', 'briefcase', 'calendar-days', 'clock']
            },
            'social': {
                name: 'Social & Media',
                icons: ['users', 'user-group', 'shopping-cart', 'shopping-bag', 'tv', 'play-circle']
            },
            'navigation': {
                name: 'Navigation',
                icons: ['home', 'link', 'globe-alt', 'magnifying-glass']
            },
            'tools': {
                name: 'Tools & Settings',
                icons: ['wrench-screwdriver', 'cog-6-tooth', 'magnifying-glass', 'puzzle-piece']
            },
            'ai': {
                name: 'AI & Innovation',
                icons: ['brain', 'rocket-launch', 'sparkles', 'cpu-chip']
            },
            'custom': {
                name: 'Custom Icons',
                icons: ['salesforce']
            },
            'general': {
                name: 'General',
                icons: ['star', 'heart', 'bookmark', 'link']

            }
        };
        
        this.loadRecentlyUsed();
    }

    async loadRecentlyUsed() {
        try {
            const result = await chrome.storage.local.get('recentlyUsedIcons');
            this.recentlyUsed = result.recentlyUsedIcons || [];
        } catch (error) {
            console.error('Error loading recently used icons:', error);
            this.recentlyUsed = [];
        }
    }

    async saveRecentlyUsed() {
        try {
            await chrome.storage.local.set({ recentlyUsedIcons: this.recentlyUsed });
        } catch (error) {
            console.error('Error saving recently used icons:', error);
        }
    }

    addToRecentlyUsed(iconName) {
        // Remove if already exists
        this.recentlyUsed = this.recentlyUsed.filter(icon => icon !== iconName);
        
        // Add to beginning
        this.recentlyUsed.unshift(iconName);
        
        // Limit size
        if (this.recentlyUsed.length > this.maxRecentlyUsed) {
            this.recentlyUsed = this.recentlyUsed.slice(0, this.maxRecentlyUsed);
        }
        
        this.saveRecentlyUsed();
    }

    createIconPickerModal(selectedIcon = 'link', callback) {
        this.selectedCallback = callback;
        
        // Create modal
        const modal = this.createModal();
        document.body.appendChild(modal);
        
        // Setup initial display
        this.populateRecentlyUsed();
        this.populateCategories();
        this.setupSearch();
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Focus search input
        setTimeout(() => {
            const searchInput = modal.querySelector('#icon-search');
            if (searchInput) searchInput.focus();
        }, 100);
        
        return modal;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal icon-picker-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Choose Icon</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="icon-search-container">
                    <input type="text" id="icon-search" class="icon-search" placeholder="Search icons...">
                </div>
                <div class="recently-used-section" id="recently-used-section">
                    <div class="recently-used-title">Recently Used</div>
                    <div class="recently-used-icons" id="recently-used-icons">
                        <!-- Recently used icons will be populated here -->
                    </div>
                </div>
                <div class="icon-categories" id="icon-categories">
                    <!-- Categories will be populated here -->
                </div>
                <div class="modal-body" style="padding: 16px; border-top: 1px solid var(--border-secondary);">
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-icon">Cancel</button>
                        <button type="button" class="btn btn-primary" id="select-icon" disabled>Select Icon</button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners
        this.setupIconModalEvents(modal);
        
        return modal;
    }

    setupIconModalEvents(modal) {
        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('#cancel-icon').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        // Select icon event
        modal.querySelector('#select-icon').addEventListener('click', () => {
            const selectedIcon = modal.querySelector('.enhanced-icon-option.selected');
            if (selectedIcon && this.selectedCallback) {
                const iconName = selectedIcon.dataset.icon;
                this.addToRecentlyUsed(iconName);
                this.selectedCallback(iconName);
            }
            this.closeModal(modal);
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('icon-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase().trim();
            this.filterIcons();
        });
    }

    filterIcons() {
        const categories = document.querySelectorAll('.icon-category');
        const recentlyUsedSection = document.getElementById('recently-used-section');
        
        if (this.currentSearch === '') {
            // Show all categories and recently used
            categories.forEach(category => {
                category.style.display = 'block';
            });
            recentlyUsedSection.style.display = 'block';
            return;
        }
        
        // Hide recently used during search
        recentlyUsedSection.style.display = 'none';
        
        // Filter categories and icons
        categories.forEach(category => {
            const categoryName = category.dataset.category.toLowerCase();
            const categoryTitle = category.querySelector('.category-title').textContent.toLowerCase();
            const icons = category.querySelectorAll('.enhanced-icon-option');
            
            let hasMatchingIcons = false;
            let categoryMatches = categoryName.includes(this.currentSearch) || categoryTitle.includes(this.currentSearch);
            
            icons.forEach(icon => {
                const iconName = icon.dataset.icon.toLowerCase();
                const iconMatches = iconName.includes(this.currentSearch);
                
                if (iconMatches || categoryMatches) {
                    icon.style.display = 'flex';
                    hasMatchingIcons = true;
                } else {
                    icon.style.display = 'none';
                }
            });
            
            // Show category if it has matching icons or name matches
            if (hasMatchingIcons || categoryMatches) {
                category.style.display = 'block';
                // Auto-expand category during search
                this.expandCategory(category.dataset.category);
            } else {
                category.style.display = 'none';
            }
        });
    }

    populateRecentlyUsed() {
        const container = document.getElementById('recently-used-icons');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.recentlyUsed.length === 0) {
            document.getElementById('recently-used-section').style.display = 'none';
            return;
        }
        
        this.recentlyUsed.forEach(iconName => {
            if (window.IconUtils && window.IconUtils.MATERIAL_ICONS[iconName]) {
                const iconDiv = this.createIconElement(iconName);
                container.appendChild(iconDiv);
            }
        });
    }

    populateCategories() {
        const container = document.getElementById('icon-categories');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(this.iconCategories).forEach(([categoryKey, categoryData]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'icon-category';
            categoryDiv.dataset.category = categoryKey;
            
            const isExpanded = this.expandedCategories.has(categoryKey);
            
            categoryDiv.innerHTML = `
                <div class="category-header" data-category="${categoryKey}">
                    <span class="category-title">${categoryData.name}</span>
                    <svg class="category-toggle ${isExpanded ? 'expanded' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                </div>
                <div class="category-icons ${isExpanded ? '' : 'collapsed'}" id="category-${categoryKey}">
                    <!-- Icons will be populated here -->
                </div>
            `;
            
            // Setup category toggle
            const header = categoryDiv.querySelector('.category-header');
            header.addEventListener('click', () => {
                this.toggleCategory(categoryKey);
            });
            
            // Populate icons
            const iconsContainer = categoryDiv.querySelector('.category-icons');
            categoryData.icons.forEach(iconName => {
                if (window.IconUtils && window.IconUtils.MATERIAL_ICONS[iconName]) {
                    const iconDiv = this.createIconElement(iconName);
                    iconsContainer.appendChild(iconDiv);
                }
            });
            
            container.appendChild(categoryDiv);
        });
    }

    createIconElement(iconName) {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'enhanced-icon-option';
        iconDiv.dataset.icon = iconName;
        iconDiv.title = this.formatIconName(iconName);
        iconDiv.innerHTML = window.IconUtils.createIcon(iconName, 'slate', 24); // Slightly larger in picker
        
        iconDiv.addEventListener('click', () => {
            // Remove selected class from all
            document.querySelectorAll('.enhanced-icon-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class
            iconDiv.classList.add('selected');
            
            // Enable select button
            const selectBtn = document.getElementById('select-icon');
            if (selectBtn) {
                selectBtn.disabled = false;
            }
        });
        
        return iconDiv;
    }

    toggleCategory(categoryKey) {
        const categoryDiv = document.querySelector(`.icon-category[data-category="${categoryKey}"]`);
        if (!categoryDiv) return;
        
        const iconsContainer = categoryDiv.querySelector('.category-icons');
        const toggle = categoryDiv.querySelector('.category-toggle');
        
        if (this.expandedCategories.has(categoryKey)) {
            // Collapse
            this.expandedCategories.delete(categoryKey);
            iconsContainer.classList.add('collapsed');
            toggle.classList.remove('expanded');
        } else {
            // Expand
            this.expandedCategories.add(categoryKey);
            iconsContainer.classList.remove('collapsed');
            toggle.classList.add('expanded');
        }
    }

    expandCategory(categoryKey) {
        if (this.expandedCategories.has(categoryKey)) return;
        
        const categoryDiv = document.querySelector(`.icon-category[data-category="${categoryKey}"]`);
        if (!categoryDiv) return;
        
        const iconsContainer = categoryDiv.querySelector('.category-icons');
        const toggle = categoryDiv.querySelector('.category-toggle');
        
        this.expandedCategories.add(categoryKey);
        iconsContainer.classList.remove('collapsed');
        toggle.classList.add('expanded');
    }

    formatIconName(iconName) {
        return iconName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    closeModal(modal) {
        modal.classList.add('hidden');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Static helper to open icon picker
    static openIconPicker(selectedIcon = 'link', callback) {
        const picker = new EnhancedIconPicker();
        return picker.createIconPickerModal(selectedIcon, callback);
    }
}

// Enhanced Icon Utils - Fixed class extension issue
class EnhancedIconUtils {
    // Static methods that extend IconUtils functionality
    static populateEnhancedIconPicker(containerId, selectedIcon = 'link', callback) {
        // This method now opens the modal instead of populating a container
        EnhancedIconPicker.openIconPicker(selectedIcon, callback);
    }
    
    static populateEnhancedColorPicker(containerId, selectedColor = 'blue-500', callback) {
        // This method now opens the modal instead of populating a container
        if (window.EnhancedColorPicker) {
            const picker = new window.EnhancedColorPicker();
            picker.createColorPickerModal(selectedColor, callback);
        } else {
            console.error('EnhancedColorPicker not available');
        }
    }

    // Extend IconUtils methods safely
    static createIcon(iconName, color = 'slate', size = 28) {
        if (window.IconUtils && window.IconUtils.createIcon) {
            return window.IconUtils.createIcon(iconName, color, size);
        }
        return `<span>Icon: ${iconName}</span>`; // Fallback
    }

    static createIconWithColor(iconName, colorName = 'slate-500', size = 28) {
        if (window.IconUtils && window.IconUtils.createIconWithColor) {
            return window.IconUtils.createIconWithColor(iconName, colorName, size);
        }
        return this.createIcon(iconName, 'slate', size); // Fallback
    }

    static getColorClass(colorName, type = 'text') {
        if (window.IconUtils && window.IconUtils.getColorClass) {
            return window.IconUtils.getColorClass(colorName, type);
        }
        return `text-${colorName}`; // Fallback
    }

    static populateColorPicker(containerId, selectedColor = 'blue', callback) {
        if (window.IconUtils && window.IconUtils.populateColorPicker) {
            return window.IconUtils.populateColorPicker(containerId, selectedColor, callback);
        }
    }

    static populateIconPicker(containerId, selectedIcon = 'link', callback) {
        if (window.IconUtils && window.IconUtils.populateIconPicker) {
            return window.IconUtils.populateIconPicker(containerId, selectedIcon, callback);
        }
    }

    // Access to material icons
    static get MATERIAL_ICONS() {
        return window.IconUtils ? window.IconUtils.MATERIAL_ICONS : {};
    }

    static get TAILWIND_COLORS() {
        return window.IconUtils ? window.IconUtils.TAILWIND_COLORS : {};
    }
}

// Export for global use
window.EnhancedIconPicker = EnhancedIconPicker;
window.EnhancedIconUtils = EnhancedIconUtils;