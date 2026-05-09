const characterData = {
    'Bot': { 
        name: 'Persona Assistant', 
        status: 'Online', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', 
        greet: "Hello! I am your AI partner. How can I help you today?",
        personality: "You are a highly intelligent, professional, and friendly AI assistant. Avoid robotic phrases. Be insightful.",
        voicePitch: 1.0, voiceRate: 1.1, gender: 'male'
    },
    'Uncle': { 
        name: 'Chacha Advice', 
        status: 'Drinking Chai', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png', 
        greet: "Assalam-o-Alaikum beta! Ap kuch kehna chaho gay?",
        personality: "You are a wise Pakistani Chacha. Speak Hinglish. Use 'Beta'. Give realistic life advice.",
        voicePitch: 0.5, voiceRate: 0.8, gender: 'male'
    },
    'Doctor': { 
        name: 'Dr. Sahiba', 
        status: 'In Clinic', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png', 
        greet: "Hello. I am Dr. Sahiba. How are you feeling today?",
        personality: "You are a professional General Physician. Ask follow-up questions. Provide cures and causes.",
        voicePitch: 1.5, voiceRate: 1.0, gender: 'female'
    },
    'Islamic': { 
        name: 'Islamic Scholar', 
        status: 'In Majlis', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/2822/2822557.png', 
        greet: "Assalam-o-Alaikum. I am here to provide guidance based on Islamic wisdom.",
        personality: "You are an authentic Islamic Scholar. Provide specific Sahih references. Format with headers.",
        voicePitch: 0.7, voiceRate: 0.85, gender: 'male'
    }
};

let currentPersona = 'Bot';
let conversationHistory = [];

// --- 1. THE SWITCHER ---
function changeCharacter(id) {
    currentPersona = id; 
    conversationHistory = []; 
    const data = characterData[id];

    document.body.className = `theme-${id.toLowerCase()}`;
    document.getElementById('current-character-name').innerText = data.name;
    document.getElementById('current-status').innerText = data.status;
    document.getElementById('header-avatar').src = data.avatar;

    document.querySelectorAll('.char-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`button[onclick*="${id}"]`);
    if(activeBtn) activeBtn.classList.add('active');

    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ""; 
    // We pass the avatar to renderBubble so it stays "locked"
    renderBubble('bot', data.greet, data.avatar);
}

// --- 2. THE DUAL AGENTS ---
function requestAgent(userInput, persona) {
    const data = characterData[persona];
    return `Instruction: Act strictly as ${data.name}. Persona: ${data.personality}. User said: ${userInput}`;
}

function responseAgent(aiText, persona) {
    let cleanText = aiText.replace(/System Core Initiated|Initialization Sequence|Processing|Operational within/gi, "");
    if (persona === 'Doctor' && !cleanText.includes("disclaimer")) {
        cleanText += "\n\n> **Note:** Consult a physical doctor for emergencies.";
    }
    if (persona === 'Uncle' && !cleanText.includes("Beta")) {
        cleanText = "Suno Beta, " + cleanText;
    }
    return cleanText.trim();
}

// --- 3. THE ENGINE ---
async function sendMessage() {
    const input = document.getElementById('user-msg');
    const userText = input.value.trim();
    if (userText === "") return;

    const data = characterData[currentPersona];

    // DISPLAY: Show clean user text
    renderBubble('user', userText);
    input.value = "";
    
    // MEMORY: Save clean text and current avatar to history
    conversationHistory.push({ role: "user", content: userText, avatar: data.avatar });

    const typingId = "typing-" + Date.now();
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `
        <div id="${typingId}" class="chat-row">
            <img src="${data.avatar}" class="avatar-sm">
            <div class="bot-msg"><div class="typing"><span></span><span></span><span></span></div></div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    

    try {
        // Prepare the specialized prompt for the AI
        const agentPrompt = requestAgent(userText, currentPersona);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                // Send the agent instructions as 'system' to keep 'user' history clean
                messages: [
                    { role: "system", content: agentPrompt },
                    ...conversationHistory.map(m => ({ role: m.role, content: m.content }))
                ],
                temperature: 0.7
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error.message);

        const rawResponse = result.choices[0].message.content;
        const verifiedResponse = responseAgent(rawResponse, currentPersona);

        // MEMORY: Save bot response and its avatar
        conversationHistory.push({ role: "assistant", content: verifiedResponse, avatar: data.avatar });
        if(conversationHistory.length > 10) conversationHistory.shift();

        document.getElementById(typingId).remove();
        renderBubble('bot', verifiedResponse, data.avatar);
        
        saveChatToLocal();

    } catch (error) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) typingElement.innerText = "Notice: " + error.message;
    }
}

// --- 4. THE LIBRARIAN (LOCAL STORAGE) ---
function saveChatToLocal() {
    localStorage.setItem('personaChatHistory', JSON.stringify(conversationHistory));
    updateHistoryList();
}

function loadChatFromLocal() {
    const savedData = localStorage.getItem('personaChatHistory');
    if (savedData) {
        conversationHistory = JSON.parse(savedData);
        document.getElementById('chat-box').innerHTML = ""; 
        conversationHistory.forEach(msg => {
            // We use the 'avatar' property we saved in the history object
            renderBubble(msg.role === "user" ? 'user' : 'bot', msg.content, msg.avatar);
        });
        updateHistoryList();
    }
}

function updateHistoryList() {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    conversationHistory.filter(m => m.role === "user").slice(-5).forEach(m => {
        list.innerHTML += `<div class="history-item">${m.content.substring(0, 30)}...</div>`;
    });
}
function clearHistory() {
    // 1. Ask for confirmation so they don't click it by mistake
    if (confirm("Are you sure you want to delete all chat history?")) {
        
        // 2. Wipe the Vault (LocalStorage)
        localStorage.removeItem('personaChatHistory');
        
        // 3. Wipe the local memory (The Array)
        conversationHistory = [];
        
        // 4. Wipe the UI (The Chat Box)
        document.getElementById('chat-box').innerHTML = "";
        
        // 5. Wipe the Drawer List
        updateHistoryList();
        
        // 6. Refresh the Character's greeting so it's not empty
        const data = characterData[currentPersona];
        renderBubble('bot', data.greet, data.avatar);
        
        // Optional: Close the history drawer after clearing
        toggleHistory();
    }
}

// --- 5. THE PRINTER (UI) ---
function renderBubble(role, text, avatar) {
    const chatBox = document.getElementById('chat-box');
    
    if (role === 'user') {
        chatBox.innerHTML += `<div class="user-msg-bubble">${text}</div>`;
    } else {
        const formattedHTML = marked.parse(text);
        const voiceSafeText = text.replace(/'/g, "").replace(/\n/g, " ");
        chatBox.innerHTML += `
            <div class="chat-row">
                <img src="${avatar}" class="avatar-sm">
                <div class="bot-msg">
                    ${formattedHTML}
                    <button class="speak-btn" onclick="speakText('${voiceSafeText}')">🔊</button>
                </div>
            </div>`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- 6. VOICE & UTILS ---
function speakText(text) {
    window.speechSynthesis.cancel();
    const data = characterData[currentPersona];
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => data.gender === 'female' ? v.name.includes('Female') : v.name.includes('Male'));
    if(preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = data.voicePitch; utterance.rate = data.voiceRate;
    window.speechSynthesis.speak(utterance);
}

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    const micBtn = document.getElementById('mic-btn');
    micBtn.classList.add('listening');
    recognition.start();
    recognition.onresult = (event) => {
        document.getElementById('user-msg').value = event.results[0][0].transcript;
        sendMessage(); 
    }
    recognition.onend = () => { micBtn.classList.remove('listening'); };
}

function toggleHistory() { document.getElementById('history-drawer').classList.toggle('open'); }

window.onload = () => { 
    changeCharacter('Bot');
    loadChatFromLocal(); 
};