/**
 * Script principal pour le Calculateur de Salaire Maroc 2025
 * Implémente les règles de la Loi de Finances 2025.
 */

// ============================================================================
// CONFIGURATION - URL de l'API Backend
// ============================================================================
// En PRODUCTION : URL du backend déployé sur Vercel
// En DÉVELOPPEMENT : Utilisez "http://localhost:3000"
// ============================================================================
const API_BASE_URL = "https://calculateur-salaire-backend.vercel.app";
// const API_BASE_URL = "http://localhost:3000";
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // --- Initialisation des composants ClearableInput ---
    // On initialise les champs avec notre nouveau composant
    new ClearableInput('salaireDeBaseMensuel', { type: 'number', decimals: 2, maxlength: 9, minlength: 0 });
    new ClearableInput('indemniteTransport', { type: 'number', decimals: 0, maxlength: 3, minlength: 0 });
    new ClearableInput('indemnitePanier', { type: 'number', decimals: 0, maxlength: 3, minlength: 0 });
    
    // --- Initialisation des éléments du DOM ---
    const salaireDeBaseMensuelInput = document.getElementById('salaireDeBaseMensuel');
    const dateEmbaucheInput = document.getElementById('dateEmbauche');
    const nbChargesInput = document.getElementById('nbCharges');
    const chkPersonnesCharge = document.getElementById('chkPersonnesCharge');
    const nbChargesContainer = document.getElementById('nbChargesContainer');
    
    const chkIndemniteTransport = document.getElementById('chkIndemniteTransport');
    const indemniteTransportInput = document.getElementById('indemniteTransport');
    const indemniteTransportContainer = document.getElementById('indemniteTransportContainer');
    
    const chkIndemnitePanier = document.getElementById('chkIndemnitePanier');
    const indemnitePanierInput = document.getElementById('indemnitePanier');
    const indemnitePanierContainer = document.getElementById('indemnitePanierContainer');
    
    const chkAMO = document.getElementById('chkAMO');

    const chkCIMR = document.getElementById('chkCIMR');
    const tauxCIMRInput = document.getElementById('tauxCIMR');
    const tauxCIMRContainer = document.getElementById('tauxCIMRContainer');
    const tauxCIMRWrapper = document.getElementById('tauxCIMRWrapper');
    
    const btnCalculer = document.getElementById('btnCalculer');
    const btnReset = document.getElementById('btnReset');
    const resultatCalculDiv = document.getElementById('resultatCalcul');
    const detailsResultatsDiv = document.getElementById('detailsResultats');

    // Initialisation des tooltips Bootstrap
    $('[data-toggle="tooltip"]').tooltip();

    // Initialisation de la date d'embauche à aujourd'hui
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    dateEmbaucheInput.value = formattedToday;
    dateEmbaucheInput.max = formattedToday; // Empêche la sélection d'une date future

    // --- Gestion des Événements ---

    // Checkboxes pour activer/désactiver les champs
    chkPersonnesCharge.addEventListener('change', function() {
        if (this.checked) {
            nbChargesContainer.style.display = 'block';
        } else {
            nbChargesContainer.style.display = 'none';
        }
    });

    chkIndemniteTransport.addEventListener('change', function() {
        indemniteTransportInput.disabled = !this.checked;
        if (this.checked) {
            indemniteTransportContainer.style.display = 'block';
        } else {
            indemniteTransportContainer.style.display = 'none';
        }
        gererChampsSalaireEtBouton();
    });

    chkIndemnitePanier.addEventListener('change', function() {
        indemnitePanierInput.disabled = !this.checked;
        if (this.checked) {
            indemnitePanierContainer.style.display = 'block';
        } else {
            indemnitePanierContainer.style.display = 'none';
        }
        gererChampsSalaireEtBouton();
    });

    chkCIMR.addEventListener('change', function() {
        tauxCIMRInput.disabled = !this.checked;
        if (this.checked) {
            tauxCIMRContainer.style.display = 'block';
            tauxCIMRWrapper.classList.remove('disabled');
        } else {
            tauxCIMRContainer.style.display = 'none';
            tauxCIMRWrapper.classList.add('disabled');
        }
        gererChampsSalaireEtBouton();
    });

    // Initialisation des sliders
    function setupSlider(sliderId, bubbleId) {
        const slider = document.getElementById(sliderId);
        const bubble = document.getElementById(bubbleId);
        
        function updateBubble() {
            const val = slider.value;
            const min = slider.min ? slider.min : 0;
            const max = slider.max ? slider.max : 100;
            const newVal = Number(((val - min) * 100) / (max - min));
            
            bubble.innerHTML = val;
            
            // Ajustement de la position pour suivre le thumb
            // Le thumb a une largeur, donc le centre se déplace de thumbWidth/2 à width - thumbWidth/2
            // On utilise une formule empirique pour centrer la bulle sur le thumb
            bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
        }
        
        slider.addEventListener('input', updateBubble);
        // Initialisation
        updateBubble();
    }

    setupSlider('nbCharges', 'nbChargesBubble');
    setupSlider('tauxCIMR', 'tauxCIMRBubble');

    // Ajout des listeners sur les champs optionnels pour la validation en temps réel
    indemniteTransportInput.addEventListener('input', gererChampsSalaireEtBouton);
    indemnitePanierInput.addEventListener('input', gererChampsSalaireEtBouton);
    tauxCIMRInput.addEventListener('input', gererChampsSalaireEtBouton);

    // Gestion des champs de salaire (Exclusivité mutuelle et activation bouton)
    function gererChampsSalaireEtBouton() {
        const SMIG_2025 = 3266.10;
        const brutVal = parseAndValidateNumber(salaireDeBaseMensuelInput);
        
        const isBrutValid = !isNaN(brutVal) && brutVal >= SMIG_2025;
        const isBrutFilled = salaireDeBaseMensuelInput.value.trim() !== '';

        // Gestion de l'exclusivité et des erreurs visuelles
        if (isBrutFilled) {
            if (!isBrutValid) {
                salaireDeBaseMensuelInput.classList.add('is-invalid');
            } else {
                salaireDeBaseMensuelInput.classList.remove('is-invalid');
            }
        } else {
            salaireDeBaseMensuelInput.disabled = false;
            salaireDeBaseMensuelInput.classList.remove('is-invalid');
        }

        // Validation des champs optionnels
        let optionalsValid = true;
        if (chkIndemniteTransport.checked && isNaN(parseAndValidateNumber(indemniteTransportInput))) optionalsValid = false;
        if (chkIndemnitePanier.checked && isNaN(parseAndValidateNumber(indemnitePanierInput))) optionalsValid = false;
        // tauxCIMR est maintenant un slider, toujours valide (numérique)
        
        // État du bouton Calculer
        if (isBrutValid && optionalsValid) {
            btnCalculer.disabled = false;
        } else {
            btnCalculer.disabled = true;
        }
    }

    salaireDeBaseMensuelInput.addEventListener('input', gererChampsSalaireEtBouton);

    // Bouton Réinitialiser
    btnReset.addEventListener('click', function() {
        document.getElementById('salaryForm').reset();
        resultatCalculDiv.style.display = 'none';
        
        // Réinitialiser l'état des champs désactivés par défaut
        indemniteTransportInput.disabled = true;
        indemnitePanierInput.disabled = true;
        tauxCIMRInput.disabled = true;
        tauxCIMRWrapper.classList.add('disabled');
        
        // Cacher les conteneurs
        nbChargesContainer.style.display = 'none';
        indemniteTransportContainer.style.display = 'none';
        indemnitePanierContainer.style.display = 'none';
        tauxCIMRContainer.style.display = 'none';

        // Réinitialiser les sliders
        nbChargesInput.value = 0;
        tauxCIMRInput.value = 0;
        nbChargesInput.dispatchEvent(new Event('input'));
        tauxCIMRInput.dispatchEvent(new Event('input'));

        // Réinitialiser les champs de salaire
        salaireDeBaseMensuelInput.disabled = false;
        salaireDeBaseMensuelInput.classList.remove('is-invalid');
        btnCalculer.disabled = true;
        
        // Remettre la date du jour
        dateEmbaucheInput.value = `${yyyy}-${mm}-${dd}`;
    });

    // Bouton Calculer
    btnCalculer.addEventListener('click', function() {
        // Récupération des valeurs
        const salaireBrutSaisi = parseAndValidateNumber(salaireDeBaseMensuelInput);
        const dateEmbauche = dateEmbaucheInput.value;
        
        const isPersonnesChargeActive = chkPersonnesCharge.checked;
        const nbCharges = isPersonnesChargeActive ? parseInt(nbChargesInput.value) : 0;
        
        const isTransportActive = chkIndemniteTransport.checked;
        const indemniteTransport = isTransportActive ? parseAndValidateNumber(indemniteTransportInput) : 0;
        
        const isPanierActive = chkIndemnitePanier.checked;
        const indemnitePanier = isPanierActive ? parseAndValidateNumber(indemnitePanierInput) : 0;
        
        const isAMOActive = chkAMO.checked;

        const isCIMRActive = chkCIMR.checked;
        const tauxCIMR = isCIMRActive ? parseInt(tauxCIMRInput.value) : 0;

        if (!isNaN(salaireBrutSaisi)) {
            // Appel API vers le backend Node.js
            const payload = {
                salaireDeBaseMensuel: salaireBrutSaisi,
                dateEmbauche: dateEmbauche,
                nbCharges: nbCharges,
                indemniteTransport: indemniteTransport,
                indemnitePanier: indemnitePanier,
                tauxCIMR: tauxCIMR,
                isCIMRActive: isCIMRActive,
                isTransportActive: isTransportActive,
                isPanierActive: isPanierActive,
                isAMOActive: isAMOActive
            };

            fetch(`${API_BASE_URL}/api/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau ou serveur');
                }
                return response.json();
            })
            .then(resultats => {
                if (resultats.error) {
                    alert('Erreur: ' + resultats.error);
                } else {
                    afficherResultats(resultats);
                }
            })
            .catch(error => {
                console.error('Erreur API:', error);
                alert('Impossible de calculer le salaire. Vérifiez que le serveur backend est démarré (npm start).');
            });
        }
    });

    // --- Fonctions Utilitaires ---

    /**
     * Valide et convertit une entrée utilisateur en nombre.
     * @param {HTMLInputElement} inputElement 
     * @returns {number|NaN}
     */
    function parseAndValidateNumber(inputElement) {
        let value = inputElement.value;
        if (!value) return NaN;

        // Supprimer les espaces pour supporter le copier-coller (ex: "10 000")
        // value = value.replace(/\s+/g, '');
        
        // Validation stricte du format : chiffres, optionnellement un point ou virgule suivi de chiffres
        // Interdit les formats comme "122..." ou "12.34.56"
        if (!/^\d+([.,]\d+)?$/.test(value)) return NaN;

        value = value.replace(',', '.');
        const number = parseFloat(value);
        if (isNaN(number) || number < 0) return NaN;
        return number;
    }

    /**
     * Affiche les résultats dans le DOM.
     */
    function afficherResultats(res) {
        // Sauvegarder les résultats pour l'export PDF (module externe)
        if (typeof sauvegarderResultatsPourPDF === 'function') {
            sauvegarderResultatsPourPDF(res);
        }
        
        const totalCotisations = res.cotisationCnss + res.cotisationAmo + res.cotisationCimr;

        // Helper to set text and visibility
        const setVal = (id, val, isMoney = true, prefix = '') => {
            const el = document.getElementById(id);
            if (el) el.textContent = prefix + (isMoney ? formatMoney(val) : val);
        };
        const showRow = (id, show) => {
            const el = document.getElementById(id);
            if (el) {
                if (show) el.classList.remove('d-none');
                else el.classList.add('d-none');
            }
        };

        setVal('res-salaireDeBase', res.salaireDeBase);
        
        showRow('row-primeAnciennete', res.primeAnciennete > 0);
        setVal('res-primeAnciennete', res.primeAnciennete);

        showRow('row-indemniteTransport', res.indemniteTransport > 0);
        setVal('res-indemniteTransport', res.indemniteTransport);

        showRow('row-indemnitePanier', res.indemnitePanier > 0);
        setVal('res-indemnitePanier', res.indemnitePanier);

        setVal('res-salaireBrutGlobal', res.salaireBrutGlobal);

        setVal('res-cotisationCnss', res.cotisationCnss, true, '-');

        showRow('row-cotisationAmo', res.cotisationAmo > 0);
        setVal('res-cotisationAmo', res.cotisationAmo, true, '-');

        showRow('row-cotisationCimr', res.cotisationCimr > 0);
        setVal('res-cotisationCimr', res.cotisationCimr, true, '-');

        setVal('res-totalCotisations', totalCotisations, true, '-');
        setVal('res-fraisPro', res.fraisPro, true, '-');
        setVal('res-salaireNetImposable', res.salaireNetImposable, true);

        if (res.reductionFamille > 0) {
            showRow('row-irNet-simple', false);
            showRow('group-ir-detailed', true);
            setVal('res-irBrut', res.irBrut, true, '-');
            setVal('res-reductionFamille', res.reductionFamille, true);
            setVal('res-irNet-detailed', res.irNet, true, '-');
        } else {
            showRow('row-irNet-simple', true);
            showRow('group-ir-detailed', false);
            setVal('res-irNet-simple', res.irNet, true, '-');
        }

        setVal('res-salaireNetMensuel', res.salaireNetMensuel, true);

        resultatCalculDiv.style.display = 'block';
        
        // Scroll vers les résultats et focus pour l'accessibilité
        resultatCalculDiv.scrollIntoView({ behavior: 'smooth' });
        resultatCalculDiv.focus();
    }

    function formatMoney(amount) {
        return amount.toFixed(2) + ' MAD';
    }

    // Accessibilité Clavier pour les Toggles (Enter, Espace, Flèches)
    const toggleInputs = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    toggleInputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (!this.checked) this.click();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (this.checked) this.click();
            }
            // Espace est géré nativement par le navigateur pour les checkboxes
        });
    });

    // Validation de la date d'embauche pour empêcher les dates futures
    dateEmbaucheInput.addEventListener('change', function() {
        const enteredDate = new Date(dateEmbaucheInput.value);
        const today = new Date();
        today.setHours(12, 0, 0, 0); // Réinitialiser l'heure pour comparer uniquement les dates

        if (enteredDate > today) {
            dateEmbaucheInput.value = today.toISOString().split('T')[0];
            // alert('La date d\'embauche ne peut pas être une date future.');
        }
    });
});
