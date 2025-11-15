// =============================================================================
// FIREBASE CONFIGURATION
// =============================================================================
// Firebase project: innovitech-tools
// Configured for TurboType Rally game

const firebaseConfig = {
    apiKey: "AIzaSyDYHmMD0BQHxxPR4Anzx4ZmZpFTgcs6RBQ",
    authDomain: "innovitech-tools.firebaseapp.com",
    databaseURL: "https://innovitech-tools-default-rtdb.asia-southeast1.firebasedatabase.app",
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
    playerColor: null,
    playerCar: null
};

// =============================================================================
// CAR SYSTEM - Available car images for players
// =============================================================================
const AVAILABLE_CARS = [
    'blueCar.png',
    'redCar.png', 
    'greenCar.png',
    'yellowCar.png',
    'orangeCar.png',
    'whiteCar.png'
];

// Get a random car for solo mode or assign different cars for multiplayer
function getRandomCar() {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_CARS.length);
    return `assets/images/${AVAILABLE_CARS[randomIndex]}`;
}

function getPlayerCar(playerIndex) {
    // Cycle through available cars for different players
    const carIndex = playerIndex % AVAILABLE_CARS.length;
    return `assets/images/${AVAILABLE_CARS[carIndex]}`;
}

// =============================================================================
// PARAGRAPH BANK - Random paragraphs for typing practice
// =============================================================================
const PARAGRAPHS = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. It is often used for testing typewriters and computer keyboards, displaying examples of fonts, and other applications involving text.",
    "Technology has revolutionized the way we communicate. From smartphones to social media, the digital world connects billions of people instantly. Yet despite this connectivity, many struggle with genuine human connection and meaningful relationships.",
    "Learning to type quickly and accurately is an essential skill in today's digital world. Many jobs require proficiency with keyboards and computers. Practice and dedication are key to improving your typing speed and accuracy over time.",
    "The ocean covers more than seventy percent of Earth's surface. It is home to an incredible diversity of life, from microscopic plankton to massive whales. Marine ecosystems play a crucial role in regulating our planet's climate and weather patterns.",
    "Coffee is one of the most popular beverages in the world. Millions of people enjoy a cup of coffee every single day. Whether hot or cold, black or with cream, coffee brings comfort and energy to people's mornings and afternoons.",
    "Reading opens doors to infinite worlds and possibilities. Books transport us to different times, places, and perspectives. Through reading, we can learn, grow, and understand ourselves and others in profound and meaningful ways.",
    "Music has the power to evoke emotions and memories. Whether classical, pop, rock, or jazz, music resonates with the human soul. Throughout history, music has been an integral part of culture, celebration, and expression across all civilizations.",
    "Traveling abroad expands our horizons and enriches our lives. Meeting new people and experiencing different cultures broadens our perspectives. Every journey teaches us something new about the world and ourselves in unexpected and wonderful ways.",
    "The rise of artificial intelligence is transforming industries and societies. Machine learning algorithms can now recognize faces, understand language, and make decisions. As this technology advances, we must consider both its tremendous potential and ethical implications.",
    "Healthy eating habits contribute to overall well-being and longevity. Consuming balanced meals with fruits, vegetables, and proteins provides essential nutrients. Regular exercise combined with good nutrition creates a foundation for a healthier, happier life ahead.",
    "The stars have fascinated humans since ancient times. Astronomers study distant galaxies to understand our universe. Space exploration reveals the vastness of creation and inspires wonder about our place in the cosmos and beyond.",
    "Art and creativity are fundamental to human expression and culture. Painters, musicians, and writers communicate ideas and emotions through their work. Creativity fosters innovation and helps us see the world from fresh and interesting perspectives.",
    "Climate change poses unprecedented challenges to our planet. Rising temperatures affect weather patterns, sea levels, and ecosystems worldwide. Collective action and sustainable practices are essential to protect our environment for future generations.",
    "Friendship is one of life's greatest treasures and blessings. True friends support us through difficulties and celebrate our successes. The bonds we form with others add meaning, joy, and richness to our existence throughout our lives.",
    "Innovation drives progress and shapes the future of humanity. From medicine to transportation, new ideas improve our quality of life. Entrepreneurs and inventors take risks to create solutions that benefit society in countless ways."
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
    results: document.getElementById('resultsScreen'),
    practiceResults: document.getElementById('practiceResultsScreen')
};

const elements = {
    // Lobby
    playerNameInput: document.getElementById('playerNameInput'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    roomCodeInput: document.getElementById('roomCodeInput'),
    practiceBtn: document.getElementById('practiceBtn'),
    
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
    paragraphContainer: document.getElementById('paragraphContainer'),
    completedText: document.getElementById('completedText'),
    currentText: document.getElementById('currentText'),
    currentChar: document.getElementById('currentChar'),
    remainingText: document.getElementById('remainingText'),
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
    
    // Practice Results
    practiceWPM: document.getElementById('practiceWPM'),
    practiceAccuracy: document.getElementById('practiceAccuracy'),
    practiceTime: document.getElementById('practiceTime'),
    personalBest: document.getElementById('personalBest'),
    practiceAgainBtn: document.getElementById('practiceAgainBtn'),
    backToLobbyFromPracticeBtn: document.getElementById('backToLobbyFromPracticeBtn'),
    
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
                startRace(roomData.paragraphIndex);
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
    
    // Host selects paragraph for all players
    const paragraphIndex = Math.floor(Math.random() * PARAGRAPHS.length);
    
    const roomRef = ref(database, `rooms/${gameState.roomId}`);
    await update(roomRef, {
        status: 'countdown',
        countdownStartedAt: Date.now(),
        paragraphIndex: paragraphIndex
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

function startRace(paragraphIndex = null) {
    gameState.raceStartTime = Date.now();
    
    // Use provided paragraph index (for multiplayer) or random (for solo)
    if (paragraphIndex !== null) {
        gameState.currentParagraphIndex = paragraphIndex;
    } else {
        gameState.currentParagraphIndex = Math.floor(Math.random() * PARAGRAPHS.length);
    }
    
    gameState.currentParagraph = PARAGRAPHS[gameState.currentParagraphIndex];
    gameState.correctChars = 0;
    gameState.incorrectChars = 0;
    gameState.totalChars = gameState.currentParagraph.length;
    
    // Display paragraph with character spans
    displayParagraphWithCharacters();
    
    // Focus input
    elements.typingInput.value = '';
    elements.typingInput.addEventListener('input', handleCharacterTyping);
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
        
        const finishLine = document.createElement('div');
        finishLine.className = 'finish-line';
        
        const racer = document.createElement('div');
        racer.className = `racer ${player.finished ? 'finished' : ''}`;
        racer.style.left = `${player.progress}%`;
        
        // Create car image instead of emoji
        const carImg = document.createElement('img');
        carImg.src = getPlayerCar(index);
        carImg.alt = 'Race Car';
        carImg.style.width = '60px';
        carImg.style.height = 'auto';
        
        const racerName = document.createElement('div');
        racerName.className = 'racer-name';
        racerName.textContent = player.name;
        
        const racerProgress = document.createElement('div');
        racerProgress.className = 'racer-progress';
        racerProgress.textContent = `${Math.round(player.progress)}%`;
        
        racer.appendChild(carImg);
        racer.appendChild(racerName);
        racer.appendChild(racerProgress);
        
        lane.appendChild(finishLine);
        lane.appendChild(racer);
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

function displayParagraphWithCharacters() {
    // Initialize the advanced paragraph display
    updateParagraphDisplay();
    
    // Also ensure legacy display works if new elements aren't found
    if (!elements.completedText && elements.currentWord) {
        // Clear previous content
        elements.currentWord.innerHTML = '';
        
        // Create spans for each character (legacy fallback)
        const paragraph = gameState.currentParagraph;
        for (let i = 0; i < paragraph.length; i++) {
            const span = document.createElement('span');
            span.className = 'char-span pending';
            span.textContent = paragraph[i];
            span.id = `char-${i}`;
            elements.currentWord.appendChild(span);
        }
    }
}

function updateParagraphDisplay() {
    const paragraph = gameState.currentParagraph;
    const currentPos = gameState.correctChars;
    
    // Check if new paragraph display elements exist
    if (elements.completedText && elements.currentChar && elements.remainingText) {
        // Split text into completed, current character, and remaining
        const completed = paragraph.substring(0, currentPos);
        const currentChar = paragraph.charAt(currentPos);
        const remaining = paragraph.substring(currentPos + 1);
        
        // Update display elements
        elements.completedText.textContent = completed;
        elements.currentChar.textContent = currentChar || '';
        elements.remainingText.textContent = remaining;
        
        // Auto-scroll logic: keep only last 30 characters of completed text visible
        if (completed.length > 30) {
            const visibleCompleted = '...' + completed.substring(completed.length - 27);
            elements.completedText.textContent = visibleCompleted;
        }
        
        // Show only next 100 characters of remaining text to limit display
        if (remaining.length > 100) {
            const visibleRemaining = remaining.substring(0, 100) + '...';
            elements.remainingText.textContent = visibleRemaining;
        }
    }
    
    // Fallback for legacy word display (if elements exist)
    if (elements.currentWord) {
        elements.currentWord.innerHTML = '';
        
        // Create spans for each character (legacy compatibility)
        for (let i = 0; i < paragraph.length; i++) {
            const span = document.createElement('span');
            if (i < currentPos) {
                span.className = 'char-span correct';
            } else if (i === currentPos) {
                span.className = 'char-span current';
            } else {
                span.className = 'char-span pending';
            }
            span.textContent = paragraph[i];
            span.id = `char-${i}`;
            elements.currentWord.appendChild(span);
        }
    }
}

async function handleCharacterTyping(event) {
    const typed = elements.typingInput.value;
    const paragraph = gameState.currentParagraph;
    
    // Reset counters
    gameState.correctChars = 0;
    gameState.incorrectChars = 0;
    
    // Update character highlighting
    for (let i = 0; i < paragraph.length; i++) {
        const charSpan = document.getElementById(`char-${i}`);
        
        if (i < typed.length) {
            if (typed[i] === paragraph[i]) {
                // Correct character - green
                charSpan.classList.remove('pending', 'incorrect');
                charSpan.classList.add('correct');
                gameState.correctChars++;
            } else {
                // Incorrect character - red
                charSpan.classList.remove('pending', 'correct');
                charSpan.classList.add('incorrect');
                gameState.incorrectChars++;
            }
        } else {
            // Not yet typed
            charSpan.classList.remove('correct', 'incorrect');
            charSpan.classList.add('pending');
        }
    }
    
    // Update the scrolling paragraph display
    updateParagraphDisplay();
    
    // Calculate progress (percentage of paragraph typed correctly)
    const progress = Math.min((gameState.correctChars / gameState.totalChars) * 100, 100);
    
    // Calculate WPM based on characters (standard: 5 chars = 1 word)
    const elapsedMinutes = (Date.now() - gameState.raceStartTime) / 60000;
    const wpm = Math.round((gameState.correctChars / 5) / elapsedMinutes) || 0;
    
    // Calculate accuracy
    const accuracy = typed.length > 0 
        ? Math.round((gameState.correctChars / typed.length) * 100) 
        : 100;
    
    // Update UI
    elements.wordsTyped.textContent = `${gameState.correctChars}/${gameState.totalChars} chars`;
    elements.currentWPM.textContent = `${wpm} WPM`;
    
    // Update accuracy display (if you have an accuracy element)
    if (elements.accuracyDisplay) {
        elements.accuracyDisplay.textContent = `${accuracy}% accuracy`;
    }
    
    // Update Firebase for multiplayer
    if (gameState.roomId) {
        const playerRef = ref(database, `rooms/${gameState.roomId}/players/${gameState.playerId}`);
        await update(playerRef, {
            progress: progress,
            wpm: wpm,
            accuracy: accuracy,
            finished: progress >= 100
        });
    }
    
    // Check if paragraph is complete
    if (typed.length === paragraph.length && gameState.correctChars === gameState.totalChars) {
        await handleRaceFinish();
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
// PRACTICE MODE
// =============================================================================

const practiceState = {
    currentParagraph: '',
    correctChars: 0,
    incorrectChars: 0,
    startTime: null,
    isPracticing: false
};

function startPracticeMode() {
    // Select random paragraph
    const randomIndex = Math.floor(Math.random() * PARAGRAPHS.length);
    gameState.currentParagraph = PARAGRAPHS[randomIndex];
    practiceState.currentParagraph = PARAGRAPHS[randomIndex];
    gameState.correctChars = 0;
    gameState.incorrectChars = 0;
    practiceState.correctChars = 0;
    practiceState.incorrectChars = 0;
    practiceState.startTime = null;
    practiceState.isPracticing = true;
    
    // Show racing screen
    showScreen('racing');
    
    // Display paragraph with character spans
    displayParagraphWithCharacters();
    
    // Clear race track and show solo player
    elements.raceTrack.innerHTML = '';
    const playerName = elements.playerNameInput.value.trim() || 'You';
    const laneSolo = document.createElement('div');
    laneSolo.className = 'race-lane';
    
    const laneLabel = document.createElement('div');
    laneLabel.className = 'lane-label';
    laneLabel.textContent = playerName;
    
    const laneTrack = document.createElement('div');
    laneTrack.className = 'lane-track';
    
    const finishLine = document.createElement('div');
    finishLine.className = 'finish-line';
    
    const raceCar = document.createElement('div');
    raceCar.className = 'race-car';
    
    // Create car image instead of emoji
    const carImg = document.createElement('img');
    carImg.src = getRandomCar();
    carImg.alt = 'Race Car';
    carImg.style.width = '60px';
    carImg.style.height = 'auto';
    
    raceCar.appendChild(carImg);
    laneTrack.appendChild(finishLine);
    laneTrack.appendChild(raceCar);
    
    const laneStats = document.createElement('div');
    laneStats.className = 'lane-stats';
    const laneWpm = document.createElement('span');
    laneWpm.className = 'lane-wpm';
    laneWpm.textContent = '0 WPM';
    laneStats.appendChild(laneWpm);
    
    laneSolo.appendChild(laneLabel);
    laneSolo.appendChild(laneTrack);
    laneSolo.appendChild(laneStats);
    elements.raceTrack.appendChild(laneSolo);
    
    // Reset stats display
    elements.raceTimer.textContent = '0:00';
    elements.currentWPM.textContent = '0 WPM';
    elements.wordsTyped.textContent = '0/0 chars';
    
    // Clear and setup input
    elements.typingInput.value = '';
    elements.typingInput.disabled = false;
    elements.typingInput.removeEventListener('input', handleCharacterTyping);
    elements.typingInput.addEventListener('input', handlePracticeCharacterTyping);
    elements.typingInput.focus();
    
    showToast('Start typing to begin practice mode!', 'success');
}

function handlePracticeCharacterTyping(event) {
    const typed = elements.typingInput.value;
    const paragraph = practiceState.currentParagraph;
    
    // Start timer on first keypress
    if (!practiceState.startTime) {
        practiceState.startTime = Date.now();
        updatePracticeTimer();
    }
    
    // Reset counters
    practiceState.correctChars = 0;
    practiceState.incorrectChars = 0;
    
    // Update character highlighting
    for (let i = 0; i < paragraph.length; i++) {
        const charSpan = document.getElementById(`char-${i}`);
        
        if (i < typed.length) {
            if (typed[i] === paragraph[i]) {
                // Correct character - green
                charSpan.classList.remove('pending', 'incorrect');
                charSpan.classList.add('correct');
                practiceState.correctChars++;
            } else {
                // Incorrect character - red
                charSpan.classList.remove('pending', 'correct');
                charSpan.classList.add('incorrect');
                practiceState.incorrectChars++;
            }
        } else {
            // Not yet typed
            charSpan.classList.remove('correct', 'incorrect');
            charSpan.classList.add('pending');
        }
    }
    
    // Calculate progress
    const progress = Math.min((practiceState.correctChars / paragraph.length) * 100, 100);
    
    // Calculate WPM
    const elapsedMinutes = (Date.now() - practiceState.startTime) / 60000;
    const wpm = Math.round((practiceState.correctChars / 5) / elapsedMinutes) || 0;
    
    // Update UI
    elements.wordsTyped.textContent = `${practiceState.correctChars}/${paragraph.length} chars`;
    elements.currentWPM.textContent = `${wpm} WPM`;
    
    // Update car progress
    const raceCar = document.querySelector('.race-car');
    if (raceCar) {
        raceCar.style.left = `${progress}%`;
    }
    
    // Check if paragraph is complete (typed entire length, not necessarily all correct)
    if (typed.length === paragraph.length) {
        finishPractice();
    }
}

function updatePracticeTimer() {
    if (!practiceState.startTime || !practiceState.isPracticing) return;
    
    const timerInterval = setInterval(() => {
        if (!practiceState.isPracticing) {
            clearInterval(timerInterval);
            return;
        }
        
        const elapsed = Date.now() - practiceState.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        elements.raceTimer.textContent = 
            `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 100);
}

function finishPractice() {
    practiceState.isPracticing = false;
    elements.typingInput.disabled = true;
    
    const elapsed = (Date.now() - practiceState.startTime) / 1000;
    const elapsedMinutes = elapsed / 60;
    const wpm = Math.round((practiceState.correctChars / 5) / elapsedMinutes) || 0;
    const accuracy = Math.round((practiceState.correctChars / practiceState.currentParagraph.length) * 100);
    const errors = practiceState.incorrectChars;
    
    // Display practice results
    elements.resultsList.innerHTML = `
        <div class="practice-results-card">
            <h3>Practice Session Complete!</h3>
            <div class="results-grid">
                <div class="result-stat">
                    <div class="stat-label">WPM</div>
                    <div class="stat-value">${wpm}</div>
                </div>
                <div class="result-stat">
                    <div class="stat-label">Accuracy</div>
                    <div class="stat-value">${accuracy}%</div>
                </div>
                <div class="result-stat">
                    <div class="stat-label">Time</div>
                    <div class="stat-value">${elapsed.toFixed(1)}s</div>
                </div>
                <div class="result-stat">
                    <div class="stat-label">Errors</div>
                    <div class="stat-value">${errors}</div>
                </div>
            </div>
        </div>
    `;
    
    showScreen('results');
    showToast('Practice complete! Great job!', 'success');
}

async function updatePracticeProgress() {
    // Placeholder for updating progress bar
    const raceCar = document.querySelector('.race-car');
    if (raceCar) {
        const progress = (practiceState.currentIndex / practiceState.words.length) * 100;
        raceCar.style.left = progress + '%';
    }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

elements.createRoomBtn.addEventListener('click', createRoom);
elements.joinRoomBtn.addEventListener('click', joinRoom);
elements.leaveRoomBtn.addEventListener('click', leaveRoom);
elements.startRaceBtn.addEventListener('click', startRaceAsHost);
elements.typingInput.addEventListener('keydown', (e) => {
    if (practiceState.isPracticing) {
        handlePracticeTyping(e);
    } else {
        handleTyping(e);
    }
});

// Practice mode buttons
elements.practiceBtn.addEventListener('click', startPracticeMode);
elements.practiceAgainBtn.addEventListener('click', startPracticeMode);
elements.backToLobbyFromPracticeBtn.addEventListener('click', () => {
    practiceState.isPracticing = false;
    showScreen('lobby');
});

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

// Leaderboard button functionality
document.getElementById('leaderboardBtn')?.addEventListener('click', () => {
    showLeaderboard();
});

// =============================================================================
// LEADERBOARD FUNCTIONALITY
// =============================================================================

function showLeaderboard() {
    // Create a simple modal-style leaderboard display
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    modal.innerHTML = `
        <div class="leaderboard-content">
            <h2>🏆 Top Typing Speeds</h2>
            <div class="leaderboard-list">
                <div class="leaderboard-item">
                    <span class="rank">1.</span>
                    <span class="name">SpeedTyper</span>
                    <span class="score">120 WPM</span>
                </div>
                <div class="leaderboard-item">
                    <span class="rank">2.</span>
                    <span class="name">FastFingers</span>
                    <span class="score">115 WPM</span>
                </div>
                <div class="leaderboard-item">
                    <span class="rank">3.</span>
                    <span class="name">QuickType</span>
                    <span class="score">108 WPM</span>
                </div>
                <div class="leaderboard-item">
                    <span class="rank">4.</span>
                    <span class="name">TypeMaster</span>
                    <span class="score">95 WPM</span>
                </div>
                <div class="leaderboard-item">
                    <span class="rank">5.</span>
                    <span class="name">KeyboardNinja</span>
                    <span class="score">88 WPM</span>
                </div>
            </div>
            <p class="leaderboard-note">Complete a solo game to submit your score!</p>
            <button id="closeLeaderboard" class="btn btn-secondary">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close leaderboard functionality
    document.getElementById('closeLeaderboard').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('� TurboType Rally initialized!');
console.log('⚠️  Remember to add your Firebase config at the top of app.js');

// Show lobby screen on load
showScreen('lobby');
