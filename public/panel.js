/**
 * DevTools Panel Script for NumÉcoDiag
 * This script provides DevTools-specific functionality for the NumÉcoDiag app
 * The main Svelte app loads automatically via the script tag in index.html
 */

/**
 * Initialize DevTools-specific functionality
 */
function initializeDevToolsIntegration() {
	console.log('NumÉcoDiag DevTools panel initialized');

	// Inject page context information for the audit
	injectPageContext();

	// Set up DevTools-specific event listeners
	setupDevToolsListeners();
}

/**
 * Inject context about the inspected page
 */
function injectPageContext() {
	// Get page information from the inspected window
	chrome.devtools.inspectedWindow.eval(
		`
        // Extract basic page information for the audit context
        ({
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            hasServiceWorker: 'serviceWorker' in navigator,
            userAgent: navigator.userAgent,
            documentElement: {
                lang: document.documentElement.lang,
                charset: document.characterSet
            }
        });
    `,
		(pageInfo, isException) => {
			if (!isException && pageInfo) {
				// Store page context for the audit tool
				try {
					// Store in localStorage for the Svelte app to access
					localStorage.setItem('devtools_page_context', JSON.stringify(pageInfo));

					// Dispatch custom event for the Svelte app
					window.dispatchEvent(
						new CustomEvent('devtools-page-context', {
							detail: pageInfo
						})
					);

					console.log('Page context injected:', pageInfo);
				} catch (error) {
					console.warn('Could not store page context:', error);
				}
			} else {
				console.warn('Could not get page context:', isException);
			}
		}
	);
}

/**
 * Set up DevTools-specific event listeners
 */
function setupDevToolsListeners() {
	// Listen for messages from the main Svelte app
	window.addEventListener('message', (event) => {
		// Handle different message types from the audit app
		switch (event.data?.type) {
			case 'AUDIT_COMPLETED':
				console.log('Audit completed:', event.data.results);
				break;
			case 'AUDIT_ERROR':
				console.error('Audit error:', event.data.error);
				break;
			default:
				// Log other messages for debugging
				if (event.data?.type) {
					console.log('Message from audit app:', event.data);
				}
		}
	});

	// Update page context when DevTools selection changes (if supported)
	if (chrome.devtools.panels && chrome.devtools.panels.onSelectionChanged) {
		chrome.devtools.panels.onSelectionChanged.addListener(() => {
			injectPageContext();
		});
	}

	// Listen for navigation changes in the inspected window
	if (chrome.devtools.network && chrome.devtools.network.onNavigated) {
		chrome.devtools.network.onNavigated.addListener((url) => {
			console.log('Inspected page navigated to:', url);
			// Re-inject context for the new page
			setTimeout(injectPageContext, 500); // Small delay to ensure page is loaded
		});
	}
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeDevToolsIntegration);
} else {
	initializeDevToolsIntegration();
}
