// ===== UTILIDADES MATEMÁTICAS Y CONVERSIÓN =====

const MathUtils = {
    /**
     * Convertir código Blockly/JavaScript a LaTeX
     * @param {string} code - Código JavaScript de Blockly
     * @returns {string} Fórmula en formato LaTeX
     */
    jsToLatex: function(code) {
        if (!code || typeof code !== 'string') return '$$y = 0$$';
        
        let latex = code
            .replace(/^y1\s*=\s*/, '')
            .replace(/;$/, '')
            .trim();

        // Reemplazar funciones matemáticas comunes
        const replacements = [
            // Potencias
            [/Math\.pow\(([^,]+),\s*2\)/g, '$1^2'],
            [/Math\.pow\(([^,]+),\s*3\)/g, '$1^3'],
            [/Math\.pow\(([^,]+),\s*(\d+)\)/g, '$1^{$2}'],
            
            // Raíces y funciones trigonométricas
            [/Math\.sqrt\(([^)]+)\)/g, '\\\\sqrt{$1}'],
            [/Math\.sin\(([^)]+)\)/g, '\\\\sin($1)'],
            [/Math\.cos\(([^)]+)\)/g, '\\\\cos($1)'],
            [/Math\.tan\(([^)]+)\)/g, '\\\\tan($1)'],
            
            // Fracciones y división
            [/\((\d+)\s*\/\s*(\d+)\)/g, '\\\\frac{$1}{$2}'],
            [/(\w+)\s*\/\s*(\w+)/g, '\\\\frac{$1}{$2}'],
            
            // Multiplicación implícita
            [/(\d)([a-zA-Z])/g, '$1\\\\cdot $2'],
            [/(\))(\()/g, '$1\\\\cdot $2'],
            
            // Limpiar paréntesis innecesarios
            [/^\((.*)\)$/, '$1']
        ];

        replacements.forEach(([pattern, replacement]) => {
            latex = latex.replace(pattern, replacement);
        });

        return `$$y = ${latex}$$`;
    },

    /**
     * Validar expresión matemática
     * @param {string} expression - Expresión a validar
     * @returns {boolean} True si la expresión es válida
     */
    isValidExpression: function(expression) {
        if (!expression) return false;
        
        try {
            // Intentar crear función
            new Function('x', `return ${expression};`);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Evaluar expresión matemática de forma segura
     * @param {string} expression - Expresión a evaluar
     * @param {number} x - Valor de x
     * @returns {number|NaN} Resultado o NaN si hay error
     */
    safeEval: function(expression, x) {
        if (!this.isValidExpression(expression)) return NaN;
        
        try {
            const func = new Function('x', `return ${expression};`);
            const result = func(x);
            return typeof result === 'number' ? result : NaN;
        } catch (error) {
            return NaN;
        }
    },

    /**
     * Generar tabla de valores para una función
     * @param {string} expression - Expresión de la función
     * @param {number} start - Valor inicial de x
     * @param {number} end - Valor final de x
     * @param {number} step - Paso entre valores
     * @returns {Array} Array de objetos {x, y}
     */
    generateValueTable: function(expression, start = -5, end = 5, step = 1) {
        const table = [];
        
        for (let x = start; x <= end; x += step) {
            const y = this.safeEval(expression, x);
            if (!isNaN(y)) {
                table.push({ x, y: Math.round(y * 100) / 100 });
            }
        }
        
        return table;
    },

    /**
     * Simplificar expresión matemática
     * @param {string} expression - Expresión a simplificar
     * @returns {string} Expresión simplificada
     */
    simplifyExpression: function(expression) {
        return expression
            .replace(/\s+/g, '')
            .replace(/\*1/g, '')
            .replace(/1\*/g, '')
            .replace(/\+0/g, '')
            .replace(/0\+/g, '')
            .replace(/\b0\b/g, '0')
            .replace(/\((\d+)\)/g, '$1');
    }
};