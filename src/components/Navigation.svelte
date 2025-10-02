<nav aria-label="Navigation principale">
	<div>
		<svg viewBox="0 0 16 16" xml:space="preserve" aria-hidden="true"
			><g
				><path
					d="M15.7,0.8c-0.1-0.3-0.3-0.5-0.5-0.5C14.9,0.2,8.4-1.1,4.6,2.7C1.3,6,1.9,11.4,2.1,12.9l-1.9,1.9c-0.3,0.3-0.3,0.7,0,1C0.3,15.9,0.5,16,0.7,16s0.4-0.1,0.5-0.2l1.9-1.9c0.5,0.1,1.4,0.2,2.6,0.2c2.3,0,5.4-0.5,7.6-2.7C17.1,7.6,15.8,1.1,15.7,0.8z M12.3,10.4c-2.8,2.8-7.4,2.3-8.9,2.1c-0.2-1.5-0.6-6.1,2.1-8.9c2.8-2.8,7.4-2.3,8.9-2.1C14.7,3,15.1,7.7,12.3,10.4z"
				/><path
					d="M11.6,3.9L7.9,8.6l-1.6-2c-0.2-0.3-0.7-0.4-1-0.1c-0.3,0.2-0.4,0.7-0.1,1l2.1,2.7c0.1,0.2,0.3,0.3,0.5,0.3c0.2,0,0.4-0.1,0.5-0.3l4.2-5.4c0.2-0.3,0.2-0.7-0.1-1C12.2,3.6,11.8,3.6,11.6,3.9z"
				/></g
			><title>Logo NumÉcoDiag</title></svg
		>
		<h1><a href="#header">NumÉcoDiag V2</a></h1>
	</div>
	<ul role="list">
		<li><a href="#resultats" aria-describedby="nav-results-desc">Résultats</a></li>
		<li><a href="#diagnostic" aria-describedby="nav-diagnostic-desc">Diagnostic</a></li>
		<li><a href="#a-propos" aria-describedby="nav-about-desc">À propos</a></li>
	</ul>
	<!-- Hidden descriptions for screen readers -->
	<div class="sr-only">
		<span id="nav-results-desc">Voir les résultats de votre audit</span>
		<span id="nav-diagnostic-desc">Effectuer l'auto-diagnostic RGESN</span>
		<span id="nav-about-desc">À propos de NumÉcoDiag</span>
	</div>
</nav>

<style>
	nav {
		align-items: center;
		background-color: var(--cl-white);
		box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 1fr 2fr;
		left: 0;
		padding: 0.75em;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 1;
	}

	.sr-only {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	div {
		align-items: center;
		display: inline-flex;
	}

	h1 {
		font-size: 1em;
		font-weight: normal;
		margin: 0;
	}

	ul {
		display: flex;
		list-style-type: none;
		padding: 0;
		justify-content: flex-end;
	}

	li + li {
		margin-left: 2em;
	}

	svg {
		width: 36px;
		fill: #000091;
		margin-right: 0.75em;
	}

	a {
		text-decoration: none;
	}
</style>
