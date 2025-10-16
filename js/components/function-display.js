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
            // USAR FORMATO SIMPLE EN LUGAR DE LaTeX PARA EVITAR "frac"
            const simpleExpression = this.convertToSimpleFormat(code);
            this.showPlainText(simpleExpression);
            
        } catch (error) {
            console.error('Error al convertir a formato simple:', error);
            this.showError('Error en la función');
        }
    },

    /**
     * Convertir código JavaScript a formato simple legible
     * @param {string} code - Código JavaScript de Blockly
     * @returns {string} Expresión en formato simple
     */
    convertToSimpleFormat: function(code) {
        if (!code) return '';
        
        // Extraer la expresión después de "y1 = " y remover el punto y coma
        let expression = code.replace(/^y1\s*=\s*/, '').replace(/;\s*$/, '');
        
        // Si la expresión está entre paréntesis, removerlos
        expression = expression.replace(/^\((.*)\)$/, '$1');
        
        // Simplificar operaciones matemáticas comunes
        expression = this.simplifyMathOperations(expression);
        
        return expression;
    },

    /**
     * Simplificar operaciones matemáticas para mejor legibilidad
     * @param {string} expression - Expresión matemática
     * @returns {string} Expresión simplificada
     */
    simplifyMathOperations: function(expression) {
        let simplified = expression;
        
        // Simplificar Math.pow a notación de exponente
        simplified = simplified.replace(/Math\.pow\(([^,]+),\s*2\)/g, '($1)²');
        simplified = simplified.replace(/Math\.pow\(([^,]+),\s*3\)/g, '($1)³');
        simplified = simplified.replace(/Math\.pow\(([^,]+),\s*(\d+)\)/g, '($1)^$2');
        
        // Simplificar Math.sqrt a √
        simplified = simplified.replace(/Math\.sqrt\(([^)]+)\)/g, '√($1)');
        
        // Asegurar que las fracciones se muestren como a/b en lugar de frac{a}{b}
        simplified = simplified.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
        
        // Remover espacios innecesarios alrededor de operadores
        simplified = simplified.replace(/\s*([\+\-\*\/\^])\s*/g, ' $1 ');
        
        return simplified.trim();
    },

    /**
     * Reprocesar MathJax (mantenido por si se necesita en el futuro)
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
     * Mostrar función en formato legible (AHORA ES EL MÉTODO PRINCIPAL)
     * @param {string} functionText - Texto de la función
     */
    showPlainText: function(functionText) {
        if (this.displayElement) {
            this.displayElement.innerHTML = 
                `<div class="function-plain" style="font-family: 'Arial', sans-serif; font-size: 18px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                    <strong>Y = ${functionText}</strong>
                 </div>`;
        }
    },

    /**
     * Mostrar función en formato LaTeX (opcional, para casos específicos)
     * @param {string} latexCode - Código LaTeX
     */
    showLatex: function(latexCode) {
        if (this.displayElement) {
            this.displayElement.innerHTML = `$$${latexCode}$$`;
            this.renderMathJax();
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
     * Obtener expresión simplificada
     * @returns {string} Expresión en formato simple
     */
    getSimpleExpression: function() {
        return this.convertToSimpleFormat(this.currentFunction);
    },

    /**
     * Verificar si hay una función válida
     * @returns {boolean} True si hay función válida
     */
    isValid: function() {
        return this.currentFunction && 
               this.currentFunction.trim() !== '' && 
               this.currentFunction !== 'y1 = 0;' &&
               this.currentFunction !== 'y1 = ;';
    }
};