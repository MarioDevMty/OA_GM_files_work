// ===== LÓGICA ESPECÍFICA PARA PÁGINA APLICACIÓN/RETOS =====

const AplicacionPage = {
    workspace: null,
    retoActual: 0,
    retosCompletados: 0,
    retos: [],
    isInitialized: false,

    /**
     * Definición de retos
     */
    retosConfig: [
        {
            id: 1,
            formula: 'x + 4',
            nombre: 'Función Lineal',
            descripcion: 'Crea una función lineal que pase por los puntos mostrados',
            plotXMin: -10,
            plotXMax: 10,
            viewXMin: -10,
            viewXMax: 10,
            viewYMin: -10,
            viewYMax: 10,
            bloques: '<block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="graph_get_x"></block></value><value name="B"><block type="math_number"><field name="NUM">4</field></block></value></block>'
        },
        {
            id: 2,
            formula: 'Math.pow(x, 2) + 6',
            nombre: 'Función Cuadrática',
            descripcion: 'Construye una parábola con el vértice desplazado',
            plotXMin: -20,
            plotXMax: 20,
            viewXMin: -10,
            viewXMax: 10,
            viewYMin: 0,
            viewYMax: 100,
            bloques: '<block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="math_arithmetic"><field name="OP">POWER</field><value name="A"><block type="graph_get_x"></block></value><value name="B"><block type="math_number"><field name="NUM">2</field></block></value></block></value><value name="B"><block type="math_number"><field name="NUM">6</field></block></value></block>'
        },
        {
            id: 3,
            formula: 'Math.sqrt(x)',
            nombre: 'Función Raíz Cuadrada',
            descripcion: 'Implementa la función raíz cuadrada',
            plotXMin: 0,
            plotXMax: 20,
            viewXMin: 0,
            viewXMax: 20,
            viewYMin: 0,
            viewYMax: 10,
            bloques: '<block type="math_single"><field name="OP">ROOT</field><value name="NUM"><block type="graph_get_x"></block></value></block>'
        },
        {
            id: 4,
            formula: 'Math.pow(x, 3) + 2',
            nombre: 'Función Cúbica',
            descripcion: 'Crea una función cúbica con desplazamiento vertical',
            plotXMin: -10,
            plotXMax: 10,
            viewXMin: -10,
            viewXMax: 10,
            viewYMin: -100,
            viewYMax: 100,
            bloques: '<block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="math_arithmetic"><field name="OP">POWER</field><value name="A"><block type="graph_get_x"></block></value><value name="B"><block type="math_number"><field name="NUM">3</field></block></value></block></value><value name="B"><block type="math_number"><field name="NUM">2</field></block></value></block>'
        },
        {
            id: 5,
            formula: '(x - 5) / x',
            nombre: 'Función Racional',
            descripcion: 'Construye una función racional con asíntotas',
            plotXMin: -10,
            plotXMax: 10,
            viewXMin: -10,
            viewXMax: 10,
            viewYMin: -20,
            viewYMax: 20,
            bloques: '<block type="math_arithmetic"><field name="OP">MINUS</field><value name="A"><block type="graph_get_x"></block></value><value name="B"><block type="math_arithmetic"><field name="OP">DIVIDE</field><value name="A"><block type="math_number"><field name="NUM">5</field></block></value><value name="B"><block type="graph_get_x"></block></value></block></value></block>'
        }
    ],

    /**
     * Inicializar página aplicación
     */
    init: function() {
        if (this.isInitialized) return;
        
        console.log('Inicializando página aplicación...');
        
        // Cargar progreso guardado
        this.loadProgress();
        
        // Configurar cuando esté todo listo
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
            // 1. Inicializar componentes core
            ChartManager.initialize();
            FunctionDisplay.init('functionDisplay');
            
            // 2. Configurar Blockly para retos
            this.workspace = BlocklySetup.setupChallengeWorkspace('blocklyDiv');
            
            // 3. Configurar UI
            this.setupUI();
            
            // 4. Configurar event listeners
            this.setupEventListeners();
            
            // 5. Cargar primer reto o mostrar diálogo de progreso
            this.checkProgressAndLoad();
            
            this.isInitialized = true;
            console.log('Página aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar página aplicación:', error);
        }
    },

    /**
     * Configurar UI
     */
    setupUI: function() {
        this.setupRetoNavigation();
        this.updateUIState();
    },

    /**
     * Configurar navegación de retos
     */
    setupRetoNavigation: function() {
        const navContainer = document.getElementById('reto-nav');
        if (!navContainer) return;
        
        navContainer.innerHTML = '';
        
        this.retosConfig.forEach((reto, index) => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = reto.id;
            link.dataset.retoIndex = index;
            
            // Estilos según estado
            if (index === this.retoActual) {
                link.classList.add('active');
            }
            if (index < this.retosCompletados) {
                link.classList.add('completed');
            }
            if (index > this.retosCompletados) {
                link.classList.add('disabled');
            }
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (index <= this.retosCompletados) {
                    this.cargarReto(index);
                }
            });
            
            navContainer.appendChild(link);
        });
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        // Cambios en Blockly
        this.workspace.addChangeListener((event) => {
            if (!event.isUiEvent) {
                FunctionDisplay.updateFromBlockly(this.workspace);
            }
        });

        // Botones
        document.getElementById('evaluar-btn')?.addEventListener('click', () => this.evaluarReto());
        document.getElementById('pista-btn')?.addEventListener('click', () => this.mostrarPista());
        document.getElementById('siguiente-btn')?.addEventListener('click', () => this.cargarSiguienteReto());

        // Modales
        document.getElementById('pista-modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.cerrarModalPista();
            }
        });

        document.getElementById('opciones-modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.cerrarModalOpciones();
            }
        });
    },

    /**
     * Cargar reto específico
     * @param {number} index - Índice del reto
     */
    cargarReto: function(index) {
        if (index < 0 || index >= this.retosConfig.length) return;
        
        this.retoActual = index;
        const reto = this.retosConfig[index];
        
        // Actualizar UI
        this.updateRetoUI(reto);
        
        // Dibujar gráfica del reto
        this.dibujarGraficaReto(reto);
        
        // Reiniciar workspace
        this.reiniciarWorkspace();
        
        // Actualizar navegación
        this.setupRetoNavigation();
    },

    /**
     * Actualizar UI del reto
     * @param {Object} reto - Datos del reto
     */
    updateRetoUI: function(reto) {
        const titleElement = document.getElementById('reto-title');
        if (titleElement) {
            titleElement.textContent = `Reto ${reto.id}: ${reto.nombre}`;
        }
        
        // Ocultar gráfica de usuario
        const userChartContainer = document.getElementById('user-chart-container');
        if (userChartContainer) {
            userChartContainer.style.display = 'none';
        }
        
        // Limpiar mensajes
        const messageElement = document.getElementById('reto-message');
        if (messageElement) {
            messageElement.textContent = '';
            messageElement.className = '';
        }
        
        // Estado de botones
        this.updateButtonStates();
    },

    /**
     * Dibujar gráfica del reto
     * @param {Object} reto - Datos del reto
     */
    dibujarGraficaReto: function(reto) {
        const data = ChartManager.plotFunction(reto.formula, reto.plotXMin, reto.plotXMax);
        const options = {
            hAxis: { 
                title: 'x', 
                viewWindow: { min: reto.viewXMin, max: reto.viewXMax } 
            },
            vAxis: { 
                title: 'y', 
                viewWindow: { min: reto.viewYMin, max: reto.viewYMax } 
            },
            series: { 0: { color: 'green' } }
        };
        
        ChartManager.drawChart('reto-chart', data, options);
    },

    /**
     * Evaluar reto actual
     */
    evaluarReto: function() {
        const reto = this.retosConfig[this.retoActual];
        const code = javascript.javascriptGenerator.workspaceToCode(this.workspace);
        const formulaAlumno = code.replace(/y1\s*=\s*/, '').replace(/;$/, '').trim();
        
        // Mostrar gráfica del usuario
        this.mostrarGraficaUsuario(formulaAlumno, reto);
        
        // Comparar gráficas
        const esCorrecto = this.compararGraficas(reto.formula, formulaAlumno, reto);
        
        // Mostrar resultado
        this.mostrarResultado(esCorrecto, reto);
    },

    /**
     * Mostrar gráfica del usuario
     * @param {string} formula - Fórmula del usuario
     * @param {Object} reto - Datos del reto
     */
    mostrarGraficaUsuario: function(formula, reto) {
        const userChartContainer = document.getElementById('user-chart-container');
        const userChartElement = document.getElementById('user-chart');
        
        if (userChartContainer && userChartElement) {
            userChartContainer.style.display = 'block';
            
            const data = ChartManager.plotFunction(formula, reto.plotXMin, reto.plotXMax);
            const options = {
                hAxis: { 
                    title: 'x', 
                    viewWindow: { min: reto.viewXMin, max: reto.viewXMax } 
                },
                vAxis: { 
                    title: 'y', 
                    viewWindow: { min: reto.viewYMin, max: reto.viewYMax } 
                },
                series: { 0: { color: 'blue' } }
            };
            
            ChartManager.drawChart('user-chart', data, options);
        }
    },

    /**
     * Comparar gráficas
     * @param {string} formulaCorrecta - Fórmula correcta
     * @param {string} formulaUsuario - Fórmula del usuario
     * @param {Object} reto - Datos del reto
     * @returns {boolean} True si son iguales
     */
    compararGraficas: function(formulaCorrecta, formulaUsuario, reto) {
        const dataCorrecta = ChartManager.plotFunction(formulaCorrecta, reto.plotXMin, reto.plotXMax);
        const dataUsuario = ChartManager.plotFunction(formulaUsuario, reto.plotXMin, reto.plotXMax);
        
        return ChartManager.compareCharts(dataCorrecta, dataUsuario, 0.1);
    },

    /**
     * Mostrar resultado de evaluación
     * @param {boolean} esCorrecto - Si es correcto
     * @param {Object} reto - Datos del reto
     */
    mostrarResultado: function(esCorrecto, reto) {
        const messageElement = document.getElementById('reto-message');
        if (!messageElement) return;
        
        if (esCorrecto) {
            messageElement.textContent = `¡Correcto! Has resuelto el reto "${reto.nombre}" 🎉`;
            messageElement.className = 'correct';
            
            // Actualizar progreso
            if (this.retoActual === this.retosCompletados) {
                this.retosCompletados++;
                this.saveProgress();
            }
            
            this.updateButtonStates();
            
        } else {
            messageElement.textContent = 'Inténtalo de nuevo. La gráfica no coincide.';
            messageElement.className = 'incorrect';
        }
    },

    /**
     * Actualizar estados de botones
     */
    updateButtonStates: function() {
        const evaluarBtn = document.getElementById('evaluar-btn');
        const pistaBtn = document.getElementById('pista-btn');
        const siguienteBtn = document.getElementById('siguiente-btn');
        
        const retoCompletado = this.retoActual < this.retosCompletados;
        
        if (evaluarBtn) evaluarBtn.classList.toggle('hidden', retoCompletado);
        if (pistaBtn) pistaBtn.classList.toggle('hidden', retoCompletado);
        if (siguienteBtn) siguienteBtn.classList.toggle('hidden', !retoCompletado);
    },

    /**
     * Mostrar pista
     */
    mostrarPista: function() {
        const reto = this.retosConfig[this.retoActual];
        const pistaTabla = document.getElementById('pista-tabla');
        const pistaModal = document.getElementById('pista-modal');
        
        if (!pistaTabla || !pistaModal) return;
        
        // Generar tabla de valores
        const tabla = MathUtils.generateValueTable(reto.formula, -2, 3, 1);
        let html = '<table><thead><tr><th>X</th><th>Y</th></tr></thead><tbody>';
        
        tabla.forEach(punto => {
            html += `<tr><td>${punto.x}</td><td>${punto.y}</td></tr>`;
        });
        
        html += '</tbody></table>';
        pistaTabla.innerHTML = html;
        
        pistaModal.showModal();
    },

    /**
     * Cargar siguiente reto
     */
    cargarSiguienteReto: function() {
        if (this.retoActual < this.retosConfig.length - 1) {
            this.cargarReto(this.retoActual + 1);
        } else {
            this.mostrarCompletado();
        }
    },

    /**
     * Mostrar mensaje de completado
     */
    mostrarCompletado: function() {
        const messageElement = document.getElementById('reto-message');
        if (messageElement) {
            messageElement.textContent = '¡Felicidades! Has completado todos los retos. 🏆';
            messageElement.className = 'correct';
        }
        
        this.updateButtonStates();
    },

    /**
     * Cargar progreso
     */
    loadProgress: function() {
        const saved = localStorage.getItem('aplicacion-progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.retoActual = progress.retoActual || 0;
            this.retosCompletados = progress.retosCompletados || 0;
        }
    },

    /**
     * Guardar progreso
     */
    saveProgress: function() {
        const progress = {
            retoActual: this.retoActual,
            retosCompletados: this.retosCompletados,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('aplicacion-progress', JSON.stringify(progress));
    },

    /**
     * Verificar progreso y cargar
     */
    checkProgressAndLoad: function() {
        if (this.retosCompletados > 0) {
            this.mostrarModalOpciones();
        } else {
            this.cargarReto(0);
        }
    },

    /**
     * Mostrar modal de opciones
     */
    mostrarModalOpciones: function() {
        const modal = document.getElementById('opciones-modal');
        if (modal) {
            modal.showModal();
        }
    },

    /**
     * Cerrar modales
     */
    cerrarModalPista: function() {
        document.getElementById('pista-modal')?.close();
    },

    cerrarModalOpciones: function() {
        document.getElementById('opciones-modal')?.close();
    },

    /**
     * Reiniciar workspace
     */
    reiniciarWorkspace: function() {
        BlocklySetup.clearWorkspace(this.workspace);
        
        // Cargar bloques iniciales
        const startBlocks = document.getElementById('startBlocks');
        if (startBlocks) {
            BlocklySetup.loadBlocks(this.workspace, startBlocks);
        }
        
        FunctionDisplay.clear();
    }
};

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    AplicacionPage.init();
});

// Funciones globales para modales (mantener compatibilidad)
function mostrarPista() {
    AplicacionPage.mostrarPista();
}

function cerrarModalPista() {
    AplicacionPage.cerrarModalPista();
}

function cargarSiguienteReto() {
    AplicacionPage.cargarSiguienteReto();
}

function evaluarReto() {
    AplicacionPage.evaluarReto();
}