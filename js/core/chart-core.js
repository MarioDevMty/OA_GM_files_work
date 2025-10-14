// ===== GESTIÓN CENTRALIZADA DE GRÁFICAS =====

const ChartManager = {
    // Configuración global de gráficas
    options: {
        curveType: 'function',
        width: 400,
        height: 400,
        chartArea: { left: '10%', width: '85%', height: '85%' },
        series: { 0: { color: '#36c' } },
        legend: { position: 'none' }
    },

    // Cache de fórmulas para evitar recálculos innecesarios
    formulaCache: new Map(),

    /**
     * Inicializar Google Charts
     */
    initialize: function() {
        if (typeof google !== 'object') {
            console.error('Google Charts no está cargado');
            return false;
        }
        
        google.load('visualization', '1', { packages: ['corechart'] });
        return true;
    },

    /**
     * Graficar función matemática
     * @param {string} formula - Fórmula JavaScript (ej: 'x * x')
     * @param {number} xMin - Valor mínimo de x
     * @param {number} xMax - Valor máximo de x
     * @param {number} step - Paso entre puntos (default: 0.1)
     * @returns {Array} Datos para la gráfica
     */
    plotFunction: function(formula, xMin = -10, xMax = 10, step = 0.1) {
        const cacheKey = `${formula}-${xMin}-${xMax}-${step}`;
        
        // Verificar cache
        if (this.formulaCache.has(cacheKey)) {
            return this.formulaCache.get(cacheKey);
        }

        const table = [['x', 'y']];
        let hasValidPoints = false;

        try {
            // Crear función dinámicamente
            const mathFunction = new Function('x', `return ${formula};`);
            
            for (let x = xMin; x <= xMax; x = Math.round((x + step) * 10) / 10) {
                let y;
                try {
                    y = mathFunction(x);
                    if (!isNaN(y) && isFinite(y)) {
                        // Redondear para evitar errores de precisión
                        y = Math.round(y * Math.pow(10, 10)) / Math.pow(10, 10);
                        table.push([x, y]);
                        hasValidPoints = true;
                    }
                } catch (e) {
                    // Punto inválido, continuar
                    continue;
                }
            }
        } catch (error) {
            console.error('Error al evaluar función:', error);
        }

        // Si no hay puntos válidos, crear punto dummy
        if (!hasValidPoints) {
            table.push([0, 0]);
        }

        // Guardar en cache
        this.formulaCache.set(cacheKey, table);
        return table;
    },

    /**
     * Dibujar gráfica en contenedor
     * @param {string} containerId - ID del elemento contenedor
     * @param {Array} data - Datos de la gráfica
     * @param {Object} customOptions - Opciones personalizadas
     */
    drawChart: function(containerId, data, customOptions = {}) {
        if (typeof google !== 'object' || !google.visualization) {
            console.error('Google Visualization API no disponible');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contenedor ${containerId} no encontrado`);
            return;
        }

        try {
            const dataTable = google.visualization.arrayToDataTable(data);
            const options = { ...this.options, ...customOptions };
            
            new google.visualization.LineChart(container)
                .draw(dataTable, options);
                
        } catch (error) {
            console.error('Error al dibujar gráfica:', error);
        }
    },

    /**
     * Comparar dos gráficas para evaluación
     * @param {Array} data1 - Datos primera gráfica
     * @param {Array} data2 - Datos segunda gráfica
     * @param {number} tolerance - Tolerancia para comparación
     * @returns {boolean} True si son iguales dentro de la tolerancia
     */
    compareCharts: function(data1, data2, tolerance = 0.01) {
        if (data1.length !== data2.length) return false;
        
        for (let i = 1; i < data1.length; i++) {
            const [x1, y1] = data1[i];
            const [x2, y2] = data2[i];
            
            if (Math.abs(x1 - x2) > tolerance || Math.abs(y1 - y2) > tolerance) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * Limpiar cache
     */
    clearCache: function() {
        this.formulaCache.clear();
    },

    /**
     * Obtener rango automático para y basado en los datos
     * @param {Array} data - Datos de la gráfica
     * @returns {Object} Objeto con minY y maxY
     */
    getAutoYRange: function(data) {
        if (data.length <= 1) return { minY: -10, maxY: 10 };
        
        let minY = Infinity;
        let maxY = -Infinity;
        
        for (let i = 1; i < data.length; i++) {
            const y = data[i][1];
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        
        // Agregar margen
        const margin = Math.max(1, (maxY - minY) * 0.1);
        return {
            minY: minY - margin,
            maxY: maxY + margin
        };
    }
};