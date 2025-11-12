// =============================================================================
// FIREBASE CONFIGURATION
// =============================================================================
// Firebase project: innovitech-tools
// Configured for TurboType Rally game

const firebaseConfig = {
    apiKey: "AIzaSyDYHmMD0BQHxxPR4Anzx4ZmZpFTgcs6RBQ",
    authDomain: "innovitech-tools.firebaseapp.com",
    databaseURL: "https://innovitech-tools-default-rtdb.firebaseio.com",
    projectId: "innovitech-tools",
    storageBucket: "innovitech-tools.firebasestorage.app",
    messagingSenderId: "229701728021",
    appId: "1:229701728021:web:614906807f7ee0dcf1db1c"
};

// =============================================================================
// IMPORTS
// =============================================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update, 
    onValue, 
    push,
    remove,
    onDisconnect 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// =============================================================================
// FIREBASE INITIALIZATION
// =============================================================================
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// =============================================================================
// GAME STATE
// =============================================================================
const gameState = {
    playerId: null,
    playerName: 'Player',
    roomId: null,
    isHost: false,
    currentWordIndex: 0,
    correctWords: 0,
    startTime: null,
    raceStartTime: null,
    playerColor: null
};

// =============================================================================
// WORD BANK
// =============================================================================
const WORDS = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
    'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
    'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
    'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
    'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is'
];

// Player colors
const PLAYER_COLORS = ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'];

// =============================================================================
// DOM ELEMENTS
// =============================================================================
const screens = {
    lobby: document.getElementById('lobbyScreen'),
    waiting: document.getElementById('waitingScreen'),
    countdown: document.getElementById('countdownScreen'),
    racing: document.getElementById('racingScreen'),
    results: document.getElementById('resultsScreen')
};

const elements = {
    // Lobby
    playerNameInput: document.getElementById('playerNameInput'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    roomCodeInput: document.getElementById('roomCodeInput'),
    
    // Waiting Room
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    playerCount: document.getElementById('playerCount'),
    playersList: document.getElementById('playersList'),
    startRaceBtn: document.getElementById('startRaceBtn'),
    leaveRoomBtn: document.getElementById('leaveRoomBtn'),
    
    // Countdown
    countdownNumber: document.getElementById('countdownNumber'),
    
    // Racing
    raceTrack: document.getElementById('raceTrack'),
    currentWord: document.getElementById('currentWord'),
    typingInput: document.getElementById('typingInput'),
    typingFeedback: document.getElementById('typingFeedback'),
    raceTimer: document.getElementById('raceTimer'),
    currentWPM: document.getElementById('currentWPM'),
    wordsTyped: document.getElementById('wordsTyped'),
    
    // Results
    resultsList: document.getElementById('resultsList'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToLobbyBtn: document.getElementById('backToLobbyBtn'),
    
    // Toast
    toast: document.getElementById('toast')
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function getPlayerColor(playerIndex) {
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
}

// =============================================================================
// ROOM MANAGEMENT
// =============================================================================

async function createRoom() {
    const playerName = elements.playerNameInput.value.trim() || 'Player';
    const roomCode = generateRoomCode();
    const playerId = generatePlayerId();
    
    gameState.playerId = playerId;
    gameState.playerName = playerName;
    gameState.roomId = roomCode;
    gameState.isHost = true;
    gameState.playerColor = PLAYER_COLORS[0];
    
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    try {
        await set(roomRef, {
            status: 'waiting',
            hostId: playerId,
            createdAt: Date.now(),
            players: {
                [playerId]: {
                    name: playerName,
                    color: PLAYER_COLORS[0],
                    progress: 0,
                    wpm: 0,
                    finished: false,
                    finishPosition: null,
                    joinedAt: Date.now()
                }
            }
        });
        
        // Setup disconnect handler
        const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
        onDisconnect(playerRef).remove();
        
        listenToRoom(roomCode);
        showScreen('waiting');
        elements.roomCodeDisplay.textContent = roomCode;
        showToast('Room created successfully!', 'success');
    } catch (error) {
        console.error('Error creating room:', error);
        showToast('Failed to create room. Please try again.', 'error');
    }
}

async function joinRoom() {
    const roomCode = elements.roomCodeInput.value.trim().toUpperCase();
    const playerName = elements.playerNameInput.value.trim() || 'Player';
    
    if (!roomCode || roomCode.length !== 6) {
        showToast('Please enter a valid 6-character room code', 'error');
        return;
    }
    
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    try {
        const snapshot = await get(roomRef);
        
        if (!snapshot.exists()) {
            showToast('Room not found. Please check the code.', 'error');
            return;
        }
        
        const roomData = snapshot.val();
        const playerCount = roomData.players ? Object.keys(roomData.players).length : 0;
        
        if (playerCount >= 4) {
            showToast('Room is full (4/4 players)', 'error');
            return;
        }
        
        if (roomData.status !== 'waiting') {
            showToast('Race has already started', 'error');
            return;
        }
        
        const playerId = generatePlayerId();
        const playerColor = PLAYER_COLORS[playerCount];
        
        gameState.playerId = playerId;
        gameState.playerName = playerName;
        gameState.roomId = roomCode;
        gameState.isHost = false;
        gameState.playerColor = playerColor;
        
        const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
        await set(playerRef, {
            name: playerName,
            color: playerColor,
            progress: 0,
            wpm: 0,
            finished: false,
            finishPosition: null,
            joinedAt: Date.now()
        });
        
        // Setup disconnect handler
        onDisconnect(playerRef).remove();
        
        listenToRoom(roomCode);
        showScreen('waiting');
        elements.roomCodeDisplay.textContent = roomCode;
        showToast('Joined room successfully!', 'success');
    } catch (error) {
        console.error('Error joining room:', error);
        showToast('Failed to join room. Please try again.', 'error');
    }
}

function listenToRoom(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            showToast('Room has been closed', 'error');
            leaveRoom();
            return;
        }
        
        const roomData = snapshot.val();
        const players = roomData.players || {};
        const playerCount = Object.keys(players).length;
        
        // Update waiting room
        if (screens.waiting.classList.contains('active')) {
            updatePlayersList(players);
            elements.playerCount.textContent = playerCount;
            
            if (gameState.isHost) {
                elements.startRaceBtn.disabled = playerCount < 2;
            } else {
                elements.startRaceBtn.style.display = 'none';
            }
        }
        
        // Handle status changes
        if (roomData.status === 'countdown') {
            showScreen('countdown');
            startCountdown();
        } else if (roomData.status === 'racing') {
            if (!screens.racing.classList.contains('active')) {
                showScreen('racing');
                startRace();
            }
            updateRaceTrack(players);
        } else if (roomData.status === 'finished') {
            showScreen('results');
            displayResults(players);
        }
    });
}

function updatePlayersList(players) {
    const playerIds = Object.keys(players);
    elements.playersList.innerHTML = '';
    
    playerIds.forEach((playerId, index) => {
        const player = players[playerId];
        const isCurrentPlayer = playerId === gameState.playerId;
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <div class="player-color" style="background: ${player.color}"></div>
            <div class="player-info">
                <div class="player-name">${player.name} ${isCurrentPlayer ? '(You)' : ''}</div>
                <div class="player-status">Ready</div>
            </div>
        `;
        elements.playersList.appendChild(playerDiv);
    });
}

async function leaveRoom() {
    if (gameState.roomId && gameState.playerId) {
        const playerRef = ref(database, `rooms/${gameState.roomId}/players/${gameState.playerId}`);
        await remove(playerRef);
        
        // If host leaves, delete the room
        if (gameState.isHost) {
            const roomRef = ref(database, `rooms/${gameState.roomId}`);
            await remove(roomRef);
        }
    }
    
    resetGameState();
    showScreen('lobby');
}

function resetGameState() {
    gameState.playerId = null;
    gameState.roomId = null;
    gameState.isHost = false;
    gameState.currentWordIndex = 0;
    gameState.correctWords = 0;
    gameState.startTime = null;
    gameState.raceStartTime = null;
}

// =============================================================================
// RACE MANAGEMENT
// =============================================================================

async function startRaceAsHost() {
    if (!gameState.isHost) return;
    
    const roomRef = ref(database, `rooms/${gameState.roomId}`);
    await update(roomRef, {
        status: 'countdown',
        countdownStartedAt: Date.now()
    });
}

function startCountdown() {
    let count = 3;
    elements.countdownNumber.textContent = count;
    
    const countdownInterval = setInterval(async () => {
        count--;
        if (count > 0) {
            elements.countdownNumber.textContent = count;
        } else if (count === 0) {
            elements.countdownNumber.textContent = 'GO!';
        } else {
            clearInterval(countdownInterval);
            
            // Host updates room status to racing
            if (gameState.isHost) {
                const roomRef = ref(database, `rooms/${gameState.roomId}`);
                await update(roomRef, {
                    status: 'racing',
                    raceStartedAt: Date.now()
                });
            }
        }
    }, 1000);
}

function startRace() {
    gameState.raceStartTime = Date.now();
    gameState.currentWordIndex = 0;
    gameState.correctWords = 0;
    
    // Show first word
    showNextWord();
    
    // Focus input
    elements.typingInput.value = '';
    elements.typingInput.focus();
    
    // Setup race track
    setupRaceTrack();
    
    // Start timer
    startRaceTimer();
}

function setupRaceTrack() {
    elements.raceTrack.innerHTML = '';
    // Lanes will be created dynamically in updateRaceTrack
}

function updateRaceTrack(players) {
    const playerIds = Object.keys(players);
    
    // Clear and rebuild track
    elements.raceTrack.innerHTML = '';
    
    playerIds.forEach((playerId, index) => {
        const player = players[playerId];
        
        const lane = document.createElement('div');
        lane.className = 'race-lane';
        lane.innerHTML = `
            <div class="finish-line"></div>
            <div class="racer ${player.finished ? 'finished' : ''}" 
                 style="background: ${player.color}; left: ${player.progress}%">
                🏎️
                <div class="racer-name">${player.name}</div>
                <div class="racer-progress">${Math.round(player.progress)}%</div>
            </div>
        `;
        elements.raceTrack.appendChild(lane);
    });
}

function startRaceTimer() {
    setInterval(() => {
        if (!gameState.raceStartTime) return;
        
        const elapsed = Date.now() - gameState.raceStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        elements.raceTimer.textContent = 
            `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 100);
}

function showNextWord() {
    gameState.currentWordIndex = Math.floor(Math.random() * WORDS.length);
    elements.currentWord.textContent = WORDS[gameState.currentWordIndex];
}

async function handleTyping(event) {
    const typedWord = elements.typingInput.value.trim().toLowerCase();
    const currentWord = WORDS[gameState.currentWordIndex].toLowerCase();
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        
        if (typedWord === currentWord) {
            // Correct word
            gameState.correctWords++;
            elements.typingFeedback.textContent = '✓ Correct!';
            elements.typingFeedback.className = 'typing-feedback correct';
            
            // Calculate progress (100 words = 100%)
            const progress = Math.min((gameState.correctWords / 100) * 100, 100);
            
            // Calculate WPM
            const elapsedMinutes = (Date.now() - gameState.raceStartTime) / 60000;
            const wpm = Math.round(gameState.correctWords / elapsedMinutes) || 0;
            
            // Update UI
            elements.wordsTyped.textContent = `${gameState.correctWords} words`;
            elements.currentWPM.textContent = `${wpm} WPM`;
            
            // Update Firebase
            const playerRef = ref(database, `rooms/${gameState.roomId}/players/${gameState.playerId}`);
            await update(playerRef, {
                progress: progress,
                wpm: wpm,
                finished: progress >= 100
            });
            
            // Check if finished
            if (progress >= 100) {
                await handleRaceFinish();
            } else {
                showNextWord();
                elements.typingInput.value = '';
            }
            
            setTimeout(() => {
                elements.typingFeedback.textContent = '';
            }, 500);
        } else if (typedWord.length > 0) {
            // Incorrect word
            elements.typingFeedback.textContent = '✗ Try again';
            elements.typingFeedback.className = 'typing-feedback incorrect';
            
            setTimeout(() => {
                elements.typingFeedback.textContent = '';
            }, 500);
        }
    }
}

async function handleRaceFinish() {
    elements.typingInput.disabled = true;
    showToast('You finished the race!', 'success');
    
    // Get current players to determine position
    const roomRef = ref(database, `rooms/${gameState.roomId}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    const players = roomData.players || {};
    
    // Count how many players finished before this one
    const finishedCount = Object.values(players).filter(p => p.finished).length;
    
    const playerRef = ref(database, `rooms/${gameState.roomId}/players/${gameState.playerId}`);
    await update(playerRef, {
        finishPosition: finishedCount,
        finishedAt: Date.now()
    });
    
    // If host and all players finished, end race
    if (gameState.isHost) {
        checkIfRaceComplete();
    }
}

async function checkIfRaceComplete() {
    const roomRef = ref(database, `rooms/${gameState.roomId}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    const players = roomData.players || {};
    
    const allFinished = Object.values(players).every(p => p.finished);
    const raceTime = Date.now() - roomData.raceStartedAt;
    const timeout = raceTime > 90000; // 90 seconds
    
    if (allFinished || timeout) {
        await update(roomRef, {
            status: 'finished',
            finishedAt: Date.now()
        });
    }
}

function displayResults(players) {
    const playerArray = Object.entries(players).map(([id, data]) => ({
        id,
        ...data
    }));
    
    // Sort by finish position, then by WPM
    playerArray.sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        if (a.finished && b.finished) {
            return (a.finishPosition || 999) - (b.finishPosition || 999);
        }
        return (b.wpm || 0) - (a.wpm || 0);
    });
    
    elements.resultsList.innerHTML = '';
    
    playerArray.forEach((player, index) => {
        const position = index + 1;
        const positionClass = ['first', 'second', 'third'][index] || '';
        const emoji = ['🥇', '🥈', '🥉', ''][index] || '';
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        resultDiv.innerHTML = `
            <div class="result-position ${positionClass}">${emoji} #${position}</div>
            <div class="result-player-color" style="background: ${player.color}"></div>
            <div class="result-details">
                <div class="result-name">${player.name}</div>
                <div class="result-stats">
                    ${player.wpm} WPM • ${Math.round(player.progress)}% complete
                    ${player.finished ? ' • ✓ Finished' : ''}
                </div>
            </div>
        `;
        elements.resultsList.appendChild(resultDiv);
    });
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

elements.createRoomBtn.addEventListener('click', createRoom);
elements.joinRoomBtn.addEventListener('click', joinRoom);
elements.leaveRoomBtn.addEventListener('click', leaveRoom);
elements.startRaceBtn.addEventListener('click', startRaceAsHost);
elements.typingInput.addEventListener('keydown', handleTyping);

elements.playAgainBtn.addEventListener('click', () => {
    leaveRoom();
    setTimeout(createRoom, 500);
});

elements.backToLobbyBtn.addEventListener('click', () => {
    leaveRoom();
});

// Allow Enter key in room code input
elements.roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('🏎️ TurboType Rally initialized!');
console.log('⚠️  Remember to add your Firebase config at the top of app.js');

// Show lobby screen on load
showScreen('lobby');
