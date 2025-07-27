// Global variables
let unsavedChanges = false;
let originalContent = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCaddyfile();
    loadBackups();
    checkCaddyStatus();
    updateTimezoneInfo();
    
    // Set up editor change detection
    const editor = document.getElementById('caddyfile-editor');
    editor.addEventListener('input', function() {
        if (this.value !== originalContent) {
            unsavedChanges = true;
        } else {
            unsavedChanges = false;
        }
    });

    // Warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });

    // Auto-refresh status every 30 seconds
    setInterval(checkCaddyStatus, 30000);
});

// Load Caddyfile content
async function loadCaddyfile() {
    try {
        showLoading('Loading Caddyfile...');
        const response = await fetch('/api/caddyfile');
        const data = await response.json();
        
        if (response.ok) {
            const editor = document.getElementById('caddyfile-editor');
            editor.value = data.content;
            originalContent = data.content;
            unsavedChanges = false;
            
            updateLastModified(data.lastModified);
            hideAlerts();
            showAlert('success', 'Caddyfile loaded successfully! "Gunga galunga!"');
        } else {
            throw new Error(data.message || 'Failed to load Caddyfile');
        }
    } catch (error) {
        showAlert('error', `Failed to load Caddyfile: ${error.message}`);
    }
}

// Save Caddyfile content
async function saveCaddyfile() {
    const editor = document.getElementById('caddyfile-editor');
    const content = editor.value;
    
    if (!content.trim()) {
        showAlert('error', 'Cannot save empty Caddyfile! "That\'s a peach, hon!"');
        return;
    }

    try {
        showLoading('Saving Caddyfile...');
        const response = await fetch('/api/caddyfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        const data = await response.json();
        
        if (response.ok) {
            originalContent = content;
            unsavedChanges = false;
            showAlert('success', `${data.message}<br><small>Backup created: ${data.backupCreated}</small>`);
            loadBackups(); // Refresh backup list
            
            // Show reload confirmation modal
            document.getElementById('reload-modal').style.display = 'block';
        } else {
            throw new Error(data.message || 'Failed to save Caddyfile');
        }
    } catch (error) {
        showAlert('error', `Failed to save Caddyfile: ${error.message}`);
    }
}

// Reload Caddy configuration
async function reloadCaddy() {
    try {
        showLoading('Reloading Caddy configuration...');
        const response = await fetch('/api/reload', {
            method: 'POST',
        });

        const data = await response.json();
        
        if (response.ok) {
            showAlert('success', data.message);
            checkCaddyStatus(); // Refresh status
        } else {
            throw new Error(data.message || 'Failed to reload configuration');
        }
    } catch (error) {
        showAlert('error', `Failed to reload configuration: ${error.message}`);
    }
}

// Load backup list
async function loadBackups() {
    try {
        const response = await fetch('/api/backups');
        const backups = await response.json();
        
        const backupList = document.getElementById('backup-list');
        
        if (response.ok && backups.length > 0) {
            backupList.innerHTML = backups.map(backup => `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-name">${backup.name}</div>
                        <div class="backup-meta">
                            ${new Date(backup.created).toLocaleString()} | ${formatFileSize(backup.size)}
                        </div>
                    </div>
                    <div class="backup-actions">
                        <button class="btn btn-secondary btn-small" onclick="restoreBackup('${backup.name}')">
                            <i class="fas fa-undo"></i>
                            Restore
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            backupList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-folder-open"></i><br>
                    No backups found yet.<br>
                    <small>"I'm not a loser!"</small>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('backup-list').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f44336;">
                <i class="fas fa-exclamation-triangle"></i><br>
                Failed to load backups<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Restore from backup
async function restoreBackup(backupName) {
    if (!confirm(`Are you sure you want to restore from ${backupName}? This will replace your current Caddyfile!`)) {
        return;
    }

    try {
        showLoading('Restoring backup...');
        const response = await fetch(`/api/restore/${backupName}`, {
            method: 'POST',
        });

        const data = await response.json();
        
        if (response.ok) {
            showAlert('success', `${data.message}<br><small>Current backup created: ${data.currentBackupCreated}</small>`);
            loadCaddyfile(); // Reload editor content
            loadBackups(); // Refresh backup list
        } else {
            throw new Error(data.message || 'Failed to restore backup');
        }
    } catch (error) {
        showAlert('error', `Failed to restore backup: ${error.message}`);
    }
}

// Check Caddy admin API status
async function checkCaddyStatus() {
    try {
        const response = await fetch('/api/caddy/status');
        const data = await response.json();
        
        const statusIndicator = document.getElementById('caddy-status');
        const statusText = document.getElementById('caddy-status-text');
        
        if (response.ok && data.status === 'connected') {
            statusIndicator.className = 'status-indicator status-connected';
            statusText.textContent = `Caddy Connected (${data.version || 'Unknown version'})`;
        } else {
            statusIndicator.className = 'status-indicator status-disconnected';
            statusText.textContent = 'Caddy Disconnected';
        }
    } catch (error) {
        const statusIndicator = document.getElementById('caddy-status');
        const statusText = document.getElementById('caddy-status-text');
        statusIndicator.className = 'status-indicator status-disconnected';
        statusText.textContent = 'Connection Error';
    }
}

// Update timezone information
function updateTimezoneInfo() {
    const timezoneInfo = document.getElementById('timezone-info');
    const now = new Date();
    timezoneInfo.textContent = `${Intl.DateTimeFormat().resolvedOptions().timeZone} (${now.toLocaleTimeString()})`;
    
    // Update every minute
    setTimeout(updateTimezoneInfo, 60000);
}

// Update last modified timestamp
function updateLastModified(timestamp) {
    const lastModified = document.getElementById('last-modified');
    if (timestamp) {
        const date = new Date(timestamp);
        lastModified.textContent = `Last modified: ${date.toLocaleString()}`;
    } else {
        lastModified.textContent = 'Last modified: Unknown';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show alert message
function showAlert(type, message) {
    hideAlerts();
    const alert = document.getElementById(`${type}-alert`);
    alert.innerHTML = message;
    alert.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}

// Hide all alerts
function hideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.display = 'none';
    });
}

// Show loading state
function showLoading(message) {
    showAlert('info', `<i class="fas fa-spinner fa-spin"></i> ${message}`);
}

// Modal functions
function closeModal() {
    document.getElementById('reload-modal').style.display = 'none';
}

function confirmReload() {
    closeModal();
    reloadCaddy();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('reload-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCaddyfile();
    }
    
    // Ctrl+R or Cmd+R to reload (prevent default browser reload)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadCaddyfile();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add some Caddyshack quotes that rotate
const quotes = [
    "\"So I got that goin' for me, which is nice.\" - Carl Spackler",
    "\"Be the ball, Danny.\" - Ty Webb",
    "\"It's in the hole!\" - Carl Spackler",
    "\"Hey everybody, we're all gonna get laid!\" - Al Czervik",
    "\"Gunga galunga... gunga, gunga-lagunga.\" - Carl Spackler",
    "\"That's a peach, hon.\" - Mrs. Smails",
    "\"I'm gonna get that gopher!\" - Carl Spackler",
    "\"Spaulding, get your foot off the boat!\" - Judge Smails"
];

let currentQuoteIndex = 0;

function rotateQuotes() {
    const quoteElements = document.querySelectorAll('.quote');
    quoteElements.forEach(element => {
        element.textContent = quotes[currentQuoteIndex];
    });
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
}

// Rotate quotes every 30 seconds
setInterval(rotateQuotes, 30000);
