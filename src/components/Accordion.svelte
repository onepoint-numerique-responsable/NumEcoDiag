<script>
	export let priorite = '';
	export let description = '';
	export let difficulte = '';
	export let cible = '';
	export let url = '';
	export let critere = '';
	export let critereId = '';
	let isOpen = false;

	// Génère des IDs uniques pour ARIA
	const accordionId = `accordion-${critereId.replace('.', '-')}`;
	const contentId = `content-${critereId.replace('.', '-')}`;

	function toggleAccordion() {
		isOpen = !isOpen;
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleAccordion();
		}
	}
</script>

<div
	class="accordion"
	role="button"
	tabindex="0"
	aria-expanded={isOpen}
	aria-controls={contentId}
	id={accordionId}
	on:click={toggleAccordion}
	on:keydown={handleKeydown}
	aria-label="Détails du critère {critereId}: {critere}"
>
	<div class="title-row">
		<a
			on:click|stopPropagation
			rel="noreferrer"
			href={url}
			aria-label="Consulter la documentation du critère {critereId} (ouvre dans un nouvel onglet)"
			target="_blank"
		>
			{critereId} : {critere}
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><path
					d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
				/></svg
			>
		</a>
		<img
			class:is-open={isOpen}
			src="static/Arrow.svg"
			alt={isOpen ? 'Réduire le détail' : 'Développer le détail'}
			width="30"
			height="30"
			viewBox="0 0 24 24"
			aria-hidden="true"
		/>
	</div>
	<div class="info-row">
		<span class="left">Cible: {cible}</span>
		<div class="right">
			<span>Priorité: {priorite}</span>
			<span>Difficulté: {difficulte}</span>
		</div>
	</div>
</div>
{#if isOpen}
	<div class="content" id={contentId} role="region" aria-labelledby={accordionId}>
		<div class="description">
			<h2 class="synthese">Synthèse du moyen de test ou de contrôle</h2>
			<p>{description}</p>
		</div>
	</div>
{/if}

<style>
	.accordion {
		background-color: #f6f6fe;
		padding: 10px 0px;
		width: 100%;
		overflow: hidden;
		user-select: none;
		flex-direction: column;
		height: 100%;
		cursor: pointer;
		border: 2px solid transparent;
		border-radius: 4px;
	}

	.accordion:focus {
		outline: none;
		border-color: #000091;
		box-shadow: 0 0 0 2px rgba(0, 0, 145, 0.3);
	}

	.accordion:focus-visible {
		outline: 2px solid #000091;
		outline-offset: 2px;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		position: relative;
		padding-right: 40px;
		font-size: 16px;
		margin: 0;
		width: 100%;
		padding: 0px 10px;
		font-weight: 700;
		margin-bottom: 5px;
		box-sizing: border-box;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}
	.title-row a {
		all: unset;
		display: inline;
		cursor: pointer;
		padding-right: 38px;
		color: inherit;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
		text-decoration-skip-ink: auto;
	}

	.title-row img {
		position: absolute;
		top: 0;
		right: 0;
		margin: 0;
		padding: 0;
		height: 24px;
		width: 24px;
		margin-left: 10px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-items: stretch;
		flex-wrap: wrap;
		height: auto;
		padding: 0 10px;
	}

	.left {
		color: var(--light-background-action-high-blue-france, #000091);
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		line-height: 20px;
		width: 50%;
	}

	.right {
		display: flex;
		gap: 15px;
		color: var(--light-background-action-high-blue-france, #000091);
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		align-items: flex-start;
		padding-top: 0%;
		line-height: 20px;
		height: 100%;
	}

	.synthese {
		color: var(--light-text-action-high-grey, #161616);
		/* Body bold */
		padding-bottom: 5px;
		font-size: 14px;
		font-style: normal;
		font-weight: 700;
		line-height: 24px;
		margin-top: 0;
		margin-bottom: 5px;
	}

	.content {
		margin-top: 25px;
		font-weight: 400;
		font-size: 14px;
		line-height: 24px;
		background-color: white;
	}

	.content p {
		margin: 0;
		padding: 0px 0px;
		font-weight: 300;
		font-size: 14px;
		line-height: 24px;
	}
	.content h2 {
		margin-top: 0;
		margin-bottom: 0;
	}

	img {
		transition: transform 0.3s ease;
		margin-bottom: 3%;
	}

	img.is-open {
		transform: rotate(180deg);
	}

	svg {
		fill: var(--cl-blue);
		height: 12px;
		margin-left: 0.25em;
		vertical-align: middle;
		width: 12px;
		text-decoration: none;
	}

	.description {
		padding: 10px 10px;
	}
</style>
