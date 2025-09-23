/**
 * Calcule le pourcentage de conformité pondéré selon les coefficients des critères
 * @param {Object} audit - L'audit contenant les statuts des critères
 * @param {Object} referential - Le référentiel contenant les définitions des critères et leurs coefficients
 * @returns {String} - Le pourcentage de conformité formaté (entier) ou 'NaN' si aucun critère applicable
 */

function calculateTotalWeight(referential) {
	let totalWeight = 0;

	if (!referential || !referential.criteres) {
		return totalWeight;
	}

	for (const criterion of referential.criteres) {
		if (criterion.coefficient && criterion.coefficient > 0) {
			totalWeight += criterion.coefficient;
		}
	}

	return totalWeight;
}

export function calculateConformity(audit, referential) {
	let totalWeight = calculateTotalWeight(referential);
	let satisfiedWeight = 0;

	if (!referential || !audit || !audit.byCriteria || totalWeight === 0) {
		return 'NaN';
	}

	for (const criterionId in audit.byCriteria) {
		const criterion = referential.criteres.find((c) => c.id === criterionId);
		if (criterion && criterion.coefficient) {
			const status = audit.byCriteria[criterionId].status;
			const weight = criterion.coefficient;

			if (status !== 'not-applicable' && status !== 'undefined') {
				if (status === 'satisfied') {
					satisfiedWeight += weight;
				}
			}
		}
	}

	// Calcul du pourcentage de conformité pondéré
	return totalWeight > 0 ? ((satisfiedWeight / totalWeight) * 100).toFixed(0) : 'NaN';
}

/**
 * Calcule les statistiques d'évaluation (nombre de critères évalués)
 * @param {Object} counters - L'objet contenant les compteurs par statut
 * @param {Number} nbOfCriteria - Le nombre total de critères dans le référentiel
 * @returns {Object} - Les statistiques d'évaluation
 */
export function calculateAssessmentStats(counters, nbOfCriteria) {
	const assessed = counters.satisfied + counters.rejected + counters.notApplicable;

	const assessedPercent = Math.trunc((assessed / nbOfCriteria) * 100);

	return {
		assessed,
		assessedPercent
	};
}

/**
 * Calcule la taille estimée du fichier Excel en fonction du contenu de l'audit
 * @param {Object} auditData - Les données d'audit contenant les critères remplis
 * @returns {String} - La taille estimée formatée (KB ou MB)
 */
export function calculateEstimatedFileSize(auditData) {
	// Taille de base après traitement ExcelJS (mesurée : 63KB)
	const baseFileSize = 63;
	let additionalSize = 0;

	if (auditData?.byCriteria) {
		let totalTextLength = 0;
		let filledCells = 0;

		// Premier passage : compter le texte total et les cellules
		Object.values(auditData.byCriteria).forEach((criteria) => {
			if (criteria.analysis) {
				totalTextLength += criteria.analysis.length;
				filledCells++;
			}
			if (criteria.status && criteria.status !== 'undefined') {
				filledCells++;
			}
		});

		// Modèle de compression non linéaire basé sur des données empiriques :
		// Petit texte : ~0.1 octet/car, Grand texte : ~0.043 octet/car
		if (totalTextLength > 0) {
			// Utilise l'efficacité de compression logarithmique
			// La compression s'améliore avec l'augmentation de la longueur du texte
			const compressionRatio = Math.max(0.03, 0.15 - Math.log10(totalTextLength) * 0.02);
			const compressedTextSize = totalTextLength * compressionRatio;

			// Surcharge de cellule : coût fixe par cellule quel que soit la taille du contenu (15 octets par cellule pour les métadonnées Excel)
			const cellOverhead = filledCells * 15;

			additionalSize = compressedTextSize + cellOverhead;
		}

		// N'ajoute la surcharge de métadonnées que s'il y a des données réelles
		if (filledCells > 0) {
			additionalSize += 128; // Surcharge minimale pour les dates et métadonnées
		}
	}

	const totalSizeBytes = baseFileSize * 1024 + additionalSize;
	const totalSizeKB = totalSizeBytes / 1024;

	if (totalSizeKB > 1024) {
		return `${(totalSizeKB / 1024).toFixed(1)} MB`;
	} else {
		return `${Math.round(totalSizeKB)} KB`;
	}
}
