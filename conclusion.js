class ConclusionManager {
    constructor() {
        this.modal = new Modal();
        this.savedData = {
            suspect: '',
            reasoning: ''
        };
        this.initButton();
    }

    initButton() {
        document.getElementById('conclusion').addEventListener('click', () => {
            this.showConclusionModal();
        });
    }

    showConclusionModal() {
        const content = `
            <div class="conclusion-form">
                <div class="form-group">
                    <label for="suspect">Who is the culprit?</label>
                    <textarea id="suspect" placeholder="Enter the name of the suspect...">${this.savedData.suspect}</textarea>
                </div>
                <div class="form-group">
                    <label for="reasoning">What is your reasoning and evidence?</label>
                    <textarea id="reasoning" placeholder="Explain your reasoning and list the supporting evidence...">${this.savedData.reasoning}</textarea>
                </div>
                <div class="conclusion-buttons">
                    <button class="conclusion-button-submit">Submit</button>
                    <button class="conclusion-button-save">Save Draft</button>
                </div>
            </div>
        `;

        this.modal.show('Case Conclusion', content);

        // 添加按钮事件监听
        document.querySelector('.conclusion-button-submit').addEventListener('click', () => {
            this.submitConclusion();
        });

        document.querySelector('.conclusion-button-save').addEventListener('click', () => {
            this.saveConclusion();
        });
    }

    saveConclusion() {
        this.savedData = {
            suspect: document.getElementById('suspect').value,
            reasoning: document.getElementById('reasoning').value
        };
        // 保存到 localStorage
        localStorage.setItem('conclusionDraft', JSON.stringify(this.savedData));
        alert('Draft saved successfully!');
    }

    submitConclusion() {
        const suspect = document.getElementById('suspect').value;
        const reasoning = document.getElementById('reasoning').value;

        if (!suspect || !reasoning) {
            alert('Please fill in both fields before submitting.');
            return;
        }

        // 保存当前输入内容
        this.savedData = {
            suspect: suspect,
            reasoning: reasoning
        };
        localStorage.setItem('conclusionDraft', JSON.stringify(this.savedData));

        // 显示加载状态
        const modalBody = document.querySelector('#modal .modal-body');
        modalBody.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Analyzing your conclusion...</p>
            </div>
        `;

        // 调用 API 验证结论
        this.checkConclusion(suspect, reasoning);
    }

    async checkConclusion(suspect, reasoning) {
        try {
            // 构建系统提示，类似于 questioning.js 中的 getSystemPrompt
            const systemPrompt = `You are the Truth Verification System for the detective game. 
            As an AI judge, your role is to evaluate the detective's conclusion about the culprit.
            Respond as if you are the verification system, analyzing the detective's conclusion.
            Be factual but cryptic - don't reveal the full truth, only hint if they're on the right track.
            Give feedback on their reasoning and evidence interpretation.
            
            The truth is: Linna killed Mark by hitting him with a bat after drugging him. Her motive was revenge for exploitation and to steal drugs and money. Amy drugged Mark's coffee to retrieve blackmail documents. John tampered with the crime scene to hide evidence of his forged contracts. Tom discovered the body but was afraid to report it directly.`;

            // 构建用户提示文本
            const userPrompt = `The detective has concluded that ${suspect} is the culprit, with the following reasoning:
            ${reasoning}
            
            Provide an evaluation of this conclusion. Indicate if they're on the right track and provide hints about their reasoning without directly confirming the murderer.`;

            // 使用 DeepSeek API
            const apiKey = "sk-cdba29d487ad43f483fbad11c3f07cef"; // 与 questioning.js 使用相同的 API 密钥
            
            const data = {
                model: "gpt-3.5-turbo",  // 可以选择 gpt-3.5-turbo 或 gpt-4
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 300,  // 生成的最大字数，结论分析需要更多字数
            };
            
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`, // 使用 Bearer token
                },
                body: JSON.stringify(data),
            };
            
            const url = "https://api.deepseek.com/completions"; // DeepSeek API URL

            const words_response = await fetch(url, options);
            const responseData = await words_response.json();
            
            if (!responseData.choices || responseData.choices.length === 0) {
                console.error("API 响应为空，请重试。");
                this.displayVerificationResult("System error: Could not verify your conclusion. Please try again later.");
            } else {
                let incomingText = responseData.choices[0].message.content;
                this.displayVerificationResult(incomingText);
            }
        } catch (error) {
            console.error("API 请求失败", error);
            this.displayVerificationResult("System error: Could not connect to verification system. Please try again later.");
        } finally {
            // 确保无论成功或失败，都移除加载指示器
            const loadingContainer = document.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.remove();
            }
        }
    }

    displayVerificationResult(resultText) {
        // 处理响应
        let formattedResult = resultText || "No analysis available.";

        // 显示结果
        const modalBody = document.querySelector('#modal .modal-body');
        modalBody.innerHTML = `
            <div class="conclusion-result">
                <div class="conclusion-data">
                    <h3>Your Conclusion</h3>
                    <div class="conclusion-section">
                        <h4>Suspect:</h4>
                        <p>${this.savedData.suspect}</p>
                    </div>
                    <div class="conclusion-section">
                        <h4>Reasoning:</h4>
                        <p>${this.savedData.reasoning}</p>
                    </div>
                </div>
                <div class="verification-result">
                    <h3>Verification System Analysis</h3>
                    <div class="system-response">
                        ${formattedResult.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <button class="conclusion-button-close">Return</button>
            </div>
        `;

        // 添加关闭按钮事件
        document.querySelector('.conclusion-button-close').addEventListener('click', () => {
            this.showConclusionModal(); // 返回到结论表单
        });
    }

    loadSavedData() {
        // 从 localStorage 加载保存的草稿
        const savedDraft = localStorage.getItem('conclusionDraft');
        if (savedDraft) {
            try {
                this.savedData = JSON.parse(savedDraft);
            } catch (error) {
                console.error('Error parsing saved conclusion draft:', error);
                this.savedData = { suspect: '', reasoning: '' };
            }
        }
    }
}

// 初始化结案管理器
const conclusionManager = new ConclusionManager();
conclusionManager.loadSavedData(); 