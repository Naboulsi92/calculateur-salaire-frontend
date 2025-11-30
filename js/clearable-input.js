/**
 * Composant Input Effaçable (Inspiré de clearable-input.component.ts)
 * Gère l'affichage d'un bouton de suppression, la validation numérique et le formatage.
 */
class ClearableInput {
    /**
     * @param {string} elementId - L'ID de l'élément input
     * @param {Object} options - Options de configuration
     * @param {string} options.type - 'text' ou 'number'
     * @param {number} options.decimals - Nombre de décimales pour le formatage (si type='number')
     */
    constructor(elementId, options = {}) {
        this.input = document.getElementById(elementId);
        if (!this.input) {
            console.warn(`ClearableInput: Element with id '${elementId}' not found.`);
            return;
        }

        this.options = Object.assign({
            type: 'text',
            decimals: null,
            maxlength: 999999,
            minlength: 0
        }, options);

        this.wrapper = null;
        this.clearBtn = null;

        this.init();
    }

    init() {
        this.wrapInput();
        this.createClearButton();
        this.applyAttributes();
        this.bindEvents();
    }

    applyAttributes() {
        if (this.options.maxlength !== null) {
            this.input.setAttribute('maxlength', this.options.maxlength);
        }
        if (this.options.minlength !== null) {
            this.input.setAttribute('minlength', this.options.minlength);
        }
    }

    wrapInput() {
        // Créer un conteneur relatif pour positionner le bouton "X"
        const parent = this.input.parentNode;
        const wrapper = document.createElement('div');
        wrapper.className = 'clearable-input-container position-relative';
        
        // Insérer le wrapper avant l'input, puis déplacer l'input dedans
        parent.insertBefore(wrapper, this.input);
        wrapper.appendChild(this.input);
        this.wrapper = wrapper;
        
        // Ajuster le padding de l'input pour ne pas chevaucher le bouton
        this.input.style.paddingRight = '30px';
    }

    createClearButton() {
        const btn = document.createElement('span');
        btn.innerHTML = '&times;'; // Symbole multiplication (X)
        btn.className = 'clear-input-btn';
        btn.style.display = 'none'; // Masqué par défaut
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', 'Effacer la saisie');
        
        this.wrapper.appendChild(btn);
        this.clearBtn = btn;
    }

    bindEvents() {
        // Gestion de l'affichage du bouton "X"
        this.input.addEventListener('input', () => this.toggleClearButton());
        this.input.addEventListener('focus', () => this.toggleClearButton());
        
        // Délai sur le blur pour permettre le clic sur le bouton "X"
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.toggleClearButton(false), 200);
            if (this.options.type === 'number') {
                this.formatNumber();
            }
        });

        // Clic sur le bouton "X"
        this.clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clear();
        });

        // Validation pour les nombres
        if (this.options.type === 'number') {
            this.input.addEventListener('keydown', (e) => this.preventInvalidCharacters(e));
            // Empêcher le 'e' pour les exposants si c'est un input type number (bien que ici on utilise text)
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                }
            });
        }
    }

    toggleClearButton(forceState) {
        if (!this.clearBtn) return;

        // Si l'input est désactivé ou readonly, on ne montre pas le bouton
        if (this.input.disabled || this.input.readOnly) {
            this.clearBtn.style.display = 'none';
            return;
        }

        const hasValue = this.input.value.length > 0;
        const isVisible = forceState !== undefined ? forceState : hasValue;

        // On affiche seulement s'il y a une valeur ET (qu'on force l'affichage OU qu'on a le focus)
        // Pour simplifier l'UX : on affiche tant qu'il y a du texte, c'est plus standard sur mobile
        this.clearBtn.style.display = hasValue ? 'block' : 'none';
    }

    clear() {
        this.input.value = '';
        this.input.focus();
        this.toggleClearButton();
        
        // Déclencher l'événement 'input' pour que les scripts externes (script.js) réagissent
        this.input.dispatchEvent(new Event('input'));
    }

    preventInvalidCharacters(e) {
        // Autoriser les touches de contrôle de navigation et d'édition
        const allowedControlKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
            'Home', 'End'
        ];

        // Autoriser les raccourcis clavier (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
        if (e.ctrlKey || e.metaKey) {
            return;
        }

        // Autoriser les touches de contrôle
        if (allowedControlKeys.includes(e.key)) {
            return;
        }

        // Autoriser uniquement les chiffres, le point et la virgule
        // e.key contient la valeur du caractère généré par la touche
        if (!/^[0-9.,]$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        // Empêcher la saisie de plusieurs points ou virgules
        if ((e.key === '.' || e.key === ',') && (this.input.value.includes('.') || this.input.value.includes(','))) {
            // Vérifier si le caractère existant est sélectionné (donc va être remplacé)
            const selectionStart = this.input.selectionStart;
            const selectionEnd = this.input.selectionEnd;
            const value = this.input.value;
            const existingSeparatorIndex = value.indexOf('.') !== -1 ? value.indexOf('.') : value.indexOf(',');
            
            // Si la sélection ne couvre pas le séparateur existant, on bloque
            if (existingSeparatorIndex === -1 || (selectionStart > existingSeparatorIndex || selectionEnd <= existingSeparatorIndex)) {
                e.preventDefault();
            }
        }
    }

    formatNumber() {
        if (this.options.decimals !== null && this.input.value) {
            // Supprimer les espaces et remplacer virgule par point pour le parsing
            let valStr = this.input.value.replace(/\s+/g, '').replace(',', '.');
            let val = parseFloat(valStr);
            
            if (!isNaN(val)) {
                // Formater avec le nombre de décimales
                this.input.value = val.toFixed(this.options.decimals);
                // Déclencher input pour mettre à jour les calculs si nécessaire
                this.input.dispatchEvent(new Event('input'));
            }
        }
    }
}
