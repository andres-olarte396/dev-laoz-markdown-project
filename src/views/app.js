// API Configuration
const API_BASE = 'http://localhost:7000/api';

// State
let currentCourse = null;
let currentTopic = null;
let currentTopicTitle = '';
let courses = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
    loadCourses();

    // Configure Marked.js
    if (window.marked) {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
    }

    // Configure Mermaid
    if (window.mermaid) {
        mermaid.initialize({ 
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
        });
    }
});

// Check backend status
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('apiStatus').textContent = '🟢';
            document.getElementById('backendStatus').textContent = `✅ Conectado (v${data.version})`;
        }
    } catch (error) {
        document.getElementById('apiStatus').textContent = '🔴';
        document.getElementById('backendStatus').textContent = '❌ Desconectado';
        showError('No se pudo conectar con el backend');
    }
}

// Load courses
async function loadCourses() {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '<div class="loading">Cargando cursos...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/courses`);
        const data = await response.json();
        
        if (data.success && data.data) {
            courses = Array.isArray(data.data) ? data.data : Object.values(data.data);
            
            // Update stats
            document.getElementById('totalCourses').textContent = courses.length;
            
            // Render courses
            if (courses.length === 0) {
                courseList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <p>No hay cursos disponibles</p>
                    </div>
                `;
            } else {
                courseList.innerHTML = courses.map(course => `
                    <div class="course-item" onclick="loadCourseDetail('${course.id}')">
                        <h3>${course.title || course.id}</h3>
                        <p>${course.description || 'Sin descripción'}</p>
                        <span class="course-badge">${course.level || 'General'}</span>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        courseList.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar cursos: ${error.message}
            </div>
        `;
    }
}

// Load course detail
async function loadCourseDetail(courseId) {
    currentCourse = courseId;
    
    // Update active state
    document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.course-item[onclick="loadCourseDetail('${courseId}')"]`);
    if (activeItem) activeItem.classList.add('active');
    
    // Show course detail view and hide rest
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('topicView').style.display = 'none';
    document.getElementById('courseDetail').style.display = 'block';
    
    // Load course structure
    const modulesList = document.getElementById('modulesList');
    modulesList.innerHTML = '<div class="loading">Cargando estructura del curso...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/structure`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const course = data.data;
            
            // Update course info
            document.getElementById('courseTitle').textContent = course.title || courseId;
            document.getElementById('courseDescription').textContent = course.description || 'Sin descripción';
            document.getElementById('courseLevel').textContent = course.level || 'General';
            document.getElementById('courseDuration').textContent = course.duration_hours 
                ? `${course.duration_hours} horas` 
                : 'No especificado';
            document.getElementById('courseModules').textContent = course.total_modules || 0;
            
            // Update total modules stat
            const totalModules = courses.reduce((sum, c) => sum + (c.total_modules || 0), 0);
            document.getElementById('totalModules').textContent = totalModules;
            
            // Render modules
            if (!course.modules || course.modules.length === 0) {
                modulesList.innerHTML = `
                    <div class="warning-message">
                        ⚠️ Este curso no tiene módulos cargados en la base de datos.
                    </div>
                    <div class="empty-state">
                        <div class="empty-state-icon">📑</div>
                        <p>Estructura del curso no disponible</p>
                    </div>
                `;
            } else {
                modulesList.innerHTML = course.modules.map((module, index) => `
                    <div class="module-item">
                        <div class="module-header" onclick="toggleModule(${index})">
                            <h4>📘 ${module.title || `Módulo ${module.module_number}`}</h4>
                            <span class="module-toggle" id="toggle-${index}">▼</span>
                        </div>
                        <div class="module-content" id="module-${index}">
                            ${renderTopics(module.topics || [])}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading course detail:', error);
        modulesList.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar la estructura del curso: ${error.message}
            </div>
        `;
    }
}

// Render topics
function renderTopics(topics) {
    if (!topics || topics.length === 0) {
        return `
            <div class="empty-state">
                <p>No hay temas en este módulo</p>
            </div>
        `;
    }
    
    return `
        <div class="topic-list">
            ${topics.map(topic => `
                <div class="topic-item" onclick="loadTopicContent('${topic.id}', '${topic.audio_path || ''}', '${topic.evaluation_path || ''}')">
                    <span class="topic-title">📄 ${topic.title || 'Sin título'}</span>
                    ${topic.audio_path ? '<span class="topic-badge">🎧 Audio</span>' : ''}
                    ${topic.evaluation_path ? '<span class="topic-badge" style="background:var(--primary-color)">📝 Quiz</span>' : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Load Topic Content
async function loadTopicContent(topicId, audioPath, evalPath) {
    currentTopic = topicId;
    
    // Hide course detail, show topic view
    document.getElementById('courseDetail').style.display = 'none';
    document.getElementById('topicView').style.display = 'block';
    
    const contentArea = document.getElementById('topicContentArea');
    contentArea.innerHTML = '<div class="loading">Cargando contenido...</div>';
    
    // Config audio button
    const btnAudio = document.getElementById('btnAudio');
    if (audioPath && audioPath !== 'null' && audioPath !== 'undefined') {
        btnAudio.style.display = 'inline-flex';
        btnAudio.onclick = () => setupAudioPlayer(topicId, currentTopicTitle || 'Audio del tema');
    } else {
        btnAudio.style.display = 'none';
        hideAudioPlayer();
    }

    // Config evaluation button
    const btnEval = document.getElementById('btnEvaluation');
    if (btnEval) {
        if (evalPath && evalPath !== 'null' && evalPath !== 'undefined') {
            btnEval.style.display = 'inline-flex';
        } else {
            btnEval.style.display = 'none';
        }
    }

    try {
        // Encode topicId to handle slashes correctly
        const response = await fetch(`${API_BASE}/content/${encodeURIComponent(topicId)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const topic = data.data;
            currentTopicTitle = topic.title; 
            
            // Update audio button logic with fresh title
            if (audioPath && btnAudio) {
                 btnAudio.onclick = () => setupAudioPlayer(topicId, topic.title);
            }
            
            // Update eval button visibility if data refreshed confirms eval path
            if (btnEval) {
                if (topic.evaluation_path) {
                    btnEval.style.display = 'inline-flex';
                }
            }
            
            let htmlContent = '';
            
            if (topic.content) {
                if (typeof marked === 'undefined') {
                    throw new Error('La librería Marked.js no se ha cargado.');
                }

                // Determine base URL for images
                const filePath = (topic.file_path || '').replace(/\\/g, '/');
                const lastSlashIndex = filePath.lastIndexOf('/');
                const relativeDir = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex + 1) : '';
                const baseURL = `/content/${relativeDir}`;

                const renderer = new marked.Renderer();
                
                renderer.image = function(token) {
                    // Handle API v12
                    let href, title, text;
                    if (typeof token === 'object' && token !== null && !Array.isArray(token)) {
                        href = token.href; title = token.title; text = token.text;
                    } else {
                        href = arguments[0]; title = arguments[1]; text = arguments[2];
                    }

                    const cleanHref = String(href || '');
                    const cleanText = String(text || '');
                    const cleanTitle = title ? String(title) : null;
                    let finalHref = cleanHref;

                    if (!cleanHref.startsWith('http') && !cleanHref.startsWith('/') && !cleanHref.startsWith('data:')) {
                        finalHref = baseURL + cleanHref;
                    }

                    let out = `<img src="${finalHref}" alt="${cleanText}"`;
                    if (cleanTitle) out += ` title="${cleanTitle}"`;
                    out += '>';
                    return out;
                };

                renderer.code = function(token) {
                    let code, language;
                    if (typeof token === 'object' && token !== null && !Array.isArray(token)) {
                        code = token.text; language = token.lang;
                    } else {
                        code = arguments[0]; language = arguments[1];
                    }

                    if (language === 'mermaid') {
                        return '<div class="mermaid">' + code + '</div>';
                    }
                    return '<pre><code class="feature-' + language + '">' + code + '</code></pre>';
                };

                htmlContent = marked.parse(topic.content, { renderer: renderer });
            } else {
                htmlContent = `
                    <div class="empty-state">
                        <p>Este tema no tiene contenido disponible.</p>
                    </div>
                `;
            }
            
            contentArea.innerHTML = htmlContent;
            
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            if (window.mermaid) {
                mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            }
            
            document.querySelector('.content').scrollTop = 0;
            
        } else {
           throw new Error('No se encontraron datos del tema');
        }
        
    } catch (error) {
        console.error('Error loading topic content:', error);
        contentArea.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar el contenido: ${error.message}
            </div>
        `;
    }
}

// Back navigation
function showCourseDetailFromTopic() {
    document.getElementById('topicView').style.display = 'none';
    document.getElementById('courseDetail').style.display = 'block';
}

function showWelcome() {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('courseDetail').style.display = 'none';
    document.getElementById('topicView').style.display = 'none';
    
    document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('active');
    });
    
    currentCourse = null;
}

// Toggle module
function toggleModule(index) {
    const content = document.getElementById(`module-${index}`);
    const toggle = document.getElementById(`toggle-${index}`);
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        toggle.classList.remove('open');
    } else {
        content.classList.add('open');
        toggle.classList.add('open');
    }
}

// Audio Player Logic
function setupAudioPlayer(topicId, title) {
    const playerContainer = document.getElementById('audioPlayerContainer');
    const audioTitle = document.getElementById('audioTitle');
    const audioPlayer = document.getElementById('mainAudioPlayer');
    const audioStatus = document.getElementById('audioStatus');
    
    audioTitle.textContent = title || 'Audio del tema';
    audioTitle.title = title;
    audioStatus.textContent = 'Cargando...';
    
    audioPlayer.src = `${API_BASE}/audio/${encodeURIComponent(topicId)}`;
    playerContainer.style.display = 'flex';
    
    audioPlayer.play().then(() => {
        audioStatus.textContent = 'Reproduciendo';
    }).catch(err => {
        console.warn('Auto-play prevented:', err);
        audioStatus.textContent = 'Haz clic para reproducir';
    });
    
    audioPlayer.onplaying = () => audioStatus.textContent = 'Reproduciendo';
    audioPlayer.onpause = () => audioStatus.textContent = 'Pausado';
    audioPlayer.onerror = () => {
        audioStatus.textContent = 'Error al cargar audio';
        showError('No se pudo cargar el archivo de audio');
    };
}

function toggleAudio() {
    const playerContainer = document.getElementById('audioPlayerContainer');
    if (playerContainer.style.display === 'none') {
        if (currentTopic) {
            setupAudioPlayer(currentTopic, currentTopicTitle);
        }
    } else {
        hideAudioPlayer();
    }
}

function hideAudioPlayer() {
    const playerContainer = document.getElementById('audioPlayerContainer');
    const audioPlayer = document.getElementById('mainAudioPlayer');
    audioPlayer.pause();
    playerContainer.style.display = 'none';
}

function showError(message) {
    console.error(message);
}

// Auto-refresh backend status every 30 seconds
setInterval(checkBackendStatus, 30000);

// ==========================================
// QUIZ LOGIC
// ==========================================

let currentQuizQuestions = [];

async function startQuiz() {
    if (!currentTopic) return;
    
    const btnEval = document.getElementById('btnEvaluation');
    const originalText = btnEval.textContent;
    btnEval.textContent = '⏳ Cargando...';
    
    try {
        const response = await fetch(`${API_BASE}/content/${encodeURIComponent(currentTopic)}/evaluation`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!data.markdown) throw new Error('Contenido vacío');
        
        // Parse Markdown to Quiz Object
        currentQuizQuestions = parseQuizMarkdown(data.markdown);
        
        if (currentQuizQuestions.length === 0) {
            alert('No se pudieron detectar preguntas en esta evaluación.');
            return;
        }
        
        renderQuiz(currentQuizQuestions);
        document.getElementById('quizModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error starting quiz:', error);
        showError('No se pudo cargar la evaluación: ' + error.message);
    } finally {
        btnEval.textContent = originalText; // Restore text
    }
}

function parseQuizMarkdown(markdown) {
    const questions = [];
    const lines = markdown.split('\n');
    let currentQuestion = null;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Detect Question (Heading or Numbered List)
        if (trimmed.match(/^#{1,4}\s+/) || trimmed.match(/^\d+\.\s+/)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            
            currentQuestion = {
                text: trimmed.replace(/^[#\d\.]+\s+/, ''),
                options: [],
                type: 'single' // default
            };
        }
        // Detect Options (- [ ] or - [x])
        else if (currentQuestion && trimmed.match(/^-\s*\[([ xX])\]/)) {
            const isCorrect = trimmed.match(/^-\s*\[([xX])\]/);
            const text = trimmed.replace(/^-\s*\[([ xX])\]\s*/, '');
            
            currentQuestion.options.push({
                text: text,
                isCorrect: !!isCorrect
            });
        }
    });
    
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    return questions.filter(q => q.options.length > 0);
}

function renderQuiz(questions) {
    const quizBody = document.getElementById('quizBody');
    quizBody.innerHTML = '';
    
    questions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.innerHTML = `
            <h3>${index + 1}. ${q.text}</h3>
            <div class="quiz-options">
                ${q.options.map((opt, optIndex) => `
                    <div class="quiz-option">
                        <input type="${hasMultipleCorrect(q) ? 'checkbox' : 'radio'}" 
                               name="q${index}" 
                               id="q${index}_o${optIndex}"
                               value="${optIndex}">
                        <label for="q${index}_o${optIndex}">${opt.text}</label>
                    </div>
                `).join('')}
            </div>
        `;
        quizBody.appendChild(qDiv);
    });
    
    document.querySelector('.btn-submit-quiz').style.display = 'block';
}

function hasMultipleCorrect(question) {
    return question.options.filter(o => o.isCorrect).length > 1;
}

function closeQuiz() {
    document.getElementById('quizModal').style.display = 'none';
}

async function submitQuiz() {
    let score = 0;
    const results = [];
    
    currentQuizQuestions.forEach((q, index) => {
        const selectedInputs = document.querySelectorAll(`input[name="q${index}"]:checked`);
        const selectedIndices = Array.from(selectedInputs).map(i => parseInt(i.value));
        
        const correctIndices = q.options
            .map((o, i) => o.isCorrect ? i : -1)
            .filter(i => i !== -1);
            
        const isCorrect = 
            selectedIndices.length === correctIndices.length &&
            selectedIndices.every(val => correctIndices.includes(val));
            
        if (isCorrect) score++;
        
        results.push({
            question: q.text,
            isCorrect: isCorrect,
            selected: selectedIndices,
            correct: correctIndices
        });
        
        const qDiv = document.querySelectorAll('.quiz-question')[index];
        const optionsDivs = qDiv.querySelectorAll('.quiz-option');
        
        optionsDivs.forEach((optDiv, optIndex) => {
            optDiv.classList.remove('correct-answer', 'wrong-answer');
            if (correctIndices.includes(optIndex)) {
                optDiv.classList.add('correct-answer');
            }
            if (selectedIndices.includes(optIndex) && !correctIndices.includes(optIndex)) {
                optDiv.classList.add('wrong-answer');
            }
        });
    });

    // Save to Backend
    const btnSubmit = document.querySelector('.btn-submit-quiz');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Guardando...';
    btnSubmit.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/progress/submit-evaluation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topicId: currentTopic,
                score: score,
                maxScore: currentQuizQuestions.length,
                answers: results,
                timeSpent: 0 // TODO: Add timer logic
            })
        });
        
        if (!response.ok) throw new Error('Failed to save progress');
        
        // Mark topic as complete automatically if passed?
        // Let's leave that optional for now.
        
    } catch (error) {
        console.error('Error saving quiz result:', error);
        // Don't block UI, just log error
    } finally {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
    }
    
    const percentage = Math.round((score / currentQuizQuestions.length) * 100);
    showQuizResults(score, currentQuizQuestions.length, percentage);
}

function showQuizResults(score, total, percentage) {
    const btnSubmit = document.querySelector('.btn-submit-quiz');
    btnSubmit.style.display = 'none';
    
    const quizBody = document.getElementById('quizBody');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'quiz-result';
    resultDiv.innerHTML = `
        <div class="score-circle" style="--percentage: ${percentage}%; --primary-color: ${percentage >= 70 ? '#10b981' : '#ef4444'}">
            <span class="score-text" style="color: ${percentage >= 70 ? '#10b981' : '#ef4444'}">${percentage}%</span>
        </div>
        <h3>Has acertado ${score} de ${total} preguntas</h3>
        <p>${percentage >= 70 ? '¡Excelente trabajo! 🎉' : 'Sigue repasando 💪'}</p>
        <button class="btn-action" onclick="closeQuiz()">Cerrar</button>
    `;
    
    quizBody.insertBefore(resultDiv, quizBody.firstChild);
    quizBody.scrollTop = 0;
}

window.onclick = function(event) {
    const modal = document.getElementById('quizModal');
    if (event.target == modal) {
        closeQuiz();
    }
}
