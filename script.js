// =============================================
// SCRIPT PRINCIPAL - MasterStudio Website
// Incluye: Navegación, Tema, Traducciones y SORTEOS
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('main section');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // ==================== NAVEGACIÓN ====================
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-section');

            // Remover clase activa de todos
            navButtons.forEach(btn => btn.classList.remove('active-nav'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Activar botón y sección correspondiente
            button.classList.add('active-nav');
            document.getElementById(targetId)?.classList.add('active');

            // Si es la sección de sorteos → cargar datos
            if (targetId === 'sorteos') {
                loadSorteoData();
            }
        });
    });

    // ==================== TEMA CLARO/OSCURO ====================
    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        themeToggle.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Cargar tema guardado
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        themeToggle.textContent = 'Modo Oscuro';
    }

    // ==================== TRADUCCIONES (si tienes) ====================
    // Si usas tu sistema de idiomas, déjalo aquí debajo (no lo toqué)

    // ==================== SISTEMA DE SORTEOS ====================
    const SORTEOS_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/sorteos.json';
    const PARTICIPANTES_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/participantes.json';

    let sorteoData = null;
    let participantesData = null;
    let countdownInterval = null;

    async function loadSorteoData() {
        try {
            const response = await fetch(SORTEOS_JSON_URL + '?t=' + Date.now());
            if (!response.ok) throw new Error('Error al cargar sorteos.json');
            sorteoData = await response.json();
            console.log('Datos del sorteo cargados:', sorteoData);

            if (sorteoData.activo) {
                await loadParticipantes();
            }
            displaySorteo();
        } catch (error) {
            console.error('Error cargando sorteo:', error);
            showNoSorteos();
        }
    }

    async function loadParticipantes() {
        try {
            const response = await fetch(PARTICIPANTES_JSON_URL + '?t=' + Date.now());
            if (!response.ok) throw new Error('Error al cargar participantes');
            participantesData = await response.json();
            console.log('Participantes:', participantesData.totalParticipantes);
        } catch (error) {
            console.error('Error participantes:', error);
            participantesData = { participantes: [], totalParticipantes: 0 };
        }
    }

    function displaySorteo() {
        const noSorteos = document.getElementById('no-sorteos-container');
        const activo = document.getElementById('sorteo-activo-container');
        const ganador = document.getElementById('sorteo-ganador-container');

        // Ocultar todo
        noSorteos.style.display = 'none';
        activo.style.display = 'none';
        ganador.style.display = 'none';

        if (!sorteoData || !sorteoData.activo) {
            showNoSorteos();
            return;
        }

        // Si ya hay ganador anunciado
        if (sorteoData.ganadorSeleccionado && sorteoData.ganador) {
            showGanador();
            return;
        }

        // Fecha de finalización
        const fechaFin = new Date(
            sorteoData.fechaFinalizacion.año,
            sorteoData.fechaFinalizacion.mes - 1,
            sorteoData.fechaFinalizacion.dia,
            sorteoData.fechaFinalizacion.hora,
            sorteoData.fechaFinalizacion.minuto
        );

        if (new Date() >= fechaFin) {
            seleccionarGanador();
            return;
        }

        // Mostrar sorteo activo
        activo.style.display = 'block';

        document.getElementById('sorteo-titulo').textContent = sorteoData.titulo || 'SORTEO ESPECIAL';
        document.getElementById('sorteo-subtitulo').textContent = sorteoData.subtitulo || '';
        document.getElementById('sorteo-descripcion').textContent = sorteoData.descripcion || '';
        document.getElementById('sorteo-imagen').src = sorteoData.imagenPremio || '';
        document.getElementById('sorteo-premio').textContent = sorteoData.premio || 'PREMIO';

        // Requisitos
        const lista = document.getElementById('sorteo-requisitos-lista');
        lista.innerHTML = '';
        (sorteoData.requisitos || []).forEach(req => {
            const li = document.createElement('li');
            li.textContent = req;
            lista.appendChild(li);
        });

        // Contador y participantes
        startCountdown(fechaFin);
        updateParticipantesCount();
    }

    function showNoSorteos() {
        document.getElementById('no-sorteos-container').style.display = 'block';
        if (countdownInterval) clearInterval(countdownInterval);
    }

    function startCountdown(fechaFin) {
        if (countdownInterval) clearInterval(countdownInterval);

        const update = () => {
            const now = new Date().getTime();
            const distance = fechaFin.getTime() - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                seleccionarGanador();
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('dias').textContent = String(d).padStart(2, '0');
            document.getElementById('horas').textContent = String(h).padStart(2, '0');
            document.getElementById('minutos').textContent = String(m).padStart(2, '0');
            document.getElementById('segundos').textContent = String(s).padStart(2, '0');
        };

        update();
        countdownInterval = setInterval(update, 1000);
    }

    function updateParticipantesCount() {
        const el = document.getElementById('total-participantes');
        el.textContent = participantesData?.totalParticipantes || 0;
    }

    function seleccionarGanador() {
        if (!participantesData || participantesData.participantes.length === 0) {
            showNoSorteos();
            return;
        }

        const index = Math.floor(Math.random() * participantesData.participantes.length);
        const ganador = participantesData.participantes[index];
        mostrarGanador(ganador);
    }

    function mostrarGanador(ganadorObj) {
        document.getElementById('sorteo-activo-container').style.display = 'none';
        const cont = document.getElementById('sorteo-ganador-container');
        cont.style.display = 'block';

        const nombre = ganadorObj.nombre || ganadorObj.username || 'Anónimo';
        document.getElementById('ganador-nombre').textContent = nombre;
        document.getElementById('ganador-premio-texto').textContent = sorteoData?.premio || 'Premio';

        createConfetti();
        if (countdownInterval) clearInterval(countdownInterval);
    }

    function showGanador() {
        const g = sorteoData.ganador;
        mostrarGanador({ nombre: g?.nombre || g?.username || 'Desconocido' });
    }

    function createConfetti() {
        const container = document.querySelector('.confetti-container');
        if (!container) return;

        const colors = ['#FFD700', '#FFA500', '#FF6B35', '#4CAF50', '#5865F2'];

        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.style.position = 'absolute';
                c.style.width = '12px';
                c.style.height = '12px';
                c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                c.style.left = Math.random() * 100 + '%';
                c.style.top = '-15px';
                c.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                c.style.transform = `rotate(${Math.random() * 360}deg)`;
                c.style.opacity = '1';
                c.style.transition = 'all 3s ease-out';
                container.appendChild(c);

                setTimeout(() => {
                    c.style.top = '100%';
                    c.style.opacity = '0';
                }, 50);

                setTimeout(() => c.remove(), 3200);
            }, i * 40);
        }
    }

    // Si la página carga directamente en #sorteos
    if (window.location.hash === '#sorteos' || document.getElementById('sorteos')?.classList.contains('active')) {
        loadSorteoData();
    }
});
