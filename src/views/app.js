// API Configuration
const API_BASE = '/api';

// State
let currentCourse = null;
let currentTopic = null;
let currentTopicTitle = '';
let activeCourseData = null;
let courses = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
    loadCourses().then(() => {
        restoreState(); // Restore state only after courses loaded
    });

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

// Persistence Logic
function saveState() {
    const state = {
        courseId: currentCourse,
        topicId: currentTopic,
        topicTitle: currentTopicTitle
    };
    localStorage.setItem('lmsState', JSON.stringify(state));
}

function clearState() {
    localStorage.removeItem('lmsState');
}

async function restoreState() {
    const saved = localStorage.getItem('lmsState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (state.courseId) {
                // Load course detail
                await loadCourseDetail(state.courseId);
                
                // If topic was open, try to reopen it
                if (state.topicId) {
                    setTimeout(() => {
                        const topicLink = document.querySelector(`.topic-item[onclick*="${state.topicId}"]`);
                        if (topicLink) {
                             topicLink.click();
                        } else {
                             loadTopicContent(state.topicId, null, null); 
                        }
                    }, 500);
                }
            }
        } catch (e) {
            console.error('Failed to restore state', e);
        }
    }
}

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
            
            // Sort courses by creation date (descending - newest first)
            courses.sort((a, b) => {
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA; // Descending order
            });
            
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
    saveState();

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
            activeCourseData = course; // Store globally regarding navigation
            console.log('DEBUG: Course Structure Received:', course);
            if (course.modules) {
                course.modules.forEach(m => console.log(`Module ${m.id} has ${m.topics ? m.topics.length : 0} topics`));
            }
            
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
            ${topics.map(topic => {
                const safeAudio = (topic.audio_path || '').replace(/\\/g, '/');
                const safeEval = (topic.evaluation_path || '').replace(/\\/g, '/');
                const isCompleted = false; // TODO: Check completion status
                
                return `
                <div class="topic-item ${isCompleted ? 'completed' : ''}" 
                     onclick="loadTopicContent('${topic.id}', '${safeAudio}', '${safeEval}')">
                    <div class="topic-status">
                        ${isCompleted ? '✅' : '○'}
                    </div>
                    <span class="topic-title">${topic.title || 'Sin título'}</span>
                    <div class="topic-badges">
                        ${topic.audio_path ? '<span class="topic-badge">🎧 Audio</span>' : ''}
                        ${topic.evaluation_path ? '<span class="topic-badge quiz">📝 Quiz</span>' : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Load Topic Content
async function loadTopicContent(topicId, audioPath, evalPath) {
    console.log('DEBUG: loadTopicContent called', { topicId, audioPath, evalPath });
    currentTopic = topicId;
    saveState();
    
    // Update Navigation logic
    updateNavigationButtons();
    
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
        const response = await fetch(`${API_BASE}/content/${encodeURIComponent(topicId)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const topic = data.data;
            currentTopicTitle = topic.title; 
            saveState(); // Update saved title
            
            // Mark as viewed/completed (Progress)
            try {
                if (currentCourse && topic.module_id) {
                     fetch(`${API_BASE}/progress/mark-complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            courseId: currentCourse, 
                            moduleId: topic.module_id, 
                            topicId: topicId 
                        })
                    }).then(r => r.json()).then(d => {
                        if(d.success) console.log('Topic marked as completed');
                    }).catch(err => console.warn('Silent progress error', err));
                }
            } catch (pErr) { console.warn('Progress logic error', pErr); }

            if (audioPath && btnAudio) {
                 btnAudio.onclick = () => setupAudioPlayer(topicId, topic.title);
            }
            
            if (btnEval && topic.evaluation_path) {
                btnEval.style.display = 'inline-flex';
            }
            
            let htmlContent = '';
            
            if (topic.content) {
                if (typeof marked === 'undefined') {
                    throw new Error('La librería Marked.js no se ha cargado.');
                }

                const filePath = (topic.file_path || '').replace(/\\/g, '/');
                const lastSlashIndex = filePath.lastIndexOf('/');
                const relativeDir = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex + 1) : '';
                const baseURL = `/content/${relativeDir}`;

                const renderer = new marked.Renderer();
                
                renderer.image = function(token) {
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
    
    // Reload course detail to refresh progress/stats?
    if(currentCourse) loadCourseDetail(currentCourse);
}

function showWelcome() {
    clearState();
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

function hideAudioPlayer() {
    const playerContainer = document.getElementById('audioPlayerContainer');
    const audioPlayer = document.getElementById('mainAudioPlayer');
    audioPlayer.pause();
    playerContainer.style.display = 'none';
}

function showError(message) {
    console.error(message);
}

// Auto-refresh backend status
setInterval(checkBackendStatus, 30000);

// Navigation Logic
// Navigation Logic
function updateNavigationButtons() {
    const btnNext = document.getElementById('btnNextTopic');
    const btnPrev = document.getElementById('btnPrevTopic');
    
    if(!btnNext || !btnPrev) return;
    
    if (!activeCourseData || !currentTopic) {
        btnNext.style.display = 'none';
        btnPrev.style.display = 'none';
        return;
    }
    
    let allTopics = [];
    if(activeCourseData.modules) {
        activeCourseData.modules.forEach(m => {
            if(m.topics) allTopics.push(...m.topics);
        });
    }
    
    const currentIndex = allTopics.findIndex(t => t.id === currentTopic);
    
    // Check Next
    if (currentIndex !== -1 && currentIndex < allTopics.length - 1) {
        btnNext.style.display = 'inline-flex';
        const nextTopic = allTopics[currentIndex + 1];
        btnNext.title = `Siguiente: ${nextTopic.title}`;
    } else {
        btnNext.style.display = 'none';
    }

    // Check Prev
    if (currentIndex > 0) {
        btnPrev.style.display = 'inline-flex';
        const prevTopic = allTopics[currentIndex - 1];
        btnPrev.title = `Anterior: ${prevTopic.title}`;
    } else {
        btnPrev.style.display = 'none';
    }
}

function loadNextTopic() {
    if (!activeCourseData || !currentTopic) return;
    
    let allTopics = [];
    if(activeCourseData.modules) {
        activeCourseData.modules.forEach(m => {
            if(m.topics) allTopics.push(...m.topics);
        });
    }
    
    const currentIndex = allTopics.findIndex(t => t.id === currentTopic);
    if (currentIndex !== -1 && currentIndex < allTopics.length - 1) {
        const nextTopic = allTopics[currentIndex + 1];
        loadTopicContent(nextTopic.id, nextTopic.audio_path, nextTopic.evaluation_path);
    }
}

function loadPrevTopic() {
    if (!activeCourseData || !currentTopic) return;
    
    let allTopics = [];
    if(activeCourseData.modules) {
        activeCourseData.modules.forEach(m => {
            if(m.topics) allTopics.push(...m.topics);
        });
    }
    
    const currentIndex = allTopics.findIndex(t => t.id === currentTopic);
    if (currentIndex > 0) {
        const prevTopic = allTopics[currentIndex - 1];
        loadTopicContent(prevTopic.id, prevTopic.audio_path, prevTopic.evaluation_path);
    }
}

// QUIZ LOGIC
let currentQuizQuestions = [];
let currentQuizTopicId = null;

async function startQuiz() {
    if (!currentTopic) return;
    
    currentQuizTopicId = currentTopic;
    const btnEval = document.getElementById('btnEvaluation');
    const originalText = btnEval.textContent;
    btnEval.textContent = '⏳ Cargando...';
    
    document.querySelector('.btn-submit-quiz').style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE}/content/${encodeURIComponent(currentTopic)}/evaluation`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!data.markdown) throw new Error('Contenido vacío');
        
        currentQuizQuestions = parseQuizMarkdown(data.markdown);
        
        if (currentQuizQuestions.length === 0) {
            alert('No se pudieron detectar preguntas en esta evaluación. Verifica el formato del archivo.');
            return;
        }
        
        renderQuiz(currentQuizQuestions);
        document.getElementById('quizModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error starting quiz:', error);
        showError('No se pudo cargar la evaluación: ' + error.message);
    } finally {
        btnEval.textContent = originalText;
    }
}

function parseQuizMarkdown(markdown) {
    const questions = [];
    
    const splitParts = markdown.split(/#{2,}\s*SOLUCIONARIO/i);
    const questionsText = splitParts[0];
    const solutionsText = splitParts[1] || '';
    
    const blocks = questionsText.split(/#{3}\s*Pregunta/i).slice(1); 
    
    blocks.forEach(block => {
        const lines = block.trim().split('\n').filter(l => l.trim().length > 0);
        
        if(lines.length === 0) return;

        const optionLinesIndices = [];
        lines.forEach((line, idx) => {
             if (line.match(/^\s*[a-eA-E]\s*[).]\s+/)) {
                 optionLinesIndices.push(idx);
             }
        });
        
        if (optionLinesIndices.length === 0) return; 
        
        const firstOptionIdx = optionLinesIndices[0];
        let qTextLines = lines.slice(0, firstOptionIdx);
        
        // Remove question numbering 1., 2., etc. even if it has markdown chars
        if (qTextLines.length > 0) {
             // Regex matches:
             // ^\s*     Leading whitespace
             // \d+      Number
             // [:.]?    Optional separator
             // \s*      Whitespace
             // (?:[*_]{2,})?  Optional markdown start (** or __)
             const numberingRegex = /^\s*\d+[:.]?\s*/;
             qTextLines[0] = qTextLines[0].replace(numberingRegex, '');
        }
        
        const questionText = qTextLines.join('\n').trim();
        
        const options = [];
        for (let i = firstOptionIdx; i < lines.length; i++) {
             const line = lines[i].trim();
             const match = line.match(/^\s*([a-eA-E])\s*[).]\s+(.*)$/);
             if (match) {
                 options.push({
                     text: match[2],
                     letter: match[1].toLowerCase(),
                     isCorrect: false
                 });
             }
        }
        
        questions.push({
            text: questionText,
            options: options,
            type: 'single'
        });
    });
    
    const solLines = solutionsText.split('\n');
    solLines.forEach(line => {
        const match = line.match(/(\d+)\.\s*\**([a-e])\s*\**([).])?/i);
        if (match) {
            const index = parseInt(match[1]) - 1;
            const correctLetter = match[2].toLowerCase();
            
            if (questions[index]) {
                questions[index].options.forEach(opt => {
                    if (opt.letter === correctLetter) {
                        opt.isCorrect = true;
                    }
                });
            }
        }
    });

    if (questions.length === 0) {
        return parseLegacyQuizMarkdown(markdown);
    }
    
    return questions;
}

function parseLegacyQuizMarkdown(markdown) {
    const questions = [];
    const lines = markdown.split('\n');
    let currentQuestion = null;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^#{1,4}\s+/) || trimmed.match(/^\d+\.\s+/)) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = {
                text: trimmed.replace(/^[#\d\.]+\s+/, ''),
                options: [],
                type: 'single'
            };
        } else if (currentQuestion && trimmed.match(/^-\s*\[([ xX])\]/)) {
            const isCorrect = trimmed.match(/^-\s*\[([xX])\]/);
            const text = trimmed.replace(/^-\s*\[([ xX])\]\s*/, '');
            currentQuestion.options.push({ text: text, isCorrect: !!isCorrect });
        }
    });
    if (currentQuestion) questions.push(currentQuestion);
    return questions.filter(q => q.options.length > 0);
}

function renderQuiz(questions) {
    const quizBody = document.getElementById('quizBody');
    quizBody.innerHTML = '';
    
    questions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.id = `q-${index}`; 
        qDiv.innerHTML = `
            <h3>${index + 1}. ${q.text}</h3>
            <div class="quiz-options">
                ${q.options.map((opt, optIndex) => `
                    <div class="quiz-option">
                        <input type="radio" 
                               name="q-${index}" 
                               id="q-${index}-opt-${opt.letter || optIndex}" 
                               value="${opt.letter || optIndex}">
                        <label for="q-${index}-opt-${opt.letter || optIndex}">
                            ${opt.letter ? opt.letter.toUpperCase() + ') ' : ''}${opt.text}
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        quizBody.appendChild(qDiv);
    });
}

function submitQuiz() {
    let score = 0;
    let total = currentQuizQuestions.length;
    let results = [];
    
    currentQuizQuestions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q-${index}"]:checked`);
        let isCorrect = false;
        
        let correctOption = q.options.find(opt => opt.isCorrect);
        let correctAnswerVal = correctOption ? (correctOption.letter || 'marked') : 'unknown';

        if (selected) {
            const selectedVal = selected.value;
            // Compare letters or indices
            if (correctOption && selectedVal === correctOption.letter) {
                isCorrect = true;
            } else if (correctOption && typeof correctOption.letter === 'undefined' && correctOption.isCorrect) {
                // Legacy check
                isCorrect = true; 
            }
        }
        
        if (isCorrect) score++;
        
        results.push({
            questionId: index,
            correct: isCorrect,
            userAnswer: selected ? selected.value : null,
            correctAnswer: correctAnswerVal
        });
        
        // Visual Feedback
        const questionDiv = document.getElementById(`q-${index}`);
        if(questionDiv) {
            if(isCorrect) {
                questionDiv.style.borderLeft = "5px solid #22c55e"; 
                questionDiv.style.background = "#f0fdf4";
            } else {
                 questionDiv.style.borderLeft = "5px solid #ef4444"; 
                 questionDiv.style.background = "#fef2f2";
                 
                 const note = document.createElement('div');
                 note.style.color = '#ef4444';
                 note.style.marginTop = '10px';
                 note.style.fontWeight = 'bold';
                 note.innerText = `Respuesta correcta: ${correctAnswerVal.toUpperCase()}`;
                 if(!questionDiv.querySelector('div[style*="color"]')) {
                     questionDiv.appendChild(note);
                 }
            }
        }
    });
    
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;
    
    // Save Result
    if (currentCourse && currentQuizTopicId) {
        fetch(`${API_BASE}/progress/submit-evaluation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: currentCourse,
                topicId: currentQuizTopicId,
                score: percentage,
                passed: passed,
                details: results
            })
        }).then(r => r.json())
          .then(d => console.log('Quiz saved', d))
          .catch(e => console.error('Error saving quiz', e));
    }
    
    showQuizResults(score, total, percentage);
    document.querySelector('.btn-submit-quiz').style.display = 'none';
}

function showQuizResults(score, total, percentage) {
    const quizBody = document.getElementById('quizBody');
    const passed = percentage >= 70;
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'quiz-result';
    summaryDiv.innerHTML = `
        <div class="score-circle" style="background: conic-gradient(${passed ? '#22c55e' : '#ef4444'} ${percentage}%, #e2e8f0 0)">
            <span style="font-size: 1.5rem; font-weight: bold; color: white;">${percentage}%</span>
        </div>
        <h3>${passed ? '¡Felicitaciones!' : 'Sigue practicando'}</h3>
        <p>Has respondido correctamente ${score} de ${total} preguntas.</p>
    `;
    
    quizBody.insertBefore(summaryDiv, quizBody.firstChild);
    quizBody.scrollTop = 0;
}

function closeQuiz() {
    document.getElementById('quizModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('quizModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    const toggleBtn = document.getElementById('btnToggleSidebar');
    const toggleIcon = toggleBtn.querySelector('ion-icon');
    const showBtn = document.getElementById('btnShowSidebar');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.setAttribute('name', 'chevron-forward-outline');
        toggleBtn.setAttribute('title', 'Mostrar panel');
        showBtn.style.display = 'flex'; // Show floating button
    } else {
        toggleIcon.setAttribute('name', 'chevron-back-outline');
        toggleBtn.setAttribute('title', 'Ocultar panel');
        showBtn.style.display = 'none'; // Hide floating button
    }
}
