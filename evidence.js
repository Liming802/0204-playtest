const evidenceData = {
    en: [
        {
            id: 1,
            name: "Evidence 1",
            image: "path/to/image1.jpg",
            description: "This is the detailed description of Evidence 1"
        },
        {
            id: 2,
            name: "Evidence 2",
            image: "path/to/image2.jpg",
            description: "This is the detailed description of Evidence 2"
        },
        {
            id: 3,
            name: "Evidence 3",
            image: "path/to/image3.jpg",
            description: "This is the detailed description of Evidence 3"
        },
        {
            id: 4,
            name: "Evidence 4",
            image: "path/to/image4.jpg",
            description: "This is the detailed description of Evidence 4"
        },
        {
            id: 5,
            name: "Evidence 5",
            image: "path/to/image5.jpg",
            description: "This is the detailed description of Evidence 5"
        }
    ],
    zh: [
        {
            id: 1,
            name: "物证1",
            image: "path/to/image1.jpg",
            description: "这是物证1的详细描述"
        },
        {
            id: 2,
            name: "物证2",
            image: "path/to/image2.jpg",
            description: "这是物证2的详细描述"
        },
        {
            id: 3,
            name: "物证3",
            image: "path/to/image3.jpg",
            description: "这是物证3的详细描述"
        },
        {
            id: 4,
            name: "物证4",
            image: "path/to/image4.jpg",
            description: "这是物证4的详细描述"
        },
        {
            id: 5,
            name: "物证5",
            image: "path/to/image5.jpg",
            description: "这是物证5的详细描述"
        }
    ]
};

class EvidencePage {
    constructor() {
        this.currentLang = 'en';
        this.createEvidenceModal();
        this.modal = document.getElementById('evidence-management-modal');
        this.setupEvidenceItems();
        this.bindEvents();
    }

    createEvidenceModal() {
        const modal = document.createElement('div');
        modal.id = 'evidence-management-modal';
        modal.className = 'modal';
        
        // 使用当前语言的翻译
        const t = translations[this.currentLang];
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${t.evidenceManagement}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="evidence-container">
                        <div class="evidence-list">
                            <!-- Evidence items will be added here -->
                        </div>
                        <div class="evidence-categories">
                            <div class="category" id="conviction">
                                <h3>${t.conviction}</h3>
                                <div class="category-content" data-category="conviction"></div>
                            </div>
                            <div class="category" id="important">
                                <h3>${t.important}</h3>
                                <div class="category-content" data-category="important"></div>
                            </div>
                            <div class="category" id="related">
                                <h3>${t.related}</h3>
                                <div class="category-content" data-category="related"></div>
                            </div>
                            <div class="category" id="other">
                                <h3>${t.other}</h3>
                                <div class="category-content" data-category="other"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    setupEvidenceItems() {
        const evidenceList = document.querySelector('.evidence-list');
        evidenceList.innerHTML = ''; // 清空现有内容
        evidenceData[this.currentLang].forEach(item => {
            const itemElement = this.createEvidenceItem(item);
            evidenceList.appendChild(itemElement);
        });
    }

    createEvidenceItem(item) {
        const div = document.createElement('div');
        div.className = 'evidence-item';
        div.draggable = true;
        div.dataset.id = item.id;
        div.innerHTML = `
            <span class="evidence-name">${item.name}</span>
            <button class="info-btn">!</button>
        `;
        return div;
    }

    bindEvents() {
        // 绑定拖拽事件
        const evidenceItems = document.querySelectorAll('.evidence-item');
        evidenceItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            
            // 为每个物证的感叹号按钮添加点击事件
            const infoBtn = item.querySelector('.info-btn');
            if (infoBtn) {
                infoBtn.addEventListener('click', (e) => this.showEvidenceInfo(e));
            }
        });

        // 绑定分类区域的拖放事件
        const categoryContents = document.querySelectorAll('.category-content');
        categoryContents.forEach(category => {
            category.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            category.addEventListener('drop', (e) => this.handleDrop(e));
        });

        // 绑定关闭按钮事件
        const closeBtn = this.modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const evidenceId = e.dataTransfer.getData('text/plain');
        const category = e.target.closest('.category-content');
        if (category) {
            this.moveEvidenceToCategory(evidenceId, category);
        }
    }

    moveEvidenceToCategory(evidenceId, category) {
        // 检查目标分类是否已经存在该物证
        const existingInCategory = category.querySelector(`[data-id="${evidenceId}"]`);
        if (existingInCategory) {
            return;
        }

        // 创建新的物证元素
        const evidence = evidenceData[this.currentLang].find(e => e.id === parseInt(evidenceId));
        if (!evidence) return;

        const evidenceItem = document.createElement('div');
        evidenceItem.className = 'evidence-item';
        evidenceItem.draggable = true;
        evidenceItem.dataset.id = evidence.id;
        evidenceItem.innerHTML = `
            <span class="evidence-name">${evidence.name}</span>
            <button class="info-btn">!</button>
        `;

        // 从所有分类区域中移除该物证
        document.querySelectorAll('.category-content').forEach(content => {
            const itemToRemove = content.querySelector(`[data-id="${evidenceId}"]`);
            if (itemToRemove) {
                itemToRemove.remove();
            }
        });

        // 添加到新分类
        category.appendChild(evidenceItem);

        // 绑定新物证的事件
        evidenceItem.addEventListener('dragstart', (e) => this.handleDragStart(e));
        const infoBtn = evidenceItem.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => this.showEvidenceInfo(e));
        }

        // 添加点击删除功能
        evidenceItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('info-btn')) {
                evidenceItem.remove();
            }
        });
    }

    showEvidenceInfo(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const evidenceId = e.target.closest('.evidence-item').dataset.id;
        const evidence = evidenceData[this.currentLang].find(item => item.id === parseInt(evidenceId));
        
        let detailPanel = document.querySelector('.evidence-detail-panel');
        if (!detailPanel) {
            detailPanel = document.createElement('div');
            detailPanel.className = 'evidence-detail-panel';
            document.querySelector('.evidence-categories').appendChild(detailPanel);
        }
        
        detailPanel.innerHTML = `
            <div class="detail-header">
                <h3>${evidence.name}</h3>
                <button class="close-detail">×</button>
            </div>
            <div class="detail-content">
                <img src="${evidence.image}" alt="${evidence.name}">
                <p>${evidence.description}</p>
            </div>
        `;

        detailPanel.style.display = 'block';

        // 绑定详情面板的关闭按钮
        const closeDetailBtn = detailPanel.querySelector('.close-detail');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => {
                detailPanel.style.display = 'none';
            });
        }
    }

    // 添加语言更新方法
    updateLanguage(lang) {
        this.currentLang = lang;
        const t = translations[this.currentLang];
        
        // 更新分类标题
        const modal = document.getElementById('evidence-management-modal');
        modal.querySelector('.modal-header h2').textContent = t.evidenceManagement;
        modal.querySelector('#conviction h3').textContent = t.conviction;
        modal.querySelector('#important h3').textContent = t.important;
        modal.querySelector('#related h3').textContent = t.related;
        modal.querySelector('#other h3').textContent = t.other;

        // 更新物证列表
        this.setupEvidenceItems();
        
        // 更新已分类的物证
        document.querySelectorAll('.category-content').forEach(category => {
            const items = category.querySelectorAll('.evidence-item');
            items.forEach(item => {
                const id = parseInt(item.dataset.id);
                const evidence = evidenceData[this.currentLang].find(e => e.id === id);
                if (evidence) {
                    item.querySelector('.evidence-name').textContent = evidence.name;
                }
            });
        });
    }
} 