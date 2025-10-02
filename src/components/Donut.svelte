<script>
	import { onMount, tick } from 'svelte';

	export let counters;
	export let nbOfCriteria;

	$: rates = [
		((counters.satisfied / nbOfCriteria) * 100).toFixed(2), // taux conforme
		((counters.rejected / nbOfCriteria) * 100).toFixed(2), // taux non conforme
		((counters.notApplicable / nbOfCriteria) * 100).toFixed(2), // taux non applicable
		(
			((nbOfCriteria - (counters.satisfied + counters.rejected + counters.notApplicable)) /
				nbOfCriteria) *
			100
		).toFixed(2) // taux non évalué
	];

	function updateDonut(rates) {
		const circleElms = document.querySelectorAll('.donut circle:not(.border-circle)');
		const borderCircle = document.querySelector('.donut circle.border-circle');
		const radius = 92.5;
		const circumference = 2 * Math.PI * radius;
		let i = 0;
		let spaceLeft = circumference;

		for (const rate of rates) {
			if (rate > 0) {
				circleElms[i].style.strokeDasharray = `${spaceLeft} ${circumference}`;
				spaceLeft -= (rate / 100) * circumference;
				circleElms[i].style.display = 'initial';
			} else {
				circleElms[i].style.display = 'none';
			}
			i++;
		}

		// Synchroniser la bordure avec le dernier segment (non évalué)
		const lastSegmentRate = rates[rates.length - 1];
		if (lastSegmentRate > 0) {
			const lastCircle = circleElms[circleElms.length - 1];
			if (lastCircle) {
				borderCircle.style.strokeDasharray = lastCircle.style.strokeDasharray;
				borderCircle.style.strokeDashoffset = lastCircle.style.strokeDashoffset;
				borderCircle.style.display = 'initial';
			}
		} else {
			borderCircle.style.display = 'none';
		}
	}

	onMount(async () => {
		await tick();
		updateDonut(rates);
	});

	$: (async () => {
		await tick();
		updateDonut(rates);
	})();
</script>

<div class="donut-wrapper">
	<svg viewBox="0 0 255 255" class="donut" aria-hidden="true" focusable="false">
		<circle cx="127.5" cy="127.5" r="92.5" />
		<circle cx="127.5" cy="127.5" r="92.5" />
		<circle cx="127.5" cy="127.5" r="92.5" />
		<circle cx="127.5" cy="127.5" r="92.5" class="border-circle" />
		<circle cx="127.5" cy="127.5" r="92.5" />
	</svg>
</div>

<style>
	.donut-wrapper {
		aspect-ratio: 1; /* maintient un cercle parfait */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.donut {
		width: 150px;
		height: 150px;
		fill: none;
		stroke-width: 60px;
		transform: rotate(-90deg);
	}

	.donut circle:first-of-type {
		stroke: var(--cl-green);
	}
	.donut circle:nth-of-type(2) {
		stroke: var(--cl-red);
	}
	.donut circle:nth-of-type(3) {
		stroke: var(--cl-blue);
	}
	.donut circle:last-of-type {
		stroke: var(--cl-lightgray);
		stroke-width: 57px;
	}

	/* Bordure magenta pour le segment non évalué */
	.donut circle.border-circle {
		stroke: #6a6af4;
		stroke-width: 60px; /* Plus large pour créer la bordure externe */
		z-index: -1; /* Placer derrière le segment gris */
	}
</style>
