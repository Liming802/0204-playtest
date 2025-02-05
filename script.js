// 添加语言配置
const translations = {
    zh: {
        timer: "重置计时器",
        timerConfirm: "确定要重置计时器吗？",
        yes: "是",
        no: "否",
        evidence: "证物",
        map: "地图",
        events: "事件",
        evidenceManagement: "证物管理",
        conviction: "定罪物证",
        important: "其他重要物证",
        related: "相关物证",
        other: "其他物证",
        switchLang: "EN",
        eventDetails: "事件详情",
        unreadEvents: "未读事件",
        conclusion: "结案",
        suspect: "凶手是？",
        reasoning: "你的依据和推理",
        submit: "提交",
        saveDraft: "暂时保存",
        caseConclusion: "案件结论"
    },
    en: {
        timer: "Reset Timer",
        timerConfirm: "Are you sure you want to reset the timer?",
        yes: "Yes",
        no: "No",
        evidence: "Evidence",
        map: "Map",
        events: "Events",
        evidenceManagement: "Evidence Management",
        conviction: "Conviction Evidence",
        important: "Other Important Evidence",
        related: "Related Evidence",
        other: "Other Evidence",
        switchLang: "中",
        eventDetails: "Event Details",
        unreadEvents: "Unread Events",
        conclusion: "Conclusion",
        suspect: "Who is the culprit?",
        reasoning: "What is your reasoning and evidence?",
        submit: "Submit",
        saveDraft: "Save Draft",
        caseConclusion: "Case Conclusion"
    }
};

class GameTimer {
    constructor() {
        this.startTime = new Date(2025, 1, 5).getTime();
        this.missionStartTime = new Date().getTime();
        this.timerElement = document.getElementById('timer');
        this.missionTimerElement = document.getElementById('mission-timer');
        this.isRunning = true;
        this.timerInterval = null;
        this.speedMultiplier = 60;
        this.events = [
            { 
                hours: 0.5, 
                name: "Initial Contact", 
                description: "First contact with the suspect established. Surveillance team reports unusual activity.",
                triggered: false,
                read: false
            },
            { 
                hours: 2, 
                name: "Suspicious Transaction", 
                description: "Multiple suspicious transactions detected through monitored accounts.",
                triggered: false,
                read: false
            },
            { 
                hours: 4, 
                name: "Witness Report", 
                description: "Key witness comes forward with crucial information about the case.",
                triggered: false,
                read: false
            },
            { 
                hours: 6, 
                name: "Evidence Discovery", 
                description: "New physical evidence found at secondary location.",
                triggered: false,
                read: false
            },
            { 
                hours: 8, 
                name: "Suspect Movement", 
                description: "Target suspect observed moving to new location. Surveillance team following.",
                triggered: false,
                read: false
            },
            { 
                hours: 10, 
                name: "Operation Status", 
                description: "Critical phase of operation reached. All teams on standby for final action.",
                triggered: false,
                read: false
            }
        ];
        this.backgroundUpdates = [
            { hours: 0, image: './images/scene0.jpg' },
            { hours: 0.5, image: './images/scene1.jpg' },
            { hours: 2, image: './images/scene2.jpg' },
            { hours: 4, image: './images/scene3.jpg' },
            { hours: 6, image: './images/scene4.jpg' },
            { hours: 8, image: './images/scene5.jpg' },
            { hours: 10, image: './images/scene6.jpg' }
        ];
        this.initTimer();
        this.initTimerClick();
    }

    initTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isRunning) {
                const currentTime = new Date().getTime();
                
                // 更新主计时器
                const elapsedTime = (currentTime - this.startTime) * this.speedMultiplier;
                const date = new Date(this.startTime + elapsedTime);
                this.updateMainTimer(date);

                // 更新任务计时器
                const missionElapsedTime = (currentTime - this.missionStartTime) * this.speedMultiplier;
                const missionDate = new Date(missionElapsedTime);
                this.updateMissionTimer(missionDate);

                // 检查事件触发
                this.checkEvents(missionElapsedTime);
            }
        }, 1000);
    }

    updateMainTimer(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        this.timerElement.textContent = 
            `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    updateMissionTimer(date) {
        const hours = String(Math.floor(date.getTime() / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        this.missionTimerElement.textContent = 
            `${hours}:${minutes}:${seconds}`;
    }

    checkEvents(elapsedTime) {
        const elapsedHours = elapsedTime / (1000 * 60 * 60);
        
        this.events.forEach(event => {
            if (!event.triggered && elapsedHours >= event.hours) {
                event.triggered = true;
                event.read = false;
                this.updateEventNotification();
                
                // 更新背景图片
                this.updateBackgroundImages(event.hours);
            }
        });
    }

    updateEventNotification() {
        const unreadCount = this.events.filter(e => e.triggered && !e.read).length;
        const eventsButton = document.getElementById('events');
        const notification = document.getElementById('event-notification') || 
            document.createElement('div');
        
        if (unreadCount > 0) {
            notification.id = 'event-notification';
            notification.textContent = unreadCount;
            if (!document.getElementById('event-notification')) {
                eventsButton.appendChild(notification);
            }
        } else if (document.getElementById('event-notification')) {
            document.getElementById('event-notification').remove();
        }
    }

    updateBackgroundImages(hours) {
        console.log(`Updating background for event at ${hours} hours`);
        const update = this.backgroundUpdates.find(u => u.hours === hours);
        if (update) {
            const bgElement = document.querySelector('.background-image');
            if (bgElement) {
                // 添加淡出效果
                bgElement.style.opacity = '0';
                
                setTimeout(() => {
                    // 使用带有渐变的背景图片
                    bgElement.style.backgroundImage = `linear-gradient(
                        rgba(0, 0, 0, 0.7),
                        rgba(0, 0, 0, 0.7)
                    ), url('${update.image}')`;
                    bgElement.style.opacity = '1';
                }, 500);
            }
        }
    }

    resetTimer() {
        this.startTime = new Date(2025, 1, 5).getTime();
        this.missionStartTime = new Date().getTime();
        // 重置事件触发状态
        this.events.forEach(event => event.triggered = false);
        
        // 重置背景图片到初始状态
        const initialUpdate = this.backgroundUpdates.find(u => u.hours === 0);
        if (initialUpdate) {
            this.updateBackgroundImages(0);
        }
    }

    initTimerClick() {
        this.timerElement.addEventListener('click', () => {
            document.getElementById('timer-modal').style.display = 'block';
        });
    }
}

class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.timerModal = document.getElementById('timer-modal');
        this.initCloseButtons();
        this.initTimerButtons();
    }

    initCloseButtons() {
        const closeButtons = document.getElementsByClassName('close');
        Array.from(closeButtons).forEach(button => {
            button.addEventListener('click', () => {
                this.modal.style.display = 'none';
                this.timerModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.style.display = 'none';
            }
            if (event.target === this.timerModal) {
                this.timerModal.style.display = 'none';
            }
        });
    }

    initTimerButtons() {
        document.getElementById('timer-yes').addEventListener('click', () => {
            gameTimer.resetTimer();
            this.timerModal.style.display = 'none';
        });

        document.getElementById('timer-no').addEventListener('click', () => {
            this.timerModal.style.display = 'none';
        });
    }

    show(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        this.modal.style.display = 'block';
    }
}

class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.init();
    }

    init() {
        const langBtn = document.createElement('button');
        langBtn.id = 'lang-switch';
        langBtn.className = 'lang-switch-btn';
        langBtn.textContent = translations[this.currentLang].switchLang;
        document.body.insertBefore(langBtn, document.body.firstChild);
        langBtn.addEventListener('click', () => this.toggleLanguage());
        
        this.updateContent();
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        this.updateContent();
    }

    updateContent() {
        const t = translations[this.currentLang];
        
        // 更新按钮文本
        document.getElementById('lang-switch').textContent = t.switchLang;
        document.getElementById('evidence').textContent = t.evidence;
        document.getElementById('map').textContent = t.map;
        document.getElementById('events').textContent = t.events;

        // 更新模态框内容
        document.querySelector('#timer-modal .modal-header h2').textContent = t.timer;
        document.querySelector('#timer-modal .modal-body p').textContent = t.timerConfirm;
        document.getElementById('timer-yes').textContent = t.yes;
        document.getElementById('timer-no').textContent = t.no;

        // 更新证物管理模态框
        const evidenceModal = document.getElementById('evidence-management-modal');
        if (evidenceModal) {
            evidenceModal.querySelector('.modal-header h2').textContent = t.evidenceManagement;
            evidenceModal.querySelector('#conviction h3').textContent = t.conviction;
            evidenceModal.querySelector('#important h3').textContent = t.important;
            evidenceModal.querySelector('#related h3').textContent = t.related;
            evidenceModal.querySelector('#other h3').textContent = t.other;
            
            // 更新物证页面的语言
            if (game.evidencePage) {
                game.evidencePage.updateLanguage(this.currentLang);
            }
        }
    }
}

class Game {
    constructor() {
        this.modal = new Modal();
        this.evidencePage = null;
        this.languageManager = new LanguageManager();
        this.initButtons();
    }

    initButtons() {
        document.getElementById('evidence').addEventListener('click', () => {
            if (!this.evidencePage) {
                this.evidencePage = new EvidencePage();
            }
            this.evidencePage.modal.style.display = 'block';
        });

        document.getElementById('map').addEventListener('click', () => {
            const t = translations[this.languageManager.currentLang];
            this.modal.show(t.map, `<div style="min-height: 200px;"></div>`);
        });

        document.getElementById('events').addEventListener('click', () => {
            const t = translations[this.languageManager.currentLang];
            let eventContent = `
                <div class="events-container">
                    <div class="events-list">
                        ${gameTimer.events
                            .filter(event => event.triggered)
                            .map(event => `
                                <div class="event-item ${!event.read ? 'unread' : ''}" 
                                     data-event-id="${event.hours}">
                                    <h3>${event.name}</h3>
                                    <p>Time: ${
                                        event.hours < 1 
                                            ? `${Math.floor(event.hours * 60)} minutes` 
                                            : `${event.hours} hours`
                                    }</p>
                                    <div class="event-description">
                                        ${event.description}
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            `;
            this.modal.show(t.events, eventContent);

            // Mark events as read when viewed
            document.querySelectorAll('.event-item.unread').forEach(item => {
                const eventHours = parseFloat(item.dataset.eventId);
                const event = gameTimer.events.find(e => e.hours === eventHours);
                if (event) {
                    event.read = true;
                    item.classList.remove('unread');
                }
            });
            gameTimer.updateEventNotification();
        });
    }
}

// 初始化游戏
const gameTimer = new GameTimer();
const game = new Game();

// 更新 HTML 文件的语言标签
document.documentElement.lang = 'en';