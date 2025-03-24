class DetectiveManager {
    constructor() {
        this.detectives = {
            poirot: {
                name: "Hercule Poirot",
                title: "Private Detective",
                image: "./images/detective.png",
                avatarImage: "./images/Me.png",
                background: "A former Belgian police officer turned private detective, is known for his sharp intellect, psychological insight, and obsession with order,  believing that 'the little grey cells' hold the key to solving any mystery.",
                skillTitle: "Special Ability: Grey Cells",
                skillText: "In each game, key evidence marked with grey cells will be randomly triggered.",
                labPoints: 10,
                techPoints: 8
            },
            Holmes:{
                name: "Sherlock Holmes",
                title: "Consulting Detective",
                image: "./images/sherlock.jpg",
                avatarImage: "./images/sherlock2.jpg",
                background: "A brilliant detective from London, known for his unmatched deductive reasoning, keen observation skills, and ability to solve the most complex of cases.",
                skillTitle: "Special Ability: The Mind Palace",
                skillText: "In each game, SherSherlock can visualize mysterious connections between related pieces of evidences.",
                labPoints: 6,
                techPoints: 7
            }
        };
        this.currentDetective = 'poirot';
        this.initializeEventListeners();
        this.updateMainPoints();
        
        // 初始化时设置切换按钮文本
        this.updateSwitchButton();
    }

    initializeEventListeners() {
        const switchButton = document.getElementById('detective-switch');
        if (switchButton) {
            switchButton.addEventListener('click', () => this.switchDetective());
        }
        
        const mainSwitchButton = document.getElementById('main-detective-switch');
        if (mainSwitchButton) {
            mainSwitchButton.addEventListener('click', () => this.switchDetective());
        }
    }

    async switchDetective() {
        // 添加切换动画类
        this.addSwitchingAnimation();

        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 300));

        // 切换侦探
        this.currentDetective = this.currentDetective === 'poirot' ? 'Holmes' : 'poirot';
        const detective = this.detectives[this.currentDetective];

        // 更新内容
        this.updateDetectiveContent(detective);

        // 更新切换按钮文本
        this.updateSwitchButton();

        // 更新主界面的点数显示
        this.updateMainPoints();

        // 更新外部侦探头像
        this.updateExternalAvatar(detective);

        // 移除切换动画类
        setTimeout(() => this.removeSwitchingAnimation(), 300);
    }

    // 更新主界面的点数显示
    updateMainPoints() {
        const detective = this.detectives[this.currentDetective];
        this.updatePointsWithAnimation('main-lab-points', detective.labPoints);
        this.updatePointsWithAnimation('main-tech-points', detective.techPoints);
    }

    // 使用动画更新点数
    updatePointsWithAnimation(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('changing');
            element.textContent = newValue;
            setTimeout(() => element.classList.remove('changing'), 300);
        }
    }

    // 修改点数的方法
    modifyPoints(type, amount) {
        const detective = this.detectives[this.currentDetective];
        const pointType = type.toLowerCase() === 'lab' ? 'labPoints' : 'techPoints';
        const currentPoints = detective[pointType];
        const newPoints = Math.max(0, currentPoints + amount); // 确保点数不会小于0
        detective[pointType] = newPoints;

        // 更新显示
        const mainElementId = `main-${type.toLowerCase()}-points`;
        const cardElementId = type.toLowerCase() === 'lab' ? 'lab-point' : 'tech-point';
        
        this.updatePointsWithAnimation(mainElementId, newPoints);
        this.updatePointsWithAnimation(cardElementId, newPoints);

        // 检查点数是否不足
        const container = document.querySelector(`.${type.toLowerCase()}-points`);
        if (container) {
            if (newPoints === 0) {
                container.classList.add('insufficient');
            } else {
                container.classList.remove('insufficient');
            }
        }

        return newPoints;
    }

    // 检查是否有足够的点数
    hasEnoughPoints(type, amount) {
        const detective = this.detectives[this.currentDetective];
        const pointType = type.toLowerCase() === 'lab' ? 'labPoints' : 'techPoints';
        return detective[pointType] >= amount;
    }

    addSwitchingAnimation() {
        document.getElementById('detective-profile-img').classList.add('switching');
        document.querySelector('.info-section').classList.add('switching');
        document.querySelector('.skill-section').classList.add('switching');
    }

    removeSwitchingAnimation() {
        document.getElementById('detective-profile-img').classList.remove('switching');
        document.querySelector('.info-section').classList.remove('switching');
        document.querySelector('.skill-section').classList.remove('switching');
    }

    updateDetectiveContent(detective) {
        // 更新头像
        document.getElementById('detective-profile-img').src = detective.image;
        
        // 更新名称和头衔
        document.querySelector('.detective-name').textContent = detective.name;
        document.querySelector('.detective-title').textContent = detective.title;
        
        // 更新背景信息
        document.getElementById('detective-background-text').textContent = detective.background;
        
        // 更新技能信息
        document.getElementById('detective-skill-title').textContent = detective.skillTitle;
        document.getElementById('detective-skill-text').textContent = detective.skillText;
        
        // 更新属性点数
        document.getElementById('lab-point').textContent = detective.labPoints;
        document.getElementById('tech-point').textContent = detective.techPoints;
    }

    updateSwitchButton() {
        const currentName = this.currentDetective === 'poirot' ? 'Poirot' : 'Holmes';
        const nextName = this.currentDetective === 'poirot' ? 'Holmes' : 'Poirot';
        
        const switchButtons = document.querySelectorAll('.detective-switch');
        switchButtons.forEach(button => {
            button.querySelector('.current-detective').textContent = currentName;
            button.querySelector('.next-detective').textContent = nextName;
        });
    }
    
    // 更新外部侦探头像
    updateExternalAvatar(detective) {
        const avatarElement = document.getElementById('detective-avatar');
        if (avatarElement) {
            avatarElement.src = detective.avatarImage;
        }
    }
}

// 初始化侦探管理器
document.addEventListener('DOMContentLoaded', () => {
    window.detectiveManager = new DetectiveManager();
});

// 使用示例：
// 消耗点数：detectiveManager.modifyPoints('lab', -2);
// 增加点数：detectiveManager.modifyPoints('tech', 1);
// 检查点数：if (detectiveManager.hasEnoughPoints('lab', 3)) { ... } 