// ===== LÓGICA ESPECÍFICA PARA PÁGINA GRÁFICO =====

const GraficoPage = {
    workspace: null,
    isInitialized: false,

    /**
     * Inicializar página gráfico
     */
    init: function() {
        if (this.isInitialized) return;
        
        console.log('Inicializando página gráfico...');
        
        // Esperar a que Google Charts y Blockly estén listos
        if (typeof google === 'object' && typeof Blockly !== 'undefined') {
            this.setupPage();
        } else {
            window.addEventListener('load', () => this.setupPage());
        }
    },

    /**
     * Configurar la página
     */
    setupPage: function() {
        try {
            // 1. Inicializar Google Charts
            if (!ChartManager.initialize()) {
                console.error('No se pudo inicializar Google Charts');
                return;
            }

            // 2. Inicializar Blockly
            this.workspace = BlocklyConfig.initializeWorkspace('blocklyDiv');
            
            // 3. Inicializar componentes
            FunctionDisplay.init('functionDisplay');
            ExamplesManager.init();
            
            // 4. Configurar event listeners
            this.setupEventListeners();
            
            // 5. Configurar gráfica inicial
            this.setupInitialGraph();
            
            this.isInitialized = true;
            console.log('Página gráfico inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar página gráfico:', error);
        }
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        // Cambios en Blockly
        this.workspace.addChangeListener((event) => {
            this.onBlocklyChange(event);
        });

        // Tutorial
        const tutorialBtn = document.querySelector('button[onclick*="startTutorial"]');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => this.startTutorial());
        }

        // Eventos de ejemplos
        document.addEventListener('exampleChanged', (event) => {
            this.onExampleChanged(event.detail);
        });

        // Redimensionamiento
        window.addEventListener('resize', () => {
            Blockly.svgResize(this.workspace);
        });
    },

    /**
     * Manejar cambios en Blockly
     * @param {Event} event - Evento de cambio
     */
    onBlocklyChange: function(event) {
        // Ignorar eventos que no sean de UI
        if (event.isUiEvent) return;
        
        // Actualizar display de función
        FunctionDisplay.updateFromBlockly(this.workspace);
        
        // Actualizar gráfica
        this.updateGraph();
    },

    /**
     * Actualizar gráfica basada en Blockly
     */
    updateGraph: function() {
        try {
            const code = javascript.javascriptGenerator.workspaceToCode(this.workspace);
            const formula = code.replace(/y1\s*=\s*/, '').replace(/;$/, '').trim();
            
            if (formula && formula !== '0') {
                const data = ChartManager.plotFunction(formula, -10, 10, 0.1);
                ChartManager.drawChart('visualization', data);
            }
        } catch (error) {
            console.warn('Error al actualizar gráfica:', error);
        }
    },

    /**
     * Configurar gráfica inicial
     */
    setupInitialGraph: function() {
        // Gráfica inicial para y = x²
        const initialData = ChartManager.plotFunction('x * x', -10, 10, 0.1);
        ChartManager.drawChart('visualization', initialData);
    },

    /**
     * Manejar cambio de ejemplo
     * @param {Object} detail - Detalles del evento
     */
    onExampleChanged: function(detail) {
        console.log('Ejemplo cambiado:', detail);
        // Aquí podrías cargar el ejemplo en Blockly si es necesario
    },

    /**
     * Iniciar tutorial
     */
    startTutorial: function() {
        if (typeof introJs === 'undefined') {
            console.warn('Intro.js no está cargado');
            return;
        }

        setTimeout(() => {
            introJs().setOptions({
                steps: [
                    {
                        element: document.querySelector('.content-page'),
                        intro: 'Bienvenido al constructor de gráficas. Aquí aprenderás a crear funciones usando bloques.'
                    },
                    {
                        element: document.getElementById('blocklyDiv'),
                        intro: 'En esta área puedes arrastrar y conectar bloques para construir tu función matemática.'
                    },
                    {
                        element: document.getElementById('visualization'),
                        intro: 'Aquí verás la gráfica de tu función en tiempo real.'
                    },
                    {
                        element: document.querySelector('.examples-container'),
                        intro: 'Puedes practicar con estos ejemplos para entender cómo funcionan los diferentes tipos de funciones.'
                    },
                    {
                        element: document.getElementById('functionDisplay'),
                        intro: 'Tu función se mostrará aquí en formato matemático profesional.'
                    }
                ],
                showProgress: true,
                showBullets: false
            }).start();
        }, 500);
    },

    /**
     * Limpiar workspace
     */
    clearWorkspace: function() {
        if (this.workspace) {
            this.workspace.clear();
            FunctionDisplay.clear();
            
            // Restablecer gráfica inicial
            this.setupInitialGraph();
        }
    },

    /**
     * Cargar ejemplo específico en Blockly
     * @param {number} exampleNumber - Número del ejemplo
     */
    loadExample: function(exampleNumber) {
        // Esta función cargaría los bloques específicos del ejemplo
        // en el workspace de Blockly
        console.log(`Cargando ejemplo ${exampleNumber} en Blockly`);
        
        // Ejemplo de implementación:
        // const exampleXml = this.getExampleXml(exampleNumber);
        // BlocklySetup.loadBlocks(this.workspace, exampleXml);
    },

    /**
     * Obtener estado actual del workspace
     * @returns {Object} Estado del workspace
     */
    getWorkspaceState: function() {
        return {
            xml: BlocklySetup.getWorkspaceXml(this.workspace),
            code: BlocklySetup.getWorkspaceCode(this.workspace),
            isValid: BlocklySetup.hasValidBlocks(this.workspace)
        };
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    GraficoPage.init();
});

// También inicializar cuando la página se muestre (para navegación forward/back)
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        GraficoPage.init();
    }
});