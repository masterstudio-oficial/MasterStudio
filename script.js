// =============================================
// SISTEMA DE SORTEOS
// =============================================

// URLs y constantes
const SORTEOS_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/sorteos.json';
const PARTICIPANTES_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/participantes.json';

let sorteoData = null;
let participantesData = null;
let countdownInterval = null;

/**
 * Cargar datos del sorteo desde el JSON
 */
async function loadSorteoData() {
    try {
        const response = await fetch(SORTEOS_JSON_URL + '?' + Date.now()); // Cache busting
        if (!response.ok) {
            throw new Error('Error al cargar sorteos.json');
        }
        sorteoData = await response.json();
        console.log('📦 Datos del sorteo cargados:', sorteoData);
        
        // Cargar participantes si el sorteo está activo
        if (sorteoData.activo) {
            await loadParticipantes();
        }
        
        displaySorteo();
    } catch (error) {
        console.error('❌ Error al cargar sorteo:', error);
        showNoSorteos();
    }
}

/**
 * Cargar lista de participantes desde el JSON
 */
async function loadParticipantes() {
    try {
        const response = await fetch(PARTICIPANTES_JSON_URL + '?' + Date.now());
        if (!response.ok) {
            throw new Error('Error al cargar participantes.json');
        }
        participantesData = await response.json();
        console.log('👥 Participantes cargados:', participantesData.totalParticipantes);
    } catch (error) {
        console.error('❌ Error al cargar participantes:', error);
        participantesData = { participantes: [], totalParticipantes: 0 };
    }
}

/**
 * Mostrar el sorteo o el mensaje de "no hay sorteos"
 */
function displaySorteo() {
    const noSorteosContainer = document.getElementById('no-sorteos-container');
    const sorteoActivoContainer = document.getElementById('sorteo-activo-container');
    const ganadorContainer = document.getElementById('sorteo-ganador-container');

    if (!sorteoData || !sorteoData.activo) {
        showNoSorteos();
        return;
    }

    // Verificar si ya hay un ganador seleccionado
    if (sorteoData.ganadorSeleccionado && sorteoData.ganador) {
        showGanador();
        return;
    }

    // Verificar si el sorteo ya terminó
    const fechaFin = new Date(
        sorteoData.fechaFinalizacion.año,
        sorteoData.fechaFinalizacion.mes - 1,
        sorteoData.fechaFinalizacion.dia,
        sorteoData.fechaFinalizacion.hora,
        sorteoData.fechaFinalizacion.minuto
    );

    if (new Date() >= fechaFin) {
        // El sorteo terminó, seleccionar ganador
        seleccionarGanador();
        return;
    }

    // Mostrar sorteo activo
    noSorteosContainer.style.display = 'none';
    ganadorContainer.style.display = 'none';
    sorteoActivoContainer.style.display = 'block';

    // Llenar información del sorteo
    document.getElementById('sorteo-titulo').textContent = sorteoData.titulo || 'SORTEO ESPECIAL';
    document.getElementById('sorteo-subtitulo').textContent = sorteoData.subtitulo || '';
    document.getElementById('sorteo-descripcion').textContent = sorteoData.descripcion || '';
    document.getElementById('sorteo-imagen').src = sorteoData.imagenPremio || '';
    document.getElementById('sorteo-premio').textContent = sorteoData.premio || 'PREMIO';

    // Llenar requisitos
    const requisitosList = document.getElementById('sorteo-requisitos-lista');
    requisitosList.innerHTML = '';
    if (sorteoData.requisitos && sorteoData.requisitos.length > 0) {
        sorteoData.requisitos.forEach(req => {
            const li = document.createElement('li');
            li.textContent = req;
            requisitosList.appendChild(li);
        });
    }

    // Iniciar contador regresivo
    startCountdown(fechaFin);

    // Actualizar contador de participantes
    updateParticipantesCount();
}

/**
 * Mostrar mensaje de "no hay sorteos"
 */
function showNoSorteos() {
    document.getElementById('no-sorteos-container').style.display = 'block';
    document.getElementById('sorteo-activo-container').style.display = 'none';
    document.getElementById('sorteo-ganador-container').style.display = 'none';
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

/**
 * Iniciar contador regresivo
 */
function startCountdown(fechaFin) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = fechaFin.getTime() - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            seleccionarGanador();
            return;
        }

        const dias = Math.floor(distance / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('dias').textContent = String(dias).padStart(2, '0');
        document.getElementById('horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Actualizar contador de participantes
 */
function updateParticipantesCount() {
    const totalElement = document.getElementById('total-participantes');
    
    if (participantesData && participantesData.totalParticipantes) {
        totalElement.textContent = participantesData.totalParticipantes;
    } else {
        totalElement.textContent = '0';
    }
}

/**
 * Seleccionar ganador del sorteo de forma aleatoria
 */
function seleccionarGanador() {
    console.log('🎲 Seleccionando ganador del sorteo...');
    
    if (!participantesData || !participantesData.participantes || participantesData.participantes.length === 0) {
        console.warn('⚠️ No hay participantes en el sorteo');
        showNoSorteos();
        return;
    }

    // Seleccionar participante aleatorio
    const randomIndex = Math.floor(Math.random() * participantesData.participantes.length);
    const ganador = participantesData.participantes[randomIndex];
    
    console.log('🏆 Ganador seleccionado:', ganador);
    mostrarGanador(ganador);
}

/**
 * Mostrar ganador en la interfaz
 */
function mostrarGanador(ganador) {
    const ganadorContainer = document.getElementById('sorteo-ganador-container');
    
    document.getElementById('no-sorteos-container').style.display = 'none';
    document.getElementById('sorteo-activo-container').style.display = 'none';
    ganadorContainer.style.display = 'block';
    
    // Mostrar nombre del ganador
    const nombreGanador = ganador.nombre || ganador.username || 'Participante';
    document.getElementById('ganador-nombre').textContent = nombreGanador;
    document.getElementById('ganador-premio-texto').textContent = sorteoData?.premio || 'PREMIO';
    
    // Crear efecto de confeti
    createConfetti();
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

/**
 * Mostrar ganador (cuando ya está seleccionado en sorteos.json)
 */
function showGanador() {
    if (!sorteoData || !sorteoData.ganador) return;
    
    mostrarGanador({
        nombre: sorteoData.ganador.nombre || sorteoData.ganador.username
    });
}

/**
 * Crear efecto de confeti
 */
function createConfetti() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    const colors = ['#FFD700', '#FFA500', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.transition = 'all 3s ease-out';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.style.top = '100%';
                confetti.style.opacity = '0';
                confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
            }, 50);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

// =============================================
// INICIALIZACIÓN AL ENTRAR A LA SECCIÓN
// =============================================

// Agregar al evento de navegación existente
document.addEventListener('DOMContentLoaded', () => {
    // Buscar el código donde se manejan los clics de navegación
    // y agregar esta lógica cuando se selecciona "sorteos"
    
    const originalNavButtons = document.querySelectorAll('.nav-button');
    originalNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-section');
            
            if (targetId === 'sorteos') {
                // Cargar datos del sorteo cuando se entra a la sección
                loadSorteoData();
            }
        });
    });
});

// También cargar si la página se carga directamente en la sección de sorteos
if (document.getElementById('sorteos')?.classList.contains('active')) {
    loadSorteoData();
}
