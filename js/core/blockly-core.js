// ===== CONFIGURACIÓN CENTRALIZADA DE BLOCKLY =====

const BlocklyConfig = {
    // Toolbox unificado para toda la aplicación
    toolbox: {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: 'Matemáticas',
                colour: '%{BKY_MATH_HUE}',
                contents: [
                    {
                        kind: 'block',
                        type: 'math_number',
                        fields: { NUM: 123 }
                    },
                    {
                        kind: 'block',
                        type: 'math_arithmetic',
                        inputs: {
                            A: { shadow: { type: 'math_number', fields: { NUM: 1 } } },
                            B: { shadow: { type: 'math_number', fields: { NUM: 1 } } }
                        }
                    },
                    {
                        kind: 'block',
                        type: 'math_single',
                        inputs: {
                            NUM: { shadow: { type: 'math_number', fields: { NUM: 9 } } }
                        }
                    },
                    {
                        kind: 'block',
                        type: 'math_fraction'
                    }
                ]
            },
            {
                kind: 'category',
                name: 'Variables',
                colour: '%{BKY_VARIABLES_HUE}',
                contents: [
                    {
                        kind: 'block',
                        type: 'graph_get_x'
                    }
                ]
            }
        ]
    },

    // Bloques personalizados - DEFINIDOS UNA SOLA VEZ
    defineCustomBlocks: function() {
        Blockly.defineBlocksWithJsonArray([
            {
                type: 'graph_get_x',
                message0: 'x',
                output: 'Number',
                colour: Blockly.Msg['VARIABLES_HUE'],
                tooltip: 'Variable x para la función'
            },
            {
                type: 'graph_set_y1',
                message0: 'y = %1',
                args0: [
                    {
                        type: 'input_value',
                        name: 'VALUE',
                        check: 'Number'
                    }
                ],
                colour: Blockly.Msg['VARIABLES_HUE'],
                tooltip: 'Define la función y = f(x)'
            },
            {
                type: 'math_fraction',
                message0: 'fracción %1 / %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'NUMERATOR',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'DENOMINATOR', 
                        check: 'Number'
                    }
                ],
                output: 'Number',
                colour: Blockly.Msg['MATH_HUE'],
                tooltip: 'Calcula el valor de una fracción'
            }
        ]);
    },

    // Generadores de código - CENTRALIZADOS
    setupGenerators: function() {
        // Generador para graph_get_x
        javascript.javascriptGenerator.forBlock['graph_get_x'] = function(block) {
            return ['x', javascript.Order.ATOMIC];
        };

        // Generador para graph_set_y1
        javascript.javascriptGenerator.forBlock['graph_set_y1'] = function(block, generator) {
            block.setDeletable(false);
            const argument0 = generator.valueToCode(block, 'VALUE', javascript.Order.ASSIGNMENT) || '0';
            return 'y1 = ' + argument0 + ';';
        };

        // Generador para math_fraction
        javascript.javascriptGenerator.forBlock['math_fraction'] = function(block, generator) {
            const numerator = generator.valueToCode(block, 'NUMERATOR', javascript.Order.DIVISION) || '0';
            const denominator = generator.valueToCode(block, 'DENOMINATOR', javascript.Order.DIVISION) || '0';
            const code = '(' + numerator + ' / ' + denominator + ')';
            return [code, javascript.Order.DIVISION];
        };
    },

    // Inicializar workspace de Blockly
    initializeWorkspace: function(containerId, startBlocks = null) {
        // Definir bloques personalizados
        this.defineCustomBlocks();
        
        // Configurar generadores
        this.setupGenerators();

        // Crear workspace
        const workspace = Blockly.inject(containerId, {
            media: 'https://unpkg.com/blockly@12.0.0/media/',
            toolbox: this.toolbox,
            theme: Blockly.Theme.Modern,
            renderer: 'zelos',
            collapse: false,
            disable: false
        });

        // Cargar bloques iniciales si se proporcionan
        if (startBlocks) {
            Blockly.Xml.domToWorkspace(startBlocks, workspace);
            workspace.clearUndo();
        }

        return workspace;
    }
};

// ===== FUNCIONES DE UTILIDAD PARA BLOCKLY =====

/**
 * Convertir código JavaScript de Blockly a LaTeX
 */
function blocklyToLatex(code) {
    let latexCode = code.replace(/^y1\s*=\s*/, '').replace(/;$/, '');
    
    // Reemplazar funciones matemáticas por notación LaTeX
    latexCode = latexCode.replace(/Math.pow\(([^,]+),\s*2\)/g, '$1^2');
    latexCode = latexCode.replace(/Math.pow\(([^,]+),\s*3\)/g, '$1^3');
    latexCode = latexCode.replace(/Math.sqrt\((.*?)\)/g, '\\sqrt{$1}');
    latexCode = latexCode.replace(/\((\d+)\s*\/\s*(\d+)\)/g, '\\frac{$1}{$2}');
    
    return `$$y = ${latexCode}$$`;
}

/**
 * Actualizar display de función con MathJax
 */
function updateFunctionDisplay(workspace, displayElementId) {
    const code = javascript.javascriptGenerator.workspaceToCode(workspace);
    const latex = blocklyToLatex(code);
    const displayElement = document.getElementById(displayElementId);
    
    if (displayElement) {
        displayElement.innerHTML = latex;
        // Reprocesar MathJax si está disponible
        if (window.MathJax) {
            MathJax.typesetPromise([displayElement]);
        }
    }
}