// Auto-update system for One Piece Arena
class AutoUpdater {
    constructor() {
        this.currentVersion = '2.0.0';
        this.currentVersionCode = 2;
        this.checkInterval = 3600000; // 1 hour
        this.updateCheckUrl = '/version.json';
        this.isChecking = false;
    }

    async init() {
        await this.checkForUpdates();
        setInterval(() => this.checkForUpdates(), this.checkInterval);

        const lastCheck = localStorage.getItem('lastUpdateCheck');
        if (!lastCheck || Date.now() - parseInt(lastCheck) > this.checkInterval) {
            await this.checkForUpdates();
        }
    }

    async checkForUpdates() {
        if (this.isChecking) return;

        try {
            this.isChecking = true;
            const response = await fetch(this.updateCheckUrl + '?t=' + Date.now());
            const data = await response.json();

            localStorage.setItem('lastUpdateCheck', Date.now().toString());

            if (data.versionCode > this.currentVersionCode) {
                this.showUpdateNotification(data);
            }
        } catch (error) {
            console.error('Update check failed:', error);
        } finally {
            this.isChecking = false;
        }
    }

    showUpdateNotification(updateInfo) {
        const existingNotif = document.getElementById('update-notification');
        if (existingNotif) existingNotif.remove();

        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.className = 'update-notification';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        const title = document.createElement('h3');
        title.textContent = `Phiên bản mới ${updateInfo.version} có sẵn!`;

        const changelogList = document.createElement('ul');
        updateInfo.changelog.forEach(change => {
            const li = document.createElement('li');
            li.textContent = change;
            changelogList.appendChild(li);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'update-buttons';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Tải về ngay';
        downloadBtn.className = 'update-btn download-btn';
        downloadBtn.onclick = () => this.downloadUpdate(updateInfo);

        const laterBtn = document.createElement('button');
        laterBtn.textContent = updateInfo.forceUpdate ? 'Bắt buộc cập nhật' : 'Để sau';
        laterBtn.className = 'update-btn later-btn';
        laterBtn.disabled = updateInfo.forceUpdate;
        laterBtn.onclick = () => this.dismissNotification();

        buttonContainer.appendChild(downloadBtn);
        if (!updateInfo.forceUpdate) {
            buttonContainer.appendChild(laterBtn);
        }

        notification.appendChild(title);
        notification.appendChild(changelogList);
        notification.appendChild(buttonContainer);

        document.body.appendChild(notification);

        this.announceUpdate(updateInfo);
    }

    announceUpdate(updateInfo) {
        const message = `Có phiên bản mới ${updateInfo.version}. ${updateInfo.changelog.join('. ')}. Nhấn nút tải về để cập nhật.`;

        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    downloadUpdate(updateInfo) {
        const link = document.createElement('a');
        link.href = updateInfo.downloadUrl;
        link.download = `OnePieceArena-v${updateInfo.version}.apk`;
        link.click();

        const message = 'Đang tải xuống bản cập nhật. Sau khi tải xong, mở file APK để cài đặt.';
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'vi-VN';
            window.speechSynthesis.speak(utterance);
        }

        this.dismissNotification();
    }

    dismissNotification() {
        const notification = document.getElementById('update-notification');
        if (notification) {
            notification.remove();
        }
    }

    async manualCheck() {
        const message = 'Đang kiểm tra cập nhật...';
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'vi-VN';
            window.speechSynthesis.speak(utterance);
        }

        await this.checkForUpdates();

        if (!document.getElementById('update-notification')) {
            const noUpdateMsg = 'Bạn đang sử dụng phiên bản mới nhất.';
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(noUpdateMsg);
                utterance.lang = 'vi-VN';
                window.speechSynthesis.speak(utterance);
            }
        }
    }
}

const autoUpdater = new AutoUpdater();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoUpdater.init());
} else {
    autoUpdater.init();
}
