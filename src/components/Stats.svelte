<script>
	import { calculateConformity } from '../utils/index.js';

	export let counters;
	export let nbOfCriteria;
	export let referential;
	export let audit;
	let conformity;

	$: assessed = counters.satisfied + counters.rejected + counters.notApplicable;
	$: conformity = calculateConformity(audit, referential);
</script>

<table>
	<tbody>
		<!-- Obligatoire -->
		<tr>
			<th>Total critères</th>
			<td>{nbOfCriteria}</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<th class="donut-ref notEvaluated">À évaluer</th>
			<td>{nbOfCriteria - assessed}</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<th class="donut-ref satisfied">Conformes</th>
			<td>{counters.satisfied}</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<th class="donut-ref rejected">Non conformes</th>
			<td>{counters.rejected}</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<th class="donut-ref not-applicable">Non applicables</th>
			<td>{counters.notApplicable}</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<th>Conformité <br />({assessed} critères évalués)</th>
			<td>{conformity !== 'NaN' ? conformity + ' %' : 'Indisponible'}</td>
		</tr>
	</tbody>
</table>

<style>
	.donut-ref::before {
		content: '';
		display: inline-block;
		height: 9px;
		margin-right: 0.5em;
		vertical-align: middle;
		width: 9px;
	}

	.donut-ref.notEvaluated::before {
		background-color: var(--cl-lightgrayblue);
		border: solid 1px #6a6af4;
	}

	.donut-ref.satisfied::before {
		background-color: var(--cl-green);
	}

	.donut-ref.rejected::before {
		background-color: var(--cl-red);
	}

	.donut-ref.not-applicable::before {
		background-color: var(--cl-blue);
	}

	table {
		border-collapse: collapse;
		width: 100%;
		table-layout: fixed;
		word-break: break-word;
	}

	th,
	td {
		border-bottom: solid 1px;
		padding: 0.25em;
		text-align: left;
		max-width: 200px;
		overflow-wrap: break-word;
		word-break: break-word;
		white-space: normal;
	}

	th {
		min-width: 120px;
		font-weight: normal;
	}

	td {
		text-align: right;
	}
</style>
