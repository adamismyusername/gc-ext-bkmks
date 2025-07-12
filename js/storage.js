// Enhanced Storage management for v0.0.3a with layout settings

class DashboardStorage {
    constructor() {
        this.storageKey = 'bookmarkDashboard';
        this.settingsKey = 'dashboardSettings';
        this.version = '0.0.3';
    }

    // Initialize default data with updated color format
    getDefaultData() {
        return {
            version: this.version,
            cards: [
                {
                    id: 'google-workspace',
                    title: 'Google Workspace',
                    color: 'blue-500', // Updated to new format
                    order: 0,
                    links: [
                        {
                            id: 'gmail',
                            title: 'Gmail',
                            url: 'https://mail.google.com',
                            icon: 'mail',
                            color: 'red-500', // Updated to new format
                            order: 0
                        },
                        {
                            id: 'drive',
                            title: 'Google Drive',
                            url: 'https://drive.google.com',
                            icon: 'folder',
                            color: 'yellow-500', // Updated to new format
                            order: 1
                        },
                        {
                            id: 'docs',
                            title: 'Google Docs',
                            url: 'https://docs.google.com',
                            icon: 'document-text',
                            color: 'blue-500', // Updated to new format
                            order: 2
                        },
                        {
                            id: 'sheets',
                            title: 'Google Sheets',
                            url: 'https://sheets.google.com',
                            icon: 'table',
                            color: 'green-500', // Updated to new format
                            order: 3
                        },
                        {
                            id: 'chat',
                            title: 'Google Chat',
                            url: 'https://chat.google.com',
                            icon: 'chat-bubble-left-right',
                            color: 'green-500', // Updated to new format
                            order: 4
                        }
                    ]
                },
                {
                    id: 'ai-tools',
                    title: 'AI Tools',
                    color: 'purple-500', // Updated to new format
                    order: 1,
                    links: [
                        {
                            id: 'chatgpt',
                            title: 'ChatGPT',
                            url: 'https://chat.openai.com',
                            icon: 'cpu-chip',
                            color: 'green-500', // Updated to new format
                            order: 0
                        },
                        {
                            id: 'claude',
                            title: 'Claude',
                            url: 'https://claude.ai',
                            icon: 'brain',
                            color: 'orange-500', // Updated to new format
                            order: 1
                        },
                        {
                            id: 'copilot',
                            title: 'GitHub Copilot',
                            url: 'https://github.com/features/copilot',
                            icon: 'code-bracket',
                            color: 'gray-500', // Updated to new format
                            order: 2
                        },
                        {
                            id: 'midjourney',
                            title: 'Midjourney',
                            url: 'https://www.midjourney.com',
                            icon: 'photo',
                            color: 'blue-500', // Updated to new format
                            order: 3
                        },
                        {
                            id: 'runway',
                            title: 'Runway',
                            url: 'https://runwayml.com',
                            icon: 'video-camera',
                            color: 'purple-500', // Updated to new format
                            order: 4
                        }
                    ]
                },
                {
                    id: 'business-tools',
                    title: 'Business Tools',
                    color: 'emerald-500', // Updated to new format
                    order: 2,
                    links: [
                        {
                            id: 'salesforce',
                            title: 'Salesforce',
                            url: 'https://salesforce.com',
                            icon: 'cloud',
                            color: 'blue-500', // Updated to new format
                            order: 0
                        },
                        {
                            id: 'monday',
                            title: 'Monday.com',
                            url: 'https://monday.com',
                            icon: 'calendar-days',
                            color: 'blue-500', // Updated to new format
                            order: 1
                        },
                        {
                            id: 'unbounce',
                            title: 'Unbounce',
                            url: 'https://unbounce.com',
                            icon: 'rocket-launch',
                            color: 'orange-500', // Updated to new format
                            order: 2
                        },
                        {
                            id: 'adobe-stock',
                            title: 'Adobe Stock',
                            url: 'https://stock.adobe.com',
                            icon: 'photo',
                            color: 'red-500', // Updated to new format
                            order: 3
                        },
                        {
                            id: 'github',
                            title: 'GitHub',
                            url: 'https://github.com',
                            icon: 'code-bracket-square',
                            color: 'gray-500', // Updated to new format
                            order: 4
                        }
                    ]
                }
            ]
        };
    }

    getDefaultSettings() {
        return {
            version: this.version,
            uniformCardHeight: false,
            theme: 'light', // Default to light theme
            gridColumns: 'auto',
            // New layout settings for v0.0.3a
            cardWidth: 'sm', // xs, sm, md, lg, xl
            containerMargin: 'medium' // none, narrow, medium, wide, xwide
        };
    }

    // Migration function to update data from previous versions to v0.0.3a
    async migrateData(data) {
        let needsMigration = false;
        
        if (!data.version || data.version === '0.0.1') {
            console.log('Migrating data from v0.0.1 to v0.0.3a...');
            needsMigration = true;
            
            // Migrate color format from single words to shade format
            const colorMigrationMap = {
                'slate': 'slate-500',
                'gray': 'gray-500',
                'zinc': 'zinc-500',
                'neutral': 'neutral-500',
                'stone': 'stone-500',
                'red': 'red-500',
                'orange': 'orange-500',
                'amber': 'amber-500',
                'yellow': 'yellow-500',
                'lime': 'lime-500',
                'green': 'green-500',
                'emerald': 'emerald-500',
                'teal': 'teal-500',
                'cyan': 'cyan-500',
                'sky': 'sky-500',
                'blue': 'blue-500',
                'indigo': 'indigo-500',
                'violet': 'violet-500',
                'purple': 'purple-500',
                'fuchsia': 'fuchsia-500',
                'pink': 'pink-500',
                'rose': 'rose-500'
            };

            // Migrate cards
            if (data.cards) {
                data.cards.forEach(card => {
                    if (card.color && !card.color.includes('-')) {
                        card.color = colorMigrationMap[card.color] || 'blue-500';
                    }
                    
                    // Migrate links within cards
                    if (card.links) {
                        card.links.forEach(link => {
                            if (link.color && !link.color.includes('-')) {
                                link.color = colorMigrationMap[link.color] || 'blue-500';
                            }
                        });
                    }
                });
            }
        }
        
        if (!data.version || data.version === '0.0.1' || data.version === '0.0.2') {
            console.log('Migrating data to v0.0.3...');
            needsMigration = true;
        }
        
        if (needsMigration) {
            // Update version
            data.version = this.version;
            console.log('Data migration completed to v0.0.3');
        }
        
        return data;
    }

    // Migration function for settings
    async migrateSettings(settings) {
        let needsMigration = false;
        
        if (!settings.version || settings.version !== this.version) {
            console.log('Migrating settings to v0.0.3...');
            needsMigration = true;
            
            // Add new layout settings if they don't exist
            if (!settings.cardWidth) {
                settings.cardWidth = 'sm'; // Default to small cards
            }
            
            if (!settings.containerMargin) {
                settings.containerMargin = 'medium'; // Default to medium margins
            }
            
            // Ensure all default settings are present
            const defaultSettings = this.getDefaultSettings();
            Object.keys(defaultSettings).forEach(key => {
                if (settings[key] === undefined) {
                    settings[key] = defaultSettings[key];
                }
            });
            
            settings.version = this.version;
        }
        
        return settings;
    }

    // Load data from Chrome storage with migration support
    async loadData() {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            if (result[this.storageKey]) {
                let data = result[this.storageKey];
                
                // Check if migration is needed
                data = await this.migrateData(data);
                
                // Save migrated data
                if (!data.version || data.version !== this.version) {
                    await this.saveData(data);
                }
                
                return data;
            } else {
                // Initialize with default data
                const defaultData = this.getDefaultData();
                await this.saveData(defaultData);
                return defaultData;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            return this.getDefaultData();
        }
    }

    // Save data to Chrome storage
    async saveData(data) {
        try {
            // Ensure version is set
            data.version = this.version;
            await chrome.storage.local.set({ [this.storageKey]: data });
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Load settings from Chrome storage with migration support
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(this.settingsKey);
            if (result[this.settingsKey]) {
                let settings = result[this.settingsKey];
                
                // Migrate settings if needed
                settings = await this.migrateSettings(settings);
                
                // Save migrated settings
                if (!settings.version || settings.version !== this.version) {
                    await this.saveSettings(settings);
                }
                
                return settings;
            } else {
                const defaultSettings = this.getDefaultSettings();
                await this.saveSettings(defaultSettings);
                return defaultSettings;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Save settings to Chrome storage
    async saveSettings(settings) {
        try {
            // Migrate settings before saving
            settings = await this.migrateSettings(settings);
            
            await chrome.storage.local.set({ [this.settingsKey]: settings });
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new card
    async addCard(cardData) {
        const data = await this.loadData();
        const newCard = {
            id: this.generateId(),
            title: cardData.title || 'New Card',
            color: cardData.color || 'blue-500', // Default to new format
            order: data.cards.length,
            links: []
        };
        data.cards.push(newCard);
        await this.saveData(data);
        return newCard;
    }

    // Update card
    async updateCard(cardId, updates) {
        const data = await this.loadData();
        const cardIndex = data.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            data.cards[cardIndex] = { ...data.cards[cardIndex], ...updates };
            await this.saveData(data);
            return data.cards[cardIndex];
        }
        return null;
    }

    // Delete card
    async deleteCard(cardId) {
        const data = await this.loadData();
        data.cards = data.cards.filter(card => card.id !== cardId);
        await this.saveData(data);
        return true;
    }

    // Add link to card
    async addLink(cardId, linkData) {
        const data = await this.loadData();
        const card = data.cards.find(card => card.id === cardId);
        if (card) {
            const newLink = {
                id: this.generateId(),
                title: linkData.title || 'New Link',
                url: linkData.url || 'https://example.com',
                icon: linkData.icon || 'link',
                color: linkData.color || 'blue-500', // Default to new format
                order: card.links.length
            };
            card.links.push(newLink);
            await this.saveData(data);
            return newLink;
        }
        return null;
    }

    // Update link
    async updateLink(cardId, linkId, updates) {
        const data = await this.loadData();
        const card = data.cards.find(card => card.id === cardId);
        if (card) {
            const linkIndex = card.links.findIndex(link => link.id === linkId);
            if (linkIndex !== -1) {
                card.links[linkIndex] = { ...card.links[linkIndex], ...updates };
                await this.saveData(data);
                return card.links[linkIndex];
            }
        }
        return null;
    }

    // Delete link
    async deleteLink(cardId, linkId) {
        const data = await this.loadData();
        const card = data.cards.find(card => card.id === cardId);
        if (card) {
            card.links = card.links.filter(link => link.id !== linkId);
            await this.saveData(data);
            return true;
        }
        return false;
    }

    // Reorder cards
    async reorderCards(cardIds) {
        const data = await this.loadData();
        const reorderedCards = [];
        
        cardIds.forEach((cardId, index) => {
            const card = data.cards.find(c => c.id === cardId);
            if (card) {
                card.order = index;
                reorderedCards.push(card);
            }
        });
        
        data.cards = reorderedCards;
        await this.saveData(data);
        return true;
    }

    // Reorder links within a card
    async reorderLinks(cardId, linkIds) {
        const data = await this.loadData();
        const card = data.cards.find(card => card.id === cardId);
        if (card) {
            const reorderedLinks = [];
            
            linkIds.forEach((linkId, index) => {
                const link = card.links.find(l => l.id === linkId);
                if (link) {
                    link.order = index;
                    reorderedLinks.push(link);
                }
            });
            
            card.links = reorderedLinks;
            await this.saveData(data);
            return true;
        }
        return false;
    }

    // Move link between cards
    async moveLinkToCard(linkId, fromCardId, toCardId, newOrder = 0) {
        const data = await this.loadData();
        const fromCard = data.cards.find(card => card.id === fromCardId);
        const toCard = data.cards.find(card => card.id === toCardId);
        
        if (fromCard && toCard) {
            const linkIndex = fromCard.links.findIndex(link => link.id === linkId);
            if (linkIndex !== -1) {
                const [link] = fromCard.links.splice(linkIndex, 1);
                link.order = newOrder;
                toCard.links.splice(newOrder, 0, link);
                
                // Reorder remaining links in both cards
                fromCard.links.forEach((link, index) => link.order = index);
                toCard.links.forEach((link, index) => link.order = index);
                
                await this.saveData(data);
                return true;
            }
        }
        return false;
    }

    // Layout Settings Management
    async updateLayoutSettings(layoutSettings) {
        const settings = await this.loadSettings();
        
        // Update layout-specific settings
        if (layoutSettings.cardWidth !== undefined) {
            settings.cardWidth = layoutSettings.cardWidth;
        }
        
        if (layoutSettings.containerMargin !== undefined) {
            settings.containerMargin = layoutSettings.containerMargin;
        }
        
        await this.saveSettings(settings);
        return settings;
    }

    // Get layout settings
    async getLayoutSettings() {
        const settings = await this.loadSettings();
        return {
            cardWidth: settings.cardWidth || 'sm',
            containerMargin: settings.containerMargin || 'medium'
        };
    }

    // Backup/Export functionality
    async exportData() {
        try {
            const data = await this.loadData();
            const settings = await this.loadSettings();
            
            const exportData = {
                version: this.version,
                timestamp: new Date().toISOString(),
                data,
                settings
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    // Import data with validation
    async importData(importJson) {
        try {
            const importData = JSON.parse(importJson);
            
            // Validate import data structure
            if (!importData.data || !importData.settings) {
                throw new Error('Invalid backup file format');
            }
            
            // Migrate imported data if needed
            const migratedData = await this.migrateData(importData.data);
            const migratedSettings = await this.migrateSettings(importData.settings);
            
            // Save imported data
            await this.saveData(migratedData);
            await this.saveSettings(migratedSettings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    // Clear all data and reset to defaults
    async resetToDefaults() {
        try {
            await chrome.storage.local.clear();
            
            const defaultData = this.getDefaultData();
            const defaultSettings = this.getDefaultSettings();
            
            await this.saveData(defaultData);
            await this.saveSettings(defaultSettings);
            
            return true;
        } catch (error) {
            console.error('Error resetting to defaults:', error);
            return false;
        }
    }
}

// Initialize storage instance
window.dashboardStorage = new DashboardStorage();
