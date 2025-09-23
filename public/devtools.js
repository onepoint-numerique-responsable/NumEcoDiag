/**
 * DevTools initialization script
 * This script creates the NumÉcoDiag panel in the Chrome DevTools
 */

// Create the DevTools panel
chrome.devtools.panels.create(
	'NumÉcoDiag', // Panel name as requested
	'./static/numecodiag-logo-48x48.png', // Panel icon
	'index.html', // Panel HTML file
	(panel) => {
		console.log('NumÉcoDiag DevTools panel created successfully');

		// Optional: Handle panel events
		panel.onShown.addListener((panelWindow) => {
			console.log('NumÉcoDiag panel shown');
			// The panel window is available here if needed for communication
			if (panelWindow) {
				// Panel window is ready for interaction
			}
		});

		panel.onHidden.addListener(() => {
			console.log('NumÉcoDiag panel hidden');
		});
	}
);
