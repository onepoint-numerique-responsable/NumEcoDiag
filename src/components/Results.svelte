<script>
	import Donut from './Donut.svelte';
	import Stats from './Stats.svelte';

	export let counters;
	export let audit;
	export let nbOfCriteria;
	export let referential;
</script>

<section id="resultats" class="page-anchor">
	<h2>Résultats</h2>
	<div class="container">
		<Donut {counters} {nbOfCriteria} />
		<Stats class="stats" {referential} {audit} {counters} {nbOfCriteria} />
	</div>
</section>

<style>
	section {
		margin-bottom: 2em;
		padding: 0 15px;
	}

	.container {
		align-items: center;
		display: flex;
		gap: 30px;
	}
</style>
