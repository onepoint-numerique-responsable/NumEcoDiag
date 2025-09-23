<script>
	/* ### VARIABLES ### */

	import Navigation from './components/Navigation.svelte';
	import Results from './components/Results.svelte';
	import AuditForm from './components/AuditForm.svelte';
	import Options from './components/Options.svelte';
	import About from './components/About.svelte';
	import Header from './components/Header.svelte';
	import ExcelJS from 'exceljs';
	import { calculateAssessmentStats, calculateConformity } from './utils/index.js';

	// Variables d'état de l'application
	let referential = null;
	const index = 0;
	const defaultVersion = 'v2';

	// Initialise la structure d'audit par défaut
	function getDefaultAudits() {
		return [
			{
				byCriteria: {},
				byCounters: {
					satisfied: 0,
					rejected: 0,
					notApplicable: 0
				},
				projectInfo: {
					serviceName: '',
					evaluationEntity: '',
					responsibleName: '',
					samples: ''
				},
				selectedVersion: defaultVersion
			}
		];
	}

	// Charge les audits sauvegardés depuis localStorage lors de l'initialisation uniquement
	const audits = (() => {
		try {
			const savedAudits = window.localStorage.getItem('audits');
			return savedAudits ? JSON.parse(savedAudits) : getDefaultAudits();
		} catch (error) {
			console.warn('Échec du chargement des audits sauvegardés :', error);
			return getDefaultAudits();
		}
	})();
	let auditFormComponent;

	/* ### FUNCTIONS ### */

	function handleCheckAudit() {
		if (auditFormComponent && auditFormComponent.checkAudit) {
			auditFormComponent.checkAudit(); // appel direct à la fonction dans auditform
		}
	}

	async function getRGESN(versionToLoad) {
		try {
			const response = await fetch(`./rgesn/${versionToLoad}.json`);
			if (!response.ok) {
				throw new Error(`Échec du chargement du référentiel : ${response.status}`);
			}
			const data = await response.json();
			referential = data;
		} catch (error) {
			// Utilise une gestion d'erreur plus conviviale pour la production
			const message = `Impossible de charger le référentiel v${versionToLoad}`;
			console.warn(message, error);
			// Pourrait afficher une notification utilisateur au lieu de console.error
		}
	}

	function resetAudit(currentVersion = defaultVersion) {
		if (
			confirm(
				"Attention : cette action entraîne la perte de toutes les données non exportées saisies jusqu'à présent. Souhaitez-vous poursuivre ?"
			)
		) {
			// Met à jour les valeurs runtime
			audits[index].byCriteria = {};
			audits[index].byCounters.satisfied = 0;
			audits[index].byCounters.rejected = 0;
			audits[index].byCounters.notApplicable = 0;
			audits[index].selectedVersion = currentVersion;
			// Met à jour le stockage
			window.localStorage.setItem('audits', JSON.stringify(audits));
			// Met à jour la vue
			window.location.reload();
			return true;
		}
		return false;
	}

	function updateAudit(e) {
		const criterion = {
			prop: e.prop,
			id: e.criterionId,
			value: e.value
		};
		// Si nécessaire, initialise les valeurs pour le critère
		if (!audits[index].byCriteria[criterion.id]) {
			audits[index].byCriteria[criterion.id] = {
				status: 'undefined',
				analysis: ''
			};
		}
		// Si le statut a changé, met à jour les compteurs
		if (criterion.prop === 'status') {
			const oldStatus = audits[index].byCriteria[criterion.id].status;
			const newStatus = criterion.value;
			if (oldStatus !== 'undefined') {
				switch (oldStatus) {
					case 'satisfied':
						audits[index].byCounters.satisfied--;
						break;
					case 'rejected':
						audits[index].byCounters.rejected--;
						break;
					case 'not-applicable':
						audits[index].byCounters.notApplicable--;
						break;
				}
			}
			if (newStatus !== 'undefined') {
				switch (newStatus) {
					case 'satisfied':
						audits[index].byCounters.satisfied++;
						break;
					case 'rejected':
						audits[index].byCounters.rejected++;
						break;
					case 'not-applicable':
						audits[index].byCounters.notApplicable++;
						break;
				}
			}
		}
		// Définit la nouvelle valeur et sauvegarde l'audit mis à jour
		audits[index].byCriteria[criterion.id][criterion.prop] = criterion.value;
		window.localStorage.setItem('audits', JSON.stringify(audits));
	}

	function updateProjectInfo(field, value) {
		// Initialize projectInfo if it doesn't exist
		if (!audits[index].projectInfo) {
			audits[index].projectInfo = {
				serviceName: '',
				evaluationEntity: '',
				responsibleName: '',
				samples: ''
			};
		}

		// Update the specific field
		audits[index].projectInfo[field] = value;

		// Save to localStorage
		window.localStorage.setItem('audits', JSON.stringify(audits));
	}

	getRGESN(audits[index].selectedVersion);

	async function createCopyAudit() {
		try {
			const response = await fetch('/assets/input.xlsx');
			if (!response.ok) {
				throw new Error(`Échec du chargement du modèle : ${response.status}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			const sourceWorkbook = new ExcelJS.Workbook();
			await sourceWorkbook.xlsx.load(arrayBuffer);

			const newWorkbook = new ExcelJS.Workbook();

			// Copie plus efficace des feuilles
			sourceWorkbook.eachSheet((sheet) => {
				const newSheet = newWorkbook.addWorksheet(sheet.name);

				// Copie d'abord les propriétés de la feuille
				newSheet.properties = { ...sheet.properties };

				// Copie les lignes et cellules par lot
				sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
					const newRow = newSheet.getRow(rowNumber);

					row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
						const newCell = newRow.getCell(colNumber);

						// Gère les formules plus efficacement
						if (cell.value?.formula) {
							newCell.value = {
								formula: cell.value.formula,
								result: cell.value.result
							};
						} else {
							newCell.value = cell.value;
						}

						// Copie le style
						newCell.style = { ...cell.style };
					});

					newRow.height = row.height;
					newRow.commit();
				});

				// Copie les propriétés des colonnes
				sheet.columns.forEach((col, index) => {
					if (col.width) {
						newSheet.getColumn(index + 1).width = col.width;
					}
				});

				// Copie les cellules fusionnées
				if (sheet.model.merges) {
					sheet.model.merges.forEach((mergeRange) => {
						newSheet.mergeCells(mergeRange);
					});
				}
			});

			return newWorkbook;
		} catch (error) {
			throw new Error(`Échec de la copie du modèle : ${error.message}`);
		}
	}

	function reformatData(data) {
		switch (data.status) {
			case 'satisfied':
				data.status = 'Conforme';
				break;
			case 'rejected':
				data.status = 'Non conforme';
				break;
			case 'not-applicable':
				data.status = 'Non applicable';
				break;
			default:
				data.status = 'À évaluer';
				break;
		}
		return data;
	}

	function writeData(worksheet) {
		const data = audits[index].byCriteria;
		const projectInfo = audits[index].projectInfo || {};

		console.log('🔍 Debug writeData - Début fonction');
		console.log('📊 Worksheet name:', worksheet.name);
		console.log('📝 ProjectInfo data:', projectInfo);
		console.log('🗂️ audits[index]:', audits[index]);

		let idColumn = null;
		let evalColumn = null;
		let potentialEvolColumn = null;
		let dateColumn = null;
		worksheet.getCell('C11').value = new Date().toLocaleDateString();

		// Write project information to specific cells (corresponding to pink highlighted rows in Excel)
		console.log("✏️ Tentative d'écriture des projectInfo...");

		if (projectInfo.serviceName) {
			console.log('✅ Écriture serviceName:', projectInfo.serviceName, 'dans cellule D5');
			worksheet.getCell('C5').value = projectInfo.serviceName; // Nom du service évalué
		} else {
			console.log('❌ serviceName vide ou undefined');
		}

		if (projectInfo.samples) {
			console.log('✅ Écriture samples:', projectInfo.samples, 'dans cellule D6');
			worksheet.getCell('C6').value = projectInfo.samples; // Échantillons utilisés
		} else {
			console.log('❌ samples vide ou undefined');
		}

		if (projectInfo.evaluationEntity) {
			console.log('✅ Écriture evaluationEntity:', projectInfo.evaluationEntity, 'dans cellule D7');
			worksheet.getCell('C7').value = projectInfo.evaluationEntity; // Entité qui procède à l'évaluation
		} else {
			console.log('❌ evaluationEntity vide ou undefined');
		}

		if (projectInfo.responsibleName) {
			console.log('✅ Écriture responsibleName:', projectInfo.responsibleName, 'dans cellule D8');
			worksheet.getCell('C8').value = projectInfo.responsibleName; // Nom du responsable
		} else {
			console.log('❌ responsibleName vide ou undefined');
		}

		// Vérification des cellules après écriture
		console.log('🔍 Vérification des cellules après écriture:');
		console.log('D5 value:', worksheet.getCell('D5').value);
		console.log('D6 value:', worksheet.getCell('D6').value);
		console.log('D7 value:', worksheet.getCell('D7').value);
		console.log('D8 value:', worksheet.getCell('D8').value);

		//Trouve l'emplacement des colonnes
		worksheet.getRow(2).eachCell((cell, colNumber) => {
			// on evite la ligne 1 qui est le titre
			if (cell.value === 'ID') idColumn = colNumber;
			if (cell.value === 'Évaluation') evalColumn = colNumber;
			if (cell.value === 'Évolutions\npotentielles') potentialEvolColumn = colNumber;
			if (cell.value === 'Date de\nl’évaluation') dateColumn = colNumber;
		});

		if (!idColumn || !evalColumn || !potentialEvolColumn || !dateColumn) {
			console.error(
				"Colonnes ID, Évaluation, Date de l'évaluation ou Evolutions potentielles introuvables !"
			);
			return;
		}

		for (let i = 3; i <= worksheet.rowCount; i++) {
			// on commence a 3 pour esquiver les entetes
			const id = worksheet.getRow(i).getCell(idColumn).value;

			if (data[id]) {
				data[id] = reformatData(data[id]);
				const evalCell = worksheet.getRow(i).getCell(evalColumn);
				const dateCell = worksheet.getRow(i).getCell(dateColumn);
				const potentialEvolCell = worksheet.getRow(i).getCell(potentialEvolColumn);

				//Ecrit dans les cellules
				if (worksheet.getRow(i - 1).getCell(idColumn).value !== id) {
					// Vu que la ligne des id est fusionnée, on vérifie si l'id est différent de la ligne précédente
					evalCell.value = data[id].status;
					dateCell.value = new Date().toLocaleDateString();
					potentialEvolCell.value = data[id].analysis;
				}
			}
		}
		return worksheet;
	}

	async function exportAudit() {
		try {
			const newWorkbook = await createCopyAudit();

			newWorkbook.eachSheet((sheet) => {
				writeData(sheet);
			});

			const buffer = await newWorkbook.xlsx.writeBuffer();
			if (!(buffer instanceof Uint8Array)) {
				throw new Error('Format de buffer invalide généré');
			}

			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});

			// Téléchargement plus efficace sans manipulation DOM
			const url = URL.createObjectURL(blob);
			const aElm = document.createElement('a');
			aElm.href = url;
			aElm.download = `numecodiag-audit-${new Date().toISOString().split('T')[0]}.xlsx`;
			aElm.style.display = 'none';

			document.body.appendChild(aElm);
			aElm.click();
			document.body.removeChild(aElm);

			// Nettoie l'URL pour éviter les fuites mémoire
			URL.revokeObjectURL(url);
		} catch (error) {
			// Meilleure gestion d'erreur orientée utilisateur
			const message = "Erreur lors de l'export Excel. Veuillez réessayer.";
			console.warn('Erreur export :', message, error);
		}
	}

	function buildBadge() {
		// Meilleure notification utilisateur - pourrait être remplacée par un toast en production
		const message =
			'Retrouvez votre badge en HTML dans votre dossier téléchargements. ' +
			'Vous pouvez afficher ce badge dans vos communications lorsque 100% des critères sont évalués.';

		// Utilise confirm pour une meilleure UX
		if (!confirm('Télécharger le badge NumÉcoDiag ?\n\n' + message)) {
			return;
		}

		const nbOfCriteria = referential.criteres.length;
		const counters = audits[index].byCounters;
		const { assessedPercent } = calculateAssessmentStats(counters, nbOfCriteria);
		const score = calculateConformity(audits[index], referential);

		// Génération HTML plus maintenable avec structure appropriée
		const badgeHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Badge NumÉcoDiag</title>
	<style>
		.numecodiag-badge {
			display: flex;
			align-items: center;
			gap: 1em;
			max-width: 60ch;
			padding: 1em;
			border: 1px solid #ddd;
			border-radius: 8px;
			font-family: Arial, sans-serif;
			line-height: 1.4;
		}
		.numecodiag-badge img {
			flex-shrink: 0;
			width: 64px;
			height: auto;
		}
		.numecodiag-badge a {
			color: #000091;
			text-decoration: underline;
		}
	</style>
</head>
<body>
	<div class="numecodiag-badge">
		<img src="data:image/png;base64,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" alt="Logo MiNum_Eco">
		<p>Après auto-évaluation, ce service numérique a un taux de conformité de <strong>${score}%</strong> pour <strong>${assessedPercent}%</strong> des critères évalués selon le <a href="https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/" target="_blank" rel="noopener">Référentiel Général d'Écoconception de Services Numériques</a> (RGESN).</p>
	</div>
</body>
</html>`;

		const blob = new Blob([badgeHtml], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const aElm = document.createElement('a');
		aElm.href = url;
		aElm.download = `numecodiag-badge-${new Date().toISOString().split('T')[0]}.html`;
		aElm.style.display = 'none';

		document.body.appendChild(aElm);
		aElm.click();
		document.body.removeChild(aElm);

		// Nettoie l'URL pour éviter les fuites mémoire
		URL.revokeObjectURL(url);
	}

	/* ### INITIALIZATION ### */
	(async () => {
		await getRGESN(defaultVersion);

		// Optimise la restauration de position de défilement - limite les sauvegardes, restaure une fois
		let scrollTimeout;
		const saveScrollPosition = () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				window.localStorage.setItem('scrollPosY', window.scrollY.toString());
			}, 250); // Limite à 250ms
		};

		window.addEventListener('scroll', saveScrollPosition, { passive: true });

		// Restaure la position de défilement une fois
		const savedScrollY = window.localStorage.getItem('scrollPosY');
		if (savedScrollY) {
			window.scrollTo(0, parseInt(savedScrollY, 10) || 0);
		}
	})();
</script>

<main>
	<Navigation />
	<Header />
	{#if referential}
		<div class="stat">
			<Results
				bind:counters={audits[index].byCounters}
				bind:nbOfCriteria={referential.criteres.length}
				bind:audit={audits[index]}
				{referential}
			/>
			<Options
				onExportAudit={exportAudit}
				onCheckAudit={handleCheckAudit}
				onBuildBadge={buildBadge}
				onResetAudit={() => resetAudit(undefined)}
				audit={audits[index]}
			/>
		</div>
		<AuditForm
			bind:this={auditFormComponent}
			{referential}
			{exportAudit}
			updated={updateAudit}
			{updateProjectInfo}
			audit={audits[index]}
		/>
	{/if}
	<About />
</main>

<style>
	:global(main) {
		/* Système de couleurs amélioré avec meilleure sémantique */
		--cl-black: #000;
		--cl-blue: #000091;
		--cl-darkgray: #444;
		--cl-green: #27a658; /* Couleur de succès officielle DSFR */
		--cl-lightgray: #f5f5fe;
		--cl-lightgrayblue: #e3e3fd;
		--cl-red: #e74c3c; /* Rouge amélioré pour l'accessibilité */
		--cl-white: #fff;

		/* Optimisations typographiques et de mise en page */
		font-size: 16px;
		min-width: 600px;
		padding-top: 7px;
		line-height: 1.5; /* Meilleure lisibilité */
	}

	:global(h2) {
		margin-top: 2.5em;
	}

	:global(.page-anchor) {
		padding-top: 2.5em;
	}

	:global(a) {
		color: inherit;
	}

	/* Masquer les icônes de liens externes globalement pour un meilleur design */
	:global(a[target='_blank']::after) {
		display: none !important;
	}

	/* Améliorer la visibilité du focus pour l'accessibilité */
	:global(:focus-visible) {
		outline: 2px solid var(--cl-blue);
		outline-offset: 2px;
	}
</style>
