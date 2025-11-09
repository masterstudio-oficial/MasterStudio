// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

const profileContainer = document.getElementById('profile-container');
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownEmail = document.getElementById('dropdown-email');
const logoutButton = document.getElementById('logout-button');

// Elementos del Quiz
const quizContent = document.getElementById('quiz-content');
const loginToParticipate = document.getElementById('login-to-participate');
const quizTimerEl = document.getElementById('quiz-timer');
const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const quizMessage = document.getElementById('quiz-message');
const noQuizMessage = document.getElementById('no-quiz-message');
const winnerSection = document.getElementById('winner-section');

// Claves de almacenamiento
const USER_STORAGE_KEY = 'masterstudio_user';
const QUIZ_ANSWER_KEY = 'masterstudio_quiz_answer';

// URLs
const QUIZ_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/preguntas.json';
const RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbxK4kyZ_e18qBt4NGY_MqFzCMhreJuLVNJApXP3GCrqdU5jEW6vOFQoziPMhEyNK6k6jg/exec';

// Variables de estado
let currentUser = null;
let selectedOption = null;
let dailyQuizData = null;
let quizTimer = null;
let timeRemaining = 15;

// =============================================
// CONFIGURACIÓN DE MANTENIMIENTO
// =============================================

const MAINTENANCE_SCREEN = document.getElementById('maintenance-screen');
const IS_MAINTENANCE_ACTIVE = false;
const BYPASS_PARAM = 'dev';
const BYPASS_VALUE = 'master';

function checkMaintenanceStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const bypassActive = urlParams.get(BYPASS_PARAM) === BYPASS_VALUE;

    if (IS_MAINTENANCE_ACTIVE && !bypassActive) {
        MAINTENANCE_SCREEN.classList.remove('hidden');
        return true;
    } else {
        MAINTENANCE_SCREEN.classList.add('hidden');
        return false;
    }
}

// =============================================
// FUNCIONES DE MODAL
// =============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        profileDropdown.classList.remove('show');
        
        if (modalId === 'ranking-modal') {
            loadRanking();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
});

// =============================================
// SISTEMA DE RANKING
// =============================================

async function loadRanking() {
    try {
        const response = await fetch(RANKING_API_URL + '?action=getRanking');
        const data = await response.json();
        
        if (data.success && data.users && data.users.length > 0) {
            displayRanking(data.users);
        } else {
            displayRanking([]);
        }
    } catch (error) {
        console.error('Error al cargar ranking:', error);
        displayRanking([]);
    }
}

function displayRanking(users) {
    // Actualizar Top 3
    document.getElementById('rank-1-name').textContent = users[0]?.username || '---';
    document.getElementById('rank-1-tickets').textContent = users[0] ? `${users[0].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-2-name').textContent = users[1]?.username || '---';
    document.getElementById('rank-2-tickets').textContent = users[1] ? `${users[1].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-3-name').textContent = users[2]?.username || '---';
    document.getElementById('rank-3-tickets').textContent = users[2] ? `${users[2].tickets} TICKETS` : '0 TICKETS';

    // Resto del ranking
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    for (let i = 3; i < users.length; i++) {
        const user = users[i];
        const rankingUser = document.createElement('div');
        rankingUser.className = 'ranking-user';
        
        rankingUser.innerHTML = `
            <span class="ranking-position">#${i + 1}</span>
            <span class="ranking-name">${user.username}</span>
            <span class="ranking-tickets">${user.tickets} TICKETS</span>
        `;
        
        rankingList.appendChild(rankingUser);
    }

    if (users.length === 0) {
        rankingList.innerHTML = '<div style="text-align: center; color: #aaaaaa; padding: 20px;">Aún no hay participantes en el ranking. ¡Sé el primero! 🎮</div>';
    } else if (users.length <= 3) {
        rankingList.innerHTML = '<div style="text-align: center; color: #aaaaaa; padding: 20px;">No hay más participantes en el ranking</div>';
    }
}

// =============================================
// AUTENTICACIÓN CON GOOGLE
// =============================================

function handleCredentialResponse(response) {
    if (response.credential) {
        const idToken = response.credential;
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        currentUser = { 
            id: payload.sub,
            name: payload.given_name || payload.name || payload.email,
            email: payload.email 
        };
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        updateLoginUI();
        
        if (document.getElementById('quiz').classList.contains('active')) {
            loadDailyQuiz(currentUser.id);
        }
    }
}

function updateLoginUI() {
    const gIdOnload = document.getElementById('g_id_onload');
    const gIdSignin = document.querySelector('.g_id_signin');

    if (currentUser) {
        if (gIdOnload) gIdOnload.style.display = 'none';
        if (gIdSignin) gIdSignin.style.display = 'none';

        profileContainer.style.display = 'block';
        dropdownUsername.textContent = currentUser.name;
        dropdownEmail.textContent = currentUser.email;
        
        loginToParticipate.style.display = 'none';
    } else {
        if (gIdOnload) gIdOnload.style.display = 'block';
        if (gIdSignin) gIdSignin.style.display = 'block';
        
        profileContainer.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (profileIcon) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (profileContainer && !profileContainer.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem(USER_STORAGE_KEY);
            profileDropdown.classList.remove('show');
            updateLoginUI();
            
            if (document.getElementById('quiz').classList.contains('active')) {
                loginToParticipate.style.display = 'block';
                quizContent.style.display = 'none';
                noQuizMessage.style.display = 'none';
                winnerSection.style.display = 'none';
            }
            
            location.reload();
        });
    }
});

// =============================================
// SISTEMA DE QUIZ
// =============================================

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function getDailyQuizData() {
    try {
        const response = await fetch(QUIZ_JSON_URL);
        if (!response.ok) {
            console.error('Error al cargar preguntas.json:', response.statusText);
            return null;
        }
        const quizData = await response.json();
        const todayDate = getTodayDate();
        
        return quizData[todayDate] || null;
    } catch (e) {
        console.error('Fallo en la petición de preguntas.json:', e);
        return null;
    }
}

async function saveTicketToServer(userId, username) {
    try {
        await fetch(RANKING_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addTicket',
                userId: userId,
                username: username,
                date: getTodayDate(),
                timestamp: Date.now()
            })
        });
        console.log('Ticket guardado en el servidor');
    } catch (error) {
        console.log('Error al guardar ticket en servidor:', error);
    }
}

function startQuizTimer() {
    timeRemaining = 15;
    updateTimerDisplay();
    
    quizTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 5) {
            quizTimerEl.classList.add('warning');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    quizTimerEl.textContent = `⏱️ ${timeRemaining}`;
}

function handleTimeUp() {
    localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, 'TIMEOUT');
    
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.add('disabled');
    });
    
    quizMessage.textContent = '⏰ ¡Se acabó el tiempo! No respondiste a tiempo. Vuelve mañana para una nueva oportunidad.';
    quizMessage.style.color = '#F44336';
}

function handleOptionClick(event) {
    if (timeRemaining <= 0) return;
    
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.classList.add('selected');
    selectedOption = event.target.textContent;
    
    setTimeout(() => handleQuizSubmit(), 300);
}

async function handleQuizSubmit() {
    if (!selectedOption || timeRemaining <= 0) return;
    
    const selectedElement = document.querySelector('.quiz-option.selected');
    const selectedKey = selectedElement ? selectedElement.getAttribute('data-key') : null;

    if (!dailyQuizData) return;

    clearInterval(quizTimer);

    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.add('disabled');
    });

    if (selectedKey === dailyQuizData.respuesta_correcta) {
        // Respuesta correcta - Guardar ticket
        await saveTicketToServer(currentUser.id, currentUser.name);
        
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, 'CORRECT');
        
        // Mostrar mensaje de victoria
        quizContent.style.display = 'none';
        winnerSection.style.display = 'block';
        winnerSection.innerHTML = `
            <div class="quiz-result">
                <h3>🎉 ¡FELICIDADES! 🎉</h3>
                <p>¡Respondiste correctamente!</p>
                <div class="ticket-earned">+1 TICKET</div>
                <p style="font-size: 1rem; margin-top: 10px;">¡Has ganado 1 ticket! 🎫</p>
                <div class="user-stats">
                    <p>Vuelve mañana para ganar más tickets 😊</p>
                </div>
            </div>
        `;
        
    } else {
        // Respuesta incorrecta
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, 'INCORRECT');
        
        quizContent.style.display = 'none';
        winnerSection.style.display = 'block';
        winnerSection.innerHTML = `
            <div class="quiz-result incorrect">
                <h3>❌ Respuesta Incorrecta</h3>
                <p>¡Oh no! Tu respuesta fue incorrecta.</p>
                <p style="margin-top: 15px;">Vuelve mañana para intentarlo de nuevo con la pregunta diaria del siguiente día. ¡No te rindas! 💪</p>
            </div>
        `;
    }
}

async function loadDailyQuiz(userId) {
    loginToParticipate.style.display = 'none';
    quizContent.style.display = 'none';
    noQuizMessage.style.display = 'none';
    winnerSection.style.display = 'none';
    quizTimerEl.classList.remove('warning');
    
    dailyQuizData = await getDailyQuizData();
    
    if (!dailyQuizData) {
        noQuizMessage.style.display = 'block';
        return;
    }

    const storedAnswer = localStorage.getItem(`${QUIZ_ANSWER_KEY}_${userId}_${getTodayDate()}`);

    if (storedAnswer) {
        winnerSection.style.display = 'block';
        
        if (storedAnswer === 'CORRECT') {
            winnerSection.innerHTML = `
                <div class="quiz-result">
                    <h3>✅ Ya participaste hoy</h3>
                    <p>Ganaste 1 ticket 🎫</p>
                    <div class="user-stats">
                        <p>Vuelve mañana para la nueva pregunta diaria 😊</p>
                    </div>
                </div>
            `;
        } else if (storedAnswer === 'INCORRECT') {
            winnerSection.innerHTML = `
                <div class="quiz-result incorrect">
                    <h3>❌ Ya participaste hoy</h3>
                    <p>Tu respuesta fue incorrecta</p>
                    <div class="user-stats">
                        <p>Vuelve mañana para intentarlo de nuevo 💪</p>
                    </div>
                </div>
            `;
        } else if (storedAnswer === 'TIMEOUT') {
            winnerSection.innerHTML = `
                <div class="quiz-result incorrect">
                    <h3>⏰ Ya participaste hoy</h3>
                    <p>No respondiste a tiempo</p>
                    <div class="user-stats">
                        <p>¡Vuelve mañana por otra oportunidad! 🎮</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    quizContent.style.display = 'block';
    quizTimerEl.style.display = 'block';
    quizQuestionEl.textContent = dailyQuizData.pregunta;
    quizOptionsContainer.innerHTML = '';
    quizMessage.textContent = '';
    selectedOption = null;

    const optionsArray = Object.values(dailyQuizData.opciones);
    optionsArray.forEach(option => {
        const optionEl = document.createElement('div');
        const optionKey = Object.keys(dailyQuizData.opciones).find(key => dailyQuizData.opciones[key] === option);
        optionEl.className = 'quiz-option';
        optionEl.setAttribute('data-key', optionKey);
        optionEl.textContent = option;
        optionEl.addEventListener('click', handleOptionClick);
        quizOptionsContainer.appendChild(optionEl);
    });

    startQuizTimer();
}

function checkLocalStorageUser() {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateLoginUI();
            return true;
        } catch (e) {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }
    
    if (document.getElementById('quiz') && document.getElementById('quiz').classList.contains('active')) {
        loginToParticipate.style.display = 'block';
        quizContent.style.display = 'none';
        noQuizMessage.style.display = 'none';
        winnerSection.style.display = 'none';
    }
    return false;
}

// =============================================
// NAVEGACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-section');
            
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active-nav');
            });
            
            this.classList.add('active-nav');

            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                if (targetId === 'quiz') {
                     if (currentUser) {
                        loadDailyQuiz(currentUser.id);
                    } else {
                        loginToParticipate.style.display = 'block';
                        quizContent.style.display = 'none';
                        noQuizMessage.style.display = 'none';
                        winnerSection.style.display = 'none';
                    }
                }
            }
        });
    });
});

// =============================================
// INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const isMaintenance = checkMaintenanceStatus();
    
    if (isMaintenance) {
        return;
    }
    
    checkLocalStorageUser();
});

// Auto-actualizar ranking cada 30 segundos si el modal está abierto
setInterval(() => {
    const rankingModal = document.getElementById('ranking-modal');
    if (rankingModal && rankingModal.classList.contains('show')) {
        loadRanking();
    }
}, 30000);
