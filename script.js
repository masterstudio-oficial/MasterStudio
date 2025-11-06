// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

const profileContainer = document.getElementById('profile-container');
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownEmail = document.getElementById('dropdown-email');
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
const winnerCodeEl = document.getElementById('winner-code');

// Claves de almacenamiento
const QUIZ_STORAGE_KEY = 'masterstudio_quiz_user';
const QUIZ_ANSWER_KEY = 'masterstudio_quiz_answer';
const QUIZ_WINNER_CODE_KEY = 'masterstudio_winner_code';
const QUIZ_TICKETS_KEY = 'masterstudio_user_tickets';
const NOTIFICATIONS_KEY = 'masterstudio_notifications_enabled';
const LANGUAGE_KEY = 'masterstudio_language';
const THEME_KEY = 'masterstudio_theme';

// URLs
const QUIZ_JSON_URL = 'https://raw.githubusercontent.com/masterstudio-oficial/MasterStudio/main/preguntas.json';
const SAVE_WINNER_CODE_URL = 'https://script.google.com/macros/s/AKfycbxK4kyZ_e18qBt4NGY_MqFzCMhreJuLVNJApXP3GCrqdU5jEW6vOFQoziPMhEyNK6k6jg/exec';

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
            // Para elementos con innerHTML (como los que tienen <br>)
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

// Cerrar modales al hacer clic fuera
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
        const count = 0; // Aquí irá la lógica para contar notificaciones reales
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

function getUserTickets(userId) {
    const tickets = localStorage.getItem(`${QUIZ_TICKETS_KEY}_${userId}`);
    return tickets ? parseInt(tickets) : 0;
}

function incrementUserTickets(userId) {
    const currentTickets = getUserTickets(userId);
    localStorage.setItem(`${QUIZ_TICKETS_KEY}_${userId}`, currentTickets + 1);
}

function loadRanking() {
    const users = [];
    
    // Recorrer localStorage para encontrar todos los usuarios con tickets
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(QUIZ_TICKETS_KEY)) {
            const userId = key.replace(`${QUIZ_TICKETS_KEY}_`, '');
            const tickets = parseInt(localStorage.getItem(key));
            
            let username = 'Usuario Desconocido';
            const userKey = localStorage.getItem(QUIZ_STORAGE_KEY);
            if (userKey) {
                try {
                    const userData = JSON.parse(userKey);
                    if (userData.id === userId) {
                        username = userData.name;
                    }
                } catch (e) {}
            }
            
            users.push({ userId, username, tickets });
        }
    }

    // Añadir usuario actual si no está en la lista
    if (currentUser) {
        const userExists = users.find(u => u.userId === currentUser.id);
        if (!userExists) {
            users.push({
                userId: currentUser.id,
                username: currentUser.name,
                tickets: getUserTickets(currentUser.id)
            });
        }
    }

    // Ordenar por tickets (descendente)
    users.sort((a, b) => b.tickets - a.tickets);

    // Actualizar Top 3
    document.getElementById('rank-1-name').textContent = users[0]?.username || '---';
    document.getElementById('rank-1-tickets').textContent = users[0] ? `${users[0].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-2-name').textContent = users[1]?.username || '---';
    document.getElementById('rank-2-tickets').textContent = users[1] ? `${users[1].tickets} TICKETS` : '0 TICKETS';
    
    document.getElementById('rank-3-name').textContent = users[2]?.username || '---';
    document.getElementById('rank-3-tickets').textContent = users[2] ? `${users[2].tickets} TICKETS` : '0 TICKETS';

    // Resto del ranking (desde el 4to lugar)
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

    // Si no hay más usuarios después del top 3
    if (users.length <= 3) {
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
        
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(currentUser));
        updateLoginUI();
        
        if (document.getElementById('daily-quiz').classList.contains('active')) {
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
        
        loadNotificationsSettings();
        loadLanguageSettings();
        loadThemeSettings();
    } else {
        if (gIdOnload) gIdOnload.style.display = 'block';
        if (gIdSignin) gIdSignin.style.display = 'block';
        
        profileContainer.style.display = 'none';
    }
}

// Event listeners para el perfil
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
            localStorage.removeItem(QUIZ_STORAGE_KEY);
            profileDropdown.classList.remove('show');
            updateLoginUI();
            
            if (document.getElementById('daily-quiz').classList.contains('active')) {
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

function generateWinnerCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MS-';
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function saveWinnerCode(userId, username, code, question) {
    const winnerData = {
        code: code,
        userId: userId,
        username: username,
        question: question,
        date: getTodayDate(),
        timestamp: Date.now(),
        expiresAt: Date.now() + (4 * 60 * 60 * 1000)
    };
    
    localStorage.setItem(`${QUIZ_WINNER_CODE_KEY}_${userId}_${getTodayDate()}`, JSON.stringify(winnerData));

    if (SAVE_WINNER_CODE_URL) {
        try {
            await fetch(SAVE_WINNER_CODE_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(winnerData)
            });
            console.log('Código guardado en el servidor correctamente');
        } catch (error) {
            console.log('No se pudo guardar en servidor, código guardado localmente');
        }
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
        const winnerCode = generateWinnerCode();
        
        incrementUserTickets(currentUser.id);
        
        await saveWinnerCode(currentUser.id, currentUser.name, winnerCode, dailyQuizData.pregunta);
        
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, selectedOption);
        
        quizContent.style.display = 'none';
        winnerSection.style.display = 'block';
        winnerCodeEl.textContent = winnerCode;
        
        setTimeout(() => {
            winnerCodeEl.textContent = 'CÓDIGO EXPIRADO';
            winnerCodeEl.style.color = '#F44336';
        }, 4 * 60 * 60 * 1000);
        
    } else {
        localStorage.setItem(`${QUIZ_ANSWER_KEY}_${currentUser.id}_${getTodayDate()}`, selectedOption);
        
        quizQuestionEl.textContent = '❌ Respuesta Incorrecta';
        quizOptionsContainer.innerHTML = '';
        quizMessage.textContent = '¡Oh no! Tu respuesta fue incorrecta. Vuelve mañana para intentarlo de nuevo con la pregunta diaria del siguiente día. ¡No te rindas! 💪';
        quizMessage.style.color = '#F44336';
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
    const storedWinner = localStorage.getItem(`${QUIZ_WINNER_CODE_KEY}_${userId}_${getTodayDate()}`);

    if (storedWinner) {
        const winnerData = JSON.parse(storedWinner);
        winnerSection.style.display = 'block';
        
        if (Date.now() > winnerData.expiresAt) {
            winnerCodeEl.textContent = 'CÓDIGO EXPIRADO';
            winnerCodeEl.style.color = '#F44336';
        } else {
            winnerCodeEl.textContent = winnerData.code;
        }
        return;
    }

    if (storedAnswer) {
        quizContent.style.display = 'block';
        quizTimerEl.style.display = 'none';
        quizQuestionEl.textContent = '✅ Ya participaste hoy';
        quizOptionsContainer.innerHTML = '';
        
        if (storedAnswer === 'TIMEOUT') {
            quizMessage.textContent = '⏰ No respondiste a tiempo. ¡Vuelve mañana por otra oportunidad!';
        } else {
            quizMessage.textContent = `Tu respuesta fue: "${storedAnswer}". Vuelve mañana para la nueva pregunta diaria. 😊`;
        }
        quizMessage.style.color = '#4CAF50';
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
    const storedUser = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateLoginUI();
            return true;
        } catch (e) {
            localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
    }
    
    if (document.getElementById('daily-quiz') && document.getElementById('daily-quiz').classList.contains('active')) {
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
                
                if (targetId === 'daily-quiz') {
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
