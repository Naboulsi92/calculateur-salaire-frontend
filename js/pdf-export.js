/**
 * Module d'export PDF pour le Calculateur de Salaire Maroc 2025
 * Génère un bulletin de salaire stylisé au format PDF
 */

// Variable pour stocker les derniers résultats calculés
let derniersResultatsPDF = null;

/**
 * Sauvegarde les résultats pour l'export PDF
 * @param {Object} resultats - Les résultats du calcul
 */
function sauvegarderResultatsPourPDF(resultats) {
    derniersResultatsPDF = resultats;
}

/**
 * Initialise le bouton d'export PDF
 */
function initExportPDF() {
    const btnExportPDF = document.getElementById('btnExportPDF');
    
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', function() {
            if (!derniersResultatsPDF) {
                alert('Veuillez d\'abord effectuer un calcul.');
                return;
            }
            genererPDF(derniersResultatsPDF);
        });
    }
}

/**
 * Génère un PDF stylisé avec les résultats du calcul
 * @param {Object} res - Les résultats du calcul
 */
function genererPDF(res) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;
    
    // Couleurs du thème
    const colors = {
        primary: [16, 185, 129],      // Emerald
        danger: [239, 68, 68],        // Red
        dark: [15, 23, 42],           // Slate 900
        card: [30, 41, 59],           // Slate 800
        text: [248, 250, 252],        // Slate 50
        muted: [148, 163, 184],       // Slate 400
        accent: [245, 158, 11]        // Amber
    };
    
    // Fond sombre
    doc.setFillColor(...colors.dark);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Bandeau supérieur
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BULLETIN DE SALAIRE', pageWidth / 2, 18, { align: 'center' });
    
    // Sous-titre
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Simulation - Loi de Finances Maroc 2025', pageWidth / 2, 28, { align: 'center' });
    
    // Date de génération
    const dateGeneration = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    doc.setFontSize(10);
    doc.text(`Généré le ${dateGeneration}`, pageWidth / 2, 36, { align: 'center' });
    
    yPos = 50;
    
    // Fonction helper pour dessiner une ligne de résultat
    function drawResultLine(label, value, isNegative = false, isHighlight = false, isTotal = false) {
        const lineHeight = isTotal ? 16 : 11;
        
        if (isTotal) {
            // Cadre total avec bordure verte
            doc.setFillColor(20, 60, 50);
            doc.setDrawColor(...colors.primary);
            doc.setLineWidth(0.8);
            doc.roundedRect(margin, yPos - 1, pageWidth - 2 * margin, lineHeight + 3, 3, 3, 'FD');
            
            // Barre latérale verte
            doc.setFillColor(...colors.primary);
            doc.rect(margin, yPos - 1, 3, lineHeight + 3, 'F');
        } else if (isHighlight) {
            // Fond légèrement plus clair pour les sous-totaux
            doc.setFillColor(40, 52, 75);
            doc.roundedRect(margin, yPos - 1, pageWidth - 2 * margin, lineHeight + 1, 2, 2, 'F');
        }
        
        // Label
        doc.setTextColor(...(isTotal ? colors.primary : (isHighlight ? colors.text : colors.muted)));
        doc.setFontSize(isTotal ? 12 : 11);
        doc.setFont('helvetica', isTotal || isHighlight ? 'bold' : 'normal');
        doc.text(label, margin + 5, yPos + (isTotal ? 6 : 5));
        
        // Valeur
        if (isNegative) {
            doc.setTextColor(...colors.danger);
        } else {
            doc.setTextColor(...colors.text);
        }
        doc.setFontSize(isTotal ? 14 : 11);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin - 5, yPos + (isTotal ? 6 : 5), { align: 'right' });
        
        yPos += lineHeight + 2;
    }
    
    // Fonction pour formater les montants
    function fmt(amount, prefix = '') {
        return prefix + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MAD';
    }
    
    // Fonction pour dessiner un titre de section
    function drawSectionTitle(title, color) {
        doc.setFillColor(...colors.card);
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F');
        doc.setTextColor(...color);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 4, yPos + 5.5);
        yPos += 12;
    }
    
    // =====================
    // Section: Rémunération
    // =====================
    drawSectionTitle('RÉMUNÉRATION', colors.accent);
    
    drawResultLine('Salaire de Base Mensuel', fmt(res.salaireDeBase));
    
    if (res.primeAnciennete > 0) {
        drawResultLine('Prime d\'Ancienneté', fmt(res.primeAnciennete));
    }
    if (res.indemniteTransport > 0) {
        drawResultLine('Indemnité de Transport', fmt(res.indemniteTransport));
    }
    if (res.indemnitePanier > 0) {
        drawResultLine('Indemnité de Panier', fmt(res.indemnitePanier));
    }
    
    drawResultLine('TOTAL BRUT', fmt(res.salaireBrutGlobal), false, true);
    
    yPos += 4;
    
    // =====================
    // Section: Cotisations
    // =====================
    drawSectionTitle('COTISATIONS SALARIALES', colors.danger);
    
    drawResultLine('Cotisation CNSS (4.48%)', fmt(res.cotisationCnss, '-'), true);
    
    if (res.cotisationAmo > 0) {
        drawResultLine('Cotisation AMO (2.26%)', fmt(res.cotisationAmo, '-'), true);
    }
    if (res.cotisationCimr > 0) {
        drawResultLine('Cotisation CIMR', fmt(res.cotisationCimr, '-'), true);
    }
    
    const totalCotisations = res.cotisationCnss + res.cotisationAmo + res.cotisationCimr;
    drawResultLine('TOTAL COTISATIONS', fmt(totalCotisations, '-'), true, true);
    
    yPos += 4;
    
    // =====================
    // Section: Fiscalité
    // =====================
    drawSectionTitle('FISCALITÉ', colors.accent);
    
    drawResultLine('Frais Professionnels (déductibles)', fmt(res.fraisPro, '-'));
    drawResultLine('Salaire Net Imposable', fmt(res.salaireNetImposable), false, true);
    
    if (res.reductionFamille > 0) {
        drawResultLine('IR Brut', fmt(res.irBrut));
        drawResultLine('Déduction Charges Familiales', fmt(res.reductionFamille, '-'));
    }
    drawResultLine('Impôt sur le Revenu (IR)', fmt(res.irNet, '-'), true);
    
    yPos += 8;
    
    // =====================
    // Total Net à Payer
    // =====================
    drawResultLine('SALAIRE NET À PAYER', fmt(res.salaireNetMensuel), false, false, true);
    
    // =====================
    // Pied de page
    // =====================
    const footerY = pageHeight - 20;
    doc.setDrawColor(...colors.muted);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    doc.setTextColor(...colors.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce document est une simulation basée sur les règles de la Loi de Finances 2025 du Maroc.', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text('Il ne constitue pas un document officiel et ne peut être utilisé à des fins administratives.', pageWidth / 2, footerY + 10, { align: 'center' });
    doc.text('Calculateur de Salaire Maroc 2025 - © ' + new Date().getFullYear(), pageWidth / 2, footerY + 15, { align: 'center' });
    
    // Téléchargement du PDF
    const fileName = `bulletin_salaire_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initExportPDF);
