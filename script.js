// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

const profileContainer = document.getElementById('profile-container');
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownEmail = document.getElementById('dropdown-email');
const dropdownTickets = document.getElementById('dropdown-tickets');
const logoutButton = document.getElementById('logout-button');
const notificationBadge = document.getElementById('notification-badge');
const notificationCountMenu = document.getElementById('notification-count-menu');

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
const QUIZ_TICKETS_KEY = 'masterstudio_user_tickets';
const USER_DATA_KEY = 'masterstudio_users_data';
const NOTIFICATIONS_KEY = 'masterstudio_notifications_enabled';
const LANGUAGE_KEY = 'masterstudio_language';
const THEME_KEY = 'masterstudio_theme';
const LIKES_STORAGE_KEY = 'masterstudio_post_likes';

// URLs
const QUIZ_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/preguntas.json';
const RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbx-Oay0uBNGDJborb0kKQIkymVFxmO-NB4EUBZHNogOxP-FLPItFrnmYxYqzmuwx2vVBw/exec';
const POSTS_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/posts.json';
const SORTEOS_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/sorteos.json';
const PARTICIPANTES_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/participantes.json';

// Variables de estado
let currentUser = null;
let selectedOption = null;
let dailyQuizData = null;
let quizTimer = null;
let timeRemaining = 15;
let notificationsEnabled = false;
let currentLanguage = 'es';
let currentTheme = 'dark';
let translations = {};
let sorteoData = null;
let participantesData = null;
let countdownInterval = null;


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
// SISTEMA DE IDIOMAS
// =============================================

async function loadLanguage(lang) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/lang/${lang}.json`);
        if (!response.ok) {
            console.error('Error al cargar idioma:', lang);
            return;
        }
        translations = await response.json();
        applyTranslations();
    } catch (e) {
        console.error('Error cargando traducciones:', e);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[key]) {
            if (key.includes('quiz-no-question')) {
                element.innerHTML = translations[key].replace('\\n', '<br>');
            } else {
                element.textContent = translations[key];
            }
        }
    });
}

function selectLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);
    
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`[data-lang-code="${lang}"]`).classList.add('active');
    
    loadLanguage(lang);
}

function loadLanguageSettings() {
    currentLanguage = localStorage.getItem(LANGUAGE_KEY) || 'es';
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('active');
    });
    const activeOpt = document.querySelector(`[data-lang-code="${currentLanguage}"]`);
    if (activeOpt) activeOpt.classList.add('active');
    
    loadLanguage(currentLanguage);
}

// =============================================
// SISTEMA DE NOTIFICACIONES
// =============================================

function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem(NOTIFICATIONS_KEY, notificationsEnabled);
    
    const toggle = document.getElementById('notifications-toggle');
    if (notificationsEnabled) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }
    
    updateNotificationBadge();
}

function updateNotificationBadge() {
    if (notificationsEnabled) {
        const count = 0;
        if (count > 0) {
            notificationBadge.textContent = count;
            notificationBadge.style.display = 'flex';
            notificationCountMenu.textContent = count;
            notificationCountMenu.style.display = 'inline';
        } else {
            notificationBadge.style.display = 'none';
            notificationCountMenu.style.display = 'none';
        }
    } else {
        notificationBadge.style.display = 'none';
        notificationCountMenu.style.display = 'none';
    }
}

function loadNotificationsSettings() {
    notificationsEnabled = localStorage.getItem(NOTIFICATIONS_KEY) === 'true';
    const toggle = document.getElementById('notifications-toggle');
    if (notificationsEnabled) {
        toggle.classList.add('active');
    }
    updateNotificationBadge();
}

// =============================================
// SISTEMA DE TEMAS
// =============================================

function selectTheme(theme) {
    currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    
    // Aplicar tema al body
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    // Actualizar selector visual
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    
    console.log(`🎨 Tema cambiado a: ${theme}`);
}

function loadThemeSettings() {
    currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    
    // Aplicar tema guardado
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    // Actualizar selector visual
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    const activeOpt = document.querySelector(`[data-theme="${currentTheme}"]`);
    if (activeOpt) activeOpt.classList.add('active');
}

// =============================================
// SISTEMA DE RANKING
// =============================================

function saveUserData(userId, username, email) {
    try {
        let usersData = JSON.parse(localStorage.getItem(USER_DATA_KEY)) || {};
        usersData[userId] = {
            username: username,
            email: email,
            lastUpdate: Date.now()
        };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(usersData));
        console.log('💾 Datos de usuario guardados:', username);
    } catch (e) {
        console.error('Error guardando datos de usuario:', e);
    }
}

function getUserData(userId) {
    try {
        const usersData = JSON.parse(localStorage.getItem(USER_DATA_KEY)) || {};
        return usersData[userId] || null;
    } catch (e) {
        console.error('Error leyendo datos de usuario:', e);
        return null;
    }
}

function getUserTickets(userId) {
    const key = `${QUIZ_TICKETS_KEY}_${userId}`;
    const tickets = localStorage.getItem(key);
    const ticketCount = tickets ? parseInt(tickets) : 0;
    console.log(`🎟️ getUserTickets("${userId}"): ${ticketCount} (key: ${key})`);
    return ticketCount;
}

function incrementUserTickets(userId) {
    const currentTickets = getUserTickets(userId);
    const newTickets = currentTickets + 1;
    localStorage.setItem(`${QUIZ_TICKETS_KEY}_${userId}`, newTickets);
    console.log(`✅ Tickets actualizados: ${newTickets} para usuario ${userId}`);
    
    if (dropdownTickets && currentUser && currentUser.id === userId) {
        dropdownTickets.textContent = `🎫 ${newTickets} Tickets`;
    }
    
    return newTickets;
}

async function loadRanking() {
    try {
        const response = await fetch(RANKING_API_URL + '?action=getRanking');
        const data = await response.json();
        
        console.log('📊 Datos del ranking recibidos:', data);
        
        if (data.success && data.users && data.users.length > 0) {
            displayRanking(data.users);
        } else {
            const localRanking = createLocalRanking();
            displayRanking(localRanking);
        }
    } catch (error) {
        console.error('❌ Error al cargar ranking:', error);
        const localRanking = createLocalRanking();
        displayRanking(localRanking);
    }
}

function createLocalRanking() {
    const users = [];
    const processedUsers = new Set();
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(QUIZ_TICKETS_KEY)) {
            const userId = key.replace(`${QUIZ_TICKETS_KEY}_`, '');
            
            if (processedUsers.has(userId)) continue;
            processedUsers.add(userId);
            
            const tickets = parseInt(localStorage.getItem(key)) || 0;
            
            if (tickets > 0) {
                const userData = getUserData(userId);
                let username = 'Usuario';
                
                if (userData && userData.username) {
                    username = userData.username;
                } else if (currentUser && currentUser.id === userId) {
                    username = currentUser.name;
                } else {
                    username = `Usuario ${userId.substring(0, 8)}`;
                }
                
                users.push({ userId, username, tickets });
            }
        }
    }
    
    if (currentUser) {
        const userInList = users.find(u => u.userId === currentUser.id);
        if (!userInList) {
            const userTickets = getUserTickets(currentUser.id);
            if (userTickets > 0) {
                users.push({
                    userId: currentUser.id,
                    username: currentUser.name,
                    tickets: userTickets
                });
            }
        }
    }
    
    users.sort((a, b) => b.tickets - a.tickets);
    
    console.log('📊 Ranking local creado:', users);
    console.log('👤 Usuario actual:', currentUser);
    console.log('🎫 Tickets del usuario actual:', currentUser ? getUserTickets(currentUser.id) : 0);
    
    return users;
}

function displayRanking(users) {
    document.getElementById('rank-1-name').textContent = users[0]?.username || '---';
    document.getElementById('rank-1-tickets').textContent = users[0] ? `${users[0].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-2-name').textContent = users[1]?.username || '---';
    document.getElementById('rank-2-tickets').textContent = users[1] ? `${users[1].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-3-name').textContent = users[2]?.username || '---';
    document.getElementById('rank-3-tickets').textContent = users[2] ? `${users[2].tickets} TICKETS` : '0 TICKETS';

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
        saveUserData(currentUser.id, currentUser.name, currentUser.email);
        
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
        
        const userTickets = getUserTickets(currentUser.id);
        if (dropdownTickets) {
            dropdownTickets.textContent = `🎫 ${userTickets} Tickets`;
        }
        
        loginToParticipate.style.display = 'none';
        
        loadNotificationsSettings();
        loadLanguageSettings();
        loadThemeSettings();
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
            
            if (currentUser && dropdownTickets) {
                const userTickets = getUserTickets(currentUser.id);
                dropdownTickets.textContent = `🎫 ${userTickets} Tickets`;
                console.log('🔄 Menú abierto - Tickets actualizados:', userTickets);
            }
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
        console.log('🔍 Cargando quiz del día:', getTodayDate());
        const response = await fetch(QUIZ_JSON_URL);
        if (!response.ok) {
            console.error('❌ Error al cargar preguntas.json:', response.statusText);
            return null;
        }
        const quizData = await response.json();
        console.log('📦 Datos del quiz cargados:', quizData);
        
        const todayDate = getTodayDate();
        console.log('📅 Fecha de hoy:', todayDate);
        console.log('📋 Pregunta de hoy:', quizData[todayDate]);
        
        return quizData[todayDate] || null;
    } catch (e) {
        console.error('❌ Fallo en la petición de preguntas.json:', e);
        return null;
    }
}

async function saveTicketToServer(userId, username, email) {
    try {
        const response = await fetch(RANKING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addTicket',
                userId: userId,
                username: username,
                email: email,
                date: getTodayDate(),
                timestamp: Date.now()
            })
        });
        
        const data = await response.json();
        console.log('✅ Respuesta del servidor:', data);
        
        if (data.success) {
            console.log('✅ Ticket guardado en servidor:', username);
        } else {
            console.log('⚠️ Error del servidor:', data.message);
        }
    } catch (error) {
        console.log('⚠️ No se pudo conectar con el servidor:', error);
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
        console.log('✅ Respuesta CORRECTA!');
        console.log('👤 Usuario actual:', currentUser);
        console.log('🆔 User ID:', currentUser.id);
        console.log('📝 Nombre:', currentUser.name);
        
        const newTicketCount = incrementUserTickets(currentUser.id);
        await saveTicketToServer(currentUser.id, currentUser.name, currentUser.email);
        
        console.log('💾 Ticket guardado. Nuevo total:', newTicketCount);
        console.log('🔑 localStorage key:', `${QUIZ_TICKETS_KEY}_${currentUser.id}`);
        console.log('📦 Valor guardado:', localStorage.getItem(`${QUIZ_TICKETS_KEY}_${currentUser.id}`));
        
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, 'CORRECT');
        
        quizContent.style.display = 'none';
        winnerSection.style.display = 'block';
        winnerSection.innerHTML = `
            <div class="quiz-result">
                <h3>🎉 ¡FELICIDADES! 🎉</h3>
                <p>¡Respondiste correctamente!</p>
                <div class="ticket-earned">+1 TICKET</div>
                <p style="font-size: 1rem; margin-top: 10px;">¡Has ganado 1 ticket! 🎫</p>
                <div class="user-stats">
                    <p>Total de tickets: ${newTicketCount} 🎟️</p>
                    <p style="margin-top: 10px;">Vuelve mañana para ganar más tickets 😊</p>
                </div>
            </div>
        `;
        
    } else {
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
            const currentTickets = getUserTickets(userId);
            winnerSection.innerHTML = `
                <div class="quiz-result">
                    <h3>✅ Ya participaste hoy</h3>
                    <p>Ganaste 1 ticket 🎫</p>
                    <div class="user-stats">
                        <p>Total de tickets: ${currentTickets} 🎟️</p>
                        <p style="margin-top: 10px;">Vuelve mañana para la nueva pregunta diaria 😊</p>
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
            saveUserData(currentUser.id, currentUser.name, currentUser.email);
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
                } else if (targetId === 'sorteos') {
                    // Cargar datos del sorteo cuando se entra a la sección
                    loadSorteoData();
                }
            }
        });
    });
});

// =============================================
// CARGAR POSTS
// =============================================

function generatePostId(post) {
    const cleanTitle = post.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanDate = post.fecha.replace(/[^0-9]/g, '');
    return `post-${cleanTitle}-${cleanDate}`;
}

function sharePost(postId, category) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?post=${postId}&category=${category}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        showCopyNotification();
        console.log('🔗 Link copiado:', shareUrl);
    }).catch(err => {
        console.error('Error al copiar:', err);
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

function showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = '✅ ¡Link copiado al portapapeles!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function toggleLike(postId) {
    if (!currentUser) {
        alert('Por favor, inicia sesión para dar like a los posts 💙');
        return;
    }
    
    const likeButton = document.querySelector(`#${postId} .like-button`);
    const likeCountSpan = document.querySelector(`#${postId} .like-count`);
    
    if (!likeButton) return;
    
    // Deshabilitar botón temporalmente
    likeButton.disabled = true;
    
    try {
        // Guardar en servidor
        const response = await fetch(RANKING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'toggleLike',
                postId: postId,
                userId: currentUser.id,
                username: currentUser.name
            })
        });
        
        const data = await response.json();
        console.log('❤️ Respuesta del servidor:', data);
        
        if (data.success) {
            // Actualizar UI según la acción
            if (data.action === 'liked') {
                likeButton.classList.add('liked');
                saveLocalLike(postId, true);
                console.log('💖 Like agregado a:', postId);
            } else {
                likeButton.classList.remove('liked');
                saveLocalLike(postId, false);
                console.log('💔 Like removido de:', postId);
            }
            
            // Actualizar contador
            await updateLikeCount(postId);
        }
        
    } catch (error) {
        console.error('❌ Error al dar like:', error);
        // Fallback a localStorage
        const isLiked = likeButton.classList.contains('liked');
        if (isLiked) {
            likeButton.classList.remove('liked');
            saveLocalLike(postId, false);
        } else {
            likeButton.classList.add('liked');
            saveLocalLike(postId, true);
        }
        // Actualizar contador con datos locales
        await updateLikeCount(postId);
    } finally {
        likeButton.disabled = false;
    }
}

function saveLocalLike(postId, liked) {
    if (!currentUser) return;
    try {
        let likes = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY)) || {};
        
        if (liked) {
            if (!likes[postId]) likes[postId] = [];
            if (!likes[postId].includes(currentUser.id)) {
                likes[postId].push(currentUser.id);
            }
        } else {
            if (likes[postId]) {
                likes[postId] = likes[postId].filter(id => id !== currentUser.id);
                if (likes[postId].length === 0) {
                    delete likes[postId];
                }
            }
        }
        
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
    } catch (e) {
        console.error('Error guardando like local:', e);
    }
}

function checkIfUserLiked(postId) {
    if (!currentUser) return false;
    
    const likes = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY)) || {};
    return likes[postId] && likes[postId].includes(currentUser.id);
}

async function updateLikeCount(postId) {
    const likeCountSpan = document.querySelector(`#${postId} .like-count`);
    if (!likeCountSpan) return;
    
    try {
        const response = await fetch(RANKING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getLikes',
                postId: postId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const count = data.count || 0;
            if (count > 0) {
                likeCountSpan.textContent = count;
                likeCountSpan.style.display = 'inline-flex';
            } else {
                likeCountSpan.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error al obtener likes:', error);
        // Fallback a localStorage
        const likes = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY)) || {};
        const count = likes[postId] ? likes[postId].length : 0;
        if (count > 0) {
            likeCountSpan.textContent = count;
            likeCountSpan.style.display = 'inline-flex';
        } else {
            likeCountSpan.style.display = 'none';
        }
    }
}

function checkSharedPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const category = urlParams.get('category');
    
    if (postId && category) {
        console.log('📌 Post compartido detectado:', postId, 'en categoría:', category);
        
        const targetSection = document.getElementById(category);
        if (targetSection) {
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active-nav');
            });
            document.querySelector(`[data-section="${category}"]`)?.classList.add('active-nav');
            
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active');
            });
            targetSection.classList.add('active');
            
            setTimeout(() => {
                const postElement = document.getElementById(postId);
                if (postElement) {
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    postElement.classList.add('highlighted');
                    
                    setTimeout(() => {
                        postElement.classList.remove('highlighted');
                        const cleanUrl = window.location.origin + window.location.pathname;
                        window.history.replaceState({}, document.title, cleanUrl);
                    }, 5000);
                } else {
                    console.warn('⚠️ Post no encontrado:', postId);
                }
            }, 500);
        }
    }
}

async function loadPosts() {
    try {
        const response = await fetch(POSTS_JSON_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const postsData = await response.json();

        // Si la data es un objeto de categorías, iteramos sobre ellas
        const posts = Array.isArray(postsData) ? postsData : Object.values(postsData).flat();
        
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = '';
        }

        posts.forEach(post => {
            // Usamos 'home' como categoría por defecto para renderizar en 'content-container'
            const category = post.categoria || 'home'; 
            const container = document.getElementById(`posts-${category}`) || contentContainer;

            if (container) {
                const postId = generatePostId(post);
                const postElement = createPostElement(post, postId, category);
                container.prepend(postElement);
                
                const placeholderText = container.parentElement.querySelector('.placeholder-text');
                if (placeholderText) {
                    placeholderText.style.display = 'none';
                }
                
                // Cargar contador de likes del servidor
                updateLikeCount(postId);
            }
        });
        
        checkSharedPost();
        
    } catch (e) {
        console.error('Error al cargar posts:', e);
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
             contentContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-color-secondary); padding: 50px;">
                    Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde. 😔
                </div>
            `;
        }
    }
}

function createPostElement(post, postId, category) {
    const isLiked = checkIfUserLiked(postId);
    const likedClass = isLiked ? 'liked' : '';
    const heartFill = isLiked ? 'fill="currentColor"' : 'fill="none"';
    
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.id = postId;
    
    // Reemplazar saltos de línea con <br> para el contenido
    const contentHtml = post.contenido ? post.contenido.replace(/\n/g, '<br>') : post.descripcion || '';
    
    let badge = post.esNuevo ? '<div class="new-badge">NEW!</div>' : '';
    
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-category">${post.categoria || 'GENERAL'}</span>
            <div class="post-meta">
                <span class="post-date">${post.fecha}</span>
                ${badge}
            </div>
        </div>
        
        <h2 class="post-title">${post.titulo}</h2>
        ${post.imagenUrl ? `<img src="${post.imagenUrl}" alt="${post.titulo}" class="post-image">` : ''}
        <div class="post-content">${contentHtml}</div>
        
        <div class="post-footer">
            <button class="like-button ${likedClass}" onclick="toggleLike('${postId}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${heartFill} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="like-count">0</span>
            </button>
            <button class="share-button" onclick="sharePost('${postId}', '${category}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </button>
        </div>
    `;
    return postDiv;
}


// =============================================
// SISTEMA DE SORTEOS
// =============================================

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
        
        // Cargar participantes si el sorteo está activo o ya finalizó
        await loadParticipantes();
        
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
        sorteoData.fechaFinalizacion.hora || 0,
        sorteoData.fechaFinalizacion.minuto || 0
    );

    if (new Date() >= fechaFin) {
        // El sorteo terminó, seleccionar ganador (si no hay uno en el JSON)
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
    
    const sorteoImagenEl = document.getElementById('sorteo-imagen');
    if (sorteoImagenEl) sorteoImagenEl.src = sorteoData.imagenPremio || '';
    
    document.getElementById('sorteo-premio').textContent = sorteoData.premio || 'PREMIO';

    // Llenar requisitos
    const requisitosList = document.getElementById('sorteo-requisitos-lista');
    if (requisitosList) {
        requisitosList.innerHTML = '';
        if (sorteoData.requisitos && sorteoData.requisitos.length > 0) {
            sorteoData.requisitos.forEach(req => {
                const li = document.createElement('li');
                li.textContent = req;
                requisitosList.appendChild(li);
            });
        }
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
    const noSorteosContainer = document.getElementById('no-sorteos-container');
    const sorteoActivoContainer = document.getElementById('sorteo-activo-container');
    const ganadorContainer = document.getElementById('sorteo-ganador-container');
    
    if (noSorteosContainer) noSorteosContainer.style.display = 'block';
    if (sorteoActivoContainer) sorteoActivoContainer.style.display = 'none';
    if (ganadorContainer) ganadorContainer.style.display = 'none';
    
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
    
    if (totalElement && participantesData && participantesData.totalParticipantes) {
        totalElement.textContent = participantesData.totalParticipantes;
    } else if (totalElement) {
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
    
    // NOTA: Para persistencia, el ganador debería subirse a sorteos.json en un entorno real.
}

/**
 * Mostrar ganador en la interfaz
 */
function mostrarGanador(ganador) {
    const ganadorContainer = document.getElementById('sorteo-ganador-container');
    
    document.getElementById('no-sorteos-container').style.display = 'none';
    document.getElementById('sorteo-activo-container').style.display = 'none';
    if (ganadorContainer) ganadorContainer.style.display = 'block';
    
    // Mostrar nombre del ganador
    const nombreGanador = ganador.nombre || ganador.username || 'Participante Afortunado';
    const ganadorNombreEl = document.getElementById('ganador-nombre');
    const ganadorPremioEl = document.getElementById('ganador-premio-texto');
    
    if (ganadorNombreEl) ganadorNombreEl.textContent = nombreGanador;
    if (ganadorPremioEl) ganadorPremioEl.textContent = sorteoData?.premio || 'PREMIO';
    
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
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    const colors = ['#FFD700', '#FFA500', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0'];
    
    // Limpiar confeti existente
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece'; // Asume que tienes estilos CSS para esto
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.transition = 'all 3s ease-out';
            
            container.appendChild(confetti);
            
            // Animación
            setTimeout(() => {
                confetti.style.top = (Math.random() * 100 + 100) + '%';
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
// INICIALIZACIÓN
// =============================================

function initialize() {
    if (checkMaintenanceStatus()) {
        return;
    }
    
    // 1. Cargar configuraciones de usuario (idioma, tema)
    loadLanguageSettings();
    loadThemeSettings();
    
    // 2. Comprobar autenticación de usuario
    checkLocalStorageUser();
    
    // 3. Cargar posts en la sección de inicio
    loadPosts();
    
    // 4. Configurar eventos de modales
    document.querySelectorAll('[data-open-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-open-modal');
            openModal(modalId);
        });
    });
    
    document.querySelectorAll('.close-modal, .modal-close-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const modalId = e.target.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // 5. Configurar eventos de idioma
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            selectLanguage(e.target.getAttribute('data-lang-code'));
        });
    });
    
    // 6. Configurar eventos de tema
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            selectTheme(e.target.getAttribute('data-theme'));
        });
    });
    
    // 7. Configurar evento de notificaciones
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('click', toggleNotifications);
    }
    
    // 8. Inicializar la vista de la primera sección (home)
    const urlParams = new URLSearchParams(window.location.search);
    const postIdParam = urlParams.get('post');
    let initialSection = 'home';
    
    // Determinar la sección inicial basada en la URL o el estado activo
    document.querySelectorAll('.nav-button').forEach(btn => {
        const targetId = btn.getAttribute('data-section');
        if (document.getElementById(targetId)?.classList.contains('active')) {
             initialSection = targetId;
        }
    });

    const homeButton = document.querySelector(`.nav-button[data-section="${initialSection}"]`);
    if (homeButton) {
        homeButton.classList.add('active-nav');
        document.getElementById(initialSection).classList.add('active');
        
        // Cargar quiz o sorteos si es la sección inicial
        if (initialSection === 'quiz' && currentUser) {
            loadDailyQuiz(currentUser.id);
        } else if (initialSection === 'sorteos') {
            loadSorteoData();
        }
    }
    
    // 9. Cargar sorteos si la URL apunta a un post compartido (aunque esto está en loadPosts, es un fallback)
    checkSharedPost();
}

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', initialize);

// Auto-actualizar ranking cada 30 segundos si el modal está abierto
setInterval(() => {
    const rankingModal = document.getElementById('ranking-modal');
    if (rankingModal && rankingModal.classList.contains('show')) {
        loadRanking();
    }
}, 30000);

// Exponer funciones globales (necesario para los manejadores onclick en el HTML)
window.openModal = openModal;
window.closeModal = closeModal;
window.handleCredentialResponse = handleCredentialResponse;
window.toggleLike = toggleLike;
window.sharePost = sharePost;
window.selectLanguage = selectLanguage;
window.selectTheme = selectTheme;
window.toggleNotifications = toggleNotifications;
