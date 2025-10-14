// ===== GESTIÓN DE VISUALIZACIÓN DE FUNCIONES =====

const FunctionDisplay = {
    currentFunction: '',
    displayElement: null,

    /**
     * Inicializar display de función
     * @param {string} elementId - ID del elemento contenedor
     */
    init: function(elementId) {
        this.displayElement = document.getElementById(elementId);
        if (!this.displayElement) {
            console.warn(`Elemento ${elementId} no encontrado para FunctionDisplay`);
        }
    },

    /**
     * Actualizar display con código de Blockly
     * @param {Blockly.Workspace} workspace - Workspace de Blockly
     */
    updateFromBlockly: function(workspace) {
        if (!workspace) {
            console.error('Workspace no proporcionado');
            return;
        }

        try {
            const code = javascript.javascriptGenerator.workspaceToCode(workspace);
            this.update(code);
        } catch (error) {
            console.error('Error al generar código desde Blockly:', error);
            this.showError('Error al generar la función');
        }
    },

    /**
     * Actualizar display con código específico
     * @param {string} code - Código JavaScript
     */
    update: function(code) {
        if (!this.displayElement) return;

        this.currentFunction = code;
        
        try {
            const latex = MathUtils.jsToLatex(code);
            this.displayElement.innerHTML = latex;
            
            // Reprocesar MathJax si está disponible
            this.renderMathJax();
            
        } catch (error) {
            console.error('Error al convertir a LaTeX:', error);
            this.showError('Error en la función');
        }
    },

    /**
     * Reprocesar MathJax
     */
    renderMathJax: function() {
        if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([this.displayElement]).catch(error => {
                console.warn('Error al renderizar MathJax:', error);
            });
        }
    },

    /**
     * Mostrar error en el display
     * @param {string} message - Mensaje de error
     */
    showError: function(message) {
        if (this.displayElement) {
            this.displayElement.innerHTML = 
                `<div class="function-error" style="color: #e74c3c; font-style: italic;">
                    ${message}
                 </div>`;
        }
    },

    /**
     * Mostrar función en formato legible
     * @param {string} functionText - Texto de la función
     */
    showPlainText: function(functionText) {
        if (this.displayElement) {
            this.displayElement.innerHTML = 
                `<div class="function-plain" style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    y = ${functionText}
                 </div>`;
        }
    },

    /**
     * Limpiar display
     */
    clear: function() {
        if (this.displayElement) {
            this.displayElement.innerHTML = '';
            this.currentFunction = '';
        }
    },

    /**
     * Obtener función actual
     * @returns {string} Función actual
     */
    getCurrentFunction: function() {
        return this.currentFunction;
    },

    /**
     * Verificar si hay una función válida
     * @returns {boolean} True si hay función válida
     */
    isValid: function() {
        return this.currentFunction && 
               this.currentFunction.trim() !== '' && 
               this.currentFunction !== 'y1 = 0;';
    }
};