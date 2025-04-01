// stickers.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Instruction.js loaded - creating stickers");
    
    // 设置初始计时器为灰色
    const timerElements = document.querySelectorAll('#timer, #mission, #mission-timer');
    timerElements.forEach(el => {
        if (el) el.style.color = '#888888'; // 设置为灰色
    });
    
    // 确保不重复创建
    if (document.querySelector('.sticker-container')) {
        console.log("Sticker container already exists, skipping creation");
        return;
    }
    
    // 创建贴纸容器
    const stickerContainer = document.createElement('div');
    stickerContainer.className = 'sticker-container';
    stickerContainer.style.position = 'fixed';
    stickerContainer.style.width = '100%';
    stickerContainer.style.height = '100vh';
    stickerContainer.style.zIndex = '200';
    stickerContainer.style.pointerEvents = 'none';
    document.body.appendChild(stickerContainer);

    // 跟踪贴纸数量
    let stickerCount = 5;
    
    // 添加console日志以便调试
    console.log("Creating initial stickers, count:", stickerCount);
    
    // 常规贴纸信息 - 使用不同的浅色和白色调，降低饱和度
    const stickers = [
        { 
            text: "YOU!: Here is who you are and what's your special skill, you probably know some of you already.", 
            position: { top: '10%', left: '10%' }, 
            rotation: '-3deg',
            color: 'rgba(252, 246, 231, 0.92)',  // 非常浅的米黄色
            number: 1
        },
        { 
            text: "TIME!: Time is everything, solve it before nothing too late! and Check your EVENTS in bottom right corner!", 
            position: { top: '10%', left: '70%' }, 
            rotation: '2deg',
            color: 'rgba(250, 247, 235, 0.92)',  // 更接近白色的浅色
            number: 2
        },
        { 
            text: "POINTS!: You will get points for good clue you find, Manage them nicely.", 
            position: { top: '70%', left: '15%' }, 
            rotation: '-2deg',
            color: 'rgba(248, 245, 235, 0.92)',  // 带微妙灰色调的白色
            number: 4
        },
        { 
            text: "SCENE!: No detective is complete without a scene, here is the scenes where you need to find the clues.", 
            position: { top: '40%', left: '80%' }, 
            rotation: '4deg',
            color: 'rgba(255, 250, 240, 0.92)',  // 象牙白
            number: 3
        },
        { 
            text: "BULABULA! The first 3 buttons are the tools you need to keep working on, Hit the big red button when really finished.", 
            position: { top: '65%', left: '60%' }, 
            rotation: '1deg',
            color: 'rgba(251, 248, 237, 0.92)',  // 浅奶油色
            number: 5
        },
    ];
    
    // 创建常规贴纸
    stickers.forEach(sticker => {
        const stickerDiv = document.createElement('div');
        stickerDiv.className = 'sticker';
        stickerDiv.style.position = 'absolute';
        stickerDiv.style.width = '230px';
        stickerDiv.style.height = '230px';
        stickerDiv.style.backgroundColor = sticker.color;
        stickerDiv.style.border = '1px solid rgba(0,0,0,0.08)';
        stickerDiv.style.borderRadius = '2px';
        stickerDiv.style.boxShadow = `
            0 1px 4px rgba(0,0,0,0.15),
            0 0 20px rgba(0,0,0,0.08),
            2px 2px 8px rgba(0,0,0,0.08)
        `;
        stickerDiv.style.padding = '15px';
        stickerDiv.style.textAlign = 'center';
        stickerDiv.style.display = 'flex';
        stickerDiv.style.flexDirection = 'column';
        stickerDiv.style.justifyContent = 'space-between';
        stickerDiv.style.alignItems = 'center';
        stickerDiv.style.top = sticker.position.top;
        stickerDiv.style.left = sticker.position.left;
        stickerDiv.style.transform = `rotate(${sticker.rotation})`;
        stickerDiv.style.transition = 'all 0.3s ease';
        stickerDiv.style.cursor = 'default';
        stickerDiv.style.zIndex = '200';
        stickerDiv.style.pointerEvents = 'auto';

        // 添加编号
        const numberDiv = document.createElement('div');
        numberDiv.textContent = sticker.number;
        numberDiv.style.fontSize = '48px';
        numberDiv.style.fontWeight = 'bold';
        numberDiv.style.color = '#333';
        numberDiv.style.position = 'absolute';
        numberDiv.style.top = '10px';
        numberDiv.style.left = '10px';
        numberDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.1)';
        stickerDiv.appendChild(numberDiv);

        const stickerText = document.createElement('p');
        stickerText.textContent = sticker.text;
        stickerText.style.margin = '0';
        stickerText.style.fontSize = '18px';
        stickerText.style.lineHeight = '1.4';
        stickerText.style.color = '#555'; // 更淡的文字颜色，提高可读性
        stickerText.style.paddingLeft = '20px'; // 为编号留出空间
        stickerText.style.paddingTop = '10px'; // 稍微向下移动文本
        stickerText.style.textAlign = 'left'; // 左对齐文本
        stickerDiv.appendChild(stickerText);

        const button = document.createElement('button');
        button.textContent = 'Got It';
        button.style.padding = '5px 10px';
        button.style.fontSize = '12px';
        button.style.marginTop = '10px';
        button.style.backgroundColor = '#f5f5f5';
        button.style.border = '1px solid #ddd';
        button.style.borderRadius = '3px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';
        button.style.color = '#333';

        button.onmouseover = () => {
            button.style.backgroundColor = '#ebebeb';
        };
        button.onmouseout = () => {
            button.style.backgroundColor = '#f5f5f5';
        };

        button.addEventListener('click', () => {
            stickerDiv.style.opacity = '0';
            stickerDiv.style.transform = `rotate(${sticker.rotation}) scale(0.8)`;
            
            setTimeout(() => {
                stickerDiv.remove();
                stickerCount--;
                console.log("Sticker removed, remaining:", stickerCount);
                
                // 更新ready按钮文字和颜色
                if (stickerCount === 0) {
                    readyButton.textContent = "I am so ready to play";
                    readyButton.style.backgroundColor = '#4CAF50';
                    readyButton.onmouseover = () => {
                        readyButton.style.backgroundColor = '#45a049';
                        readyButton.style.transform = 'translateX(-50%) scale(1.05)';
                        readyButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                    };
                    
                    readyButton.onmouseout = () => {
                        readyButton.style.backgroundColor = '#4CAF50';
                        readyButton.style.transform = 'translateX(-50%) scale(1)';
                        readyButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                    };
                }
            }, 300);
        });

        stickerDiv.appendChild(button);
        stickerContainer.appendChild(stickerDiv);

        // 悬停效果
        stickerDiv.onmouseover = () => {
            stickerDiv.style.boxShadow = `
                0 5px 10px rgba(0,0,0,0.15),
                0 0 30px rgba(0,0,0,0.08),
                4px 4px 12px rgba(0,0,0,0.08)
            `;
            stickerDiv.style.transform = `rotate(${sticker.rotation}) scale(1.02)`;
        };
        
        stickerDiv.onmouseout = () => {
            stickerDiv.style.boxShadow = `
                0 1px 4px rgba(0,0,0,0.15),
                0 0 20px rgba(0,0,0,0.08),
                2px 2px 8px rgba(0,0,0,0.08)
            `;
            stickerDiv.style.transform = `rotate(${sticker.rotation})`;
        };
    });
    
    // 创建ready按钮
    const readyButton = document.createElement('button');
    readyButton.className = 'ready-button';
    readyButton.textContent = "Skip, I am ready to play";
    readyButton.style.position = 'fixed';
    readyButton.style.bottom = '43%';
    readyButton.style.left = '49%';
    readyButton.style.transform = 'translateX(-50%)';
    readyButton.style.padding = '15px 30px';
    readyButton.style.fontSize = '18px';
    readyButton.style.fontWeight = 'bold';
    readyButton.style.backgroundColor = '#727272';
    readyButton.style.color = 'white';
    readyButton.style.border = '2px solid white';
    readyButton.style.borderRadius = '5px';
    readyButton.style.cursor = 'pointer';
    readyButton.style.transition = 'all 0.3s ease';
    readyButton.style.zIndex = '200';
    readyButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    readyButton.style.pointerEvents = 'auto';

    readyButton.onmouseover = () => {
        readyButton.style.backgroundColor = '#727272';
        readyButton.style.transform = 'translateX(-50%) scale(1)';
        readyButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        readyButton.style.border = '2px solid #ffffff';
    };
    
    readyButton.onmouseout = () => {
        readyButton.style.backgroundColor = '#727272';
        readyButton.style.transform = 'translateX(-50%) scale(1)';
        readyButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        readyButton.style.border = '2px solid white';
    };

    readyButton.addEventListener('click', () => {
        console.log("Ready button clicked - starting game");
        
        // 添加消失动画
        readyButton.style.transition = 'all 0.3s ease';
        readyButton.style.transform = 'translateX(-50%) translateY(100px)';
        readyButton.style.opacity = '0';
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            readyButton.remove();
            stickerContainer.remove();
            
            // 明确调用全局gameTimer的方法
            if (window.gameTimer) {
                console.log("Setting gameTimer properties");
                // 设置完成标志
                window.gameTimer.hasCompletedStickers = true;
                
                // 重置任务开始时间
                window.gameTimer.missionStartTime = new Date().getTime();
                
                // 初始化计时器
                window.gameTimer.initTimer();
                
                // 开始计时
                window.gameTimer.isRunning = true;
                
                // 更新背景层级
                const bgElement = document.querySelector('.background-container');
                if (bgElement) {
                    bgElement.style.zIndex = '-999';
                }
                
                // 点击后将计时器文本变为绿色
                const timerElements = document.querySelectorAll('#timer, #mission, #mission-timer');
                timerElements.forEach(el => {
                    if (el) {
                        el.style.color = '#4CAF50'; // 恢复为绿色
                        el.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.7)'; // 恢复文字阴影
                    }
                });
                
                // 同时也更新计时器标签的颜色
                const timerLabels = document.querySelectorAll('.timer-label');
                timerLabels.forEach(el => {
                    if (el) el.style.color = '#4CAF50';
                });
                
                // 切换到场景3
                window.gameTimer.switchToScene(window.gameTimer.SCENE_MARK_ROOM);
                
                console.log("Timer started and switched to scene 3");
            } else {
                console.error("gameTimer is not available!");
            }
        }, 300); // 等待动画完成
    });

    // 将ready按钮添加到容器中
    stickerContainer.appendChild(readyButton);
});