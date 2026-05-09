# PersonaPath AI | Digital Advisory Suite

**PersonaPath AI** is an advanced web-based AI orchestration system that provides specialized guidance through distinct digital personas. Developed as a high-performance semester project, it bridges the gap between complex AI logic and intuitive user experience.
<img width="955" height="437" alt="persona ss" src="https://github.com/user-attachments/assets/7af6fb24-a9b8-4888-97ca-4e7dd4c67c6d" />




## 🚀 Key Innovation: The Dual-Agent Pipeline
To ensure high accuracy and professional conduct, this project implements a two-stage agentic workflow:
1. **Request Architect (Agent 1):** Pre-processes user input to enforce persona constraints and authenticity rules.
2. **Response Verifier (Agent 2):** Performs post-generation validation to remove robotic preambles and ensure persona-specific formatting (e.g., medical disclaimers or religious citations).

## 🌟 Core Features
- **Contextual Memory:** Maintains a rolling history of the conversation to provide coherent multi-turn dialogues.
- **Multimodal Interaction:** Integrated **Web Speech API** for real-time voice-to-text input and natural text-to-speech output.
- **State Persistence:** Utilizes `localStorage` to preserve user sessions even after a page refresh.
- **Context-Aware Personalities:**
    - **Persona Assistant:** Logic and technical expert.
    - **Chacha Advice:** Culturally-aware life mentor (Pakistani Elder).
    - **Dr. Sahiba:** Diagnostic health assistant with a focus on nutrition.
    - **Islamic Scholar:** Authentic guidance with Sahih Hadith referencing.
- **Modern UI/UX:** A responsive dark-themed dashboard featuring **Glassmorphism**, neon glows, and custom animations.

## 🛠️ Technology Stack
- **AI Model:** Meta Llama 3.1 (via Groq Cloud LPU™ Inference)
- **Frontend:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+)
- **Libraries:** [Marked.js](https://marked.js.org/) for Markdown parsing, [FontAwesome](https://fontawesome.com/) for professional icons.

## 📦 Local Setup & Security
For security reasons, the API key is not stored in this repository. To run the project:
1. Clone the repository.
2. Create a `config.js` file in the root directory.
3. Add: `const GROQ_API_KEY = "YOUR_GROQ_KEY_HERE";`
4. Open `index.html` in a modern browser.

---
*Developed by Ayesha Irshad |  - Web Development*
