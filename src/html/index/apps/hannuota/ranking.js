export default {
    save(page, discCount, elapsedTime, playerName = 'Player') {
        const newRecord = {
            playerName,
            discCount,
            elapsedTime: Number(elapsedTime),
            timestamp: new Date().toISOString()
        };
        
        if (!page.rankings[discCount]) {
            page.rankings[discCount] = [];
        }
        
        page.rankings[discCount].push(newRecord);
        page.rankings[discCount].sort((a, b) => a.elapsedTime - b.elapsedTime);
        page.rankings[discCount] = page.rankings[discCount].slice(0, 10);
        localStorage.setItem('hannuotaRankings', JSON.stringify(page.rankings));

        this.refresh(page); // 这一行代码不能删
    },
    refresh(page) {
        console.log('refresh');
            this.load(page);
            page.sortedDiscCountsMethod();
    },
    load(page) {
        const storedRankings = localStorage.getItem('hannuotaRankings');
        page.rankings = storedRankings ? JSON.parse(storedRankings) : {};
        page.sortedDiscCountsMethod();
    },
    clear(page) {
        // 清空页面的排名数据
        page.rankings = [];
        // 从本地存储中删除排名数据
        localStorage.removeItem('hannuotaRankings');

        this.refresh(page);
    },
    // 其他相关的函数和逻辑
    // ...
    // 例如：save, load, clear, updateRankingDat
};