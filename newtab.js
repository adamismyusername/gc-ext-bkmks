// Enhanced Bookmark Dashboard v0.0.3 with Smart Layout System

// Enhanced color utilities to fix color application issues
window.ColorUtils = {
    // Convert color name to CSS class
    getColorClass: function(colorName, type = 'text') {
        if (!colorName || !colorName.includes('-')) {
            colorName = 'blue-500'; // fallback
        }
        
        const [color, shade] = colorName.split('-');
        
        switch (type) {
            case 'text':
                return `text-${color}-${shade}`;
            case 'bg':
                return `bg-${color}-${shade}`;
            case 'border':
                return `border-${color}-${shade}`;
            default:
                return `text-${color}-${shade}`;
        }
    },
    
    // Get hex color value from color name
    getColorHex: function(colorName) {
        return EnhancedColorPicker.getColorHex(colorName);
    },
    
    // Apply color directly via style attribute (for better theme support)
    applyColorStyle: function(element, colorName, type = 'color') {
        const hex = this.getColorHex(colorName);
        if (hex) {
            switch (type) {
                case 'color':
                    element.style.color = hex;
                    break;
                case 'background':
                    element.style.backgroundColor = hex;
                    break;
                case 'border':
                    element.style.borderColor = hex;
                    break;
            }
        }
    }
};

// Update the existing IconUtils to use better color handling
if (window.IconUtils) {
    // Override the existing getColorClass method
    window.IconUtils.getColorClass = window.ColorUtils.getColorClass;
    
    // Enhanced createIcon function that properly applies colors - Updated default size to 28px
    window.IconUtils.createIcon = function(iconName, color = 'slate', size = 28) { // Changed default from 20 to 28
        const iconPath = this.MATERIAL_ICONS[iconName] || this.MATERIAL_ICONS['link'];
        const colorClass = `text-${color}-500`;
        
        return `
            <svg class="${colorClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${iconPath}
            </svg>
        `;
    };
    
    // Enhanced createIcon function that properly applies colors
    window.IconUtils.createIconWithColor = function(iconName, colorName = 'slate-500', size = 28) { // Changed default from 20 to 28
        const iconPath = this.MATERIAL_ICONS[iconName] || this.MATERIAL_ICONS['link'];
        const colorHex = EnhancedColorPicker.getColorHex(colorName);
        
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2" style="color: ${colorHex};">
                ${iconPath}
            </svg>
        `;
    };
}

// Smart Layout Manager for responsive card sizing
class LayoutManager {
    constructor() {
        this.cardWidthMap = {
            'xs': { percentage: 20, minWidth: 250, name: 'X-Small' },
            'sm': { percentage: 25, minWidth: 280, name: 'Small' },
            'md': { percentage: 33.333, minWidth: 320, name: 'Medium' },
            'lg': { percentage: 50, minWidth: 360, name: 'Large' },
            'xl': { percentage: 100, minWidth: 400, name: 'X-Large' }
        };
        
        this.containerMarginMap = {
            'none': { percentage: 0, name: 'None' },
            'narrow': { percentage: 5, name: 'Narrow' },
            'medium': { percentage: 10, name: 'Medium' },
            'wide': { percentage: 15, name: 'Wide' },
            'xwide': { percentage: 20, name: 'X-Wide' }
        };
        
        this.currentSettings = {
            cardWidth: 'sm',
            containerMargin: 'medium'
        };
    }

    async loadSettings() {
        try {
            const settings = await window.dashboardStorage.getLayoutSettings();
            this.currentSettings = settings;
            this.applyLayoutSettings();
        } catch (error) {
            console.error('Error loading layout settings:', error);
        }
    }

    applyLayoutSettings() {
        const root = document.documentElement;
        const body = document.body;
        
        // Remove existing classes
        Object.keys(this.cardWidthMap).forEach(key => {
            body.classList.remove(`card-width-${key}`);
        });
        Object.keys(this.containerMarginMap).forEach(key => {
            body.classList.remove(`container-margin-${key}`);
        });
        
        // Apply new classes
        body.classList.add(`card-width-${this.currentSettings.cardWidth}`);
        body.classList.add(`container-margin-${this.currentSettings.containerMargin}`);
        
        // Set CSS custom properties for precise control
        const cardConfig = this.cardWidthMap[this.currentSettings.cardWidth];
        const marginConfig = this.containerMarginMap[this.currentSettings.containerMargin];
        
        if (cardConfig) {
            root.style.setProperty('--card-width', `${cardConfig.percentage}%`);
            root.style.setProperty('--card-min-width', `${cardConfig.minWidth}px`);
        }
        
        if (marginConfig) {
            root.style.setProperty('--container-margin', `${marginConfig.percentage}%`);
        }
        
        console.log('Layout settings applied:', this.currentSettings);
    }

    async updateSettings(newSettings) {
        try {
            this.currentSettings = { ...this.currentSettings, ...newSettings };
            await window.dashboardStorage.updateLayoutSettings(this.currentSettings);
            this.applyLayoutSettings();
            return true;
        } catch (error) {
            console.error('Error updating layout settings:', error);
            return false;
        }
    }

    getCardWidthOptions() {
        return Object.entries(this.cardWidthMap).map(([key, config]) => ({
            value: key,
            label: config.name,
            description: `~${Math.round(100 / (config.percentage / 100))} cards per row`
        }));
    }

    getContainerMarginOptions() {
        return Object.entries(this.containerMarginMap).map(([key, config]) => ({
            value: key,
            label: config.name,
            description: `${config.percentage}% margin`
        }));
    }
}

class BookmarkDashboard {
    constructor() {
        this.data = null;
        this.settings = null;
        this.currentEditingCard = null;
        this.currentEditingLink = null;
        this.editMode = false;
        this.layoutManager = new LayoutManager();
        this.init();
    }

    async init() {
        try {
            // Load data and settings
            this.data = await window.dashboardStorage.loadData();
            this.settings = await window.dashboardStorage.loadSettings();
            
            // Initialize layout manager
            await this.layoutManager.loadSettings();
            
            // Initialize theme system
            if (window.themeManager) {
                // Theme manager is already initialized, just sync with settings
                const savedTheme = await window.themeManager.loadTheme();
                window.themeManager.applyTheme(savedTheme);
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render dashboard
            await this.renderDashboard();
            
            console.log('Bookmark Dashboard v0.0.3 initialized successfully');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    setupEventListeners() {
        // Edit mode toggle
        document.getElementById('edit-mode-btn').addEventListener('click', () => {
            this.toggleEditMode();
        });

        document.getElementById('exit-edit-mode').addEventListener('click', () => {
            this.toggleEditMode(false);
        });

        // Add card button
        document.getElementById('add-card-btn').addEventListener('click', () => {
            this.showCardModal();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Card modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideCardModal();
        });

        document.getElementById('cancel-card').addEventListener('click', () => {
            this.hideCardModal();
        });

        document.getElementById('card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCardSubmit();
        });

        // Link modal events
        document.getElementById('close-link-modal').addEventListener('click', () => {
            this.hideLinkModal();
        });

        document.getElementById('cancel-link').addEventListener('click', () => {
            this.hideLinkModal();
        });

        document.getElementById('link-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLinkSubmit();
        });

        // Close modals when clicking backdrop
        document.getElementById('card-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideCardModal();
            }
        });

        document.getElementById('link-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideLinkModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCardModal();
                this.hideLinkModal();
            }
            // Toggle edit mode with Ctrl/Cmd + E
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.toggleEditMode();
            }
        });

        // Theme change listener
        document.addEventListener('themeChanged', (e) => {
            // Update any theme-dependent elements
            this.onThemeChanged(e.detail.theme);
        });

        // Layout settings change listener
        document.addEventListener('layoutSettingsChanged', (e) => {
            this.onLayoutSettingsChanged(e.detail);
        });

        // Window resize listener for responsive updates
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    onThemeChanged(theme) {
        // Handle theme-specific updates if needed
        console.log('Theme changed to:', theme);
        
        // Update any dynamic elements that need theme-aware styling
        this.updateDynamicStyles();
    }

    onLayoutSettingsChanged(settings) {
        console.log('Layout settings changed:', settings);
        // Layout manager handles the actual CSS updates
        // This could trigger additional UI updates if needed
    }

    onWindowResize() {
        // Handle any responsive updates that need JavaScript
        // Most responsiveness is handled by CSS, but this is available for complex cases
    }

    updateDynamicStyles() {
        // Update any dynamically created elements with theme-appropriate styles
        // This is called when theme changes
    }

    toggleEditMode(force = null) {
        this.editMode = force !== null ? force : !this.editMode;
        
        const body = document.body;
        const banner = document.getElementById('edit-mode-banner');
        const editBtn = document.getElementById('edit-mode-btn');
        const addCardBtn = document.getElementById('add-card-btn');
        
        if (this.editMode) {
            body.classList.add('edit-mode');
            banner.classList.remove('hidden');
            editBtn.innerHTML = `
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Exit Edit
            `;
            editBtn.classList.remove('from-orange-500', 'to-red-500', 'hover:from-orange-600', 'hover:to-red-600');
            editBtn.classList.add('from-red-500', 'to-red-600', 'hover:from-red-600', 'hover:to-red-700');
            addCardBtn.classList.remove('hidden');
        } else {
            body.classList.remove('edit-mode');
            banner.classList.add('hidden');
            editBtn.innerHTML = `
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
                </svg>
                Edit Mode
            `;
            editBtn.classList.remove('from-red-500', 'to-red-600', 'hover:from-red-600', 'hover:to-red-700');
            editBtn.classList.add('from-orange-500', 'to-red-500', 'hover:from-orange-600', 'hover:to-red-600');
            addCardBtn.classList.add('hidden');
        }
        
        // Re-render cards to show/hide edit controls
        this.renderDashboard();
    }

    async renderDashboard() {
        const grid = document.getElementById('dashboard-grid');
        grid.innerHTML = '';

        // Sort cards by order
        const sortedCards = [...this.data.cards].sort((a, b) => a.order - b.order);

        sortedCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `bookmark-card ${this.settings.uniformCardHeight ? 'uniform-height' : ''}`;
        cardDiv.dataset.cardId = card.id;
        
        // Apply card color to border
        if (card.color) {
            const colorHex = EnhancedColorPicker.getColorHex(card.color);
            cardDiv.style.borderLeftColor = colorHex;
            cardDiv.style.borderLeftWidth = '4px';
        }
        
        // Make card draggable only in edit mode
        if (this.editMode) {
            window.dragDropManager.makeCardDraggable(cardDiv);
        }

        // Card header with title and actions
        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'card-title';
        titleDiv.textContent = card.title;
        
        // Apply card color to title
        if (card.color) {
            const colorHex = EnhancedColorPicker.getColorHex(card.color);
            titleDiv.style.color = colorHex;
        }
        
        // Only show actions in edit mode
        if (this.editMode) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions';
            
            // Edit card button
            const editBtn = document.createElement('button');
            editBtn.className = 'card-action-btn';
            editBtn.innerHTML = window.IconUtils.createIcon('pencil', 'slate', 16);
            editBtn.title = 'Edit Card';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editCard(card.id);
            });
            
            // Delete card button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'card-action-btn';
            deleteBtn.innerHTML = window.IconUtils.createIcon('trash', 'red', 16);
            deleteBtn.title = 'Delete Card';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCard(card.id);
            });
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            headerDiv.appendChild(actionsDiv);
        }
        
        headerDiv.appendChild(titleDiv);

        // Quick links container
        const linksDiv = document.createElement('div');
        linksDiv.className = 'quick-links';

        // Sort links by order
        const sortedLinks = [...card.links].sort((a, b) => a.order - b.order);
        
        sortedLinks.forEach(link => {
            const linkElement = this.createLinkElement(link, card.id);
            linksDiv.appendChild(linkElement);
        });

        // Add link button - only show in edit mode
        if (this.editMode) {
            const addLinkBtn = document.createElement('button');
            addLinkBtn.className = 'add-link-btn';
            addLinkBtn.innerHTML = `
                ${window.IconUtils.createIcon('plus', 'blue', 16)}
                <span>Add Link</span>
            `;
            addLinkBtn.addEventListener('click', () => this.showLinkModal(card.id));
            linksDiv.appendChild(addLinkBtn);
        }

        cardDiv.appendChild(headerDiv);
        cardDiv.appendChild(linksDiv);

        return cardDiv;
    }

    createLinkElement(link, cardId) {
        const linkDiv = document.createElement('a');
        linkDiv.className = 'quick-link';
        linkDiv.href = link.url;
        linkDiv.target = '_blank';
        linkDiv.rel = 'noopener noreferrer';
        linkDiv.dataset.linkId = link.id;
        
        // Make link draggable only in edit mode
        if (this.editMode) {
            window.dragDropManager.makeLinkDraggable(linkDiv);
        }

        // Icon - Updated to use larger size (28px instead of 20px)
        const iconDiv = document.createElement('div');
        iconDiv.className = 'quick-link-icon';
        
        // Apply the link color directly to the SVG with larger size
        if (link.color) {
            const colorHex = EnhancedColorPicker.getColorHex(link.color);
            iconDiv.innerHTML = `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2" style="color: ${colorHex};">
                    ${window.IconUtils.MATERIAL_ICONS[link.icon] || window.IconUtils.MATERIAL_ICONS['link']}
                </svg>
            `;
        } else {
            iconDiv.innerHTML = window.IconUtils.createIcon(link.icon, 'slate', 28); // Increased from 20 to 28
        }

        // Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'quick-link-title';
        titleDiv.textContent = link.title;

        linkDiv.appendChild(iconDiv);
        linkDiv.appendChild(titleDiv);

        // Actions (edit/delete) - only show in edit mode
        if (this.editMode) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'link-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = window.IconUtils.createIcon('pencil', 'slate', 14);
            editBtn.title = 'Edit Link';
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editLink(cardId, link.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = window.IconUtils.createIcon('trash', 'red', 14);
            deleteBtn.title = 'Delete Link';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteLink(cardId, link.id);
            });
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            linkDiv.appendChild(actionsDiv);
        }

        return linkDiv;
    }

    // Card Management
    showCardModal(cardId = null) {
        if (!this.editMode && cardId === null) {
            this.toggleEditMode(true);
        }

        const modal = document.getElementById('card-modal');
        const form = document.getElementById('card-form');
        const titleInput = document.getElementById('card-title');
        const colorInput = document.getElementById('card-color');
        
        if (cardId) {
            // Edit mode
            const card = this.data.cards.find(c => c.id === cardId);
            document.getElementById('modal-title').textContent = 'Edit Card';
            titleInput.value = card.title;
            colorInput.value = card.color;
            this.currentEditingCard = cardId;
        } else {
            // Add mode
            document.getElementById('modal-title').textContent = 'Add New Card';
            titleInput.value = '';
            colorInput.value = 'blue-500';
            this.currentEditingCard = null;
        }

        // Setup enhanced color picker
        this.setupEnhancedColorPicker('color-picker', colorInput.value, (color) => {
            colorInput.value = color;
        });

        modal.classList.remove('hidden');
        setTimeout(() => titleInput.focus(), 100);
    }

    hideCardModal() {
        document.getElementById('card-modal').classList.add('hidden');
        this.currentEditingCard = null;
    }

    async handleCardSubmit() {
        const title = document.getElementById('card-title').value.trim();
        const color = document.getElementById('card-color').value;

        if (!title) {
            alert('Please enter a card title');
            return;
        }

        try {
            if (this.currentEditingCard) {
                // Update existing card
                await window.dashboardStorage.updateCard(this.currentEditingCard, {
                    title,
                    color
                });
            } else {
                // Create new card
                await window.dashboardStorage.addCard({
                    title,
                    color
                });
            }

            // Reload data and refresh display
            this.data = await window.dashboardStorage.loadData();
            await this.renderDashboard();
            this.hideCardModal();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Error saving card. Please try again.');
        }
    }

    async editCard(cardId) {
        this.showCardModal(cardId);
    }

    async deleteCard(cardId) {
        const card = this.data.cards.find(c => c.id === cardId);
        if (!card) return;

        if (confirm(`Are you sure you want to delete "${card.title}"? This will also delete all links in this card.`)) {
            try {
                await window.dashboardStorage.deleteCard(cardId);
                this.data = await window.dashboardStorage.loadData();
                await this.renderDashboard();
            } catch (error) {
                console.error('Error deleting card:', error);
                alert('Error deleting card. Please try again.');
            }
        }
    }

    // Link Management
    showLinkModal(cardId, linkId = null) {
        if (!this.editMode) {
            this.toggleEditMode(true);
        }

        const modal = document.getElementById('link-modal');
        const form = document.getElementById('link-form');
        const titleInput = document.getElementById('link-title');
        const urlInput = document.getElementById('link-url');
        const iconInput = document.getElementById('link-icon');
        const colorInput = document.getElementById('link-color');
        
        if (linkId) {
            // Edit mode
            const card = this.data.cards.find(c => c.id === cardId);
            const link = card.links.find(l => l.id === linkId);
            document.getElementById('link-modal-title').textContent = 'Edit Link';
            titleInput.value = link.title;
            urlInput.value = link.url;
            iconInput.value = link.icon;
            colorInput.value = link.color;
            this.currentEditingLink = { cardId, linkId };
        } else {
            // Add mode
            document.getElementById('link-modal-title').textContent = 'Add Link';
            titleInput.value = '';
            urlInput.value = 'https://';
            iconInput.value = 'link';
            colorInput.value = 'blue-500';
            this.currentEditingLink = { cardId, linkId: null };
        }

        // Setup enhanced icon picker
        this.setupEnhancedIconPicker(iconInput.value, (icon) => {
            iconInput.value = icon;
        });

        // Setup enhanced color picker
        this.setupEnhancedColorPicker('link-color-picker', colorInput.value, (color) => {
            colorInput.value = color;
        });

        modal.classList.remove('hidden');
        setTimeout(() => titleInput.focus(), 100);
    }

    hideLinkModal() {
        document.getElementById('link-modal').classList.add('hidden');
        this.currentEditingLink = null;
    }

    async handleLinkSubmit() {
        const title = document.getElementById('link-title').value.trim();
        const url = document.getElementById('link-url').value.trim();
        const icon = document.getElementById('link-icon').value;
        const color = document.getElementById('link-color').value;

        if (!title || !url) {
            alert('Please enter both title and URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        try {
            const { cardId, linkId } = this.currentEditingLink;
            
            if (linkId) {
                // Update existing link
                await window.dashboardStorage.updateLink(cardId, linkId, {
                    title,
                    url,
                    icon,
                    color
                });
            } else {
                // Create new link
                await window.dashboardStorage.addLink(cardId, {
                    title,
                    url,
                    icon,
                    color
                });
            }

            // Reload data and refresh display
            this.data = await window.dashboardStorage.loadData();
            await this.renderDashboard();
            this.hideLinkModal();
        } catch (error) {
            console.error('Error saving link:', error);
            alert('Error saving link. Please try again.');
        }
    }

    async editLink(cardId, linkId) {
        this.showLinkModal(cardId, linkId);
    }

    async deleteLink(cardId, linkId) {
        const card = this.data.cards.find(c => c.id === cardId);
        const link = card.links.find(l => l.id === linkId);
        
        if (!link) return;

        if (confirm(`Are you sure you want to delete "${link.title}"?`)) {
            try {
                await window.dashboardStorage.deleteLink(cardId, linkId);
                this.data = await window.dashboardStorage.loadData();
                await this.renderDashboard();
            } catch (error) {
                console.error('Error deleting link:', error);
                alert('Error deleting link. Please try again.');
            }
        }
    }

    // Enhanced Picker Setup Methods
    setupEnhancedColorPicker(containerId, selectedColor, callback) {
        // Remove old color picker if it exists
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            
            // Create color preview button
            const colorButton = document.createElement('button');
            colorButton.type = 'button';
            colorButton.className = 'enhanced-color-button';
            colorButton.style.cssText = `
                width: 100%;
                height: 40px;
                border: 2px solid var(--border-primary);
                border-radius: 8px;
                background-color: ${EnhancedColorPicker.getColorHex(selectedColor)};
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            `;
            colorButton.textContent = selectedColor.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            colorButton.addEventListener('click', () => {
                const picker = new EnhancedColorPicker();
                picker.createColorPickerModal(selectedColor, (newColor) => {
                    colorButton.style.backgroundColor = EnhancedColorPicker.getColorHex(newColor);
                    colorButton.textContent = newColor.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    callback(newColor);
                });
            });
            
            container.appendChild(colorButton);
        }
    }

    setupEnhancedIconPicker(selectedIcon, callback) {
        // Remove old icon picker UI and create button
        const iconContainer = document.getElementById('icon-picker');
        if (iconContainer) {
            iconContainer.innerHTML = '';
            
            // Create icon preview button
            const iconButton = document.createElement('button');
            iconButton.type = 'button';
            iconButton.className = 'enhanced-icon-button';
            iconButton.style.cssText = `
                width: 100%;
                height: 80px;
                border: 2px solid var(--border-primary);
                border-radius: 8px;
                background: var(--bg-tertiary);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 6px;
            `;
            
            const iconDisplay = document.createElement('div');
            iconDisplay.innerHTML = window.IconUtils.createIcon(selectedIcon, 'slate', 32); // Larger preview icon
            
            const iconLabel = document.createElement('span');
            iconLabel.style.cssText = `
                font-size: 12px;
                color: var(--text-muted);
                font-weight: 500;
            `;
            iconLabel.textContent = selectedIcon.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            iconButton.appendChild(iconDisplay);
            iconButton.appendChild(iconLabel);
            
            iconButton.addEventListener('click', () => {
                EnhancedIconPicker.openIconPicker(selectedIcon, (newIcon) => {
                    iconDisplay.innerHTML = window.IconUtils.createIcon(newIcon, 'slate', 32); // Larger preview icon
                    iconLabel.textContent = newIcon.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    callback(newIcon);
                });
            });
            
            iconContainer.appendChild(iconButton);
        }
    }

    // Settings
    openSettings() {
        // Open settings page in new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }

    async updateSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            await window.dashboardStorage.saveSettings(this.settings);
            await this.renderDashboard();
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Error updating settings. Please try again.');
        }
    }

    // Layout Settings Integration
    async updateLayoutSettings(layoutSettings) {
        try {
            await this.layoutManager.updateSettings(layoutSettings);
            
            // Trigger layout settings changed event
            document.dispatchEvent(new CustomEvent('layoutSettingsChanged', {
                detail: layoutSettings
            }));
            
            return true;
        } catch (error) {
            console.error('Error updating layout settings:', error);
            return false;
        }
    }

    getLayoutManager() {
        return this.layoutManager;
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new BookmarkDashboard();
});

// Add missing icons for UI elements (if not already present)
if (window.IconUtils && window.IconUtils.MATERIAL_ICONS) {
    // Ensure all required icons are available
    const requiredIcons = {
        'plus': '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />',
        'pencil': '<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />',
        'trash': '<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />'
    };
    
    Object.entries(requiredIcons).forEach(([iconName, iconPath]) => {
        if (!window.IconUtils.MATERIAL_ICONS[iconName]) {
            window.IconUtils.MATERIAL_ICONS[iconName] = iconPath;
        }
    });
}