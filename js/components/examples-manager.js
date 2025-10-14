// ===== GESTIÓN DE EJEMPLOS Y TUTORIALES =====

const ExamplesManager = {
    currentExample: 1,
    totalExamples: 5,
    examplesData: {},

    /**
     * Inicializar gestor de ejemplos
     */
    init: function() {
        this.loadExamplesData();
        this.setupEventListeners();
        this.showExample(1); // Mostrar primer ejemplo por defecto
    },

    /**
     * Cargar datos de ejemplos
     */
    loadExamplesData: function() {
        this.examplesData = {
            1: {
                title: 'Función Lineal',
                function: 'y = x - 2',
                description: 'Una función lineal simple con pendiente 1'
            },
            2: {
                title: 'Función Cuadrática',
                function: 'y = x² + 5', 
                description: 'Parábola con vértice desplazado'
            },
            3: {
                title: 'Función Raíz Cuadrada',
                function: 'y = √x',
                description: 'Función raíz cuadrada básica'
            },
            4: {
                title: 'Función Cúbica',
                function: 'y = x³ + 2',
                description: 'Función cúbica con desplazamiento vertical'
            },
            5: {
                title: 'Función Lineal Fraccionaria',
                function: 'y = ⅔x + 1',
                description: 'Función lineal con pendiente fraccionaria'
            }
        };
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                if (e.key === 'ArrowLeft') {
                    this.previousExample();
                } else if (e.key === 'ArrowRight') {
                    this.nextExample();
                }
            }
        });
    },

    /**
     * Mostrar ejemplo específico
     * @param {number} exampleNumber - Número del ejemplo
     */
    showExample: function(exampleNumber) {
        if (exampleNumber < 1 || exampleNumber > this.totalExamples) {
            console.error('Número de ejemplo inválido:', exampleNumber);
            return;
        }

        this.currentExample = exampleNumber;

        // Ocultar todos los ejemplos
        document.querySelectorAll('.example').forEach(example => {
            example.classList.remove('active');
        });

        // Desactivar todos los botones
        document.querySelectorAll('.example-nav button').forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar ejemplo seleccionado
        const selectedExample = document.getElementById(`example-${exampleNumber}`);
        const selectedButton = document.querySelector(`.example-nav button:nth-child(${exampleNumber})`);

        if (selectedExample && selectedButton) {
            selectedExample.classList.add('active');
            selectedButton.classList.add('active');
        }

        // Disparar evento personalizado
        this.onExampleChange(exampleNumber);
    },

    /**
     * Ejemplo siguiente
     */
    nextExample: function() {
        if (this.currentExample < this.totalExamples) {
            this.showExample(this.currentExample + 1);
        }
    },

    /**
     * Ejemplo anterior
     */
    previousExample: function() {
        if (this.currentExample > 1) {
            this.showExample(this.currentExample - 1);
        }
    },

    /**
     * Callback cuando cambia el ejemplo
     * @param {number} exampleNumber - Número del ejemplo
     */
    onExampleChange: function(exampleNumber) {
        // Puede ser sobrescrito por páginas específicas
        console.log(`Ejemplo cambiado a: ${exampleNumber}`);
        
        // Disparar evento personalizado
        const event = new CustomEvent('exampleChanged', {
            detail: { exampleNumber, data: this.examplesData[exampleNumber] }
        });
        document.dispatchEvent(event);
    },

    /**
     * Cargar ejemplo en workspace de Blockly
     * @param {Blockly.Workspace} workspace - Workspace de Blockly
     * @param {number} exampleNumber - Número del ejemplo
     */
    loadExampleIntoWorkspace: function(workspace, exampleNumber) {
        // Esta función sería implementada según los bloques específicos de cada ejemplo
        console.log(`Cargando ejemplo ${exampleNumber} en workspace`);
        
        // Aquí iría la lógica específica para cargar los bloques del ejemplo
        // en el workspace de Blockly
    },

    /**
     * Obtener datos del ejemplo actual
     * @returns {Object} Datos del ejemplo
     */
    getCurrentExampleData: function() {
        return this.examplesData[this.currentExample];
    },

    /**
     * Verificar si hay siguiente ejemplo
     * @returns {boolean} True si hay siguiente ejemplo
     */
    hasNextExample: function() {
        return this.currentExample < this.totalExamples;
    },

    /**
     * Verificar si hay ejemplo anterior
     * @returns {boolean} True si hay ejemplo anterior  
     */
    hasPreviousExample: function() {
        return this.currentExample > 1;
    }
};