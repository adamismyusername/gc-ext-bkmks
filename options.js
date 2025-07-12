// Settings page functionality with layout controls for v0.0.3

class SettingsManager {
    constructor() {
        this.settings = null;
        this.layoutSettings = {
            cardWidth: 'sm',
            containerMargin: 'medium'
        };
        this.previewMode = false;
        this.originalSettings = null;
        this.init();
    }

    async init() {
        try {
            // Initialize theme system first
            if (window.themeManager) {
                const savedTheme = await window.themeManager.loadTheme();
                window.themeManager.applyTheme(savedTheme);
            }
            
            // Load current settings
            this.settings = await window.dashboardStorage.loadSettings();
            this.layoutSettings = await window.dashboardStorage.getLayoutSettings();
            this.originalSettings = { ...this.settings, ...this.layoutSettings };
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Populate form with current settings
            this.populateForm();
            
            // Setup live preview for layout settings
            this.setupLivePreview();
            
            console.log('Settings page v0.0.3 initialized');
        } catch (error) {
            console.error('Error initializing settings:', error);
            this.showMessage('Error loading settings', 'error');
        }
    }

    setupEventListeners() {
        // Save settings button
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset data button
        document.getElementById('reset-data').addEventListener('click', () => {
            this.resetData();
        });

        // Reset layout button
        document.getElementById('reset-layout').addEventListener('click', () => {
            this.resetLayout();
        });

        // Preview settings button
        document.getElementById('preview-settings').addEventListener('click', () => {
            this.togglePreview();
        });

        // Real-time updates for toggles
        document.getElementById('uniform-height').addEventListener('change', (e) => {
            this.settings.uniformCardHeight = e.target.checked;
            this.previewChanges();
        });

        // Layout settings real-time updates
        document.getElementById('card-width').addEventListener('change', (e) => {
            this.layoutSettings.cardWidth = e.target.value;
            this.previewChanges();
        });

        document.getElementById('container-margin').addEventListener('change', (e) => {
            this.layoutSettings.containerMargin = e.target.value;
            this.previewChanges();
        });
    }

    setupLivePreview() {
        // Apply current layout settings for immediate preview
        this.applyLayoutPreview();
    }

    populateForm() {
        // Set uniform height toggle
        document.getElementById('uniform-height').checked = this.settings.uniformCardHeight;
        
        // Set layout settings
        document.getElementById('card-width').value = this.layoutSettings.cardWidth;
        document.getElementById('container-margin').value = this.layoutSettings.containerMargin;
    }

    previewChanges() {
        // Apply layout settings immediately for live preview
        this.applyLayoutPreview();
        
        // Update preview button text
        const previewBtn = document.getElementById('preview-settings');
        if (!this.previewMode) {
            this.previewMode = true;
            previewBtn.textContent = 'Stop Preview';
            previewBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            previewBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
        }
    }

    applyLayoutPreview() {
        const root = document.documentElement;
        const body = document.body;
        
        // Card width mapping
        const cardWidthMap = {
            'xs': { percentage: 20, minWidth: 250 },
            'sm': { percentage: 25, minWidth: 280 },
            'md': { percentage: 33.333, minWidth: 320 },
            'lg': { percentage: 50, minWidth: 360 },
            'xl': { percentage: 100, minWidth: 400 }
        };
        
        // Container margin mapping
        const containerMarginMap = {
            'none': 0,
            'narrow': 5,
            'medium': 10,
            'wide': 15,
            'xwide': 20
        };
        
        // Remove existing classes
        Object.keys(cardWidthMap).forEach(key => {
            body.classList.remove(`card-width-${key}`);
        });
        Object.keys(containerMarginMap).forEach(key => {
            body.classList.remove(`container-margin-${key}`);
        });
        
        // Apply new classes
        body.classList.add(`card-width-${this.layoutSettings.cardWidth}`);
        body.classList.add(`container-margin-${this.layoutSettings.containerMargin}`);
        
        // Set CSS custom properties
        const cardConfig = cardWidthMap[this.layoutSettings.cardWidth];
        const marginConfig = containerMarginMap[this.layoutSettings.containerMargin];
        
        if (cardConfig) {
            root.style.setProperty('--card-width', `${cardConfig.percentage}%`);
            root.style.setProperty('--card-min-width', `${cardConfig.minWidth}px`);
        }
        
        if (marginConfig !== undefined) {
            root.style.setProperty('--container-margin', `${marginConfig}%`);
        }
    }

    togglePreview() {
        const previewBtn = document.getElementById('preview-settings');
        
        if (this.previewMode) {
            // Stop preview and revert to original settings
            this.previewMode = false;
            this.layoutSettings = { ...this.originalSettings };
            this.populateForm();
            this.applyLayoutPreview();
            
            previewBtn.textContent = 'Preview Changes';
            previewBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            previewBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        } else {
            // Start preview
            this.previewChanges();
        }
    }

    async saveSettings() {
        try {
            // Show loading state
            const saveBtn = document.getElementById('save-settings');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            // Save general settings
            await window.dashboardStorage.saveSettings(this.settings);
            
            // Save layout settings
            await window.dashboardStorage.updateLayoutSettings(this.layoutSettings);
            
            // Update original settings for preview comparison
            this.originalSettings = { ...this.settings, ...this.layoutSettings };
            
            // Reset preview mode
            this.previewMode = false;
            const previewBtn = document.getElementById('preview-settings');
            previewBtn.textContent = 'Preview Changes';
            previewBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            previewBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            
            // Show success message
            this.showMessage('Settings saved successfully!', 'success');
            
            // Restore button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showMessage('Error saving settings', 'error');
            
            // Restore button
            const saveBtn = document.getElementById('save-settings');
            saveBtn.textContent = 'Save Settings';
            saveBtn.disabled = false;
        }
    }

    async resetLayout() {
        const confirmed = confirm(
            'Reset layout settings to defaults?\n\n' +
            'This will reset:\n' +
            '• Card size to Small\n' +
            '• Page margins to Medium\n\n' +
            'Your cards and links will not be affected.'
        );

        if (!confirmed) return;

        try {
            // Reset to default layout settings
            this.layoutSettings = {
                cardWidth: 'sm',
                containerMargin: 'medium'
            };
            
            // Update form
            this.populateForm();
            
            // Apply preview
            this.applyLayoutPreview();
            
            // Reset preview mode
            this.previewMode = false;
            const previewBtn = document.getElementById('preview-settings');
            previewBtn.textContent = 'Preview Changes';
            previewBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            previewBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            
            this.showMessage('Layout settings reset to defaults', 'success');
            
        } catch (error) {
            console.error('Error resetting layout:', error);
            this.showMessage('Error resetting layout', 'error');
        }
    }

    async resetData() {
        const confirmed = confirm(
            'Are you sure you want to reset all data? This will:\n\n' +
            '• Delete all your custom cards and links\n' +
            '• Restore the default sample cards\n' +
            '• Reset all settings to defaults\n\n' +
            'This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            // Show loading state
            const resetBtn = document.getElementById('reset-data');
            const originalText = resetBtn.textContent;
            resetBtn.textContent = 'Resetting...';
            resetBtn.disabled = true;

            // Clear all data and restore defaults
            await chrome.storage.local.clear();
            
            // Reinitialize with defaults
            const defaultData = window.dashboardStorage.getDefaultData();
            const defaultSettings = window.dashboardStorage.getDefaultSettings();
            
            await window.dashboardStorage.saveData(defaultData);
            await window.dashboardStorage.saveSettings(defaultSettings);
            
            // Update local settings
            this.settings = defaultSettings;
            this.layoutSettings = {
                cardWidth: defaultSettings.cardWidth || 'sm',
                containerMargin: defaultSettings.containerMargin || 'medium'
            };
            this.originalSettings = { ...this.settings, ...this.layoutSettings };
            
            // Update form and preview
            this.populateForm();
            this.applyLayoutPreview();
            
            // Reset preview mode
            this.previewMode = false;
            const previewBtn = document.getElementById('preview-settings');
            previewBtn.textContent = 'Preview Changes';
            previewBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            previewBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            
            // Show success message
            this.showMessage('Dashboard reset to defaults successfully!', 'success');
            
            // Restore button
            resetBtn.textContent = originalText;
            resetBtn.disabled = false;
            
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showMessage('Error resetting data', 'error');
            
            // Restore button
            const resetBtn = document.getElementById('reset-data');
            resetBtn.textContent = 'Reset to Default';
            resetBtn.disabled = false;
        }
    }

    showMessage(text, type = 'success') {
        const messageDiv = document.getElementById('status-message');
        const messageContent = messageDiv.querySelector('div');
        
        // Update message content
        messageContent.textContent = text;
        
        // Update styling based on type
        messageContent.className = `inline-block px-4 py-2 rounded-lg ${
            type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
        }`;
        
        // Show message
        messageDiv.classList.remove('hidden');
        messageDiv.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
            messageDiv.classList.remove('show');
        }, 3000);
    }

    // Import/Export functionality (for future use)
    async exportSettings() {
        try {
            const data = await window.dashboardStorage.loadData();
            const settings = await window.dashboardStorage.loadSettings();
            
            const exportData = {
                version: '0.0.3',
                timestamp: new Date().toISOString(),
                data,
                settings
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookmark-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting settings:', error);
            this.showMessage('Error exporting settings', 'error');
        }
    }

    async importSettings(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Validate import data
            if (!importData.data || !importData.settings) {
                throw new Error('Invalid backup file format');
            }
            
            // Confirm import
            const confirmed = confirm(
                'This will replace all your current data and settings. Continue?'
            );
            
            if (!confirmed) return;
            
            // Import data
            await window.dashboardStorage.saveData(importData.data);
            await window.dashboardStorage.saveSettings(importData.settings);
            
            // Update local settings
            this.settings = importData.settings;
            this.layoutSettings = {
                cardWidth: importData.settings.cardWidth || 'sm',
                containerMargin: importData.settings.containerMargin || 'medium'
            };
            this.originalSettings = { ...this.settings, ...this.layoutSettings };
            
            // Update form and preview
            this.populateForm();
            this.applyLayoutPreview();
            
            this.showMessage('Settings imported successfully!', 'success');
        } catch (error) {
            console.error('Error importing settings:', error);
            this.showMessage('Error importing settings: ' + error.message, 'error');
        }
    }

    // Chrome bookmarks integration (for future use)
    async browseChromeBookmarks() {
        try {
            // This would integrate with Chrome's bookmarks API in a future version
            const bookmarks = await chrome.bookmarks.getTree();
            console.log('Chrome bookmarks:', bookmarks);
            
            // Future implementation would show a modal to select bookmarks
            this.showMessage('Chrome bookmarks integration coming soon!', 'success');
        } catch (error) {
            console.error('Error accessing Chrome bookmarks:', error);
            this.showMessage('Error accessing Chrome bookmarks', 'error');
        }
    }

    // Layout utility methods
    getCardWidthDescription(cardWidth) {
        const descriptions = {
            'xs': '~5 cards per row',
            'sm': '~4 cards per row',
            'md': '~3 cards per row',
            'lg': '~2 cards per row',
            'xl': '1 card per row'
        };
        return descriptions[cardWidth] || 'Unknown';
    }

    getContainerMarginDescription(containerMargin) {
        const descriptions = {
            'none': '0% margin',
            'narrow': '5% margin',
            'medium': '10% margin',
            'wide': '15% margin',
            'xwide': '20% margin'
        };
        return descriptions[containerMargin] || 'Unknown';
    }

    // Version check and update notifications (for future use)
    async checkForUpdates() {
        // This would check for extension updates in a real implementation
        console.log('Checking for updates...');
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

// Handle file imports (for future use)
function handleFileImport(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        window.settingsManager.importSettings(file);
    } else {
        window.settingsManager.showMessage('Please select a valid JSON backup file', 'error');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        window.settingsManager.saveSettings();
    }
    
    // Ctrl/Cmd + R to reset layout
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        window.settingsManager.resetLayout();
    }
    
    // Escape to stop preview
    if (e.key === 'Escape' && window.settingsManager.previewMode) {
        window.settingsManager.togglePreview();
    }
});

// Handle page unload with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (window.settingsManager && window.settingsManager.previewMode) {
        e.preventDefault();
        e.returnValue = 'You have unsaved layout changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});