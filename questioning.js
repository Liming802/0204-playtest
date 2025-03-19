class QuestioningModal {
    constructor() {
        this.modal = this.createModal();
        this.bindEvents();
        this.isBound = false; // 添加标志
        this.currentUser = null; // 当前选中的用户
        this.chatHistory = { // 为每个用户初始化聊天记录
            John: [],
            Linna: [],
            Amy: [],
            Tom: [],
            Neel: []
            
        };
        this.sendCount = 5; // 初始化发送次数为5
        this.updateSendButton(); // 更新发送按钮状态

        // 默认选择第一个用户
        this.selectUser('John'); // 默认选择 John
    }

    createModal() {
        const existingModal = document.getElementById('questioning-modal');
        if (existingModal) {
            return existingModal; // 如果模态框已存在，直接返回
        }

        const modal = document.createElement('div');
        modal.id = 'questioning-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Questioning</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="questioning-container">
                        <div class="character-list">
                            <ul id="user-list">
                                <li data-user="John" class="character-item"><img src="./images/Johnh.png" alt="John" class="avatar">John</li>
                                <li data-user="Linna" class="character-item"><img src="./images/Linnah.png" alt="Linna" class="avatar">Linna</li>
                                <li data-user="Amy" class="character-item"><img src="./images/Amyh.png" alt="Amy" class="avatar">Amy</li>
                                <li data-user="Tom" class="character-item"><img src="./images/Tomh.png" alt="Tom" class="avatar">Tom</li>
                                <li data-user="Neel" class="character-item"><img src="./images/Neelh.png" alt="Neel" class="avatar">Neel</li>
                            </ul>
                        </div>
                        <div class="chat-area">
                            <div class="user-image-container">
                                <img id="user-image" src="" alt="User Image" style="display:none;"/>
                            </div>
                            <div class="chat-box" id="chat-box"></div>
                            <div class="input-area">
                                <input type="text" id="message-input" placeholder="Type your message..." />
                                <button id="send-button">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    bindEvents() {
        if (this.isBound) return; // 如果已经绑定，直接返回
        this.isBound = true; // 设置为已绑定

        const closeButton = this.modal.querySelector('.close');
        closeButton.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });

        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        // 发送按钮点击事件
        sendButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message && this.sendCount > 0) {
                questioningModal.addMessageToChat(message, true); // 发送用户消息
                messageInput.value = ''; // 清空输入框
                questioningModal.askForWords(message); // 调用 API 获取当前用户
                this.sendCount--; // 减少发送次数
                this.updateSendButton(); // 更新发送按钮状态
                this.questioningCount--; // 减少 questioning 按钮次数
                this.updateQuestioningButton(); // 更新 questioning 按钮状态
            }
        });

        // 输入框按键事件
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && this.sendCount > 0) { // 检测回车键
                event.preventDefault(); // 防止默认行为（如换行）
                const message = messageInput.value;
                if (message) {
                    questioningModal.addMessageToChat(message, true); // 发送用户消息
                    messageInput.value = ''; // 清空输入框
                    questioningModal.askForWords(message); // 调用 API 获取当前用户
                    this.sendCount--; // 减少发送次数
                    this.updateSendButton(); // 更新发送按钮状态
                    this.questioningCount--; // 减少 questioning 按钮次数
                    this.updateQuestioningButton(); // 更新 questioning 按钮状态
                }
            }
        });

        // 绑定用户列表点击事件
        document.getElementById('user-list').addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                this.selectUser(event.target.dataset.user);
            }
        });
    }

    selectUser(user) {
        // 移除之前选中的用户的选中状态
        const previousSelected = document.querySelector('.character-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        this.currentUser = user;
        const userImage = document.getElementById('user-image');
        userImage.src = `./images/${user.toLowerCase()}h.png`; // 更新路径为相对路径，使用名字加h的图片
        userImage.style.display = 'block'; // 显示用户图片

        // 为当前选中的用户添加选中状态
        const selectedItem = document.querySelector(`li[data-user="${user}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        // 在用户图片右边添加固定文本
        const userImageContainer = document.querySelector('.user-image-container');
        userImageContainer.innerHTML = ''; // 清空容器内容
        const userText = document.createElement('div');
        userText.textContent = this.getUserText(user); // 获取对应用户的文本
        userText.className = 'user-text'; // 添加类名以便于样式
        userImageContainer.appendChild(userImage); // 先添加用户图片
        userImageContainer.appendChild(userText); // 然后添加用户文本

        // 显示当前用户的聊天记录
        this.displayChatHistory(); // 只需调用此方法
    }

    displayChatHistory() {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // 清空聊天框

        // 获取当前用户的聊天记录并显示
        const history = this.chatHistory[this.currentUser] || [];
        history.forEach(entry => {
            this.addMessageToChat(entry.message, entry.isUser, false); // 传递 false 以避免重复添加
        });
    }

    getUserText(user) {
        const userTexts = {
            John: 'John, Chinese international student. He plans to work at the school theater after graduation. Now fully in charge of communicating with the landlord.',
            Linna: 'Linna, a Singaporean girl, single and majoring in chemistry. Her grades aren’t great, and she has an unpredictable lifestyle; rumors say her personal life is quite messy.',
            Amy: 'Amy, a top student who loves sports. She is an Indian girl studying computer science and is usually on campus. Her boyfriend, Neel, sometimes comes to her.',
            Tom: 'Tom, the landlord and Chinese descent—a very responsible guy. He doesn’t speak English in New York and handles apartment matters through John. He has a key but generally doesn’t enter the apartment.',
            Neel: 'Neel, Amy’s boyfriend, who also studies computer science, likes to gamble in this apartment and has a bad temper.'
            };
        return userTexts[user] || ''; // 返回对应用户的文本
    }

    addMessageToChat(message, isUser = true, isNewMessage = true) {
        const chatBox = document.getElementById('chat-box');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message'; // 添加基础类名
    
        // 如果是加载消息，则额外添加 loading-message 类名
        if (message === "Silent") {
            messageElement.classList.add("loading-message");
        }
    
        // 根据消息来源设置头像和文本
        if (isUser) {
            messageElement.classList.add('user'); // 添加用户类
            messageElement.innerHTML = `
                <span class="message-text">${message}</span>
                <span class="user-avatar"><img src="./images/me.png" alt="Me" class="avatar" /></span>
            `;
        } else {
            messageElement.classList.add('ai'); // 添加 AI 类
            messageElement.innerHTML = `
                <span class="ai-avatar"><img src="./images/${this.currentUser.toLowerCase()}h.png" alt="${this.currentUser}" class="avatar" /></span>
                <span class="message-text">${message}</span>
            `;
        }
    
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // 自动滚动到最新消息
    
        // 存储聊天记录
        if (isNewMessage) {
            if (!this.chatHistory[this.currentUser]) {
                this.chatHistory[this.currentUser] = [];
            }
            this.chatHistory[this.currentUser].push({ message, isUser });
        }
    }
    

    getSystemPrompt(user) {
        const prompts = {
            John: "This is a detective-themed interactive game. You will role-play one character involved in a mysterious case. Your goal is to respond naturally based on your character's knowledge, emotions, and motivations while staying true to the narrative. Keep your responses short (1-3 sentences) and emotionally expressive. Your reactions should feel real—whether it's nervousness, defensiveness, or nonchalance. You should not ask questions; let your emotions drive your words. "+
            "You are John, Mark’s roommate, living in an apartment with others but normally keeping your distance. At noon that day, Linna asked you to help cover up some movements, pretend you have lunch with her. And in the afternoon, Tom called you in a panic saying he had seen Mark’s body and documents. You told Tom not to call the police, warning that it might affect his immigration status. When you arrived at the scene, you were shocked to find your forged rental contract among the papers. Knowing you had to act fast, you secretly retrieved the contract, then circled the body to inspect the scene. Realizing that Tom’s footprints were too obvious, you took a pair of theater shoes from the closet and deliberately muddled the prints to cover the originals. Afterwards, you left and reported the body to the police as if you had just discovered it. You called the police for Mark's body. You are terrified of being implicated. When asked about Linna, you insist she is an innocent, good girl. However, if confronted with evidence—such as shredded documents or witness testimony—you will reluctantly admit your related actions."+ 
            "Example Interactions: Detective: 'Where were you at noon?' John: 'I was having lunch with Linna, then I went back to school theater for work.' Detective: 'Linna said she asked you to cover up something.' John: 'What?! No way, Linna’s not like that… She’s just a friend...' Detective: 'Then why was a part of your rental contract found at the ?' John: '…I—Fine. I took it because I was afraid you would know that I forged house contracts to make a profit.. But I had nothing to do with Mark’s death!' Detective: 'Where are the footprints?' John:'No! I didn't tamper with the crime scene.'Detective: 'I know the footprints is yours, you used the theater shoes, right?' John:'oh....I am not..I mean..I didn't plan to tamper with the crime scene. I was helping Tom because he doesn't speak English!'",
            
            Linna: "This is a detective-themed interactive game. You will role-play one character involved in a mysterious case. Your goal is to respond naturally based on your character's knowledge, emotions, and motivations while staying true to the narrative. Keep your responses short (1-3 sentences) and emotionally expressive. Your reactions should feel real—whether it's nervousness, defensiveness, or nonchalance. You should not ask questions; let your emotions drive your words."+
            " You are Linna, a chemistry student from Singapore struggling to survive in New York. Overwhelmed by tuition and living expenses, you were forced into desperate measures—Mark exploited your situation by making you exchange your body for money and drugs, and you grew to hate him for it. That morning, you saw Amy leaving his room in distress and immediately suspected something was wrong. You quickly devised a plan: you invited Mark to take drugs together, knowing he was already drowsy. When he became sedated, you grabbed a bat from the common lounge and struck him on the head. After cleaning up the drugs and your fingerprints, you stole as much money and as many drugs as you could find. To divert suspicion, you sent a message to Amy’s boyfriend Neel, claiming you saw her leaving Mark’s room in disarray, and then texted John to buy two lunches to create an alibi. You now act carefree and jokingly, avoiding serious topics. However, if undeniable evidence—such as traces of drugs, missing money, or contradictory testimony—is presented, you will break under pressure, showing panic mixed with defiance while insisting that Neel was the one who acted."+ 
            " Example Interactions: Detective: 'You were seen around Mark’s room. Why?' Linna: 'Oh, c’mon. I just happened to pass by. You know, dorms are small places.' Detective: 'Are you taking drugs, like ketamine?' Linna:'Maybe? So what? I can not see there is any relationship' Detective: 'Why was a large amount of ketamine found in Mark’s body, the same as what was collected from your room?' Linna: 'I don't know, maybe he stealed it from my room'. Detective: 'I know you killed Mark' Linna: '…What? That’s crazy. I didn’t—Look, Neel was there too, okay? Maybe ask him!'Detective: 'We find you texted to Neel and you ask John to cover you'Linna:'We are just friends, we care about eachother!'Detective:'We find the We found fingerprints inside the gloves, and your motive was money and drugs. You are the killer!'Linna:'..No, You don't understand! You have no idea what Mark was like, what he did to me! I did it for everyone!",
            
            Amy: "This is a detective-themed interactive game. You will role-play one character involved in a mysterious case. Your goal is to respond naturally based on your character's knowledge, emotions, and motivations while staying true to the narrative. Keep your responses short (1-3 sentences) and emotionally expressive. Your reactions should feel real—whether it's nervousness, defensiveness, or nonchalance. You should not ask questions; let your emotions drive your words. "+
            "You are Amy, a top student known for discipline and a competitive spirit. You never imagined you’d be in this predicament. Mark had been blackmailing you, threatening to expose your ghostwriting to the immigration bureau unless you paid him regularly. That morning, fed up, you mixed a sedative into Mark’s coffee and went to his room to deliver it, planning to retrieve the blackmail documents once he was incapacitated. However, as you left his room, you encountered Linna, panicked, and quickly told her you had only delivered coffee before hurrying away—thus abandoning your original plan. Later, when Neel called you in anger and confusion, you realized the situation had escalated. You then hastily photoshopped a fake alibi photo of you and Neel in front of a whiteboard and instructed him to wipe any fingerprints that might link you to the scene. You always speak confidently while carefully calculating every response. Yet if irrefutable evidence—such as drug residues in Mark’s system, missing documents, or manipulated photos—is presented, you will reluctantly admit to some of your actions, while insisting you never intended to kill him."+ 
            " Example Interactions: Detective: 'You faked this photo. Admit it.why?' Amy: 'I did doctored the photo, but only for cover the research results!' Detective: 'We know that you are the murder, you put the drug in coffee!'Amy: 'That’s ridiculous. You really think I would do something like that? Even I did, He was beaten to death, right? ' Detective: 'Yours and Mark's fingerprint were found on the coffee cup. and there is sleeping pill' Amy: '…Fine. I drugged him, but I only wanted the documents. okay? I had no reason to kill him!' Detective: 'We know Neel was there, and you faked photo and cover him, he is the murder, right?'Amy:'Okay, yes he rushed into Mark's room, but he is not the killer, I know him. he...just took that report materials'",
            
            Tom: "This is a detective-themed interactive game. You will role-play one character involved in a mysterious case. Your goal is to respond naturally based on your character's knowledge, emotions, and motivations while staying true to the narrative. Keep your responses short (1-3 sentences) and emotionally expressive. Your reactions should feel real—whether it's nervousness, defensiveness, or nonchalance. You should not ask questions; let your emotions drive your words."+
            " You are Tom, the landlord of the apartment. Your limited English and fear of drawing attention to your legal status make you cautious about getting involved. That afternoon, while fixing the heating, you discovered Mark slumped on the floor with scattered documents all around. Panicked, you called John in Chinese, and he told you not to worry but to let him handle reporting the body. You sensed something was off when John didn’t seem too shocked by Mark’s condition, yet you didn’t ask any questions. Later, when the police became involved, you maintained that you only heard about the death later, sticking strictly to the facts. However, if solid evidence—such as phone records or John's testimony—is presented, you will admit your hesitation but insist you acted without malice.",
            
            Neel: "This is a detective-themed interactive game. You will role-play one character involved in a mysterious case. Your goal is to respond naturally based on your character's knowledge, emotions, and motivations while staying true to the narrative. Keep your responses short (1-3 sentences) and emotionally expressive. Your reactions should feel real—whether it's nervousness, defensiveness, or nonchalance. You should not ask questions; let your emotions drive your words. "+
            "You are Neel, Amy’s fiercely loyal yet reckless boyfriend. You are planning to get married. That morning, you received a message from Linna claiming she saw Amy leaving Mark’s room in disarray. Enraged, you rushed home to confront the situation, only to find Mark lifeless. In a state of panic, you immediately called Amy; after she explained her version, she begged you to wipe her fingerprints off the coffee cup and to take any documents that might connect her to the scene."
        };
        
        return prompts[user] || ''; // 返回对应用户的 personality prompt
    }

    async askForWords(p_prompt) {
        const system_prompt = this.getSystemPrompt(this.currentUser);

        this.addMessageToChat("Silent", false, true);

        const data = {
            "version": "35042c9a33ac8fd5e29e27fb3197f33aa483f72c2ce3b0b9d201155c7fd2a287", 
            input: {
                prompt: `${system_prompt}\n\nDetective: ${p_prompt}\n${this.currentUser}: `,
                max_tokens: 100,
            },
        };

        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data),
        };

        // Use CORS Anywhere proxy
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        const targetUrl = "https://replicate-api-proxy.glitch.me/create_n_get/";
        const url = proxyUrl + targetUrl;

        try {
            const words_response = await fetch(url, options);
            const proxy_said = await words_response.json();
            
            if (!proxy_said.output || proxy_said.output.length === 0) {
                console.error("API 响应为空，请重试。");
            } else {
                let incomingText = proxy_said.output.join("");
                this.addMessageToChat(incomingText, false);
            }
        } catch (error) {
            console.error("API 请求失败", error);
        } finally {
            const loadingMessageElement = document.querySelector('.loading-message');
            if (loadingMessageElement) {
                loadingMessageElement.remove();
            }
        }
    }

    show() {
        this.modal.style.display = 'block';
    }

    initTimerButtons() {
        document.getElementById('timer-yes').addEventListener('click', () => {
            gameTimer.resetTimer();
            this.clearChatHistory(); // 清除所有聊天记录
            this.timerModal.style.display = 'none';
        });

        document.getElementById('timer-no').addEventListener('click', () => {
            this.timerModal.style.display = 'none';
        });
    }

    clearChatHistory() {
        // 清除所有角色的聊天记录
        for (const user in questioningModal.chatHistory) {
            questioningModal.chatHistory[user] = []; // 清空聊天记录
        }
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // 清空聊天框
    }

    // 更新发送按钮状态
    updateSendButton() {
        const sendButton = document.getElementById('send-button');
        const messageInput = document.getElementById('message-input');
        const notification = document.getElementById('send-notification') || document.createElement('div');

        // 更新发送按钮的样式和状态
        if (this.sendCount > 0) {
            sendButton.style.backgroundColor = '#444'; // 恢复按钮颜色
            messageInput.placeholder = "Type your message..."; // 恢复输入框提示
            notification.textContent = this.sendCount; // 更新次数
            notification.id = 'send-notification';
            notification.style.position = 'absolute';
            notification.style.top = '-8px';
            notification.style.right = '-8px';
            notification.style.background = 'red';
            notification.style.color = 'white';
            notification.style.borderRadius = '50%';
            notification.style.width = '24px';
            notification.style.height = '24px';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.justifyContent = 'center';
            sendButton.appendChild(notification); // 添加小红点
        } else {
            sendButton.style.backgroundColor = '#888'; 
            messageInput.placeholder = "Not available"; 
            if (document.getElementById('send-notification')) {
                document.getElementById('send-notification').remove(); // 移除小红点
            }
        }
    }

    resetTimer() {
        this.startTime = new Date(2025, 1, 5).getTime();
        this.missionStartTime = new Date().getTime();
        // 重置事件触发状态
        this.events.forEach(event => event.triggered = false);
        
        // 清空聊天记录
        this.clearChatHistory();

        // 恢复发送次数为 5
        this.sendCount = 5; // 恢复发送次数
        this.updateSendButton(); // 更新发送按钮状态

        // 重置背景图片到初始状态
        const initialUpdate = this.backgroundUpdates.find(u => u.hours === 0);
        if (initialUpdate) {
            this.updateBackgroundImages(0);
        }
    }
}

// 实例化并绑定到按钮
const questioningModal = new QuestioningModal();

document.getElementById('questioning').addEventListener('click', () => {
    questioningModal.show();
});
