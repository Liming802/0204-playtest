class EventManager {
    constructor(gameTimer) {
        console.log("EventManager initialized"); // 添加日志以调试
        this.gameTimer = gameTimer; // Reference to GameTimer instance
        this.events = [
            { 
                hours: 0.1, 
                name: "Police call from John", 
                description: "It was Sunday, and we received a police call in the evening. <span class='bold'>The caller was John, and the victim was Mark.</span> John got home at 5 PM, found Mark dead in the apartment with clear signs of blunt-force trauma to the head. and further autopsy results will take some time. All the other residents claimed they were out that day, yet investigators found obvious men's shoe prints at the scene—even though the house rules require everyone to take off their shoes upon entering.",
                triggered: false,
                read: false
            },
            { 
                hours: 1, 
                name: "Preliminary autopsy results", 
                description: " <span class='bold'>This body is believed to have died between 12 and 3 PM</span>, there is a blunt force trauma wound on the head, No signs of struggle or combat, no foreign DNA detected. Toxicological effects are suspected, requiring further examination.",
                triggered: false,
                read: false
            },
            { 
                hours: 5, 
                name: "Witness Report", 
                description: "The elderly neighbor said that in the afternoon, while taking out the trash, she saw a stranger enter the room. From the back, the person didn't resemble any of the four tenants.",
                triggered: false,
                read: false
            },
            { 
                hours: 8, 
                name: "Pressure from your superior", 
                description: "You have 12 hours <span class='bold'>(12 minutes)</span> to make progress on the case <span class='bold'>enough Conviction Evidence</span>, or your access to the lab and technology will be reduced.",
                triggered: false,
                read: false
            },
            { 
                hours: 20, 
                name: "New group Introduced:", 
                description: "Eager to close the case quickly,<span class='bold'>they took some of your evidence</span>. Hopefully, you had thoroughly reviewed everything beforehand. Your superior believes in your abilities <span class='bold'>and protected your access to the lab and technology—but now you owe them a big favor</span>. Stay focused; solving the case is the top priority.",
                triggered: false,
                read: false
            },
            { 
                hours: 30, 
                name: "Amy's Suicide Note", 
                description: "Amy overdosed on sleeping pills and is currently being treated at the hospital. She left behind a half-written confession. In it, she admitted to drugging Mark in the morning because he was blackmailing her with ghostwritten materials. She believed he passed out due to the drug's effects, fell to the ground, and died from the impact—leading her to attempt suicide. She also confessed that she never truly loved her boyfriend and only stayed with him for a green card. Overwhelmed by immense pressure, she contemplated ending her life.",
                triggered: false,
                read: false
            },
            { 
                hours: 40, 
                name: "New Pressure", 
                description: "Your superior sees Amy's suicide attempt as an opportunity to close the case and orders you to start writing the Conclusion for the final case report. <span class='bold'>You have 10 hours left to submit it—once time is up, the game will automatically end.</span>",
                triggered: false,
                read: false
            }
            
        ];
        this.eventsModal = null; // 存储模态框引用
    }

    checkEvents(elapsedTime) {
        if (!this.events) {
            console.error("Events array is not initialized");
            return;
        }
        
        const elapsedHours = elapsedTime / (1000 * 60 * 60);
        
        this.events.forEach(event => {
            if (!event.triggered && elapsedHours >= event.hours) {
                event.triggered = true;
                event.read = false;
                this.updateEventNotification();
                // 如果事件列表已创建，则动态添加事件
                if (this.eventsModal && this.eventsList) {
                    this.addEventToList(event);
                }
            }
        });
    }

    updateEventNotification() {
        try {
            const unreadCount = this.events.filter(e => e.triggered && !e.read).length;
            const eventsButton = document.getElementById('events');
            
            if (!eventsButton) {
                console.error("Events button not found");
                return;
            }
            
            let notification = document.getElementById('event-notification');
            
            if (unreadCount > 0) {
                if (!notification) {
                    notification = document.createElement('div');
                    notification.id = 'event-notification';
                    notification.style.position = 'absolute';
                    notification.style.top = '-8px';
                    notification.style.right = '-5px';
                    notification.style.background = 'red';
                    notification.style.color = 'white';
                    notification.style.borderRadius = '50%';
                    notification.style.width = '30px';
                    notification.style.height = '30px';
                    notification.style.display = 'flex';
                    notification.style.alignItems = 'center';
                    notification.style.justifyContent = 'center';
                    notification.style.fontSize = '14px';
                    notification.style.fontWeight = 'bold';
                    eventsButton.appendChild(notification);
                }
                
                notification.textContent = unreadCount;
            } else if (notification) {
                notification.remove();
            }
        } catch (error) {
            console.error("Error updating event notification:", error);
        }
    }

    showEvents() {
        try {
            console.log("Showing events modal");
            if (!this.eventsModal) {
                this.eventsModal = document.createElement('div');
                this.eventsModal.id = 'events-modal';
                this.eventsModal.className = 'modal';
                this.eventsModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Events</h2>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="events-list"></div>
                        </div>
                    </div>
                `;
                document.body.appendChild(this.eventsModal);
        
                // 绑定关闭按钮事件
                this.eventsModal.querySelector('.close').addEventListener('click', () => {
                    this.eventsModal.style.display = 'none';
                });
        
                // 点击模态框外部关闭
                window.addEventListener('click', (e) => {
                    if (e.target === this.eventsModal) {
                        this.eventsModal.style.display = 'none';
                    }
                });
        
                this.eventsList = this.eventsModal.querySelector('.events-list');
            }
        
            // 清空旧的事件列表
            this.eventsList.innerHTML = '';
        
            // 仅显示已触发的事件
            const triggeredEvents = this.events.filter(event => event.triggered);
            
            if (triggeredEvents.length === 0) {
                this.eventsList.innerHTML = '<div class="event-item">No events yet.</div>';
            } else {
                triggeredEvents.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = `event-item ${!event.read ? 'unread' : ''}`;
                    eventItem.innerHTML = `
                        <div class="event-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex-grow: 1;">
                                <span class="event-name">${event.name}</span>
                                <span class="event-time">Happened ${event.hours < 1 ? `${Math.floor(event.hours * 60)} minutes` : `${event.hours} hours`} ago</span>
                            </div>
                            <button class="toggle-description" style="pointer-events: none;">▼</button>
                        </div>
                        <div class="event-description" style="display: none;">
                            ${event.description}
                        </div>
                    `;
            
                    // 绑定点击事件到整个header
                    const header = eventItem.querySelector('.event-header');
                    header.addEventListener('click', () => {
                        const description = eventItem.querySelector('.event-description');
                        const toggleButton = eventItem.querySelector('.toggle-description');
                        
                        description.style.display = description.style.display === 'none' ? 'block' : 'none';
                        toggleButton.textContent = toggleButton.textContent === '▼' ? '▲' : '▼';
            
                        // 标记事件为已读
                        event.read = true;
                        eventItem.classList.remove('unread');
                        this.updateEventNotification();
                    });
            
                    this.eventsList.appendChild(eventItem);
                });
            }
        
            // 显示模态框
            this.eventsModal.style.display = 'block';
        } catch (error) {
            console.error("Error showing events:", error);
            // 创建一个紧急备用模态框以显示事件内容
            const modal = document.getElementById('modal');
            if (modal) {
                const modalTitle = document.getElementById('modal-title');
                const modalBody = document.getElementById('modal-body');
                
                if (modalTitle && modalBody) {
                    modalTitle.textContent = "Events";
                    
                    let content = '<div class="events-container">';
                    const triggeredEvents = this.events.filter(event => event.triggered);
                    
                    if (triggeredEvents.length === 0) {
                        content += '<div class="event-item">No events yet.</div>';
                    } else {
                        triggeredEvents.forEach(event => {
                            content += `
                                <div class="event-item ${!event.read ? 'unread' : ''}">
                                    <h3>${event.name}</h3>
                                    <div class="event-description">
                                        ${event.description}
                                    </div>
                                </div>
                            `;
                            // 标记为已读
                            event.read = true;
                        });
                    }
                    
                    content += '</div>';
                    modalBody.innerHTML = content;
                    
                    // 显示模态框
                    modal.style.display = 'block';
                    
                    // 更新通知
                    this.updateEventNotification();
                }
            } else {
                alert("Events feature is currently unavailable. Please try again later.");
            }
        }
    }
    
    // 新方法：添加事件到列表
    addEventToList(event) {
        if (!this.eventsModal || !this.eventsList) return;

        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${!event.read ? 'unread' : ''}`;
        eventItem.innerHTML = `
            <div class="event-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex-grow: 1;">
                    <span class="event-name">${event.name}</span>
                    <span class="event-time">Happened ${event.hours < 1 ? `${Math.floor(event.hours * 60)} minutes` : `${event.hours} hours`} ago</span>
                </div>
                <button class="toggle-description" style="pointer-events: none;">▼</button>
            </div>
            <div class="event-description" style="display: none;">
                ${event.description}
            </div>
        `;

        // 绑定点击事件到整个header
        const header = eventItem.querySelector('.event-header');
        header.addEventListener('click', () => {
            const description = eventItem.querySelector('.event-description');
            const toggleButton = eventItem.querySelector('.toggle-description');
            
            description.style.display = description.style.display === 'none' ? 'block' : 'none';
            toggleButton.textContent = toggleButton.textContent === '▼' ? '▲' : '▼';
            
            // 标记事件为已读
            event.read = true;
            eventItem.classList.remove('unread');
            this.updateEventNotification();
        });

        this.eventsList.appendChild(eventItem);
    }
}

// 确保 EventManager 在全局作用域中可用
window.EventManager = EventManager;

// 添加页面加载检查
document.addEventListener('DOMContentLoaded', () => {
    console.log("EventManager script loaded");
    
    // 在脚本加载后尝试注册 Events 按钮的点击处理程序
    // 这是一个备份，以防 Game 类中的事件监听器没有正确设置
    const eventsButton = document.getElementById('events');
    if (eventsButton && window.gameTimer && window.gameTimer.eventManager) {
        eventsButton.addEventListener('click', () => {
            console.log("Events button clicked");
            window.gameTimer.eventManager.showEvents();
        });
    } else {
        console.error("Events button or gameTimer not initialized yet");
    }
});

document.getElementById('events').addEventListener('click', () => {
    gameTimer.eventManager.showEvents(); // 直接调用 EventManager 中的 showEvents 方法
});