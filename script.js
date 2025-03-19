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
        this.isRunning = true;
        this.timerInterval = null;
        this.speedMultiplier = 60;
        this.isFirstLayer = false;
        
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
            { hours: 0.5, image: './images/scene1.png' },
            { hours: 2, image: './images/scene2.png' },
            { hours: 4, image: './images/scene3.png' },
            { hours: 6, image: './images/scene4.png' },
            { hours: 8, image: './images/scene5.png' },
        ];
        this.initBackgroundImage();
        this.initTimer();
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
            if (event.target === detectiveCard) {
                detectiveCard.style.display = 'none';
            }
            
            // 仅当在第一层时，点击任何地方会降低背景容器的z-index并恢复计时器
            if (this.isFirstLayer) {
                const bgElement = document.querySelector('.background-container');
                bgElement.style.zIndex = '-999';
       
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.missionStartTime = new Date().getTime();
                }
            }
            
            // 确保点击任何地方都能关闭遮罩层并恢复计时器
            // 但只在点击的不是遮罩层本身且遮罩层可见时执行
            if (!this.isRunning && this.pauseOverlay.style.display === 'block' && !this.pauseOverlay.contains(event.target) && !this.pauseButton.contains(event.target)) {
                this.togglePause();
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
        this.backgroundUpdates.forEach(update => {
            const img = new Image();
            img.src = update.image; // 预加载图片
        });
    }

    initTimer() {
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
        // 重新加载整个页面
        window.location.reload();
    }

    initTimerControls() {
        // 暂停按钮事件
        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
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

        // 添加遮罩层点击事件 - 点击遮罩层总是继续计时
        this.pauseOverlay.addEventListener('click', (event) => {
            // 阻止事件冒泡，防止触发window的点击事件
            event.stopPropagation();
            
            // 切换状态 - 从暂停到运行
            if (!this.isRunning) {
                this.togglePause();
            }
            
            // 直接确保遮罩层隐藏
            this.pauseOverlay.style.display = 'none';
        });
    }
    
    togglePause() {
        this.isRunning = !this.isRunning;
        
        // 更新暂停按钮状态和遮罩层
        if (this.isRunning) {
            // 恢复计时器运行
            this.pauseOverlay.style.display = 'none'; // 确保遮罩层被隐藏
            
            // 重新设置开始时间，保持已经过去的时间不变
            const currentTime = new Date().getTime();
            const elapsedTime = (this.pauseTime - this.missionStartTime) * this.speedMultiplier;
            this.missionStartTime = currentTime - (elapsedTime / this.speedMultiplier);
        } else {
            // 暂停计时器
            this.pauseOverlay.style.display = 'block'; // 显示遮罩层
            
            // 记录暂停时的时间
            this.pauseTime = new Date().getTime();
        }
        
        // 确保遮罩层在任何场景都能正常显示
        if (!this.isRunning) {
            // 确保遮罩层的 z-index 足够高，在所有场景都能显示
            this.pauseOverlay.style.zIndex = '10000';
        }
    }

    initSceneButtons() {
        document.getElementById('scene1-btn').addEventListener('click', () => {
            this.updateBackgroundImages(1); // 切换到场景1
        });
        document.getElementById('scene2-btn').addEventListener('click', () => {
            this.updateBackgroundImages(2); // 切换到场景2
        });
        document.getElementById('scene3-btn').addEventListener('click', () => {
            this.updateBackgroundImages(3); // 切换到场景3
        });
        document.getElementById('scene4-btn').addEventListener('click', () => {
            this.updateBackgroundImages(4); // 切换到场景4
        });
        document.getElementById('scene5-btn').addEventListener('click', () => {
            this.updateBackgroundImages(5); // 切换到场景5
        });
    }
    initBackgroundImage() {
        // Set the initial background image to scene0.png
        this.updateBackgroundImages(0); // Assuming 0 corresponds to scene0
    }
    updateBackgroundImages(sceneNumber) {
        console.log(`Switching to scene: ${sceneNumber}`); // Debug info
    
        if (sceneNumber === 0) { // 第一层
            this.isFirstLayer = true; // 设置为第一层
            const bgElement = document.querySelector('.background-container');
            bgElement.style.zIndex = '9999'; // 将背景图层置于最上方，但低于暂停遮罩层
            this.isRunning = false; // 暂停计时器
        } else {
            this.isFirstLayer = false; // 不是第一层
            const bgElement = document.querySelector('.background-container');
            bgElement.style.zIndex = '1'; // 恢复背景图层的 z-index
            // 不强制更改计时器状态，保留当前状态
            // this.isRunning = true; // 注释掉这行，不强制继续计时器
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
                    // 如果是第一个场景，不添加黑色渐变
                    if (sceneNumber === 0) {
                        bgElement.style.backgroundImage = `url('${update.image}')`;
                    } else {
                        // 使用带有渐变的背景图片
                        bgElement.style.backgroundImage = `url('${update.image}')`;
                    }
                    bgElement.style.opacity = '1';
                }, 500);
            }
        } else {
            console.error(`Scene ${sceneNumber} not found`); // Debug info
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

// 初始化游戏
const gameTimer = new GameTimer();
gameTimer.initSceneButtons(); // 初始化场景按钮
const game = new Game();

document.documentElement.lang = 'en';