// ===== GESTIÓN DE NAVEGACIÓN Y ESTADO =====

const NavigationManager = {
    currentPage: '',
    progress: {},

    /**
     * Inicializar sistema de navegación
     */
    init: function() {
        this.loadProgress();
        this.setActiveNavigation();
        this.setupEventListeners();
    },

    /**
     * Cargar progreso desde localStorage
     */
    loadProgress: function() {
        const saved = localStorage.getItem('graficas-progress');
        this.progress = saved ? JSON.parse(saved) : {
            completedLessons: [],
            currentReto: 0,
            evaluationScore: 0
        };
    },

    /**
     * Guardar progreso en localStorage
     */
    saveProgress: function() {
        localStorage.setItem('graficas-progress', JSON.stringify(this.progress));
    },

    /**
     * Establecer navegación activa basada en la página actual
     */
    setActiveNavigation: function() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-dots a').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase active al enlace correspondiente
        const pageMap = {
            'index.html': 1,
            'teoria.html': 2,
            'grafico.html': 3,
            'aplicacion.html': 4,
            'evaluacion.html': 5
        };

        const pageNumber = pageMap[currentPage];
        if (pageNumber) {
            const activeLink = document.querySelector(`.nav-dots li:nth-child(${pageNumber}) a`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    },

    /**
     * Configurar event listeners para navegación
     */
    setupEventListeners: function() {
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        window.location.href = 'index.html';
                        break;
                    case '2':
                        window.location.href = 'teoria.html';
                        break;
                    case '3':
                        window.location.href = 'grafico.html';
                        break;
                    case '4':
                        window.location.href = 'aplicacion.html';
                        break;
                    case '5':
                        window.location.href = 'evaluacion.html';
                        break;
                }
            }
        });

        // Prevenir navegación si hay cambios sin guardar
        window.addEventListener('beforeunload', (e) => {
            // Aquí puedes agregar lógica para verificar cambios sin guardar
            // e.preventDefault();
            // e.returnValue = '';
        });
    },

    /**
     * Marcar lección como completada
     * @param {string} lessonId - ID de la lección
     */
    completeLesson: function(lessonId) {
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.saveProgress();
            this.updateNavigationUI();
        }
    },

    /**
     * Actualizar interfaz de navegación
     */
    updateNavigationUI: function() {
        document.querySelectorAll('.nav-dots a').forEach((link, index) => {
            const pageNumber = index + 1;
            if (this.progress.completedLessons.includes(`page-${pageNumber}`)) {
                link.classList.add('completed');
            }
        });
    },

    /**
     * Obtener siguiente página disponible
     * @returns {string} URL de la siguiente página
     */
    getNextPage: function() {
        const pages = ['index.html', 'teoria.html', 'grafico.html', 'aplicacion.html', 'evaluacion.html'];
        const currentPage = window.location.pathname.split('/').pop();
        const currentIndex = pages.indexOf(currentPage);
        
        return currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
    },

    /**
     * Navegar a la siguiente página
     */
    goToNextPage: function() {
        const nextPage = this.getNextPage();
        if (nextPage) {
            window.location.href = nextPage;
        }
    },

    /**
     * Verificar si una página está desbloqueada
     * @param {string} pageUrl - URL de la página
     * @returns {boolean} True si está desbloqueada
     */
    isPageUnlocked: function(pageUrl) {
        const pageOrder = ['index.html', 'teoria.html', 'grafico.html', 'aplicacion.html', 'evaluacion.html'];
        const currentPage = window.location.pathname.split('/').pop();
        const currentIndex = pageOrder.indexOf(currentPage);
        const targetIndex = pageOrder.indexOf(pageUrl);
        
        return targetIndex <= currentIndex + 1;
    }
};