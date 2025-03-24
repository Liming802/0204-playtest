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
            // 构建系统提示
            const systemPrompt = `You are the Truth Verification System for the detective game. 
            As an AI judge, your role is to evaluate the detective's conclusion about the culprit.
            Respond as if you are the verification system, analyzing the detective's conclusion.
            reveal the full truth and correct user's thought.
            Give feedback on their reasoning and evidence interpretation.
            
            The truth is: Linna killed Mark by hitting him with a bat after drugging him. Her motive was revenge for exploitation and to steal drugs and money. Amy drugged Mark's coffee to retrieve blackmail documents. John tampered with the crime scene to hide evidence of his forged contracts. Tom discovered the body but was afraid to report it directly.`;

            const userPrompt = `The detective has concluded that ${suspect} is the culprit, with the following reasoning:
            ${reasoning}
            
            Provide an evaluation of this conclusion. Indicate if they're on the right track and provide hints about their reasoning without directly confirming the murderer.`;


            const data = {
                "model": "meta/meta-llama-3-8b-instruct",
                input: {
                    prompt: `${systemPrompt}\n\nUser: ${userPrompt}\nVerification System:`,
                    temperature: 0.5,
                    top_p: 1,
                    max_new_tokens: 300, // 增加token数以获取详细分析
                },
            };
        
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(data)
            };
        
            // 使用与 questioning.js 相同的 Cloudflare Worker URL
            const url = "https://restless-breeze-024b.liming970603.workers.dev/";
            
            console.log("发送结论验证请求到 API...");
            const words_response = await fetch(url, options);
            
            if (!words_response.ok) {
                console.error(`API 响应错误: ${words_response.status} ${words_response.statusText}`);
                throw new Error(`API response error: ${words_response.status}`);
            }
            
            // 解析响应
            const responseText = await words_response.text();
            console.log("API 原始响应:", responseText);
            
            try {
                const proxy_said = JSON.parse(responseText);
                
                // 处理 Replicate API 响应格式
                if (!proxy_said.output || proxy_said.output.length === 0) {
                    console.error("API 响应为空，请重试。", proxy_said);
                    this.displayVerificationResult("System error: Could not verify your conclusion. Please try again later.");
                } else {
                    // 连接输出数组中的所有文本
                    let incomingText = proxy_said.output.join("");
                    this.displayVerificationResult(incomingText);
                }
            } catch (parseError) {
                console.error("解析 API 响应失败:", parseError);
                console.log("原始响应内容:", responseText);
                this.displayVerificationResult("System error: Could not parse verification results. Please try again later.");
            }
        } catch (error) {
            console.error("验证请求失败", error);
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