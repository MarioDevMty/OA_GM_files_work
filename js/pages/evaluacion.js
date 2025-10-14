// ===== LÓGICA ESPECÍFICA PARA PÁGINA EVALUACIÓN =====

const EvaluacionPage = {
    respuestasUsuario: {},
    isSubmitted: false,

    /**
     * Respuestas correctas
     */
    respuestasCorrectas: {
        q1: 'A', // y = x + 3 es lineal
        q2: 'B', // La parábola es y = x² - 1
        q3: 'B'  // Gráfica en "S" es cúbica
    },

    /**
     * Inicializar página evaluación
     */
    init: function() {
        console.log('Inicializando página evaluación...');
        
        this.loadProgress();
        this.setupEventListeners();
        this.updateProgressUI();
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        const form = document.getElementById('evaluationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cambios en respuestas para feedback inmediato
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.onAnswerChange(e));
        });

        // Botón reiniciar
        const resetBtn = document.querySelector('button[onclick*="resetForm"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }
    },

    /**
     * Manejar envío del formulario
     * @param {Event} event - Evento de submit
     */
    handleSubmit: function(event) {
        event.preventDefault();
        
        if (this.isSubmitted) {
            this.mostrarResultados();
            return;
        }

        this.evaluarRespuestas();
        this.mostrarResultados();
        this.isSubmitted = true;
        this.saveProgress();
    },

    /**
     * Manejar cambio de respuesta
     * @param {Event} event - Evento de change
     */
    onAnswerChange: function(event) {
        const radio = event.target;
        const questionName = radio.name;
        const questionNumber = questionName.replace('q', '');
        
        // Guardar respuesta
        this.respuestasUsuario[questionName] = radio.value;
        
        // Feedback inmediato opcional (puedes activarlo si quieres)
        // this.mostrarFeedbackInmediato(questionNumber, radio.value);
    },

    /**
     * Evaluar todas las respuestas
     */
    evaluarRespuestas: function() {
        let score = 0;
        const totalQuestions = Object.keys(this.respuestasCorrectas).length;

        // Evaluar cada pregunta
        for (const [questionId, correctAnswer] of Object.entries(this.respuestasCorrectas)) {
            const userAnswer = this.respuestasUsuario[questionId];
            const questionNumber = questionId.replace('q', '');
            
            this.mostrarFeedback(questionNumber, userAnswer, correctAnswer);
            
            if (userAnswer === correctAnswer) {
                score++;
            }
        }

        this.calcularResultadoFinal(score, totalQuestions);
    },

    /**
     * Mostrar feedback por pregunta
     * @param {string} questionNumber - Número de pregunta
     * @param {string} userAnswer - Respuesta del usuario
     * @param {string} correctAnswer - Respuesta correcta
     */
    mostrarFeedback: function(questionNumber, userAnswer, correctAnswer) {
        const feedbackEl = document.getElementById(`feedback${questionNumber}`);
        if (!feedbackEl) return;

        // Limpiar feedback anterior
        feedbackEl.className = 'feedback';
        feedbackEl.innerHTML = '';

        if (!userAnswer) {
            feedbackEl.textContent = 'No respondida ⚠️';
            feedbackEl.classList.add('warning');
            return;
        }

        if (userAnswer === correctAnswer) {
            feedbackEl.innerHTML = '✅ <strong>Correcto!</strong>';
            feedbackEl.classList.add('correct');
        } else {
            feedbackEl.innerHTML = `❌ <strong>Incorrecto.</strong> La respuesta correcta es ${this.getAnswerText(correctAnswer)}`;
            feedbackEl.classList.add('incorrect');
        }
    },

    /**
     * Obtener texto de la respuesta
     * @param {string} answerKey - Clave de respuesta (A, B, C)
     * @returns {string} Texto de la respuesta
     */
    getAnswerText: function(answerKey) {
        const answerTexts = {
            'A': 'Lineal',
            'B': 'Cuadrática', 
            'C': 'Cúbica'
        };
        return answerTexts[answerKey] || answerKey;
    },

    /**
     * Calcular resultado final
     * @param {number} score - Puntuación
     * @param {number} total - Total de preguntas
     */
    calcularResultadoFinal: function(score, total) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;

        const percentage = (score / total) * 100;
        
        let message, emoji, colorClass;
        
        if (percentage >= 80) {
            message = '¡Excelente! 🎉';
            emoji = '🏆';
            colorClass = 'excellent';
        } else if (percentage >= 60) {
            message = '¡Buen trabajo! 👍';
            emoji = '⭐';
            colorClass = 'good';
        } else {
            message = 'Sigue practicando 💪';
            emoji = '📚';
            colorClass = 'needs-improvement';
        }

        resultsDiv.innerHTML = `
            <div class="evaluation-results ${colorClass}">
                <h3>Resultado de la Evaluación</h3>
                <div class="evaluation-score">${score}/${total}</div>
                <div class="evaluation-percentage">${percentage.toFixed(0)}%</div>
                <p>${message} ${emoji}</p>
                <div class="evaluation-progress">
                    <div class="evaluation-progress-bar" style="width: ${percentage}%"></div>
                </div>
                <p class="evaluation-feedback">${this.getFeedbackMessage(percentage)}</p>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        
        // Animación
        setTimeout(() => {
            resultsDiv.classList.add('evaluation-correct');
        }, 100);
    },

    /**
     * Obtener mensaje de feedback según porcentaje
     * @param {number} percentage - Porcentaje de aciertos
     * @returns {string} Mensaje de feedback
     */
    getFeedbackMessage: function(percentage) {
        if (percentage >= 90) {
            return '¡Dominas perfectamente los conceptos de gráficas de funciones!';
        } else if (percentage >= 70) {
            return 'Tienes un buen entendimiento, pero puedes practicar un poco más.';
        } else if (percentage >= 50) {
            return 'Revisa los conceptos básicos y sigue practicando.';
        } else {
            return 'Te recomendamos repasar la teoría y los ejemplos antes de intentarlo de nuevo.';
        }
    },

    /**
     * Mostrar resultados
     */
    mostrarResultados: function() {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv && resultsDiv.style.display !== 'block') {
            resultsDiv.style.display = 'block';
        }
    },

    /**
     * Reiniciar formulario
     */
    resetForm: function() {
        const form = document.getElementById('evaluationForm');
        if (form) {
            form.reset();
        }

        // Limpiar feedback
        document.querySelectorAll('.feedback').forEach(el => {
            el.innerHTML = '';
            el.className = 'feedback';
        });

        // Ocultar resultados
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
            resultsDiv.innerHTML = '';
        }

        // Resetear estado
        this.respuestasUsuario = {};
        this.isSubmitted = false;
        
        // Limpiar progreso
        localStorage.removeItem('evaluacion-progress');
    },

    /**
     * Cargar progreso
     */
    loadProgress: function() {
        const saved = localStorage.getItem('evaluacion-progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.respuestasUsuario = progress.respuestasUsuario || {};
            this.isSubmitted = progress.isSubmitted || false;
            
            // Restaurar respuestas
            this.restoreAnswers();
        }
    },

    /**
     * Guardar progreso
     */
    saveProgress: function() {
        const progress = {
            respuestasUsuario: this.respuestasUsuario,
            isSubmitted: this.isSubmitted,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('evaluacion-progress', JSON.stringify(progress));
    },

    /**
     * Restaurar respuestas desde progreso
     */
    restoreAnswers: function() {
        for (const [questionName, answer] of Object.entries(this.respuestasUsuario)) {
            const radio = document.querySelector(`input[name="${questionName}"][value="${answer}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    },

    /**
     * Actualizar UI de progreso
     */
    updateProgressUI: function() {
        const answeredCount = Object.keys(this.respuestasUsuario).length;
        const totalQuestions = Object.keys(this.respuestasCorrectas).length;
        
        // Puedes mostrar un indicador de progreso si quieres
        console.log(`Progreso: ${answeredCount}/${totalQuestions} preguntas respondidas`);
    }
};

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    EvaluacionPage.init();
});

// Mantener función global para compatibilidad
function resetForm() {
    EvaluacionPage.resetForm();
}