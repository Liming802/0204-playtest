const translations = {
    en: {
        timerConfirm: "Are you sure you want to reset the Game?<br>Your inquiry records and evidence will disappear.",
        evidenceManagement: "Evidence Management",
        conviction: "Conviction Evidence",
        important: "Other Important Evidence",
        related: "Related Evidence",
        other: "Other Evidence",
        events: "Events"
    }
};

class GameTimer {
    constructor() {
        // 获取当前日期
        const now = new Date();
        // 设置时间为当天的17点
        this.startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0).getTime();
        this.missionStartTime = new Date().getTime();
        
        this.timerElement = document.getElementById('timer');
        this.anotherElement = document.getElementById('mission');
        this.missionTimerElement = document.getElementById('mission-timer');
        this.isRunning = false;
        this.timerInterval = null;
        this.speedMultiplier = 60;
        this.isFirstLayer = false;
        this.hasCompletedStickers = false;
        this.initialized = false; // 添加标志，表示是否已初始化定时器
        
        // 添加对话点数显示
        this.conversationPointsElement = document.createElement('div');
        this.conversationPointsElement.className = 'points-container conversation-points';
        this.conversationPointsElement.innerHTML = `
            <div class="points-icon"><img src="./images/Chat.png" alt="Chat" style="width: 60px; height: 60px;"></div>
            <div class="points-info">
                <div class="points-label">Chat Points</div>
                <div class="points-value" id="conversation-points">5</div>
            </div>
        `;
        // 将对话点数添加到点数容器的最底部
        const pointsContainer = document.querySelector('.points-display');
        pointsContainer.appendChild(this.conversationPointsElement);
        
        // 场景索引常量
        this.SCENE_INTRO = 0;       // scene0.png - 介绍场景
        this.SCENE_TRANSITION = 1;  // scene0.5.png - 过渡场景
        this.SCENE_LIVING_ROOM = 2; // scene1.png - 客厅
        this.SCENE_MARK_ROOM = 3;   // scene2.png - Mark的房间
        this.SCENE_JOHN_ROOM = 4;   // scene3.png - John的房间
        this.SCENE_AMY_ROOM = 5;    // scene4.png - Amy的房间
        this.SCENE_LINNA_ROOM = 6;  // scene5.png - Linna的房间
        
        // 添加当前场景追踪
        this.currentScene = this.SCENE_INTRO; // 初始场景
        
        // 检查URL参数，判断是否已完成stickers
        if (window.location.hash === '#completed') {
            this.hasCompletedStickers = true;
            // 移除URL中的hash
            window.history.replaceState(null, null, window.location.pathname);
            this.isRunning = true; // 如果已完成，自动开始计时
            
            // 设置计时器为活跃状态（绿色）
            this.setTimerActive(true);
        } else {
            // 未完成stickers，计时器为灰色
            this.setTimerActive(false);
        }
        
        // 获取暂停和重置按钮
        this.pauseButton = document.getElementById('pause-button');
        this.resetButton = document.getElementById('reset-button');

        // 获取暂停遮罩层
        this.pauseOverlay = document.querySelector('.pause-overlay');
        
        // 确保遮罩层的 z-index 高于所有其他元素
        if (this.pauseOverlay) {
            this.pauseOverlay.style.zIndex = '10000';
        }

        // 设置计时器显示为17点
        this.updateMainTimer(new Date(this.startTime));

        // 初始化任务计时器为00:00:00
        this.updateMissionTimer(new Date(0)); // 任务计时器从0开始

        this.eventManager = new EventManager(this);

        this.backgroundUpdates = [
            { hours: 0, image: './images/scene0.png' },
            { hours: 0.25, image: './images/scene0.5.png' },
            { hours: 0.5, image: './images/scene1.png' },
            { hours: 2, image: './images/scene2.png' },
            { hours: 4, image: './images/scene3.png' },
            { hours: 6, image: './images/scene4.png' },
            { hours: 8, image: './images/scene5.png' },
        ];
        this.initBackgroundImage();
        this.initTimerControls();
        this.initSceneButtons();
        this.preloadImages(); // 预加载场景图片
        // this.initDraggableBackground();

        // 侦探头像点击事件
        const detectiveAvatar = document.getElementById('detective-avatar');
        const detectiveCard = document.getElementById('detective-card');
        const closeButton = detectiveCard.querySelector('.close-detail');

        detectiveAvatar.addEventListener('click', () => {
            detectiveCard.style.display = detectiveCard.style.display === 'none' ? 'block' : 'none';
        });

        closeButton.addEventListener('click', () => {
            detectiveCard.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            // 处理侦探卡片点击事件
            if (event.target === detectiveCard) {
                detectiveCard.style.display = 'none';
            }
            
            // 仅当在第一层时，点击任何地方会降低背景容器的z-index并恢复计时器
            if (this.isFirstLayer) {
                const bgElement = document.querySelector('.background-container');
                bgElement.style.zIndex = '-999';
       
                if (!this.isRunning && this.hasCompletedStickers) {
                    this.isRunning = true;
                    this.missionStartTime = new Date().getTime();
                }
            }
            
            // 处理暂停恢复 - 如果当前暂停且遮罩层显示，点击非暂停按钮和非遮罩层区域恢复计时
            if (!this.isRunning && 
                this.pauseOverlay && 
                this.pauseOverlay.style.display === 'block' && 
                !this.pauseOverlay.contains(event.target) && 
                !this.pauseButton.contains(event.target)) {
                
                console.log("点击窗口非按钮区域，恢复游戏");
                
                // 直接修改状态恢复游戏
                this.isRunning = true;
                this.pauseOverlay.style.display = 'none';
                
                // 调整开始时间保持计时连续
                if (this.pauseTime) {
                    const currentTime = new Date().getTime();
                    const pausedDuration = currentTime - this.pauseTime; // 暂停持续时间（毫秒）
                    this.missionStartTime += pausedDuration; // 调整开始时间，保持已经过去的时间不变
                    console.log("窗口点击：游戏恢复，调整了开始时间，暂停持续:", pausedDuration, "ms");
                }
            }
        });

        // 设置 Lab points 和 Tech points 的颜色
        const labPointsElement = document.getElementById('lab-points');
        const techPointsElement = document.getElementById('tech-points');

        if (labPointsElement) {
            labPointsElement.style.color = 'green'; // Lab points 颜色为绿色
        }

        if (techPointsElement) {
            techPointsElement.style.color = 'blue'; // Tech points 颜色为蓝色
        }
    }

    preloadImages() {
        // 确保预加载所有场景图片
        console.log("预加载场景图片...");
        this.backgroundUpdates.forEach((update, index) => {
            const img = new Image();
            img.src = update.image;
            console.log(`预加载场景 ${index}: ${update.image}`);
        });
    }

    initTimer() {
        // 防止重复初始化
        if (this.initialized) return;
        this.initialized = true;
        
        console.log("初始化计时器...");
        this.missionStartTime = new Date().getTime(); // 重置开始时间
        
        // 如果已完成贴纸，设置计时器为活跃状态
        if (this.hasCompletedStickers) {
            this.setTimerActive(true);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.isRunning) {
                const currentTime = new Date().getTime();
                const elapsedTime = (currentTime - this.missionStartTime) * this.speedMultiplier; 
                const date = new Date(this.startTime + elapsedTime);
                this.updateMainTimer(date);
    
                const missionElapsedTime = (currentTime - this.missionStartTime) * this.speedMultiplier;
                const missionDate = new Date(missionElapsedTime);
                this.updateMissionTimer(missionDate);
    
                this.eventManager.checkEvents(missionElapsedTime);
            }
        }, 1000);
        
        // 返回true表示计时器已成功初始化
        return true;
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

    clearChatHistory() {
        for (const user in questioningModal.chatHistory) {
            questioningModal.chatHistory[user] = []; // 清空聊天记录
        }
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // 清空聊天框
    }

    resetTimer() {
        // 重置游戏状态到贴纸被清除后的初始状态，保持stickers已完成
        console.log("重置计时器到初始状态");
        
        // 保持贴纸状态，重置时间为初始值
        const now = new Date();
        this.startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0).getTime();
        this.missionStartTime = new Date().getTime();
        this.isRunning = true; // 重置后继续运行
        this.initialized = false; // 允许重新初始化计时器
        
        // 清除现有定时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 重新初始化计时器
        this.initTimer();
        
        // 更新UI显示
        this.updateMainTimer(new Date(this.startTime));
        this.updateMissionTimer(new Date(0));
        
        // 重置事件状态
        if (this.eventManager && this.eventManager.events) {
            this.eventManager.events.forEach(event => event.triggered = false);
        }
        
        // 清空聊天记录
        this.clearChatHistory();
        
        // 重置背景到初始状态但保持非首屏
        const bgElement = document.querySelector('.background-container');
        if (bgElement) {
            bgElement.style.zIndex = '-999'; // 确保背景在下层
        }
        
        console.log("计时器已重置，保持stickers完成状态");
    }

    initTimerControls() {
        // 暂停按钮事件
        this.pauseButton.addEventListener('click', () => {
            console.log("点击了暂停按钮，当前状态:", this.isRunning);
            
            // 从运行切换到暂停
            if (this.isRunning) {
                this.isRunning = false;
                this.pauseOverlay.style.display = 'block'; // 显示遮罩层
                this.pauseTime = new Date().getTime(); // 记录暂停时间
                this.pauseOverlay.style.zIndex = '10000'; // 确保遮罩层在最上层
                console.log("按钮点击：游戏暂停，记录暂停时间:", this.pauseTime);
            }
            // 从暂停切换到运行
            else {
                this.isRunning = true;
                this.pauseOverlay.style.display = 'none'; // 隐藏遮罩层
                
                // 调整开始时间保持计时连续
                if (this.pauseTime) {
                    const currentTime = new Date().getTime();
                    const pausedDuration = currentTime - this.pauseTime; // 暂停持续时间（毫秒）
                    this.missionStartTime += pausedDuration; // 调整开始时间，保持已经过去的时间不变
                    console.log("按钮点击：游戏恢复，调整了开始时间，暂停持续:", pausedDuration, "ms");
                }
            }
            
            console.log("按钮点击后游戏状态:", this.isRunning);
        });
        
        // 重置按钮事件
        this.resetButton.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = "Reset Timer";
            document.querySelector('#timer-modal .modal-body p').innerHTML =
                translations.en.timerConfirm.replace(/\n/g, "<br>");
            
            document.getElementById('timer-yes').textContent = "Yes";
            document.getElementById('timer-no').textContent = "No";
            document.getElementById('timer-modal').style.display = 'block';
        });

        // 添加遮罩层点击事件 - 点击遮罩层恢复计时
        this.pauseOverlay.addEventListener('click', (event) => {
            // 阻止事件冒泡，防止触发window的点击事件
            event.stopPropagation();
            
            console.log("点击了暂停遮罩层，当前运行状态:", this.isRunning);
            
            // 手动设置为运行状态并隐藏遮罩层
            this.isRunning = true;
            this.pauseOverlay.style.display = 'none';
            
            if (this.pauseTime) {
                const currentTime = new Date().getTime();
                const pausedDuration = currentTime - this.pauseTime; // 暂停持续时间（毫秒）
                this.missionStartTime += pausedDuration; // 调整开始时间，保持已经过去的时间不变
                console.log("遮罩层点击：游戏恢复，调整了开始时间，暂停持续:", pausedDuration, "ms");
            }
            
            console.log("遮罩层点击后，游戏状态:", this.isRunning);
        });
    }
    
    initSceneButtons() {
        // 获取所有场景按钮
        const sceneButtons = [
            document.getElementById('scene1-btn'),
            document.getElementById('scene2-btn'),
            document.getElementById('scene3-btn'),
            document.getElementById('scene4-btn'),
            document.getElementById('scene5-btn')
        ];

        // 为每个按钮添加点击事件
        sceneButtons.forEach((button, index) => {
            if (button) {
                button.addEventListener('click', () => {
                    // 根据按钮索引切换到对应场景
                    const sceneIndex = index + 2; // +2 因为前两个场景是intro和transition
                    this.switchToScene(sceneIndex);
                });
            }
        });
    }

    // 更新按钮状态的方法
    updateSceneButtons(activeScene) {
        const sceneButtons = [
            document.getElementById('scene1-btn'),
            document.getElementById('scene2-btn'),
            document.getElementById('scene3-btn'),
            document.getElementById('scene4-btn'),
            document.getElementById('scene5-btn')
        ];

        sceneButtons.forEach((button, index) => {
            if (button) {
                const sceneIndex = index + 2; // +2 因为前两个场景是intro和transition
                if (sceneIndex === activeScene) {
                    button.classList.add('active-scene');
                } else {
                    button.classList.remove('active-scene');
                }
            }
        });
    }

    initBackgroundImage() {
        // Set the initial background image to scene0.png
        this.updateBackgroundImages(0); // Assuming 0 corresponds to scene0
    }
    updateBackgroundImages(sceneNumber) {
        console.log(`Switching to scene: ${sceneNumber}`);
    
        if (sceneNumber === 0) {
            this.isFirstLayer = true;
            const bgElement = document.querySelector('.background-container');
            bgElement.style.zIndex = '9999';
            
            if (!this.hasCompletedStickers) {
                this.isRunning = false; // 确保计时器暂停
            } else {
                // 如果已经完成过sticker，确保背景层级正确
                this.isRunning = true;
                bgElement.style.zIndex = '-999';
            }
        } else {
            this.isFirstLayer = false;
            const bgElement = document.querySelector('.background-container');
            bgElement.style.zIndex = '1';
        }

        // 确保暂停遮罩层的 z-index 总是高于背景图层
        if (this.pauseOverlay) {
            this.pauseOverlay.style.zIndex = '10000';
        }

        if (sceneNumber >= 0 && sceneNumber < this.backgroundUpdates.length) {
            const update = this.backgroundUpdates[sceneNumber]; // 使用索引
            console.log(`Updating background to: ${update.image}`); // Debug info
            const bgElement = document.querySelector('.background-image');
            if (bgElement) {
                bgElement.style.opacity = '0';

                setTimeout(() => {
                    bgElement.style.backgroundImage = `url('${update.image}')`;
                    bgElement.style.opacity = '1';
                }, 500);
            }
        } else {
            console.error(`Scene ${sceneNumber} not found`); // Debug info
        }
    }
    
    // 新方法：根据图片路径或场景索引切换场景
    switchToScene(scenePathOrIndex) {
        let imagePath;
        
        // 判断传入的是索引还是图片路径
        if (typeof scenePathOrIndex === 'number') {
            // 如果是索引，从backgroundUpdates获取图片路径
            if (scenePathOrIndex >= 0 && scenePathOrIndex < this.backgroundUpdates.length) {
                imagePath = this.backgroundUpdates[scenePathOrIndex].image;
                this.currentScene = scenePathOrIndex; // 更新当前场景
                this.updateSceneButtons(scenePathOrIndex); // 更新按钮状态
            } else {
                console.error(`无效的场景索引: ${scenePathOrIndex}`);
                return;
            }
        } else {
            // 如果直接传入的是图片路径
            imagePath = scenePathOrIndex;
        }
        
        console.log(`直接切换场景到: ${imagePath}`);
        
        // 设置为非第一层
        this.isFirstLayer = false;
        
        // 调整背景容器层级
        const bgContainer = document.querySelector('.background-container');
        if (bgContainer) {
            bgContainer.style.zIndex = '1';
        }
        
        // 确保暂停遮罩层的 z-index 总是高于背景图层
        if (this.pauseOverlay) {
            this.pauseOverlay.style.zIndex = '10000';
        }
        
        // 更新背景图片
        const bgElement = document.querySelector('.background-image');
        if (bgElement) {
            // 淡出效果
            bgElement.style.opacity = '0';
            
            // 等待淡出完成后更换图片
            setTimeout(() => {
                bgElement.style.backgroundImage = `url('${imagePath}')`;
                bgElement.style.opacity = '1';
            }, 500);
        }
    }

    initDraggableBackground() {
        const bgElement = document.querySelector('.background-image');
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        bgElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const transform = getComputedStyle(bgElement).transform;
            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                initialX = matrix.m41;
                initialY = matrix.m42;
            } else {
                initialX = 0;
                initialY = 0;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // 计算偏移量
            let dx = e.clientX - startX + initialX;
            let dy = e.clientY - startY + initialY;

            // 应用平移变换
            bgElement.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 适配触摸事件
        bgElement.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            const transform = getComputedStyle(bgElement).transform;
            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                initialX = matrix.m41;
                initialY = matrix.m42;
            } else {
                initialX = 0;
                initialY = 0;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];

            // 计算偏移量
            let dx = touch.clientX - startX + initialX;
            let dy = touch.clientY - startY + initialY;

            // 应用平移变换
            bgElement.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // 添加设置计时器颜色的方法
    setTimerActive(active) {
        const timerElements = [this.timerElement, this.anotherElement, this.missionTimerElement];
        const timerLabels = document.querySelectorAll('.timer-label');
        
        if (active) {
            // 设置为活跃状态（绿色）
            timerElements.forEach(el => {
                if (el) {
                    el.style.color = '#4CAF50';
                    el.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.7)';
                }
            });
            
            timerLabels.forEach(label => {
                if (label) {
                    label.style.color = '#4CAF50';
                    label.style.textShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
                }
            });
        } else {
            // 设置为非活跃状态（灰色）
            timerElements.forEach(el => {
                if (el) {
                    el.style.color = '#888888';
                    el.style.textShadow = 'none';
                }
            });
            
            timerLabels.forEach(label => {
                if (label) {
                    label.style.color = '#888888';
                    label.style.textShadow = 'none';
                }
            });
        }
    }

    // 添加更新对话点数的方法
    updateConversationPoints(count) {
        const pointsElement = document.getElementById('conversation-points');
        if (pointsElement) {
            pointsElement.textContent = count;
            // 如果点数为0，添加insufficient类
            if (count === 0) {
                this.conversationPointsElement.classList.add('insufficient');
            } else {
                this.conversationPointsElement.classList.remove('insufficient');
            }
        }
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
    
    hide() {
        this.modal.style.display = 'none';
    }
}

class Game {
    constructor() {
        this.modal = new Modal();
        this.evidencePage = null;
        this.initButtons();
    }

    initButtons() {
        document.getElementById('evidence').addEventListener('click', () => {
            if (!this.evidencePage) {
                this.evidencePage = new EvidencePage();
            }
            this.evidencePage.modal.style.display = 'block';
        });

        // 事件按钮监听器
        document.getElementById('events').addEventListener('click', () => {
            gameTimer.eventManager.showEvents(); // 直接调用 EventManager 中的 showEvents 方法
        });
    }
}

// 全局的gameTimer实例仅初始化一次
window.gameTimer = new GameTimer();
const game = new Game();

document.documentElement.lang = 'en';