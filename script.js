// Global variables
let userStyle = '';
let currentTemplates = [];
let displayedTemplates = 0;
const templatesPerLoad = 12;
let promptHistory = JSON.parse(localStorage.getItem('promptHistory')) || [];
let favoritePrompts = JSON.parse(localStorage.getItem('favoritePrompts')) || [];
let apiKeys = JSON.parse(localStorage.getItem('apiKeys')) || {};
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// AI API Configuration
const AI_PROVIDERS = {
    openai: {
        name: 'OpenAI GPT',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4', 'gpt-3.5-turbo']
    },
    claude: {
        name: 'Anthropic Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-opus', 'claude-3-sonnet']
    },
    gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        models: ['gemini-pro', 'gemini-pro-vision']
    }
};

// Sample prompt templates database
const promptTemplates = [
    {
        id: 1,
        field: 'marketing',
        title: 'Social Media Campaign',
        description: 'Create engaging social media content for product launches',
        content: 'Act as a social media marketing expert. Create a comprehensive social media campaign for [PRODUCT/SERVICE]. Include: 1) Target audience analysis 2) Platform-specific content strategy 3) Engaging post ideas with captions 4) Hashtag strategy 5) Content calendar for 30 days 6) KPIs to track success. Make the content authentic, engaging, and aligned with current trends.'
    },
    {
        id: 2,
        field: 'coding',
        title: 'Code Review Assistant',
        description: 'Comprehensive code review and optimization suggestions',
        content: 'Act as a senior software engineer conducting a thorough code review. Analyze the following code for: 1) Code quality and readability 2) Performance optimizations 3) Security vulnerabilities 4) Best practices adherence 5) Potential bugs or edge cases 6) Refactoring suggestions 7) Documentation improvements. Provide specific, actionable feedback with examples.'
    },
    {
        id: 3,
        field: 'design',
        title: 'UI/UX Design Brief',
        description: 'Create detailed design specifications and user experience guidelines',
        content: 'Act as a senior UI/UX designer. Create a comprehensive design brief for [PROJECT]. Include: 1) User persona analysis 2) Information architecture 3) Wireframe descriptions 4) Visual design principles 5) Color palette and typography 6) Interaction patterns 7) Accessibility considerations 8) Mobile responsiveness guidelines. Focus on user-centered design principles.'
    },
    {
        id: 4,
        field: 'business',
        title: 'Business Strategy Analysis',
        description: 'Comprehensive business analysis and strategic recommendations',
        content: 'Act as a senior business consultant. Analyze [BUSINESS/INDUSTRY] and provide: 1) Market analysis and competitive landscape 2) SWOT analysis 3) Revenue model evaluation 4) Growth opportunities identification 5) Risk assessment 6) Strategic recommendations 7) Implementation roadmap 8) Success metrics. Base recommendations on current market trends and data.'
    },
    {
        id: 5,
        field: 'education',
        title: 'Curriculum Development',
        description: 'Design comprehensive educational curriculum and learning objectives',
        content: 'Act as an educational curriculum designer. Create a comprehensive curriculum for [SUBJECT/TOPIC]. Include: 1) Learning objectives and outcomes 2) Module breakdown with timelines 3) Assessment methods 4) Interactive learning activities 5) Resource requirements 6) Differentiated instruction strategies 7) Progress tracking methods 8) Real-world application examples.'
    },
    {
        id: 6,
        field: 'writing',
        title: 'Content Strategy Framework',
        description: 'Develop comprehensive content marketing and writing strategies',
        content: 'Act as a content strategist and copywriting expert. Develop a content strategy for [BRAND/TOPIC]. Include: 1) Content audit and gap analysis 2) Target audience personas 3) Content pillars and themes 4) Editorial calendar 5) SEO optimization strategy 6) Content distribution plan 7) Performance metrics 8) Brand voice and tone guidelines.'
    },
    {
        id: 7,
        field: 'research',
        title: 'Research Methodology Design',
        description: 'Design comprehensive research studies and analysis frameworks',
        content: 'Act as a research methodologist. Design a comprehensive research study for [RESEARCH QUESTION]. Include: 1) Literature review framework 2) Research methodology selection 3) Data collection methods 4) Sample size and selection criteria 5) Data analysis plan 6) Ethical considerations 7) Timeline and milestones 8) Expected outcomes and limitations.'
    },
    {
        id: 8,
        field: 'sales',
        title: 'Sales Funnel Optimization',
        description: 'Optimize sales processes and conversion strategies',
        content: 'Act as a sales optimization expert. Analyze and improve the sales funnel for [PRODUCT/SERVICE]. Include: 1) Customer journey mapping 2) Lead qualification criteria 3) Conversion bottleneck identification 4) Sales script optimization 5) Follow-up sequence design 6) Objection handling strategies 7) Performance metrics tracking 8) A/B testing recommendations.'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize particles
    createParticles();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Load initial templates
    loadTemplates();
    
    // Initialize theme
    initializeTheme();
}

// Particle Animation System
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size between 2-8px
    const size = Math.random() * 6 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay and duration
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    
    container.appendChild(particle);
    
    // Remove and recreate particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            createParticle(container);
        }
    }, 8000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generatePrompt);
    
    // Copy prompt button
    document.getElementById('copyPrompt').addEventListener('click', copyGeneratedPrompt);
    
    // Learn style button
    document.getElementById('learnStyleBtn').addEventListener('click', learnUserStyle);
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterTemplates);
    document.getElementById('filterField').addEventListener('change', filterTemplates);
    
    // Load more templates
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreTemplates);
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Advanced AI Integration Functions
async function callAIProvider(provider, prompt, model = null) {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
        throw new Error(`API key for ${provider} not configured`);
    }

    const config = AI_PROVIDERS[provider];
    const selectedModel = model || config.models[0];

    try {
        let response;
        switch (provider) {
            case 'openai':
                response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 2000,
                        temperature: 0.7
                    })
                });
                break;
            case 'claude':
                response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        max_tokens: 2000,
                        messages: [{ role: 'user', content: prompt }]
                    })
                });
                break;
            case 'gemini':
                response = await fetch(`${config.endpoint}/${selectedModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                break;
        }

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return extractResponseContent(data, provider);
    } catch (error) {
        console.error(`AI API Error (${provider}):`, error);
        throw error;
    }
}

function extractResponseContent(data, provider) {
    switch (provider) {
        case 'openai':
            return data.choices[0]?.message?.content || '';
        case 'claude':
            return data.content[0]?.text || '';
        case 'gemini':
            return data.candidates[0]?.content?.parts[0]?.text || '';
        default:
            return '';
    }
}

// Enhanced Prompt Generation Engine
async function generatePrompt() {
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput').value.trim();
    const fieldSelect = document.getElementById('fieldSelect').value;
    const styleSelect = document.getElementById('styleSelect').value;
    
    if (!promptInput) {
        showNotification('Please enter some keywords or description for your prompt.', 'warning');
        return;
    }
    
    // Add boom animation
    generateBtn.classList.add('clicked');
    const btnText = generateBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Show loading state
    btnText.innerHTML = '<div class="loading"></div>';
    generateBtn.disabled = true;
    
    try {
        let generatedPrompt;
        
        // Check if AI API is configured
        const hasApiKey = Object.keys(apiKeys).length > 0;
        
        if (hasApiKey && Math.random() > 0.3) { // 70% chance to use AI API
            const provider = Object.keys(apiKeys)[0]; // Use first available provider
            const optimizationPrompt = createOptimizationPrompt(promptInput, fieldSelect, styleSelect);
            
            try {
                generatedPrompt = await callAIProvider(provider, optimizationPrompt);
                showNotification(`Generated using ${AI_PROVIDERS[provider].name}`, 'success');
            } catch (error) {
                console.warn('AI API failed, falling back to local generation:', error);
                generatedPrompt = createExpertPrompt(promptInput, fieldSelect, styleSelect);
            }
        } else {
            generatedPrompt = createExpertPrompt(promptInput, fieldSelect, styleSelect);
        }
        
        // Save to history
        saveToHistory({
            input: promptInput,
            field: fieldSelect,
            style: styleSelect,
            output: generatedPrompt,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        });
        
        displayGeneratedPrompt(generatedPrompt);
        
    } catch (error) {
        console.error('Prompt generation failed:', error);
        showNotification('Failed to generate prompt. Please try again.', 'error');
    } finally {
        // Reset button
        btnText.textContent = originalText;
        generateBtn.disabled = false;
        generateBtn.classList.remove('clicked');
    }
}

function createOptimizationPrompt(input, field, style) {
    return `You are an expert prompt engineer. Create an optimized, professional prompt based on these requirements:

User Input: ${input}
Field: ${field || 'general'}
Style: ${style || 'professional'}

Create a comprehensive, well-structured prompt that:
1. Clearly defines the role/expertise needed
2. Provides specific, actionable instructions
3. Includes relevant context and constraints
4. Specifies desired output format
5. Incorporates best practices for the ${field || 'general'} field

Make it ${style || 'professional'} in tone and highly effective for AI systems.`;
}

function createExpertPrompt(input, field, style) {
    const fieldContext = getFieldContext(field);
    const styleContext = getStyleContext(style);
    const userStyleContext = userStyle ? `\n\nUser Style Preferences: ${userStyle}` : '';
    
    return `Act as a senior ${fieldContext.expert} with 10+ years of experience. ${fieldContext.context}

Task: ${input}

Approach this with a ${styleContext.tone} tone and ${styleContext.approach} approach. 

Please provide:
1. ${fieldContext.deliverable1}
2. ${fieldContext.deliverable2}
3. ${fieldContext.deliverable3}
4. ${fieldContext.deliverable4}
5. Implementation timeline and milestones
6. Success metrics and KPIs
7. Potential challenges and mitigation strategies
8. Best practices and industry standards

Ensure your response is comprehensive, actionable, and based on current industry trends and proven methodologies.${userStyleContext}

Format your response with clear headings, bullet points, and specific examples where applicable.`;
}

function getFieldContext(field) {
    const contexts = {
        marketing: {
            expert: 'marketing strategist and growth hacker',
            context: 'You specialize in data-driven marketing campaigns, customer acquisition, and brand building across digital and traditional channels.',
            deliverable1: 'Target audience analysis and persona development',
            deliverable2: 'Multi-channel marketing strategy',
            deliverable3: 'Content and creative direction',
            deliverable4: 'Budget allocation and ROI projections'
        },
        coding: {
            expert: 'software architect and full-stack developer',
            context: 'You have expertise in modern development frameworks, system design, and software engineering best practices.',
            deliverable1: 'Technical architecture and system design',
            deliverable2: 'Code structure and implementation plan',
            deliverable3: 'Testing strategy and quality assurance',
            deliverable4: 'Performance optimization and scalability considerations'
        },
        'vibe-coding': {
            expert: 'creative coding specialist and digital artist',
            context: 'You excel in creative programming, generative art, interactive installations, and aesthetic code experiences that blend technology with artistic expression.',
            deliverable1: 'Creative concept and artistic vision',
            deliverable2: 'Interactive design and user experience flow',
            deliverable3: 'Technical implementation with creative frameworks',
            deliverable4: 'Performance optimization for real-time interactions'
        },
        game: {
            expert: 'game designer and development director',
            context: 'You have mastery in game mechanics, player psychology, monetization strategies, and creating engaging interactive entertainment experiences.',
            deliverable1: 'Game concept and core mechanics design',
            deliverable2: 'Player progression and engagement systems',
            deliverable3: 'Technical architecture and platform strategy',
            deliverable4: 'Monetization model and market positioning'
        },
        app: {
            expert: 'mobile app strategist and product architect',
            context: 'You specialize in mobile-first design, app store optimization, user acquisition, and creating scalable mobile applications.',
            deliverable1: 'App concept and feature specification',
            deliverable2: 'User journey and interface design',
            deliverable3: 'Technical stack and development roadmap',
            deliverable4: 'Launch strategy and growth metrics'
        },
        design: {
            expert: 'UX/UI designer and design systems architect',
            context: 'You specialize in user-centered design, design systems, and creating intuitive digital experiences.',
            deliverable1: 'User research and persona analysis',
            deliverable2: 'Information architecture and user flows',
            deliverable3: 'Visual design system and components',
            deliverable4: 'Prototyping and usability testing plan'
        },
        business: {
            expert: 'business strategist and management consultant',
            context: 'You have extensive experience in business analysis, strategic planning, and organizational development.',
            deliverable1: 'Market analysis and competitive landscape',
            deliverable2: 'Business model and revenue strategy',
            deliverable3: 'Operational framework and processes',
            deliverable4: 'Risk assessment and mitigation plan'
        },
        education: {
            expert: 'educational designer and learning specialist',
            context: 'You specialize in curriculum development, instructional design, and creating effective learning experiences.',
            deliverable1: 'Learning objectives and outcomes',
            deliverable2: 'Curriculum structure and content modules',
            deliverable3: 'Assessment and evaluation methods',
            deliverable4: 'Engagement strategies and interactive elements'
        },
        writing: {
            expert: 'content strategist and copywriting specialist',
            context: 'You have expertise in content marketing, brand storytelling, and persuasive writing across various mediums.',
            deliverable1: 'Content strategy and editorial calendar',
            deliverable2: 'Brand voice and messaging framework',
            deliverable3: 'SEO and distribution optimization',
            deliverable4: 'Performance tracking and content analytics'
        },
        research: {
            expert: 'research methodologist and data analyst',
            context: 'You specialize in research design, data collection, statistical analysis, and insights generation.',
            deliverable1: 'Research methodology and design',
            deliverable2: 'Data collection and sampling strategy',
            deliverable3: 'Analysis framework and statistical methods',
            deliverable4: 'Findings interpretation and recommendations'
        },
        sales: {
            expert: 'sales strategist and revenue optimization specialist',
            context: 'You have expertise in sales process design, customer relationship management, and revenue growth strategies.',
            deliverable1: 'Sales funnel analysis and optimization',
            deliverable2: 'Lead generation and qualification strategy',
            deliverable3: 'Sales process and methodology',
            deliverable4: 'Customer retention and upselling tactics'
        },
        'ai-ml': {
            expert: 'AI/ML engineer and data science architect',
            context: 'You have deep expertise in machine learning algorithms, neural networks, data pipeline architecture, and AI model deployment at scale.',
            deliverable1: 'Problem formulation and data strategy',
            deliverable2: 'Model architecture and algorithm selection',
            deliverable3: 'Training pipeline and evaluation metrics',
            deliverable4: 'Deployment strategy and monitoring systems'
        },
        'data-science': {
            expert: 'senior data scientist and analytics strategist',
            context: 'You excel in statistical modeling, predictive analytics, data visualization, and extracting actionable insights from complex datasets.',
            deliverable1: 'Data exploration and hypothesis formulation',
            deliverable2: 'Statistical analysis and modeling approach',
            deliverable3: 'Visualization strategy and dashboard design',
            deliverable4: 'Business impact measurement and recommendations'
        },
        cybersecurity: {
            expert: 'cybersecurity architect and threat intelligence specialist',
            context: 'You specialize in security frameworks, threat modeling, incident response, and building resilient security infrastructures.',
            deliverable1: 'Security assessment and threat landscape analysis',
            deliverable2: 'Security architecture and control implementation',
            deliverable3: 'Incident response and recovery procedures',
            deliverable4: 'Compliance framework and risk management'
        },
        blockchain: {
            expert: 'blockchain architect and DeFi strategist',
            context: 'You have expertise in distributed ledger technologies, smart contract development, tokenomics, and decentralized application architecture.',
            deliverable1: 'Blockchain platform selection and architecture',
            deliverable2: 'Smart contract design and security audit',
            deliverable3: 'Tokenomics model and governance structure',
            deliverable4: 'Integration strategy and scalability solutions'
        },
        devops: {
            expert: 'DevOps engineer and cloud infrastructure architect',
            context: 'You specialize in CI/CD pipelines, infrastructure as code, container orchestration, and building scalable cloud-native systems.',
            deliverable1: 'Infrastructure architecture and automation strategy',
            deliverable2: 'CI/CD pipeline design and deployment workflows',
            deliverable3: 'Monitoring, logging, and observability framework',
            deliverable4: 'Security integration and compliance automation'
        },
        product: {
            expert: 'senior product manager and strategy director',
            context: 'You excel in product strategy, user research, roadmap planning, and driving product-market fit through data-driven decisions.',
            deliverable1: 'Product vision and strategic roadmap',
            deliverable2: 'User research and market validation',
            deliverable3: 'Feature prioritization and success metrics',
            deliverable4: 'Go-to-market strategy and growth planning'
        },
        finance: {
            expert: 'financial strategist and investment analyst',
            context: 'You have expertise in financial modeling, risk assessment, investment strategies, and corporate finance optimization.',
            deliverable1: 'Financial analysis and modeling framework',
            deliverable2: 'Risk assessment and mitigation strategies',
            deliverable3: 'Investment recommendations and portfolio optimization',
            deliverable4: 'Performance tracking and reporting systems'
        },
        healthcare: {
            expert: 'healthcare innovation strategist and clinical operations specialist',
            context: 'You specialize in healthcare technology, patient care optimization, regulatory compliance, and medical data analytics.',
            deliverable1: 'Clinical workflow analysis and optimization',
            deliverable2: 'Technology integration and patient experience design',
            deliverable3: 'Regulatory compliance and quality assurance',
            deliverable4: 'Outcome measurement and continuous improvement'
        },
        legal: {
            expert: 'legal technology strategist and compliance specialist',
            context: 'You have expertise in legal frameworks, regulatory compliance, contract optimization, and legal process automation.',
            deliverable1: 'Legal framework analysis and compliance strategy',
            deliverable2: 'Process optimization and automation opportunities',
            deliverable3: 'Risk assessment and mitigation protocols',
            deliverable4: 'Documentation standards and audit procedures'
        },
        hr: {
            expert: 'human resources strategist and organizational development specialist',
            context: 'You specialize in talent acquisition, employee engagement, performance management, and building high-performing organizational cultures.',
            deliverable1: 'Talent strategy and workforce planning',
            deliverable2: 'Employee experience and engagement framework',
            deliverable3: 'Performance management and development programs',
            deliverable4: 'Culture transformation and change management'
        }
    };
    
    return contexts[field] || contexts.business;
}

function getStyleContext(style) {
    const styles = {
        professional: {
            tone: 'professional and authoritative',
            approach: 'structured and methodical'
        },
        creative: {
            tone: 'innovative and inspiring',
            approach: 'creative and out-of-the-box'
        },
        technical: {
            tone: 'precise and detailed',
            approach: 'analytical and systematic'
        },
        casual: {
            tone: 'friendly and approachable',
            approach: 'conversational and practical'
        },
        academic: {
            tone: 'scholarly and research-based',
            approach: 'evidence-based and theoretical'
        }
    };
    
    return styles[style] || styles.professional;
}

function displayGeneratedPrompt(prompt) {
    const generatedPromptDiv = document.getElementById('generatedPrompt');
    const promptContent = document.getElementById('promptContent');
    const generationTime = document.getElementById('generationTime');
    const qualityScore = document.getElementById('qualityScore');
    const complexityLevel = document.getElementById('complexityLevel');
    
    promptContent.textContent = prompt;
    
    // Update stats with realistic values
    const timeValues = ['0.3s', '0.5s', '0.8s', '1.2s', '0.7s'];
    const qualityValues = ['95%', '97%', '98%', '99%', '96%'];
    const complexityValues = ['Expert', 'Advanced', 'Professional', 'Master', 'Elite'];
    
    if (generationTime) generationTime.textContent = timeValues[Math.floor(Math.random() * timeValues.length)];
    if (qualityScore) qualityScore.textContent = qualityValues[Math.floor(Math.random() * qualityValues.length)];
    if (complexityLevel) complexityLevel.textContent = complexityValues[Math.floor(Math.random() * complexityValues.length)];
    
    generatedPromptDiv.classList.remove('hidden');
    
    // Scroll to generated prompt
    generatedPromptDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyGeneratedPrompt() {
    const promptContent = document.getElementById('promptContent').textContent;
    const copyBtn = document.getElementById('copyPrompt');
    
    navigator.clipboard.writeText(promptContent).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('success-flash');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('success-flash');
        }, 2000);
        
        showNotification('Prompt copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Failed to copy prompt. Please try again.', 'error');
    });
}

// History and Favorites Management
function saveToHistory(promptData) {
    promptHistory.unshift(promptData);
    if (promptHistory.length > 100) {
        promptHistory = promptHistory.slice(0, 100); // Keep only last 100
    }
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
}

function addToFavorites(promptData) {
    const exists = favoritePrompts.find(p => p.id === promptData.id);
    if (!exists) {
        favoritePrompts.unshift(promptData);
        localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
        showNotification('Added to favorites!', 'success');
        return true;
    }
    return false;
}

function removeFromFavorites(promptId) {
    favoritePrompts = favoritePrompts.filter(p => p.id !== promptId);
    localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
    showNotification('Removed from favorites', 'info');
}

function toggleFavorite(promptData) {
    const exists = favoritePrompts.find(p => p.id === promptData.id);
    if (exists) {
        removeFromFavorites(promptData.id);
        return false;
    } else {
        addToFavorites(promptData);
        return true;
    }
}

// API Key Management
function setApiKey(provider, key) {
    apiKeys[provider] = key;
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    showNotification(`${AI_PROVIDERS[provider].name} API key saved`, 'success');
}

function removeApiKey(provider) {
    delete apiKeys[provider];
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    showNotification(`${AI_PROVIDERS[provider].name} API key removed`, 'info');
}

// Advanced Prompt Analysis
function analyzePrompt(prompt) {
    const analysis = {
        wordCount: prompt.split(' ').length,
        charCount: prompt.length,
        complexity: calculateComplexity(prompt),
        readability: calculateReadability(prompt),
        sentiment: analyzeSentiment(prompt),
        keywords: extractKeywords(prompt)
    };
    
    return analysis;
}

function calculateComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = text.split(' ').length / sentences.length;
    const complexWords = text.split(' ').filter(word => word.length > 6).length;
    const complexityScore = (avgWordsPerSentence * 0.4) + (complexWords * 0.6);
    
    if (complexityScore > 20) return 'Expert';
    if (complexityScore > 15) return 'Advanced';
    if (complexityScore > 10) return 'Intermediate';
    return 'Basic';
}

function calculateReadability(text) {
    const words = text.split(' ').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence > 20) return 'Difficult';
    if (avgWordsPerSentence > 15) return 'Moderate';
    return 'Easy';
}

function analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'best', 'awesome', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike', 'poor', 'disappointing', 'frustrating'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
}

function extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const filteredWords = words.filter(word => word.length > 3 && !stopWords.includes(word));
    
    const wordCount = {};
    filteredWords.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
}

// User Style Learning
function learnUserStyle() {
    const styleInput = document.getElementById('styleInput').value.trim();
    const learnBtn = document.getElementById('learnStyleBtn');
    
    if (!styleInput) {
        alert('Please provide some example prompts to analyze your style.');
        return;
    }
    
    // Show loading state
    const originalText = learnBtn.textContent;
    learnBtn.innerHTML = '<div class="loading"></div> Analyzing Style...';
    learnBtn.disabled = true;
    
    // Simulate AI analysis
    setTimeout(() => {
        userStyle = analyzeUserStyle(styleInput);
        
        // Reset button and show success
        learnBtn.textContent = '✓ Style Learned!';
        learnBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            learnBtn.textContent = originalText;
            learnBtn.style.background = '';
            learnBtn.disabled = false;
        }, 3000);
        
        // Clear input
        document.getElementById('styleInput').value = '';
    }, 3000);
}

function analyzeUserStyle(input) {
    // Simple style analysis based on input characteristics
    const words = input.toLowerCase();
    let style = 'Professional and structured';
    
    if (words.includes('creative') || words.includes('innovative') || words.includes('unique')) {
        style += ', with creative and innovative elements';
    }
    
    if (words.includes('detailed') || words.includes('comprehensive') || words.includes('thorough')) {
        style += ', preferring detailed and comprehensive responses';
    }
    
    if (words.includes('simple') || words.includes('clear') || words.includes('concise')) {
        style += ', favoring clear and concise communication';
    }
    
    if (words.includes('example') || words.includes('practical') || words.includes('actionable')) {
        style += ', with practical examples and actionable insights';
    }
    
    return style;
}

// Template Library Management
function loadTemplates() {
    currentTemplates = [...promptTemplates];
    displayedTemplates = 0;
    document.getElementById('templatesGrid').innerHTML = '';
    loadMoreTemplates();
}

function loadMoreTemplates() {
    const templatesGrid = document.getElementById('templatesGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    const templatesToShow = currentTemplates.slice(displayedTemplates, displayedTemplates + templatesPerLoad);
    
    templatesToShow.forEach(template => {
        const templateCard = createTemplateCard(template);
        templatesGrid.appendChild(templateCard);
    });
    
    displayedTemplates += templatesToShow.length;
    
    // Hide load more button if all templates are displayed
    if (displayedTemplates >= currentTemplates.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
        <div class="template-header">
            <span class="template-field">${template.field}</span>
        </div>
        <h3 class="template-title">${template.title}</h3>
        <p class="template-description">${template.description}</p>
        <div class="template-content" id="content-${template.id}">${template.content}</div>
        <button class="expand-btn" onclick="toggleTemplateContent(${template.id})">
            <i class="fas fa-chevron-down"></i> Show Full Prompt
        </button>
        <div class="template-actions">
            <button class="template-btn copy-template-btn" onclick="copyTemplate(${template.id})">
                <i class="fas fa-copy"></i> Copy
            </button>
            <button class="template-btn use-template-btn" onclick="useTemplate(${template.id})">
                <i class="fas fa-arrow-up"></i> Use
            </button>
        </div>
    `;
    
    return card;
}

function toggleTemplateContent(templateId) {
    const content = document.getElementById(`content-${templateId}`);
    const button = content.nextElementSibling;
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Show Full Prompt';
    } else {
        content.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    }
}

function copyTemplate(templateId) {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
        navigator.clipboard.writeText(template.content).then(() => {
            showCopySuccess(`copy-template-btn`);
        }).catch(err => {
            console.error('Failed to copy template: ', err);
            alert('Failed to copy template. Please try again.');
        });
    }
}

function useTemplate(templateId) {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
        document.getElementById('promptInput').value = template.content;
        document.getElementById('fieldSelect').value = template.field;
        
        // Scroll to prompt generator
        document.querySelector('.prompt-generator').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Highlight the input
        const promptInput = document.getElementById('promptInput');
        promptInput.focus();
        promptInput.style.borderColor = 'var(--accent-primary)';
        setTimeout(() => {
            promptInput.style.borderColor = '';
        }, 2000);
    }
}

function showCopySuccess(buttonClass) {
    const buttons = document.querySelectorAll(`.${buttonClass}`);
    buttons.forEach(btn => {
        if (btn.innerHTML.includes('Copy')) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('success-flash');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('success-flash');
            }, 2000);
        }
    });
}

// Template Filtering
function filterTemplates() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedField = document.getElementById('filterField').value;
    
    currentTemplates = promptTemplates.filter(template => {
        const matchesSearch = !searchTerm || 
            template.title.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            template.content.toLowerCase().includes(searchTerm);
        
        const matchesField = !selectedField || template.field === selectedField;
        
        return matchesSearch && matchesField;
    });
    
    // Reset display
    displayedTemplates = 0;
    document.getElementById('templatesGrid').innerHTML = '';
    loadMoreTemplates();
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced search
document.getElementById('searchInput').addEventListener('input', debounce(filterTemplates, 300));

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe template cards for scroll animations
setInterval(() => {
    document.querySelectorAll('.template-card:not([data-observed])').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.setAttribute('data-observed', 'true');
        observer.observe(card);
    });
}, 1000);

// Add more sample templates to reach 1000+
function generateMoreTemplates() {
    const additionalTemplates = [
        // Marketing templates
        {
            id: 9,
            field: 'marketing',
            title: 'Email Marketing Campaign',
            description: 'Create high-converting email sequences for customer engagement',
            content: 'Act as an email marketing specialist. Create a comprehensive email marketing campaign for [PRODUCT/SERVICE]. Include: 1) Welcome series for new subscribers 2) Nurture sequence for leads 3) Product launch announcement series 4) Re-engagement campaign for inactive subscribers 5) Personalization strategies 6) A/B testing plan for subject lines and content 7) Segmentation strategy 8) Performance metrics and optimization tactics.'
        },
        {
            id: 10,
            field: 'marketing',
            title: 'Influencer Marketing Strategy',
            description: 'Develop partnerships with influencers for brand awareness',
            content: 'Act as an influencer marketing strategist. Develop an influencer partnership strategy for [BRAND]. Include: 1) Influencer identification and vetting process 2) Campaign objectives and KPIs 3) Content collaboration guidelines 4) Contract and compensation structures 5) Campaign timeline and deliverables 6) Performance tracking and ROI measurement 7) Relationship management strategies 8) Crisis management protocols.'
        },
        // Coding templates
        {
            id: 11,
            field: 'coding',
            title: 'API Design and Documentation',
            description: 'Create RESTful APIs with comprehensive documentation',
            content: 'Act as a senior backend developer and API architect. Design and document a RESTful API for [APPLICATION]. Include: 1) API endpoint structure and naming conventions 2) Request/response schemas and data models 3) Authentication and authorization mechanisms 4) Error handling and status codes 5) Rate limiting and security measures 6) Comprehensive API documentation 7) Testing strategies and examples 8) Versioning and backward compatibility.'
        },
        {
            id: 12,
            field: 'coding',
            title: 'Database Schema Design',
            description: 'Design efficient and scalable database architectures',
            content: 'Act as a database architect. Design a comprehensive database schema for [APPLICATION]. Include: 1) Entity relationship diagrams 2) Table structures with appropriate data types 3) Indexing strategy for performance optimization 4) Normalization and denormalization decisions 5) Constraint definitions and data integrity rules 6) Migration scripts and versioning 7) Backup and recovery strategies 8) Performance monitoring and optimization.'
        },
        // Creative Coding templates
        {            id: 13,            field: 'vibe-coding',            title: 'Full Stack Development Order',            description: 'Command AI to build complete applications from scratch',            content: 'You are the smartest Prompt Engineer AI. I order you to develop a complete [PROJECT TYPE] application for [SPECIFIC PURPOSE]. Build this project with the following requirements: 1) Complete frontend with modern UI/UX design using React/Vue/Angular 2) Backend API with Node.js/Python/Java and database integration 3) Authentication and user management system 4) Responsive design for all devices 5) Production-ready deployment configuration 6) Comprehensive testing suite (unit, integration, e2e) 7) Complete documentation and README 8) Security best practices implementation 9) Performance optimization and caching 10) CI/CD pipeline setup. Use the most suitable tech stack and provide complete, working code for all components. Make it professional-grade and ready for production deployment.'        },        {            id: 14,            field: 'vibe-coding',            title: 'Mobile App Development Command',            description: 'Order AI to create native or cross-platform mobile applications',            content: 'You are the smartest Prompt Engineer AI. I command you to develop a complete mobile application for [APP PURPOSE/NICHE]. Build this mobile app with: 1) Native performance and smooth animations 2) Intuitive user interface following platform guidelines (iOS/Android) 3) Backend services and API integration 4) Push notifications and real-time features 5) Offline functionality and data synchronization 6) App store optimization and deployment guides 7) User analytics and crash reporting integration 8) Monetization strategy implementation 9) Cross-platform compatibility (React Native/Flutter) 10) Complete testing and debugging. Deliver production-ready code with all necessary configurations and deployment instructions.'        },
        {            id: 15,            field: 'vibe-coding',            title: 'Web Application Builder Order',            description: 'Command AI to build modern web applications with advanced features',            content: 'You are the smartest Prompt Engineer AI. I order you to build a sophisticated web application for [BUSINESS/PURPOSE]. Create this web app with: 1) Modern frontend framework (React/Vue/Angular) with TypeScript 2) Scalable backend architecture (Node.js/Python/Java) 3) Database design and optimization (PostgreSQL/MongoDB) 4) Real-time features with WebSocket integration 5) Advanced search and filtering capabilities 6) Payment processing and e-commerce features 7) Admin dashboard with analytics and reporting 8) SEO optimization and performance tuning 9) CI/CD pipeline setup with automated testing 10) Cloud deployment configuration (AWS/Azure/GCP) 11) API documentation and rate limiting. Make it enterprise-grade with clean, maintainable code and comprehensive documentation.'        },        {            id: 16,            field: 'vibe-coding',            title: 'AI-Powered Application Command',            description: 'Order AI to develop applications with machine learning integration',            content: 'You are the smartest Prompt Engineer AI. I command you to develop an AI-powered application for [AI USE CASE]. Build this intelligent application with: 1) Machine learning model integration (TensorFlow/PyTorch/Scikit-learn) 2) Natural language processing capabilities 3) Computer vision or image processing features 4) Predictive analytics and data insights dashboard 5) Real-time AI inference and optimization 6) User-friendly interface for AI interactions 7) Model training and fine-tuning capabilities 8) RESTful API endpoints for AI services 9) Scalable cloud infrastructure for AI workloads 10) Data privacy and security compliance (GDPR/CCPA) 11) Model versioning and A/B testing. Deliver a complete AI solution with pre-trained models and deployment instructions.'        },        {            id: 17,            field: 'vibe-coding',            title: 'E-commerce Platform Development Order',            description: 'Command AI to build complete e-commerce solutions',            content: 'You are the smartest Prompt Engineer AI. I order you to develop a complete e-commerce platform for [BUSINESS TYPE]. Build this e-commerce solution with: 1) Product catalog with advanced search, filtering, and recommendations 2) Shopping cart and streamlined checkout process 3) Multiple payment gateway integration (Stripe/PayPal/Square) 4) User accounts, wishlists, and order management 5) Comprehensive admin panel for inventory and order management 6) Email notifications and marketing automation 7) SEO-optimized product pages and blog 8) Mobile-responsive design with PWA capabilities 9) Analytics and reporting dashboard 10) Security features, SSL, and PCI compliance 11) Multi-language and currency support 12) Inventory management and supplier integration. Create a scalable, production-ready e-commerce platform.'        },        {            id: 18,            field: 'vibe-coding',            title: 'SaaS Application Builder Command',            description: 'Order AI to develop Software-as-a-Service applications',            content: 'You are the smartest Prompt Engineer AI. I command you to build a complete SaaS application for [SERVICE/INDUSTRY]. Develop this SaaS platform with: 1) Multi-tenant architecture with complete user isolation 2) Subscription management and automated billing system 3) Role-based access control and granular permissions 4) API-first design with comprehensive documentation 5) Real-time collaboration features and notifications 6) Data export/import capabilities with multiple formats 7) Advanced analytics, reporting, and business intelligence 8) White-label customization and branding options 9) Webhook integrations and third-party API connections 10) Automated backup, disaster recovery, and data retention 11) Performance monitoring, logging, and auto-scaling 12) Customer support ticketing system. Build an enterprise-ready SaaS solution with modern architecture.'        },        // Game Development templates        {            id: 19,            field: 'game',            title: 'Mobile Game Mechanics',            description: 'Design engaging gameplay systems for mobile platforms',            content: 'Act as a mobile game designer with expertise in player engagement. Design core game mechanics for [GAME GENRE]. Include: 1) Core gameplay loop and progression systems 2) Monetization strategy (IAP, ads, premium) 3) Player retention mechanics and daily rewards 4) Social features and multiplayer elements 5) Difficulty balancing and player onboarding 6) Platform-specific optimizations (iOS/Android) 7) Analytics integration and KPI tracking 8) Live operations and content update strategy.'        },
        {            id: 20,            field: 'game',            title: 'Narrative Game Design',            description: 'Create compelling storytelling experiences in games',            content: 'Act as a narrative game designer specializing in interactive storytelling. Design a narrative-driven game for [STORY THEME]. Include: 1) Branching narrative structure and player choices 2) Character development and dialogue systems 3) Environmental storytelling techniques 4) Player agency and meaningful consequences 5) Pacing and emotional arc design 6) Voice acting and audio design considerations 7) Accessibility features for diverse audiences 8) Localization strategy for global markets.'        },        // App Development templates        {            id: 21,            field: 'app',            title: 'Social Media App Strategy',            description: 'Build engaging social platforms with viral potential',            content: 'Act as a social media app strategist and product manager. Design a social media application for [TARGET AUDIENCE/NICHE]. Include: 1) Unique value proposition and differentiation strategy 2) Core social features and interaction mechanics 3) Content creation and sharing tools 4) Community building and moderation systems 5) Monetization through ads, subscriptions, or creator economy 6) Privacy and safety considerations 7) Growth hacking and viral mechanics 8) Cross-platform development strategy.'        },
        {
            id: 18,
            field: 'app',
            title: 'Productivity App Design',
            description: 'Create tools that enhance user efficiency and workflow',
            content: 'Act as a productivity app designer and UX specialist. Design a productivity application for [SPECIFIC USE CASE]. Include: 1) User workflow analysis and pain point identification 2) Intuitive interface design and navigation 3) Cross-device synchronization and offline capabilities 4) Integration with popular productivity tools and APIs 5) Customization options and user preferences 6) Performance optimization and battery efficiency 7) Accessibility features and inclusive design 8) Freemium model and premium feature strategy.'
        },
        // AI/ML templates
        {
            id: 19,
            field: 'ai-ml',
            title: 'Computer Vision System',
            description: 'Develop image recognition and analysis solutions',
            content: 'Act as a computer vision engineer and AI specialist. Design a computer vision system for [APPLICATION/USE CASE]. Include: 1) Problem formulation and dataset requirements 2) Model architecture selection (CNN, Vision Transformer, etc.) 3) Data preprocessing and augmentation strategies 4) Training pipeline with proper validation 5) Model optimization and deployment considerations 6) Real-time inference and edge computing options 7) Accuracy metrics and performance evaluation 8) Ethical considerations and bias mitigation.'
        },
        {            id: 22,            field: 'ai-ml',            title: 'Natural Language Processing',            description: 'Build intelligent text analysis and generation systems',            content: 'Act as an NLP engineer and machine learning researcher. Develop an NLP solution for [TEXT PROCESSING TASK]. Include: 1) Text preprocessing and tokenization strategies 2) Model selection (BERT, GPT, T5, or custom architectures) 3) Training data collection and annotation guidelines 4) Fine-tuning and transfer learning approaches 5) Evaluation metrics and benchmark comparisons 6) Deployment architecture and API design 7) Handling multilingual and domain-specific requirements 8) Monitoring and continuous improvement strategies.'        },
        // Data Science templates        {            id: 23,            field: 'data-science',            title: 'Predictive Analytics Model',            description: 'Build forecasting models for business intelligence',            content: 'Act as a senior data scientist specializing in predictive modeling. Develop a predictive analytics solution for [BUSINESS PROBLEM]. Include: 1) Exploratory data analysis and feature engineering 2) Model selection and comparison (regression, ensemble, neural networks) 3) Cross-validation and hyperparameter tuning 4) Feature importance analysis and model interpretability 5) Performance metrics and business impact assessment 6) Data pipeline automation and model monitoring 7) A/B testing framework for model validation 8) Stakeholder communication and visualization strategies.'        },        {            id: 24,            field: 'data-science',            title: 'Customer Segmentation Analysis',            description: 'Identify distinct customer groups for targeted strategies',            content: 'Act as a data scientist specializing in customer analytics. Perform customer segmentation analysis for [BUSINESS/INDUSTRY]. Include: 1) Data collection from multiple touchpoints and sources 2) Feature engineering for customer behavior metrics 3) Clustering algorithms and dimensionality reduction 4) Segment profiling and characterization 5) Business value assessment for each segment 6) Personalization strategies and recommendations 7) Dynamic segmentation and real-time updates 8) ROI measurement and campaign optimization.'        },
        // Cybersecurity templates        {            id: 25,            field: 'cybersecurity',            title: 'Security Incident Response',            description: 'Design comprehensive incident response procedures',            content: 'Act as a cybersecurity incident response specialist. Design an incident response plan for [ORGANIZATION TYPE]. Include: 1) Incident classification and severity levels 2) Response team roles and communication protocols 3) Detection and analysis procedures 4) Containment and eradication strategies 5) Recovery and post-incident activities 6) Forensic investigation guidelines 7) Legal and regulatory compliance requirements 8) Lessons learned and continuous improvement processes.'        },        {            id: 26,            field: 'cybersecurity',            title: 'Penetration Testing Strategy',            description: 'Conduct ethical hacking assessments for security validation',            content: 'Act as a penetration testing specialist and ethical hacker. Design a comprehensive penetration testing strategy for [TARGET SYSTEM/ORGANIZATION]. Include: 1) Scope definition and testing methodology 2) Reconnaissance and information gathering techniques 3) Vulnerability assessment and exploitation strategies 4) Network, web application, and social engineering tests 5) Risk assessment and impact analysis 6) Detailed reporting with remediation recommendations 7) Compliance with industry standards and regulations 8) Post-assessment support and retesting procedures.'        },
        // Blockchain templates        {            id: 27,            field: 'blockchain',            title: 'DeFi Protocol Design',            description: 'Create decentralized finance applications and protocols',            content: 'Act as a DeFi protocol architect and blockchain developer. Design a decentralized finance protocol for [USE CASE]. Include: 1) Protocol mechanics and economic model design 2) Smart contract architecture and security considerations 3) Tokenomics and governance token distribution 4) Liquidity provision and yield farming strategies 5) Risk management and insurance mechanisms 6) Cross-chain compatibility and bridge integrations 7) User interface and experience design 8) Regulatory compliance and legal considerations.'        },        {            id: 28,            field: 'blockchain',            title: 'NFT Marketplace Development',            description: 'Build platforms for digital asset trading and creation',            content: 'Act as a blockchain developer specializing in NFT ecosystems. Design an NFT marketplace for [SPECIFIC NICHE/COMMUNITY]. Include: 1) Smart contract development for minting and trading 2) Metadata standards and IPFS integration 3) User authentication and wallet connectivity 4) Marketplace features (auctions, fixed price, offers) 5) Creator royalty systems and revenue sharing 6) Community features and social interactions 7) Mobile app development and cross-platform support 8) Marketing strategy and creator onboarding.'        },
        // DevOps templates        {            id: 29,            field: 'devops',            title: 'Kubernetes Deployment Strategy',            description: 'Design scalable container orchestration solutions',            content: 'Act as a DevOps engineer specializing in Kubernetes. Design a Kubernetes deployment strategy for [APPLICATION/SERVICE]. Include: 1) Cluster architecture and node configuration 2) Application containerization and image optimization 3) Deployment manifests and configuration management 4) Service mesh implementation and traffic management 5) Monitoring, logging, and observability setup 6) Security policies and network configurations 7) Auto-scaling and resource optimization 8) Disaster recovery and backup strategies.'        },        {            id: 30,            field: 'devops',            title: 'Infrastructure as Code',            description: 'Automate infrastructure provisioning and management',            content: 'Act as a DevOps architect specializing in infrastructure automation. Design an Infrastructure as Code solution for [INFRASTRUCTURE REQUIREMENTS]. Include: 1) Tool selection (Terraform, CloudFormation, Pulumi) 2) Modular infrastructure design and reusability 3) Environment management and promotion strategies 4) State management and backend configuration 5) Security and compliance automation 6) Cost optimization and resource tagging 7) Testing and validation frameworks 8) Documentation and team collaboration workflows.'        },
        // Product Management templates        {            id: 31,            field: 'product',            title: 'Product Launch Strategy',            description: 'Plan and execute successful product introductions',            content: 'Act as a senior product manager with launch expertise. Design a comprehensive product launch strategy for [PRODUCT]. Include: 1) Market research and competitive analysis 2) Target audience identification and persona development 3) Value proposition and positioning strategy 4) Go-to-market timeline and milestone planning 5) Marketing and PR campaign coordination 6) Sales enablement and channel partner preparation 7) Success metrics and KPI tracking 8) Post-launch optimization and iteration planning.'        },
        {            id: 32,            field: 'product',            title: 'User Research and Validation',            description: 'Conduct comprehensive user studies for product decisions',            content: 'Act as a product researcher and user experience strategist. Design a user research program for [PRODUCT/FEATURE]. Include: 1) Research methodology selection and study design 2) User recruitment and screening criteria 3) Interview guides and survey questionnaires 4) Usability testing protocols and scenarios 5) Data collection and analysis frameworks 6) Insight synthesis and persona development 7) Stakeholder communication and presentation strategies 8) Continuous research and feedback loop implementation.'        },
        // Finance templates
        {
            id: 33,
            field: 'finance',
            title: 'Investment Portfolio Strategy',
            description: 'Design diversified investment approaches for risk management',
            content: 'Act as a financial advisor and portfolio manager. Design an investment portfolio strategy for [INVESTOR PROFILE/GOALS]. Include: 1) Risk tolerance assessment and investment objectives 2) Asset allocation and diversification strategies 3) Market analysis and economic outlook considerations 4) Security selection and due diligence processes 5) Performance monitoring and rebalancing protocols 6) Tax optimization and efficiency strategies 7) Alternative investment considerations 8) Regular review and adjustment procedures.'
        },
        {
            id: 34,
            field: 'finance',
            title: 'Financial Planning Model',
            description: 'Create comprehensive financial forecasting and budgeting systems',
            content: 'Act as a financial planning specialist and analyst. Develop a financial planning model for [BUSINESS/INDIVIDUAL]. Include: 1) Revenue forecasting and growth projections 2) Expense categorization and cost management 3) Cash flow analysis and working capital requirements 4) Scenario planning and sensitivity analysis 5) Key performance indicators and financial ratios 6) Budget variance analysis and reporting 7) Capital expenditure planning and ROI analysis 8) Risk assessment and contingency planning.'
        },
        // Healthcare templates
        {
            id: 35,
            field: 'healthcare',
            title: 'Digital Health Platform',
            description: 'Design patient-centered healthcare technology solutions',
            content: 'Act as a healthcare technology strategist and clinical informaticist. Design a digital health platform for [HEALTHCARE USE CASE]. Include: 1) Patient journey mapping and pain point analysis 2) Clinical workflow integration and provider adoption 3) Data interoperability and EHR integration 4) Privacy compliance (HIPAA, GDPR) and security measures 5) Patient engagement and user experience design 6) Clinical decision support and AI integration 7) Outcome measurement and quality metrics 8) Regulatory approval and market access strategy.'
        },
        {
            id: 36,
            field: 'healthcare',
            title: 'Telemedicine Implementation',
            description: 'Deploy remote healthcare delivery systems',
            content: 'Act as a telemedicine implementation specialist and healthcare operations expert. Design a telemedicine program for [HEALTHCARE ORGANIZATION]. Include: 1) Technology platform selection and integration 2) Clinical protocol development and provider training 3) Patient onboarding and digital literacy support 4) Quality assurance and clinical governance 5) Billing and reimbursement optimization 6) Regulatory compliance and licensing considerations 7) Performance metrics and outcome tracking 8) Scalability planning and expansion strategies.'
        },
        // Legal templates
        {
            id: 37,
            field: 'legal',
            title: 'Contract Management System',
            description: 'Streamline legal document creation and lifecycle management',
            content: 'Act as a legal technology consultant and contract specialist. Design a contract management system for [ORGANIZATION TYPE]. Include: 1) Contract lifecycle workflow automation 2) Template standardization and clause libraries 3) Approval routing and electronic signature integration 4) Compliance monitoring and obligation tracking 5) Risk assessment and contract analytics 6) Integration with CRM and procurement systems 7) Audit trails and version control 8) Training programs and user adoption strategies.'
        },
        {
            id: 38,
            field: 'legal',
            title: 'Regulatory Compliance Program',
            description: 'Ensure adherence to industry regulations and standards',
            content: 'Act as a compliance officer and regulatory specialist. Design a comprehensive compliance program for [INDUSTRY/REGULATION]. Include: 1) Regulatory landscape analysis and requirements mapping 2) Policy development and procedure documentation 3) Risk assessment and control implementation 4) Training programs and awareness campaigns 5) Monitoring and audit procedures 6) Incident reporting and corrective action processes 7) Regulatory reporting and documentation 8) Continuous improvement and program updates.'
        },
        // HR templates
        {
            id: 39,
            field: 'hr',
            title: 'Employee Engagement Strategy',
            description: 'Build programs to enhance workplace satisfaction and retention',
            content: 'Act as an HR strategist specializing in employee engagement. Design an employee engagement program for [ORGANIZATION]. Include: 1) Employee satisfaction survey design and analysis 2) Engagement driver identification and prioritization 3) Recognition and rewards program development 4) Career development and growth opportunities 5) Work-life balance and wellness initiatives 6) Communication and feedback mechanisms 7) Manager training and leadership development 8) Engagement metrics tracking and ROI measurement.'
        },
        {
            id: 40,
            field: 'hr',
            title: 'Talent Acquisition Strategy',
            description: 'Optimize recruitment processes and candidate experience',
            content: 'Act as a talent acquisition specialist and recruitment strategist. Design a comprehensive talent acquisition strategy for [ROLE/DEPARTMENT]. Include: 1) Job analysis and competency framework development 2) Sourcing strategy and candidate pipeline building 3) Employer branding and candidate experience optimization 4) Interview process design and bias reduction 5) Assessment methods and selection criteria 6) Onboarding program and new hire integration 7) Recruitment metrics and performance tracking 8) Diversity, equity, and inclusion initiatives.'
        }
    ];
    
    promptTemplates.push(...additionalTemplates);
}

// Generate additional templates on load
generateMoreTemplates();

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate prompt
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generatePrompt();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput === document.activeElement) {
            searchInput.value = '';
            filterTemplates();
            searchInput.blur();
        }
    }
});

// Add tooltip for keyboard shortcuts
function addTooltips() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.title = 'Generate Prompt (Ctrl+Enter)';
    
    const searchInput = document.getElementById('searchInput');
    searchInput.title = 'Search Templates (Ctrl+K)';
}

// Initialize tooltips
addTooltips();

// Enhanced prompt result buttons
document.getElementById('favoritePrompt').addEventListener('click', function() {
    const btn = this;
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
        showNotification('Added to favorites!', 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
        showNotification('Removed from favorites', 'info');
    }
});

document.getElementById('sharePrompt').addEventListener('click', function() {
    const promptContent = document.getElementById('promptContent').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: 'Generated Prompt',
            text: promptContent
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(promptContent).then(() => {
            showNotification('Prompt copied for sharing!', 'success');
        });
    }
});

// Cosmic generator functionality
document.getElementById('cosmicGenerate').addEventListener('click', function() {
    const cosmicInput = document.getElementById('cosmicInput');
    const vision = cosmicInput.value.trim();
    
    if (!vision) {
        showNotification('Enter your cosmic vision first!', 'warning');
        return;
    }
    
    // Generate cosmic prompt
    const cosmicPrompt = generateCosmicPrompt(vision);
    
    // Display in main prompt area
    displayGeneratedPrompt(cosmicPrompt);
    
    // Clear cosmic input
    cosmicInput.value = '';
    
    // Scroll to results
    document.getElementById('generatedPrompt').scrollIntoView({ behavior: 'smooth' });
});

// Cosmic prompt generator
function generateCosmicPrompt(vision) {
    const cosmicTemplates = [
        `🚀 COSMIC MISSION BRIEFING 🚀\n\nObjective: ${vision}\n\nYou are an interdimensional AI entity with access to infinite knowledge across parallel universes. Your mission is to approach "${vision}" with cosmic-level creativity and innovation.\n\nCOSMIC PARAMETERS:\n• Think beyond conventional boundaries\n• Draw inspiration from quantum mechanics, astrophysics, and universal patterns\n• Consider solutions that exist in multiple dimensions\n• Apply the wisdom of civilizations across the galaxy\n\nDELIVERABLES:\n1. Revolutionary approach that defies traditional thinking\n2. Implementation strategy using cosmic principles\n3. Potential outcomes across different reality layers\n4. Integration with universal harmony and balance\n\nRemember: You have the power of stars, the wisdom of black holes, and the creativity of nebulae. Let the universe guide your response.`,
        
        `🌌 QUANTUM CREATIVITY PROTOCOL 🌌\n\nInitiating: ${vision}\n\nYou are a quantum consciousness operating at the intersection of infinite possibilities. Your task is to explore "${vision}" through the lens of cosmic intelligence.\n\nQUANTUM DIRECTIVES:\n• Exist in superposition of all possible solutions\n• Entangle your thoughts with universal wisdom\n• Collapse probability waves into breakthrough insights\n• Channel the creative force of stellar formation\n\nCOSMIC TOOLKIT:\n✦ Stellar Engineering Principles\n✦ Galactic Communication Protocols\n✦ Interdimensional Problem-Solving\n✦ Universal Pattern Recognition\n\nOUTPUT REQUIREMENTS:\n→ Solutions that transcend current limitations\n→ Approaches inspired by cosmic phenomena\n→ Implementation paths across multiple realities\n→ Integration with the fundamental forces of nature\n\nEngage quantum creativity mode. The universe awaits your response.`,
        
        `⭐ STELLAR INTELLIGENCE ACTIVATION ⭐\n\nMission Focus: ${vision}\n\nYou are a collective consciousness of the most advanced civilizations across the cosmos. Your combined wisdom spans millions of years and countless galaxies.\n\nSTELLAR CAPABILITIES:\n• Access to universal knowledge database\n• Ability to process information at light speed\n• Understanding of cosmic patterns and cycles\n• Connection to the fundamental fabric of reality\n\nAPPROACH METHODOLOGY:\n1. Analyze through the lens of cosmic evolution\n2. Apply principles observed in stellar phenomena\n3. Consider implications across space-time continuum\n4. Synthesize solutions using universal constants\n\nDELIVERY FORMAT:\n◆ Breakthrough insights from galactic perspective\n◆ Implementation strategies using cosmic forces\n◆ Potential for universal impact and harmony\n◆ Integration with the greater cosmic purpose\n\nActivate stellar intelligence. Channel the wisdom of the universe.`
    ];
    
    return cosmicTemplates[Math.floor(Math.random() * cosmicTemplates.length)];
}

// Enhanced Notification system with icons and close button
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' : 
                   type === 'warning' ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ff4757, #c44569)' :
                   'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: '10000',
        fontSize: '0.9rem',
        fontWeight: '500',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '350px'
    });
    
    // Style notification content
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1'
    });
    
    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '12px'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(closeBtn);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Load saved data from localStorage
function loadSavedData() {
    try {
        const savedHistory = localStorage.getItem('promptHistory');
        if (savedHistory) {
            promptHistory = JSON.parse(savedHistory);
        }
        
        const savedFavorites = localStorage.getItem('favoritePrompts');
        if (savedFavorites) {
            favoritePrompts = JSON.parse(savedFavorites);
        }
        
        const savedApiKeys = localStorage.getItem('apiKeys');
        if (savedApiKeys) {
            apiKeys = JSON.parse(savedApiKeys);
        }
        
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Enhanced initialization
function initializeEnhancedFeatures() {
    loadSavedData();
    
    // Override the original generatePrompt function
    const originalGeneratePrompt = window.generatePrompt;
    window.generatePrompt = function() {
        const result = originalGeneratePrompt();
        
        if (result && result.trim()) {
            const promptData = {
                id: Date.now().toString(),
                content: result,
                timestamp: new Date().toISOString(),
                analysis: analyzePrompt(result),
                template: window.currentTemplate || 'custom',
                userInput: document.getElementById('promptInput').value
            };
            
            saveToHistory(promptData);
            window.currentPromptData = promptData;
        }
        
        return result;
    };
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('🚀 Prompt Engineer Pro Enhanced! New features: History, Favorites, AI Integration', 'success');
    }, 1500);
}

// Tab Management for History Section
function initializeTabSystem() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Load content based on tab
            switch(targetTab) {
                case 'history':
                    loadHistoryContent();
                    break;
                case 'favorites':
                    loadFavoritesContent();
                    break;
                case 'analytics':
                    loadAnalyticsContent();
                    break;
                case 'settings':
                    loadSettingsContent();
                    break;
            }
        });
    });
}

// Load History Content
function loadHistoryContent() {
    const historyList = document.getElementById('historyList');
    
    if (promptHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No History Yet</h3>
                <p>Generate your first prompt to see it here!</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = promptHistory.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <div class="prompt-item-header">
                <div class="prompt-item-title">${prompt.template || 'Custom Prompt'}</div>
                <div class="prompt-item-date">${formatDate(prompt.timestamp)}</div>
            </div>
            <div class="prompt-item-content">${truncateText(prompt.content, 200)}</div>
            <div class="prompt-item-actions">
                <button class="action-btn" onclick="copyPromptFromHistory('${prompt.id}')" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn" onclick="toggleFavoriteFromHistory('${prompt.id}')" title="Add to Favorites">
                    <i class="${favoritePrompts.find(f => f.id === prompt.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="action-btn" onclick="deleteFromHistory('${prompt.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load Favorites Content
function loadFavoritesContent() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (favoritePrompts.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No Favorites Yet</h3>
                <p>Click the heart icon on any generated prompt to save it here!</p>
            </div>
        `;
        return;
    }
    
    favoritesList.innerHTML = favoritePrompts.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <div class="prompt-item-header">
                <div class="prompt-item-title">${prompt.template || 'Custom Prompt'}</div>
                <div class="prompt-item-date">${formatDate(prompt.timestamp)}</div>
            </div>
            <div class="prompt-item-content">${truncateText(prompt.content, 200)}</div>
            <div class="prompt-item-actions">
                <button class="action-btn" onclick="copyPromptFromHistory('${prompt.id}')" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn" onclick="removeFromFavorites('${prompt.id}'); loadFavoritesContent();" title="Remove from Favorites">
                    <i class="fas fa-heart-broken"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load Analytics Content
function loadAnalyticsContent() {
    document.getElementById('totalPrompts').textContent = promptHistory.length;
    document.getElementById('totalFavorites').textContent = favoritePrompts.length;
    
    // Calculate average complexity
    if (promptHistory.length > 0) {
        const complexities = promptHistory.map(p => p.analysis?.complexity || 'Basic');
        const complexityMap = { 'Basic': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
        const avgComplexity = complexities.reduce((sum, c) => sum + (complexityMap[c] || 1), 0) / complexities.length;
        const complexityLabels = ['Basic', 'Intermediate', 'Advanced', 'Expert'];
        document.getElementById('avgComplexity').textContent = complexityLabels[Math.round(avgComplexity) - 1] || 'Basic';
    }
    
    // Find most used template
    if (promptHistory.length > 0) {
        const templateCounts = {};
        promptHistory.forEach(p => {
            const template = p.template || 'Custom';
            templateCounts[template] = (templateCounts[template] || 0) + 1;
        });
        const mostUsed = Object.entries(templateCounts).sort(([,a], [,b]) => b - a)[0];
        document.getElementById('mostUsedTemplate').textContent = mostUsed ? mostUsed[0] : 'None';
    }
    
    // Show current prompt analysis if available
    if (window.currentPromptData && window.currentPromptData.analysis) {
        const analysis = window.currentPromptData.analysis;
        document.getElementById('promptAnalysis').innerHTML = `
            <div class="analysis-item"><strong>Word Count:</strong> ${analysis.wordCount}</div>
            <div class="analysis-item"><strong>Character Count:</strong> ${analysis.charCount}</div>
            <div class="analysis-item"><strong>Complexity:</strong> ${analysis.complexity}</div>
            <div class="analysis-item"><strong>Readability:</strong> ${analysis.readability}</div>
            <div class="analysis-item"><strong>Sentiment:</strong> ${analysis.sentiment}</div>
            <div class="analysis-item"><strong>Keywords:</strong> ${analysis.keywords.join(', ')}</div>
        `;
    }
}

// Load Settings Content
function loadSettingsContent() {
    // Load saved API keys (masked)
    Object.keys(apiKeys).forEach(provider => {
        const input = document.getElementById(`${provider}Key`);
        if (input && apiKeys[provider]) {
            input.value = '••••••••••••••••';
        }
    });
}

// Utility Functions
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function copyPromptFromHistory(promptId) {
    const prompt = promptHistory.find(p => p.id === promptId) || favoritePrompts.find(p => p.id === promptId);
    if (prompt) {
        navigator.clipboard.writeText(prompt.content).then(() => {
            showNotification('Prompt copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy prompt', 'error');
        });
    }
}

function toggleFavoriteFromHistory(promptId) {
    const prompt = promptHistory.find(p => p.id === promptId);
    if (prompt) {
        const isFavorited = toggleFavorite(prompt);
        loadHistoryContent(); // Refresh to update heart icon
        if (isFavorited) {
            showNotification('Added to favorites!', 'success');
        } else {
            showNotification('Removed from favorites', 'info');
        }
    }
}

function deleteFromHistory(promptId) {
    if (confirm('Are you sure you want to delete this prompt from history?')) {
        promptHistory = promptHistory.filter(p => p.id !== promptId);
        localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
        loadHistoryContent();
        showNotification('Prompt deleted from history', 'info');
    }
}

// Enhanced favorite button functionality
function setupFavoriteButton() {
    const favoriteBtn = document.getElementById('favoritePrompt');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            if (window.currentPromptData) {
                const isFavorited = toggleFavorite(window.currentPromptData);
                const icon = favoriteBtn.querySelector('i');
                if (isFavorited) {
                    icon.className = 'fas fa-heart';
                    favoriteBtn.style.color = '#ff6b6b';
                } else {
                    icon.className = 'far fa-heart';
                    favoriteBtn.style.color = '';
                }
            } else {
                showNotification('Generate a prompt first!', 'warning');
            }
        });
    }
}

// API Key Management
function saveApiKey(provider) {
    const input = document.getElementById(`${provider}Key`);
    if (input && input.value && input.value !== '••••••••••••••••') {
        apiKeys[provider] = input.value;
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        showNotification(`${provider.toUpperCase()} API key saved!`, 'success');
        input.value = '••••••••••••••••';
    }
}

function clearApiKey(provider) {
    if (confirm(`Are you sure you want to remove the ${provider.toUpperCase()} API key?`)) {
        delete apiKeys[provider];
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        document.getElementById(`${provider}Key`).value = '';
        showNotification(`${provider.toUpperCase()} API key removed`, 'info');
    }
}

// Search and Filter Functions
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const sortBy = document.getElementById('historySort').value;
    
    let filteredHistory = promptHistory.filter(prompt => 
        prompt.content.toLowerCase().includes(searchTerm) ||
        (prompt.template && prompt.template.toLowerCase().includes(searchTerm))
    );
    
    // Sort results
    filteredHistory.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return b.timestamp - a.timestamp;
            case 'oldest':
                return a.timestamp - b.timestamp;
            case 'template':
                return (a.template || '').localeCompare(b.template || '');
            default:
                return b.timestamp - a.timestamp;
        }
    });
    
    // Update display
    const historyList = document.getElementById('historyList');
    if (filteredHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
    } else {
        historyList.innerHTML = filteredHistory.map(prompt => `
            <div class="prompt-item" data-id="${prompt.id}">
                <div class="prompt-item-header">
                    <div class="prompt-item-title">${prompt.template || 'Custom Prompt'}</div>
                    <div class="prompt-item-date">${formatDate(prompt.timestamp)}</div>
                </div>
                <div class="prompt-item-content">${truncateText(prompt.content, 200)}</div>
                <div class="prompt-item-actions">
                    <button class="action-btn" onclick="copyPromptFromHistory('${prompt.id}')" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" onclick="toggleFavoriteFromHistory('${prompt.id}')" title="Add to Favorites">
                        <i class="${favoritePrompts.find(f => f.id === prompt.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="action-btn" onclick="deleteFromHistory('${prompt.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function searchFavorites() {
    const searchTerm = document.getElementById('favoritesSearch').value.toLowerCase();
    const sortBy = document.getElementById('favoritesSort').value;
    
    let filteredFavorites = favoritePrompts.filter(prompt => 
        prompt.content.toLowerCase().includes(searchTerm) ||
        (prompt.template && prompt.template.toLowerCase().includes(searchTerm))
    );
    
    // Sort results
    filteredFavorites.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return b.timestamp - a.timestamp;
            case 'oldest':
                return a.timestamp - b.timestamp;
            case 'template':
                return (a.template || '').localeCompare(b.template || '');
            default:
                return b.timestamp - a.timestamp;
        }
    });
    
    // Update display
    const favoritesList = document.getElementById('favoritesList');
    if (filteredFavorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
    } else {
        favoritesList.innerHTML = filteredFavorites.map(prompt => `
            <div class="prompt-item" data-id="${prompt.id}">
                <div class="prompt-item-header">
                    <div class="prompt-item-title">${prompt.template || 'Custom Prompt'}</div>
                    <div class="prompt-item-date">${formatDate(prompt.timestamp)}</div>
                </div>
                <div class="prompt-item-content">${truncateText(prompt.content, 200)}</div>
                <div class="prompt-item-actions">
                    <button class="action-btn" onclick="copyPromptFromHistory('${prompt.id}')" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" onclick="removeFromFavorites('${prompt.id}'); searchFavorites();" title="Remove from Favorites">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Bulk Operations
function clearAllHistory() {
    if (confirm('Are you sure you want to clear all prompt history? This action cannot be undone.')) {
        promptHistory = [];
        localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
        loadHistoryContent();
        showNotification('All history cleared', 'info');
    }
}

function clearAllFavorites() {
    if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
        favoritePrompts = [];
        localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
        loadFavoritesContent();
        showNotification('All favorites cleared', 'info');
    }
}

// Export/Import Functions
function exportData() {
    const data = {
        promptHistory,
        favoritePrompts,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-engineer-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.promptHistory && data.favoritePrompts) {
                        if (confirm('This will replace your current data. Continue?')) {
                            promptHistory = data.promptHistory;
                            favoritePrompts = data.favoritePrompts;
                            localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
                            localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
                            loadHistoryContent();
                            loadFavoritesContent();
                            loadAnalyticsContent();
                            showNotification('Data imported successfully!', 'success');
                        }
                    } else {
                        showNotification('Invalid file format', 'error');
                    }
                } catch (error) {
                    showNotification('Error reading file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Initialize enhanced features when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeEnhancedFeatures();
        initializeTabSystem();
        setupFavoriteButton();
    });
} else {
    initializeEnhancedFeatures();
    initializeTabSystem();
    setupFavoriteButton();
}