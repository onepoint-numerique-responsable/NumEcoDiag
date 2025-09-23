<script>
	import { onMount, tick } from 'svelte';
	import { calculateEstimatedFileSize } from '../utils/index.js';
	import Accordion from './Accordion.svelte';

	export let referential;
	export let exportAudit;
	export let updated;
	export let audit;
	export let updateProjectInfo;

	const thematiques = [
		'Stratégie',
		'Spécifications',
		'Architecture',
		'UX/UI',
		'Contenus',
		'Frontend',
		'Backend',
		'Hébergement',
		'Algorithmie'
	];
	let lastTheme = '';
	let lastUpdatedCriterion = null;
	let renderTimeout = null;
	let hasStartedAuditCheck = false;
	let isExporting = false;
	$: localAudit = audit;

	// Gestion de l'export avec état de chargement
	async function handleExportRequest() {
		if (isExporting) return;

		try {
			isExporting = true;
			await exportAudit();
		} catch (error) {
			console.warn("Erreur lors de l'export :", error);
		} finally {
			isExporting = false;
		}
	}

	$: if (hasStartedAuditCheck && lastUpdatedCriterion) {
		if (renderTimeout) {
			clearTimeout(renderTimeout);
		}
		renderTimeout = setTimeout(() => {
			const critere = referential.criteres.find((c) => c.id === lastUpdatedCriterion);
			if (critere) {
				checkSingleCriterion(critere);
			}
			lastUpdatedCriterion = null;
			renderTimeout = null;
		}, 500);
	}

	onMount(async () => {
		await tick(); // Attendre que le DOM soit prêt
		syncFormWithAudit();
	});

	// Synchronise les champs du formulaire avec les données d'audit - optimisé pour éviter les requêtes DOM
	function syncFormWithAudit() {
		if (!localAudit?.byCriteria) return;

		const criteria = localAudit.byCriteria;

		// Utilise une sélection DOM plus efficace avec des mises à jour par lot
		Object.entries(criteria).forEach(([criterionId, criterionData]) => {
			const safeId = criterionId.replace('.', '-');
			// Essaie d'abord l'attribut data, puis l'ID
			const criterionElm =
				document.querySelector(`[data-criterion-id="${safeId}"]`) ||
				document.getElementById(safeId);
			if (!criterionElm) return;

			// Groupe les mises à jour DOM pour minimiser les reflows
			const updates = [];

			// Définit le statut du bouton radio
			if (criterionData.status) {
				const input = criterionElm.querySelector(`input[value="${criterionData.status}"]`);
				if (input && !input.checked) {
					updates.push(() => (input.checked = true));
				}
			}

			// Définit le contenu du textarea
			if (criterionData.analysis) {
				const textarea = criterionElm.querySelector('textarea');
				if (textarea && textarea.value !== criterionData.analysis) {
					updates.push(() => (textarea.value = criterionData.analysis));
				}
			}

			// Applique toutes les mises à jour par lot
			updates.forEach((update) => update());
		});
	}

	// Synchronisation réactive optimisée - ne synchronise que quand nécessaire
	let lastSyncVersion = 0;
	$: if (localAudit) {
		const currentVersion = Object.keys(localAudit.byCriteria || {}).length;
		if (currentVersion !== lastSyncVersion) {
			lastSyncVersion = currentVersion;
			tick().then(() => syncFormWithAudit());
		}
	}

	function isAnotherTheme(currentTheme) {
		if (currentTheme !== lastTheme) {
			lastTheme = currentTheme;
			return true;
		}
		return false;
	}

	function updateAnswer(prop, criterionId, value = undefined) {
		if (hasStartedAuditCheck) {
			lastUpdatedCriterion = criterionId;
		}
		updated({
			prop: prop,
			criterionId: criterionId,
			value: value
		});
	}

	function createBanner(type, title, message) {
		// Création DOM plus efficace avec des template literals et fragments
		const bannerHTML = `
			<div class="banner ${type}">
				<div class="banner__icon">
					<img src="static/${type === 'complete' ? 'yes' : 'fail'}.svg" 
						 alt="${type === 'complete' ? 'Critère complet' : 'Critère incomplet'}" 
						 class="banner__img-icon">
				</div>
				<div class="banner__content">
					<strong>${title}</strong>
					<span>${message}</span>
				</div>
			</div>
		`;

		const template = document.createElement('template');
		template.innerHTML = bannerHTML.trim();
		return template.content.firstChild;
	}

	function checkSingleCriterion(critere) {
		const safeId = critere.id.replace('.', '-');
		// Utilise querySelector avec l'attribut data pour une sélection plus fiable
		const criterionElm =
			document.querySelector(`[data-criterion-id="${safeId}"]`) || document.getElementById(safeId);
		if (!criterionElm) return;

		// Supprime efficacement la bannière existante
		const oldBanner = criterionElm.querySelector('.banner');
		if (oldBanner) {
			oldBanner.remove();
		}

		const criterionData = localAudit.byCriteria[critere.id];
		let banner;

		if (!criterionData || !criterionData.status) {
			// Critère non évalué du tout
			banner = createBanner('incomplete', 'Oups...', "Le critère n'a pas encore été évalué.");
		} else {
			const { status, analysis } = criterionData;

			if (status === 'undefined' || !analysis) {
				// Statut ou analyse manquant (sauf pour "conforme" sans commentaire qui est acceptable)
				banner = createBanner(
					'incomplete',
					'Oups...',
					status === 'undefined'
						? "Le critère n'a pas encore été évalué."
						: "Il semblerait que tous les champs du critère n'aient pas été complétés."
				);
			} else {
				// Critère correctement complété
				banner = createBanner('complete', 'Bravo !', 'Tous les champs du critère ont été remplis.');
			}
		}

		// Insère la bannière au début pour une meilleure UX
		criterionElm.insertBefore(banner, criterionElm.firstChild);
	}

	export function checkAudit(event = null) {
		if (event !== null) {
			event.preventDefault();
		}
		hasStartedAuditCheck = true;
		let firstIncompleteElement = null;

		for (const critere of referential.criteres) {
			checkSingleCriterion(critere);

			if (!firstIncompleteElement) {
				const safeId = critere.id.replace('.', '-');
				const criterionElm =
					document.querySelector(`[data-criterion-id="${safeId}"]`) ||
					document.getElementById(safeId);

				if (criterionElm) {
					const banner = criterionElm.querySelector('.banner.incomplete');
					if (banner) {
						firstIncompleteElement = criterionElm;
					}
				}
			}
		}

		if (firstIncompleteElement) {
			setTimeout(() => {
				const banner = firstIncompleteElement.querySelector('.banner.incomplete');
				if (banner) {
					const offset = 185;
					const elementPosition = banner.getBoundingClientRect().top + window.pageYOffset;
					window.scrollTo({
						top: elementPosition - offset,
						behavior: 'smooth'
					});
				}
			}, 100);
		}
	}

	$: estimatedFileSize = calculateEstimatedFileSize(localAudit);
</script>

<form id="diagnostic" class="page-anchor" role="main" aria-labelledby="diagnostic-title">
	<!-- Lien d'évitement pour une meilleure navigation au clavier -->
	<a href="#first-criterion" class="skip-link">Aller au premier critère</a>

	<div class="form-header">
		<h2 id="diagnostic-title">
			Auto-diagnostic
			<a
				href="https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/"
				rel="noreferrer"
				target="_blank"
				aria-label="RGESN - Référentiel général d'écoconception (ouvre dans un nouvel onglet)"
				>RGESN
			</a>
			version {referential.version}
		</h2>
		<p>
			<b
				>{localAudit.byCounters.satisfied +
					localAudit.byCounters.rejected +
					localAudit.byCounters.notApplicable} critère(s) évalué(s)</b
			>
			sur {referential.criteres.length}
		</p>
	</div>
	<h3>Thématiques</h3>
	<div class="sommaire">
		<ol role="list" aria-label="Liste des thématiques">
			{#each thematiques as thematique (thematique)}
				<li>
					<a href="#{thematique}" aria-label="Aller à la thématique {thematique}">{thematique}</a>
				</li>
			{/each}
		</ol>
	</div>
	<h3>À propos de l'évaluation</h3>
	<div class="about">
		<p>
			Cette évaluation déclarative se base sur le RGESN, <a
				href="https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/"
				rel="noreferrer">Référentiel Général d’Écoconception des Services Numériques</a
			>, publié par la MiNumEco et copiloté par la DINUM, le ministère de la Transition écologique,
			l'ADEME et l'INR pour la mise en conformité des services numériques de l’administration
			française et partagé avec l’ensemble des acteurs du numérique.
		</p>
		<p>
			Cette auto-évaluation vous permet de situer le niveau d’écoconception de votre service
			numérique et de l’afficher sur vos outils de communication (<a href="#resultats"
				>en téléchargeant un badge HTML</a
			>). Vous n’êtes pas obligés de répondre à toutes les questions pour obtenir un premier
			résultat. Il est important de réaliser cette évaluation avec l'ensemble de l'équipe et des
			parties prenantes de votre projet. Pour chaque critère, 4 options sont disponibles : À
			évaluer, Conforme, Non conforme et Non applicable dans votre contexte projet. Il est important
			de justifier en commentaire lorsqu'un critère est conforme ou non applicable.
		</p>
	</div>

	<h3>Quel projet auditez-vous ?</h3>
	<div class="audited-project">
		<div>
			<p>
				Merci de renseigner les informations ci-dessous afin de vous aider à remplir plus simplement
				votre livrable d’audit.
			</p>
			<div class="project-info">
				<div class="project-info-line">
					<label for="service-name" class="sr-only">Nom du service à évaluer</label>
					<textarea
						id="service-name"
						rows="1"
						name="service-name"
						on:input={(e) => updateProjectInfo('serviceName', e.target.value)}
						value={audit.projectInfo?.serviceName || ''}
						aria-labelledby="service-name-label"
						aria-describedby="service-name-description"
					></textarea>
				</div>
				<div class="project-info-line">
					<label for="evaluation-entity" class="sr-only">Entité qui procède à l'évaluation</label>
					<textarea
						id="evaluation-entity"
						rows="1"
						name="evaluation-entity"
						on:input={(e) => updateProjectInfo('evaluationEntity', e.target.value)}
						value={audit.projectInfo?.evaluationEntity || ''}
						aria-labelledby="evaluation-entity-label"
						aria-describedby="evaluation-entity-description"
					></textarea>
				</div>
				<div class="project-info-line">
					<label for="responsible-name" class="sr-only">Nom du responsable de l'évaluation</label>
					<textarea
						id="responsible-name"
						rows="1"
						name="responsible-name"
						on:input={(e) => updateProjectInfo('responsibleName', e.target.value)}
						value={audit.projectInfo?.responsibleName || ''}
						aria-labelledby="responsible-name-label"
						aria-describedby="responsible-name-description"
					></textarea>
				</div>
			</div>
		</div>
		<div>
			<p>Échantillon utilisé pour établir le diagnostic</p>
			<p class="description">Listez les pages auditées</p>
			<textarea
				id="samples"
				rows="1"
				name="samples"
				on:input={(e) => updateProjectInfo('samples', e.target.value)}
				value={audit.projectInfo?.samples || ''}
				aria-labelledby="audited-pages-list"
				aria-describedby="audited-pages-list-description"
			></textarea>
		</div>
	</div>

	{#each referential.criteres as critere, index (critere.id)}
		{@const critereId = critere.id.replace('.', '-')}

		{#if isAnotherTheme(critere.thematique)}
			<h3 id={critere.thematique} tabindex="-1">{critere.thematique}</h3>
		{/if}
		<div
			class="criterion"
			id={index === 0 ? 'first-criterion' : critereId}
			data-criterion-id={critereId}
			role="group"
			aria-labelledby="criterion-title-{critereId}"
		>
			<div class="criterion__status">
				<Accordion
					difficulte={critere.difficulte}
					priorite={critere.priorite}
					cible={critere.cible}
					description={critere.description}
					critereId={critere.id}
					critere={critere.critere}
					url={critere.url}
				/>
				<fieldset class="radioButtons" aria-labelledby="criterion-title-{critereId}">
					<label for="status-{critereId}-undefined">
						<input
							on:change={(e) => updateAnswer('status', critere.id, e.target.value)}
							id="status-{critereId}-undefined"
							name="status-{critereId}"
							type="radio"
							value="undefined"
							checked
							aria-describedby="desc-undefined"
						/>
						<span class="radioButtonText">À évaluer</span>
					</label>
					<label for="status-{critereId}-satisfied">
						<input
							on:change={(e) => updateAnswer('status', critere.id, e.target.value)}
							id="status-{critereId}-satisfied"
							name="status-{critereId}"
							type="radio"
							value="satisfied"
							aria-describedby="desc-satisfied"
						/>
						<span class="radioButtonText">Conforme</span>
					</label>
					<label for="status-{critereId}-rejected">
						<input
							on:change={(e) => updateAnswer('status', critere.id, e.target.value)}
							id="status-{critereId}-rejected"
							name="status-{critereId}"
							type="radio"
							value="rejected"
							aria-describedby="desc-rejected"
						/>
						<span class="radioButtonText">Non conforme</span>
					</label>
					{#if critere.cible.startsWith('N/A')}
						<label for="status-{critereId}-not-applicable">
							<input
								on:change={(e) => updateAnswer('status', critere.id, e.target.value)}
								id="status-{critereId}-not-applicable"
								name="status-{critereId}"
								type="radio"
								value="not-applicable"
								aria-describedby="desc-not-applicable"
							/>
							<span class="radioButtonText">Non applicable</span>
						</label>
					{/if}
				</fieldset>
			</div>
			<div class="criterion__analysis">
				<h4 id="criterion-title-{critereId}">
					Évolutions potentielles
					{#if critere.cible === 'Applicable à tous les services'}
						<span aria-label="requis">*</span>
					{/if}
				</h4>
				<p class="description">Indiquer les évolutions potentielles pour ce critère*</p>
				<label for="analysis-{critere.id}" class="sr-only"
					>Votre évolutions potentielles pour le critère {critere.id}</label
				>
				<textarea
					on:input={(e) => updateAnswer('analysis', critere.id, e.target.value)}
					id="analysis-{critere.id}"
					name="analysis-{critere.id}"
					placeholder="Décrivez les évolutions potentielles pour ce critère..."
					aria-labelledby="criterion-title-{critereId}"
					aria-describedby="desc-evolution-{critereId}"
				></textarea>
			</div>
		</div>
	{/each}

	<div class="button-row">
		<button
			class="fr-btn tooltip-container"
			aria-describedby="tooltip-2989"
			id="check-audit-btn"
			type="button"
			on:click={(e) => checkAudit(e)}
			aria-label="Vérifier la complétude de mon audit"
		>
			Vérifier mon audit
		</button>
		<span
			class="fr-tooltip fr-placement small-tooltip"
			id="tooltip-2989"
			role="tooltip"
			aria-hidden="true"
		>
			<p>Nous vérifions si vous n’avez pas oublié de remplir des champs !</p>
		</span>
		<button
			class="fr-btn"
			type="button"
			on:click={handleExportRequest}
			disabled={isExporting}
			aria-label="Exporter l'audit au format Excel, taille estimée: {estimatedFileSize}"
		>
			{isExporting ? 'Export en cours...' : `Exporter en Excel (~${estimatedFileSize})`}
		</button>
	</div>
</form>

<style>
	/* Lien d'évitement pour l'accessibilité */
	.skip-link {
		position: absolute;
		top: -40px;
		left: 6px;
		background: var(--cl-blue);
		color: white;
		padding: 8px;
		text-decoration: none;
		border-radius: 0 0 4px 4px;
		z-index: 1000;
		transition: top 0.3s;
	}

	.skip-link:focus {
		top: 0;
	}
	.fr-tooltip {
		padding: 10px;
		width: 200px;
	}

	.form-header {
		padding: 0 15px;
	}
	.criterion {
		padding: 30px 15px;
	}
	.about {
		padding: 0 15px;
	}

	.audited-project {
		display: flex;
		flex-direction: column;
		padding: 0 15px;
		gap: 16px;

		p {
			padding: 0;
			margin: 0;
			margin-bottom: 10px;
		}
	}
	.project-info {
		width: 100%;
		display: flex;
		gap: 16px;
	}

	.project-info-line {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		label {
			height: auto;
		}

		textarea {
			height: auto;
		}
	}

	.radioButtons {
		margin-top: 16px;
		margin-bottom: 16px;
		display: flex;
		border: none;
		gap: 16px;
	}
	p {
		font-size: 14px;
		padding: 10px 0;
		align-items: center;
	}
	.criterion__status > :global(.acordion) {
		width: 100%;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	h3 {
		display: flex;
		background-color: var(--cl-blue);
		color: #fff;
		margin: 2em 0 0.5em 0;
		padding: 8px;
		height: 32px;
		position: sticky;
		align-items: center;
		z-index: 1;
		scroll-margin-top: 4em;
		top: 68px;
		font-size: 16px;
	}
	.description {
		color: var(--light-text-mention-grey, #666);
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		line-height: 20px;
		margin: 0;
		margin-bottom: 8px;
	}
	h4 {
		font-size: 1em;
		margin-bottom: 0;
		font-weight: normal;
		font-size: 16px;
	}

	label {
		display: flex;
		align-items: center;
		margin-right: 7px;
		height: 100%;
		color: var(--cl-darkgray);
		font-size: 0.9em;
	}

	.radioButtonText {
		display: inline-block;
		font-size: 16px;
		white-space: nowrap;
	}

	.criterion__analysis label {
		left: -9999px;
		position: absolute;
	}
	label input:checked {
		accent-color: var(--cl-blue);
	}
	input {
		margin: 100px 0.5em 100px 100px;
		width: 16px;
		height: 16px;
		vertical-align: middle;
	}
	input:checked + span {
		color: var(--cl-black);
	}

	span {
		align-items: center;
	}

	textarea {
		display: block;
		padding: 8px 16px;
		border-bottom: black 2px solid;
		width: 100%;
		box-sizing: border-box;
		height: 75px;
		border-radius: 4px 4px 0px 0px;
		background: var(--light-background-contrast-grey, #eee);
		resize: none;
		overflow-y: auto;
		font-family: inherit;
		font-size: 14px;
		line-height: 1.4;
	}

	:global(.banner) {
		display: flex;
		height: 7em;
		position: relative;
		margin-bottom: 1em;
	}
	:global(.banner.complete) {
		border: 1px solid #2e7d32;
	}
	:global(.banner.incomplete) {
		border: 1px solid #d32f2f;
	}
	:global(.banner__icon) {
		display: flex;
		justify-content: center;
		font-size: 1.5em;
		width: 2em;
		color: white;
	}
	:global(.banner__img-icon) {
		width: 30px;
		height: 30px;
		margin-top: 40%;
	}
	:global(.banner.complete .banner__icon) {
		background-color: #2e7d32;
	}
	:global(.banner.incomplete .banner__icon) {
		background-color: #d32f2f;
	}
	:global(.banner__content) {
		align-items: center;
		padding-left: 2em;
		margin-top: 1%;
	}
	:global(.banner__content strong) {
		font-size: 1.5em;
	}
	:global(.banner__content span) {
		font-size: 1.1em;
		color: inherit;
		margin-top: 0.5em;
		display: block;
	}

	.sommaire {
		padding: 30px 30px 30px;
	}

	ol {
		list-style-type: decimal;
		padding-left: 1.5em;
		font-size: 16px;
		line-height: 24px;
		margin-left: 0;
	}

	ol li {
		margin-bottom: 5px;
	}

	ol li::marker {
		color: #000091;
		font-weight: 400;
	}

	ol li a {
		color: #000091;
		display: inline-block;
		font-weight: 400;
	}

	#diagnostic {
		padding-bottom: 2em;
		box-sizing: border-box;
	}

	input[type='radio'] {
		vertical-align: middle;
		margin: 0 8px 0 0;
		vertical-align: middle;
	}

	.radioButtons label {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: 48px;
		line-height: 1;
		margin: 0;
		box-sizing: border-box;
	}

	.radioButtons input[type='radio'] {
		margin-right: 8px;
		flex-shrink: 0;
	}

	.button-row {
		display: flex;
		justify-content: flex-end;
		gap: 30px;
		margin-top: 2em;
		padding: 0 15px;
	}
</style>
