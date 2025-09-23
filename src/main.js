import App from './App.svelte';
import '@gouvfr/dsfr/dist/dsfr.min.css';
import '@gouvfr/dsfr/dist/utility/utility.min.css';
import '@gouvfr/dsfr/dist/dsfr.module.js';

const app = new App({
	target: document.body
});

export default app;
