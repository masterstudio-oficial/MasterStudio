// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

const profileContainer = document.getElementById('profile-container');
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownEmail = document.getElementById('dropdown-email');
const dropdownTicketsGold = document.getElementById('dropdown-tickets-gold');
const dropdownTicketsSilver = document.getElementById('dropdown-tickets-silver');
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
const GOLD_TICKETS_KEY = 'masterstudio_gold_tickets';
const SILVER_TICKETS_KEY = 'masterstudio_silver_tickets';
const USER_DATA_KEY = 'masterstudio_users_data';
const NOTIFICATIONS_KEY = 'masterstudio_notifications_enabled';
const NOTIFICATIONS_LIST_KEY = 'masterstudio_notifications_list';
const LANGUAGE_KEY = 'masterstudio_language';
const THEME_KEY = 'masterstudio_theme';
const CHALLENGES_KEY = 'masterstudio_challenges';

// URLs
const QUIZ_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/preguntas.json';
const RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbx-Oay0uBNGDJborb0kKQIkymVFxmO-NB4EUBZHNogOxP-FLPItFrnmYxYqzmuwx2vVBw/exec';

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
// SISTEMA DE TICKETS (PLATA Y ORO)
// =============================================

function getGoldTickets(userId) {
    const key = `${GOLD_TICKETS_KEY}_${userId}`;
    const tickets = localStorage.getItem(key);
    return tickets ? parseInt(tickets) : 0;
}

function getSilverTickets(userId) {
    const key = `${SILVER_TICKETS_KEY}_${userId}`;
    const tickets = localStorage.getItem(key);
    return tickets ? parseInt(tickets) : 0;
}

function setGoldTickets(userId, amount) {
    localStorage.setItem(`${GOLD_TICKETS_KEY}_${userId}`, amount);
    console.log(`🎫 Gold tickets actualizados: ${amount} para ${userId}`);
}

function setSilverTickets(userId, amount) {
    localStorage.setItem(`${SILVER_TICKETS_KEY}_${userId}`, amount);
    console.log(`🥈 Silver tickets actualizados: ${amount} para ${userId}`);
}

function addSilverTickets(userId, amount) {
    const current = getSilverTickets(userId);
    const newAmount = current + amount;
    setSilverTickets(userId, newAmount);
    
    console.log(`✅ +${amount} tickets de plata. Total: ${newAmount}`);
    
    // Verificar si se puede convertir
    checkAndConvertTickets(userId);
    
    updateTicketsDisplay(userId);
    return newAmount;
}

function addGoldTickets(userId, amount) {
    const current = getGoldTickets(userId);
    const newAmount = current + amount;
    setGoldTickets(userId, newAmount);
    
    console.log(`✅ +${amount} tickets de oro. Total: ${newAmount}`);
    
    updateTicketsDisplay(userId);
    return newAmount;
}

function checkAndConvertTickets(userId) {
    const silverTickets = getSilverTickets(userId);
    
    if (silverTickets >= 10) {
        const conversions = Math.floor(silverTickets / 10);
        const remaining = silverTickets % 10;
        
        // Actualizar tickets
        addGoldTickets(userId, conversions);
        setSilverTickets(userId, remaining);
        
        console.log(`🎉 ¡CONVERSIÓN! ${conversions} ticket(s) de oro obtenidos. Sobrante: ${remaining} plata`);
        
        // Mostrar notificación de conversión
        showConversionNotification(conversions, remaining);
        
        // Agregar a las notificaciones
        addNotification({
            type: 'conversion',
            title: '🎉 ¡Conversión Exitosa!',
            message: `${conversions} Ticket(s) de Plata se han convertido en ${conversions} Ticket(s) de Oro. Tickets de Plata restantes: ${remaining}`,
            timestamp: Date.now(),
            read: false
        });
        
        updateTicketsDisplay(userId);
    }
}

function updateTicketsDisplay(userId) {
    if (currentUser && currentUser.id === userId) {
        const gold = getGoldTickets(userId);
        const silver = getSilverTickets(userId);
        
        if (dropdownTicketsGold) {
            dropdownTicketsGold.textContent = `🎫 ${gold}`;
        }
        
        if (dropdownTicketsSilver) {
            dropdownTicketsSilver.textContent = `🥈 ${silver}`;
        }
    }
}

function showConversionNotification(conversions, remaining) {
    const notification = document.createElement('div');
    notification.className = 'conversion-notification';
    notification.innerHTML = `
        <h3>🎉 ¡CONVERSIÓN EXITOSA! 🎉</h3>
        <p>${conversions} Ticket(s) de Oro obtenidos</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Tickets de Plata restantes: ${remaining}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// =============================================
// SISTEMA DE NOTIFICACIONES
// =============================================

function addNotification(notification) {
    if (!currentUser) return;
    
    let notifications = JSON.parse(localStorage.getItem(`${NOTIFICATIONS_LIST_KEY}_${currentUser.id}`)) || [];
    
    notification.id = Date.now() + Math.random();
    notifications.unshift(notification);
    
    // Limitar a 50 notificaciones
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem(`${NOTIFICATIONS_LIST_KEY}_${currentUser.id}`, JSON.stringify(notifications));
    
    updateNotificationBadge();
}

function getNotifications() {
    if (!currentUser) return [];
    
    const notifications = localStorage.getItem(`${NOTIFICATIONS_LIST_KEY}_${currentUser.id}`);
    return notifications ? JSON.parse(notifications) : [];
}

function markNotificationAsRead(notificationId) {
    if (!currentUser) return;
    
    let notifications = getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
        notification.read = true;
        localStorage.setItem(`${NOTIFICATIONS_LIST_KEY}_${currentUser.id}`, JSON.stringify(notifications));
        updateNotificationBadge();
    }
}

function markAllNotificationsAsRead() {
    if (!currentUser) return;
    
    let notifications = getNotifications();
    notifications.forEach(n => n.read = true);
    localStorage.setItem(`${NOTIFICATIONS_LIST_KEY}_${currentUser.id}`, JSON.stringify(notifications));
    updateNotificationBadge();
}

function loadNotificationsList() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;
    
    const notifications = getNotifications();
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="notification-empty">No tienes notificaciones por el momento.</div>';
        return;
    }
    
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const notifElement = document.createElement('div');
        notifElement.className = `notification-item ${notification.read ? '' : 'unread'} ${notification.type || ''}`;
        
        const date = new Date(notification.timestamp);
        const timeStr = date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notifElement.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${notification.title}</div>
            <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 8px;">${notification.message}</div>
            <div style="color: #888; font-size: 0.8rem;">${timeStr}</div>
        `;
        
        notifElement.addEventListener('click', () => {
            markNotificationAsRead(notification.id);
            loadNotificationsList();
        });
        
        notificationsList.appendChild(notifElement);
    });
}

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
    if (!currentUser) return;
    
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (notificationsEnabled && unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'flex';
        notificationCountMenu.textContent = unreadCount;
        notificationCountMenu.style.display = 'inline';
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
// SISTEMA DE DESAFÍOS
// =============================================

function getChallenges(userId) {
    const key = `${CHALLENGES_KEY}_${userId}`;
    const challenges = localStorage.getItem(key);
    
    if (challenges) {
        return JSON.parse(challenges);
    }
    
    // Inicializar desafíos
    return {
        'like-1': { completed: false, progress: 0, total: 1, reward: 2 },
        'like-3': { completed: false, progress: 0, total: 3, reward: 5 },
        'share-1': { completed: false, progress: 0, total: 1, reward: 3 },
        'share-3': { completed: false, progress: 0, total: 3, reward: 10 }
    };
}

function saveChallenges(userId, challenges) {
    const key = `${CHALLENGES_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(challenges));
}

function updateChallengeProgress(userId, challengeType) {
    const challenges = getChallenges(userId);
    
    Object.keys(challenges).forEach(key => {
        if (key.startsWith(challengeType) && !challenges[key].completed) {
            challenges[key].progress++;
            
            // Verificar si se completó
            if (challenges[key].progress >= challenges[key].total) {
                challenges[key].completed = true;
                challenges[key].progress = challenges[key].total;
                
                // Otorgar recompensa
                const reward = challenges[key].reward;
                addSilverTickets(userId, reward);
                
                console.log(`🎉 ¡Desafío completado! +${reward} tickets de plata`);
                
                // Notificación
                addNotification({
                    type: 'challenge',
                    title: '🎯 ¡Desafío Completado!',
                    message: `Has completado un desafío y ganado ${reward} Tickets de Plata 🥈`,
                    timestamp: Date.now(),
                    read: false
                });
            }
        }
    });
    
    saveChallenges(userId, challenges);
    updateChallengesDisplay(userId);
}

function updateChallengesDisplay(userId) {
    if (!currentUser || currentUser.id !== userId) return;
    
    const challenges = getChallenges(userId);
    
    // Actualizar cada desafío en la UI
    Object.keys(challenges).forEach(key => {
        const challenge = challenges[key];
        const progressBar = document.getElementById(`progress-${key}`);
        const progressText = document.getElementById(`progress-text-${key}`);
        const challengeItem = document.getElementById(`challenge-${key}`);
        
        if (progressBar && progressText && challengeItem) {
            const percentage = (challenge.progress / challenge.total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${challenge.progress}/${challenge.total}`;
            
            if (challenge.completed) {
                challengeItem.classList.add('completed');
                challengeItem.classList.remove('locked');
            } else {
                challengeItem.classList.remove('locked');
            }
        }
    });
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
        } else if (modalId === 'notifications-modal') {
            loadNotificationsList();
        } else if (modalId === 'challenges-modal' && currentUser) {
            updateChallengesDisplay(currentUser.id);
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
// SISTEMA DE TEMAS
// =============================================

function selectTheme(theme) {
    currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    
    console.log(`🎨 Tema cambiado a: ${theme}`);
}

function loadThemeSettings() {
    currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
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
        if (key && key.startsWith(GOLD_TICKETS_KEY)) {
            const userId = key.replace(`${GOLD_TICKETS_KEY}_`, '');
            
            if (processedUsers.has(userId)) continue;
            processedUsers.add(userId);
            
            const goldTickets = getGoldTickets(userId);
            
            if (goldTickets > 0) {
                const userData = getUserData(userId);
                let username = 'Usuario';
                
                if (userData && userData.username) {
                    username = userData.username;
                } else if (currentUser && currentUser.id === userId) {
                    username = currentUser.name;
                } else {
                    username = `Usuario ${userId.substring(0, 8)}`;
                }
                
                users.push({ userId, username, tickets: goldTickets });
            }
        }
    }
    
    if (currentUser) {
        const userInList = users.find(u => u.userId === currentUser.id);
        if (!userInList) {
            const userGoldTickets = getGoldTickets(currentUser.id);
            if (userGoldTickets > 0) {
                users.push({
                    userId: currentUser.id,
                    username: currentUser.name,
                    tickets: userGoldTickets
                });
            }
        }
    }
    
    users.sort((a, b) => b.tickets - a.tickets);
    
    console.log('📊 Ranking local creado:', users);
    
    return users;
}

function displayRanking(users) {
    document.getElementById('rank-1-name').textContent = users[0]?.username || '---';
    document.getElementById('rank-1-tickets').textContent = users[0] ? `${users[0].tickets} 🎫` : '0 🎫';
    
    document.getElementById('rank-2-name').textContent = users[1]?.username || '---';
    document.getElementById('rank-2-tickets').textContent = users[1] ? `${users[1].tickets} 🎫` : '0 🎫';
    
    document.getElementById('rank-3-name').textContent = users[2]?.username || '---';
    document.getElementById('rank-3-tickets').textContent = users[2] ? `${users[2].tickets} 🎫` : '0 🎫';

    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    for (let i = 3; i < users.length; i++) {
        const user = users[i];
        const rankingUser = document.createElement('div');
        rankingUser.className = 'ranking-user';
        
        rankingUser.innerHTML = `
            <span class="ranking-position">#${i + 1}</span>
            <span class="ranking-name">${user.username}</span>
            <span class="ranking-tickets gold">${user.tickets} 🎫</span>
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
        
        updateTicketsDisplay(currentUser.id);
        
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
            
            if (currentUser) {
                updateTicketsDisplay(currentUser.id);
                console.log('🔄 Menú abierto - Tickets actualizados');
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
        
        const newGoldTickets = addGoldTickets(currentUser.id, 1);
        await saveTicketToServer(currentUser.id, currentUser.name, currentUser.email);
        
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, 'CORRECT');
        
        quizContent.style.display = 'none';
        winnerSection.style.display = 'block';
        winnerSection.innerHTML = `
            <div class="quiz-result">
                <h3>🎉 ¡FELICIDADES! 🎉</h3>
                <p>¡Respondiste correctamente!</p>
                <div class="ticket-earned">+1 GOLD TICKET</div>
                <p style="font-size: 1rem; margin-top: 10px;">¡Has ganado 1 ticket de oro! 🎫</p>
                <div class="user-stats">
                    <p>Total de Gold Tickets: ${newGoldTickets} 🎫</p>
                    <p>Silver Tickets: ${getSilverTickets(currentUser.id)} 🥈</p>
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
            const goldTickets = getGoldTickets(userId);
            const silverTickets = getSilverTickets(userId);
            winnerSection.innerHTML = `
                <div class="quiz-result">
                    <h3>✅ Ya participaste hoy</h3>
                    <p>Ganaste 1 Gold Ticket 🎫</p>
                    <div class="user-stats">
                        <p>Total de Gold Tickets: ${goldTickets} 🎫</p>
                        <p>Silver Tickets: ${silverTickets} 🥈</p>
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
                }
            }
        });
    });
});

// =============================================
// CARGAR POSTS
// =============================================

const LIKES_STORAGE_KEY = 'masterstudio_post_likes';

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
    
    likeButton.disabled = true;
    
    try {
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
            if (data.action === 'liked') {
                likeButton.classList.add('liked');
                saveLocalLike(postId, true);
                console.log('💖 Like agregado a:', postId);
                
                // Actualizar desafío de likes
                updateChallengeProgress(currentUser.id, 'like');
            } else {
                likeButton.classList.remove('liked');
                saveLocalLike(postId, false);
                console.log('💔 Like removido de:', postId);
            }
            
            await updateLikeCount(postId);
        }
        
    } catch (error) {
        console.error('❌ Error al dar like:', error);
        const isLiked = likeButton.classList.contains('liked');
        if (isLiked) {
            likeButton.classList.remove('liked');
            saveLocalLike(postId, false);
        } else {
            likeButton.classList.add('liked');
            saveLocalLike(postId, true);
            updateChallengeProgress(currentUser.id, 'like');
        }
        await updateLikeCount(postId);
    } finally {
        likeButton.disabled = false;
    }
}

function saveLocalLike(postId, liked) {
    if (!currentUser) return;
    
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
                const postId = generatePostId(post);
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.id = postId;

                const isLiked = checkIfUserLiked(postId);
                const likedClass = isLiked ? 'liked' : '';
                const heartFill = isLiked ? 'fill="currentColor"' : 'fill="none"';

                let badge = post.esNuevo ? '<div class="new-badge">NEW!</div>' : '';
                
                postElement.innerHTML = `
                    ${badge}
                    <img src="${post.imagenUrl || 'https://via.placeholder.com/150'}" alt="Imagen del post">
                    <div class="post-content">
                        <h3>${post.titulo}</h3>
                        <span class="date">Fecha: ${post.fecha}</span>
                        <p>${post.descripcion}</p>
                        <div class="post-actions">
                            <button class="like-button ${likedClass}" onclick="toggleLike('${postId}')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${heartFill} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                Like
                                <span class="like-count" style="display: none;">0</span>
                            </button>
                            <button class="share-button" onclick="sharePost('${postId}', '${category}')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                                Compartir
                            </button>
                        </div>
                    </div>
                `;
                container.prepend(postElement);
                
                const placeholderText = container.parentElement.querySelector('.placeholder-text');
                if (placeholderText) {
                    placeholderText.style.display = 'none';
                }
                
                updateLikeCount(postId);
            }
        });
        
        checkSharedPost();
        
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
