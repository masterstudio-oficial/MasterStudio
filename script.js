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
const USER_DATA_KEY = 'masterstudio_users_data'; // Nueva key para guardar datos de usuarios
const NOTIFICATIONS_KEY = 'masterstudio_notifications_enabled';
const LANGUAGE_KEY = 'masterstudio_language';
const THEME_KEY = 'masterstudio_theme';

// URLs
const QUIZ_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/preguntas.json';
const RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbwm4xK38yErPBv_m2zFCYF0EMxxBh2D-hEbSni4I8u8q92xpKp3UmZ3JwSkqWDf3qLnQw/exec';

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

// =============================================
// CONFIGURACIÓN DE MANTENIMIENTO
// =============================================

const MAINTENANCE_SCREEN = document.getElementById('maintenance-screen');
const IS_MAINTENANCE_ACTIVE = true;
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
    if (theme === 'light') {
        alert('El tema claro estará disponible próximamente. Por ahora solo está disponible el tema oscuro.');
        return;
    }
    
    currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

function loadThemeSettings() {
    currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
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
    
    // Actualizar UI del perfil inmediatamente
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
            // Si no hay datos del servidor, crear ranking local
            const localRanking = createLocalRanking();
            displayRanking(localRanking);
        }
    } catch (error) {
        console.error('❌ Error al cargar ranking:', error);
        // En caso de error, mostrar ranking local
        const localRanking = createLocalRanking();
        displayRanking(localRanking);
    }
}

function createLocalRanking() {
    // Crear ranking basado en localStorage
    const users = [];
    const processedUsers = new Set();
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(QUIZ_TICKETS_KEY)) {
            const userId = key.replace(`${QUIZ_TICKETS_KEY}_`, '');
            
            // Evitar duplicados
            if (processedUsers.has(userId)) continue;
            processedUsers.add(userId);
            
            const tickets = parseInt(localStorage.getItem(key)) || 0;
            
            if (tickets > 0) {
                // Obtener nombre de usuario desde los datos guardados
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
    
    // Asegurar que el usuario actual esté en la lista
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
    
    // Ordenar por tickets descendente
    users.sort((a, b) => b.tickets - a.tickets);
    
    console.log('📊 Ranking local creado:', users);
    console.log('👤 Usuario actual:', currentUser);
    console.log('🎫 Tickets del usuario actual:', currentUser ? getUserTickets(currentUser.id) : 0);
    
    return users;
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
        
        // Guardar usuario en localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        
        // Guardar datos del usuario para el ranking
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
        
        // Mostrar tickets del usuario
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
            
            // Actualizar tickets al abrir el menú
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
        
        // Respuesta correcta - Guardar ticket
        const newTicketCount = incrementUserTickets(currentUser.id);
        await saveTicketToServer(currentUser.id, currentUser.name);
        
        console.log('💾 Ticket guardado. Nuevo total:', newTicketCount);
        console.log('🔑 localStorage key:', `${QUIZ_TICKETS_KEY}_${currentUser.id}`);
        console.log('📦 Valor guardado:', localStorage.getItem(`${QUIZ_TICKETS_KEY}_${currentUser.id}`));
        
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
                    <p>Total de tickets: ${newTicketCount} 🎟️</p>
                    <p style="margin-top: 10px;">Vuelve mañana para ganar más tickets 😊</p>
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
            
            // Guardar datos del usuario para el ranking
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
                }
            }
        });
    });
});

// =============================================
// CARGAR POSTS
// =============================================

async function loadPosts() {
    const POSTS_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/posts.json';

    try {
        const response = await fetch(POSTS_JSON_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();

        document.querySelectorAll('.posts-container').forEach(container => {
            container.innerHTML = '';
        });

        posts.forEach(post => {
            const category = post.categoria || 'dificultad';
            const container = document.getElementById(`posts-${category}`);

            if (container) {
                const postElement = document.createElement('div');
                postElement.className = 'post';

                let badge = post.esNuevo ? '<div class="new-badge">NEW!</div>' : '';
                
                postElement.innerHTML = `
                    ${badge}
                    <img src="${post.imagenUrl || 'https://via.placeholder.com/150'}" alt="Imagen del post">
                    <div class="post-content">
                        <h3>${post.titulo}</h3>
                        <span class="date">Fecha: ${post.fecha}</span>
                        <p>${post.descripcion}</p>
                    </div>
                `;
                container.prepend(postElement);
                
                const placeholderText = container.parentElement.querySelector('.placeholder-text');
                if (placeholderText) {
                    placeholderText.style.display = 'none';
                }
            }
        });
    } catch (e) {
        console.error('Error al cargar posts:', e);
    }
}

// =============================================
// INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const isMaintenance = checkMaintenanceStatus();
    
    if (isMaintenance) {
        return;
    }
    
    loadPosts();
    checkLocalStorageUser();
});

// Auto-actualizar ranking cada 30 segundos si el modal está abierto
setInterval(() => {
    const rankingModal = document.getElementById('ranking-modal');
    if (rankingModal && rankingModal.classList.contains('show')) {
        loadRanking();
    }
}, 30000);
