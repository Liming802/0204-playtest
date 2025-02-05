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

        // 这里可以添加提交逻辑
        console.log('Conclusion submitted:', { suspect, reasoning });
        alert('Conclusion submitted successfully!');
        this.modal.hide();
    }

    loadSavedData() {
        // 实现加载保存的数据逻辑
    }
}

// 初始化结案管理器
const conclusionManager = new ConclusionManager();
conclusionManager.loadSavedData(); 