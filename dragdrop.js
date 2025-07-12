// Drag and Drop functionality with fixed drop targets and forced re-rendering

class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedType = null; // 'card' or 'link'
        this.draggedData = null;
        this.dropZones = [];
        this.currentDropTarget = null;
        this.activeDropPreview = null; // Track active preview to prevent duplicates
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('dragenter', this.handleDragEnter.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
    }

    makeCardDraggable(cardElement) {
        cardElement.draggable = true;
        cardElement.dataset.dragType = 'card';
        
        // Add visual feedback on hover
        cardElement.addEventListener('mousedown', () => {
            cardElement.style.cursor = 'grabbing';
        });
        
        cardElement.addEventListener('mouseup', () => {
            cardElement.style.cursor = 'grab';
        });
    }

    makeLinkDraggable(linkElement) {
        linkElement.draggable = true;
        linkElement.dataset.dragType = 'link';
        
        // Prevent link navigation on drag
        linkElement.addEventListener('dragstart', (e) => {
            e.preventDefault = false; // Allow drag
        });
        
        linkElement.addEventListener('click', (e) => {
            if (this.draggedElement) {
                e.preventDefault(); // Prevent navigation if drag just ended
            }
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target.closest('[data-drag-type]');
        if (!this.draggedElement) return;

        this.draggedType = this.draggedElement.dataset.dragType;
        
        // Store data based on type
        if (this.draggedType === 'card') {
            this.draggedData = {
                cardId: this.draggedElement.dataset.cardId,
                type: 'card'
            };
        } else if (this.draggedType === 'link') {
            this.draggedData = {
                linkId: this.draggedElement.dataset.linkId,
                cardId: this.draggedElement.closest('.bookmark-card').dataset.cardId,
                type: 'link'
            };
        }

        // Visual feedback
        this.draggedElement.classList.add('dragging');
        
        // Set drag image
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);
        
        // Create drop zones and enhanced visual feedback
        this.createDropZones();
        this.addDragOverlay();
        
        console.log('Drag started:', this.draggedData);
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // Clean up
        this.removeDropZones();
        this.clearDragOverStyles();
        this.removeDragOverlay();
        this.clearAllDropPreviews(); // Clear all previews
        
        this.draggedElement = null;
        this.draggedType = null;
        this.draggedData = null;
        this.currentDropTarget = null;
        this.activeDropPreview = null;
        
        console.log('Drag ended');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        
        const dropTarget = this.getDropTarget(e.target);
        if (dropTarget && this.isValidDropTarget(dropTarget)) {
            // Clear previous target
            if (this.currentDropTarget && this.currentDropTarget !== dropTarget) {
                this.currentDropTarget.classList.remove('drag-over');
                this.clearAllDropPreviews();
            }
            
            // Set new target
            this.currentDropTarget = dropTarget;
            dropTarget.classList.add('drag-over');
            
            // Add enhanced visual feedback (only one preview at a time)
            this.showDropPreview(dropTarget, e);
        }
    }

    handleDragLeave(e) {
        const dropTarget = this.getDropTarget(e.target);
        if (dropTarget && !dropTarget.contains(e.relatedTarget)) {
            dropTarget.classList.remove('drag-over');
            this.clearAllDropPreviews();
            
            if (this.currentDropTarget === dropTarget) {
                this.currentDropTarget = null;
            }
        }
    }

    async handleDrop(e) {
        e.preventDefault();
        
        const dropTarget = this.getDropTarget(e.target);
        if (!dropTarget || !this.isValidDropTarget(dropTarget)) {
            console.log('Invalid drop target');
            return;
        }

        console.log('Drop started on target:', dropTarget.dataset.cardId);

        // Clear visual feedback immediately
        dropTarget.classList.remove('drag-over');
        this.clearAllDropPreviews();
        
        try {
            // Show loading state
            this.showLoadingState();
            
            let success = false;
            
            if (this.draggedType === 'card') {
                success = await this.handleCardDrop(dropTarget, e);
            } else if (this.draggedType === 'link') {
                success = await this.handleLinkDrop(dropTarget, e);
            }
            
            console.log('Drop operation success:', success);
            
            if (success) {
                // Force immediate re-render using multiple methods
                await this.forceRefreshDashboard();
                
                // Show success feedback
                this.showSuccessFeedback();
            } else {
                this.showErrorFeedback('No changes made');
            }
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error handling drop:', error);
            this.hideLoadingState();
            this.showErrorFeedback('Error: ' + error.message);
        }
    }

    // Force dashboard refresh with multiple approaches
    async forceRefreshDashboard() {
        console.log('Force refreshing dashboard...');
        
        try {
            // Method 1: Reload data first, then render
            if (window.dashboardStorage && window.dashboardApp) {
                console.log('Reloading data and forcing render...');
                
                // Reload the data from storage
                const freshData = await window.dashboardStorage.loadData();
                
                // Update the app's data
                window.dashboardApp.data = freshData;
                
                // Force re-render
                await window.dashboardApp.renderDashboard();
                
                console.log('Dashboard refreshed with fresh data');
                return;
            }
            
            // Method 2: Direct DOM manipulation if app isn't available
            console.log('App not available, attempting manual refresh...');
            await this.manualDashboardRefresh();
            
        } catch (error) {
            console.error('Error force refreshing dashboard:', error);
            // Fallback: reload the page
            console.log('All methods failed, reloading page...');
            window.location.reload();
        }
    }

    async manualDashboardRefresh() {
        const grid = document.getElementById('dashboard-grid');
        if (!grid) return;
        
        // Clear current grid
        grid.innerHTML = '';
        
        // Reload data
        const data = await window.dashboardStorage.loadData();
        
        // Manually recreate cards (simplified version)
        const sortedCards = [...data.cards].sort((a, b) => a.order - b.order);
        
        sortedCards.forEach(card => {
            // Create a simple card element
            const cardDiv = document.createElement('div');
            cardDiv.className = 'bookmark-card';
            cardDiv.dataset.cardId = card.id;
            cardDiv.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${card.title}</div>
                </div>
                <div class="quick-links">
                    ${card.links.map(link => `
                        <div class="quick-link" data-link-id="${link.id}">
                            <div class="quick-link-icon">${window.IconUtils ? window.IconUtils.createIcon(link.icon, 'slate', 28) : '📄'}</div>
                            <div class="quick-link-title">${link.title}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            grid.appendChild(cardDiv);
        });
        
        // Re-enable edit mode if it was active
        if (document.body.classList.contains('edit-mode')) {
            // Re-apply edit mode styling and functionality
            setTimeout(() => {
                if (window.dashboardApp) {
                    window.dashboardApp.renderDashboard();
                }
            }, 100);
        }
    }

    async handleCardDrop(dropTarget, e) {
        const dashboard = document.getElementById('dashboard-grid');
        const allCards = Array.from(dashboard.children);
        const dropIndex = allCards.indexOf(dropTarget);
        
        let newOrder;
        if (dropIndex === -1) {
            // Dropped at the end
            newOrder = allCards.length - 1;
        } else {
            // Dropped before another card
            newOrder = dropIndex;
        }
        
        // Update order in storage
        const newCardOrder = allCards.map(card => card.dataset.cardId);
        
        // Remove dragged card from its current position
        const draggedIndex = newCardOrder.indexOf(this.draggedData.cardId);
        if (draggedIndex !== -1) {
            newCardOrder.splice(draggedIndex, 1);
        }
        
        // Insert at new position
        newCardOrder.splice(newOrder, 0, this.draggedData.cardId);
        
        console.log('Reordering cards:', newCardOrder);
        await window.dashboardStorage.reorderCards(newCardOrder);
        return true;
    }

    async handleLinkDrop(dropTarget, e) {
        const targetCardId = dropTarget.dataset.cardId;
        const sourceCardId = this.draggedData.cardId;
        const linkId = this.draggedData.linkId;
        
        console.log('Moving link:', { linkId, sourceCardId, targetCardId });
        
        if (targetCardId === sourceCardId) {
            // Reordering within same card
            const linksContainer = dropTarget.querySelector('.quick-links');
            const allLinks = Array.from(linksContainer.children).filter(child => 
                child.classList.contains('quick-link'));
            
            // Find drop position based on mouse position
            let dropIndex = allLinks.length;
            const rect = linksContainer.getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < allLinks.length; i++) {
                const linkRect = allLinks[i].getBoundingClientRect();
                const linkY = linkRect.top - rect.top + linkRect.height / 2;
                if (y < linkY) {
                    dropIndex = i;
                    break;
                }
            }
            
            // Reorder links
            const linkIds = allLinks.map(link => link.dataset.linkId);
            const draggedIndex = linkIds.indexOf(linkId);
            
            if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
                linkIds.splice(draggedIndex, 1);
                linkIds.splice(dropIndex > draggedIndex ? dropIndex - 1 : dropIndex, 0, linkId);
                console.log('Reordering links within card:', linkIds);
                await window.dashboardStorage.reorderLinks(targetCardId, linkIds);
                return true;
            } else {
                console.log('No reorder needed');
                return false;
            }
        } else {
            // Moving between cards
            const targetLinksContainer = dropTarget.querySelector('.quick-links');
            const existingLinks = Array.from(targetLinksContainer.children).filter(child => 
                child.classList.contains('quick-link'));
            
            // Calculate proper insertion position based on mouse position
            let newOrder = existingLinks.length; // Default to end
            const rect = targetLinksContainer.getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < existingLinks.length; i++) {
                const linkRect = existingLinks[i].getBoundingClientRect();
                const linkY = linkRect.top - rect.top + linkRect.height / 2;
                if (y < linkY) {
                    newOrder = i;
                    break;
                }
            }
            
            console.log('Moving link between cards, calculated order:', newOrder, 'out of', existingLinks.length);
            await window.dashboardStorage.moveLinkToCard(linkId, sourceCardId, targetCardId, newOrder);
            return true;
        }
    }

    getDropTarget(element) {
        // Find the appropriate drop target
        if (this.draggedType === 'card') {
            return element.closest('.bookmark-card');
        } else if (this.draggedType === 'link') {
            return element.closest('.bookmark-card');
        }
        return null;
    }

    isValidDropTarget(dropTarget) {
        if (!dropTarget || !this.draggedElement) return false;
        
        // Can't drop on self
        if (dropTarget === this.draggedElement) return false;
        
        // Can't drop a card inside itself
        if (this.draggedType === 'card' && this.draggedElement.contains(dropTarget)) {
            return false;
        }
        
        return true;
    }

    createDropZones() {
        // For card dragging, create drop zones between cards
        if (this.draggedType === 'card') {
            this.createCardDropZones();
        }
        // For link dragging, cards themselves are drop zones (handled by existing elements)
    }

    createCardDropZones() {
        const dashboard = document.getElementById('dashboard-grid');
        const cards = Array.from(dashboard.children);
        
        cards.forEach((card, index) => {
            if (card !== this.draggedElement) {
                const dropZone = document.createElement('div');
                dropZone.className = 'drop-zone card-drop-zone';
                dropZone.dataset.dropIndex = index;
                dropZone.style.cssText = `
                    min-height: 4px;
                    border: 2px dashed transparent;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    margin: 4px 0;
                `;
                this.dropZones.push(dropZone);
                
                dashboard.insertBefore(dropZone, card);
            }
        });
        
        // Add drop zone at the end
        const endDropZone = document.createElement('div');
        endDropZone.className = 'drop-zone card-drop-zone';
        endDropZone.dataset.dropIndex = cards.length;
        endDropZone.style.cssText = `
            min-height: 4px;
            border: 2px dashed transparent;
            border-radius: 8px;
            transition: all 0.2s ease;
            margin: 4px 0;
        `;
        this.dropZones.push(endDropZone);
        dashboard.appendChild(endDropZone);
    }

    removeDropZones() {
        this.dropZones.forEach(zone => {
            if (zone.parentNode) {
                zone.parentNode.removeChild(zone);
            }
        });
        this.dropZones = [];
    }

    clearDragOverStyles() {
        document.querySelectorAll('.drag-over').forEach(element => {
            element.classList.remove('drag-over');
        });
    }

    // Enhanced visual feedback methods
    addDragOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'drag-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(59, 130, 246, 0.05);
            z-index: 999;
            pointer-events: none;
            transition: background 0.2s ease;
        `;
        document.body.appendChild(overlay);
    }

    removeDragOverlay() {
        const overlay = document.getElementById('drag-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showDropPreview(dropTarget, e) {
        // Clear any existing previews first
        this.clearAllDropPreviews();
        
        if (this.draggedType === 'link') {
            const linksContainer = dropTarget.querySelector('.quick-links');
            if (!linksContainer) return;
            
            // Calculate insertion point based on mouse position
            const allLinks = Array.from(linksContainer.children).filter(child => 
                child.classList.contains('quick-link'));
            
            let insertIndex = allLinks.length;
            const rect = linksContainer.getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < allLinks.length; i++) {
                const linkRect = allLinks[i].getBoundingClientRect();
                const linkY = linkRect.top - rect.top + linkRect.height / 2;
                if (y < linkY) {
                    insertIndex = i;
                    break;
                }
            }
            
            // Create single preview indicator
            const preview = document.createElement('div');
            preview.className = 'drop-preview';
            preview.style.cssText = `
                height: 3px;
                background: #3b82f6;
                margin: 2px 0;
                border-radius: 2px;
                opacity: 0.8;
                animation: pulse 1s infinite;
                position: relative;
                z-index: 1000;
            `;
            
            // Insert preview at the calculated position
            if (insertIndex >= allLinks.length) {
                // Insert at the end, before Add Link button
                const addLinkBtn = linksContainer.querySelector('.add-link-btn');
                if (addLinkBtn) {
                    linksContainer.insertBefore(preview, addLinkBtn);
                } else {
                    linksContainer.appendChild(preview);
                }
            } else {
                // Insert before the target link
                linksContainer.insertBefore(preview, allLinks[insertIndex]);
            }
            
            this.activeDropPreview = preview;
        }
    }

    clearAllDropPreviews() {
        // Remove all existing drop previews
        document.querySelectorAll('.drop-preview').forEach(preview => {
            preview.remove();
        });
        this.activeDropPreview = null;
    }

    showLoadingState() {
        const loader = document.createElement('div');
        loader.id = 'drag-loader';
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-size: 14px;
            font-weight: 500;
        `;
        loader.textContent = 'Moving...';
        document.body.appendChild(loader);
    }

    hideLoadingState() {
        const loader = document.getElementById('drag-loader');
        if (loader) {
            loader.remove();
        }
    }

    showSuccessFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        feedback.textContent = 'Item moved successfully!';
        document.body.appendChild(feedback);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 2000);
    }

    showErrorFeedback(message = 'Error moving item. Please try again.') {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 3000);
    }
}

// Add CSS animations for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .drag-over {
        border-color: #3b82f6 !important;
        background: rgba(59, 130, 246, 0.1) !important;
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3) !important;
    }
    
    .dragging {
        opacity: 0.6;
        transform: rotate(3deg) scale(0.95);
        z-index: 1000;
    }
`;
document.head.appendChild(style);

// Initialize drag and drop manager
window.dragDropManager = new DragDropManager();