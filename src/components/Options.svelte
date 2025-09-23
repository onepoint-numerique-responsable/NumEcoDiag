<script>
	import { calculateEstimatedFileSize } from '../utils/index.js';

	export let onExportAudit;
	export let onBuildBadge;
	export let onResetAudit;
	export let onCheckAudit;
	export let audit;

	let isExporting = false;
	$: estimatedFileSize = calculateEstimatedFileSize(audit);

	// Gestion de l'export avec état de chargement
	async function handleExportRequest() {
		if (isExporting || !onExportAudit) return;

		try {
			isExporting = true;
			await onExportAudit();
		} catch (error) {
			console.warn("Erreur lors de l'export :", error);
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="options-buttons-container" role="region" aria-label="Actions d'audit">
	<button
		type="button"
		class="fr-btn"
		on:click={handleExportRequest}
		disabled={isExporting}
		aria-describedby="export-help"
	>
		{isExporting ? 'Export en cours...' : `Exporter les résultats (~${estimatedFileSize})`}
	</button>
	<span id="export-help" class="sr-only">Télécharge un fichier Excel avec vos réponses d'audit</span
	>

	<button
		type="button"
		class="fr-btn"
		on:click={() => onBuildBadge && onBuildBadge()}
		aria-describedby="badge-help"
	>
		Télécharger le badge HTML
	</button>
	<span id="badge-help" class="sr-only"
		>Génère un badge HTML pour afficher votre score de conformité</span
	>

	<button
		type="button"
		class="fr-btn"
		on:click={() => onCheckAudit && onCheckAudit()}
		aria-describedby="check-help"
	>
		Vérifier mon audit
	</button>
	<span id="check-help" class="sr-only">Vérifie que tous les critères ont été évalués</span>

	<button
		type="button"
		class="fr-btn"
		on:click={() => onResetAudit && onResetAudit()}
		aria-describedby="reset-help"
	>
		Réinitialiser le diagnostic
	</button>
	<span id="reset-help" class="sr-only">Efface toutes vos réponses et recommence l'audit</span>
</div>

<style>
	.options-buttons-container {
		padding: 0 15px;
	}

	.sr-only {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	button {
		display: block;
		margin-bottom: 15px;
	}

	button:last-child {
		margin-bottom: 0;
	}

	button:focus-visible {
		outline: 2px solid #000091;
		outline-offset: 2px;
	}
</style>
