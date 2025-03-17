<template>
  <div class="ranking-container">
    <h3>排行榜</h3>
    <div class="ranking-list">
      <div v-if="rankings.length === 0" class="no-data">
        暂无记录
      </div>
      <div v-else v-for="(item, index) in rankings" :key="index" class="ranking-item">
        <span class="rank">{{ index + 1 }}</span>
        <span class="player-name">{{ item.name || '玩家' + (index + 1) }}</span>
        <span class="score">{{ item.score }}</span>
        <span class="date">{{ formatDate(item.date) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ranking',
  data() {
    return {
      rankings: []
    }
  },
  methods: {
    addScore(score) {
      const newRecord = {
        score,
        date: new Date().getTime(),
        name: '玩家' + (this.rankings.length + 1)
      }
      
      this.rankings.push(newRecord)
      this.rankings.sort((a, b) => b.score - a.score)
      
      // 只保留前10名
      if (this.rankings.length > 10) {
        this.rankings = this.rankings.slice(0, 10)
      }
      
      // 保存到本地存储
      localStorage.setItem('snakeRankings', JSON.stringify(this.rankings))
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    loadRankings() {
      const savedRankings = localStorage.getItem('snakeRankings')
      if (savedRankings) {
        this.rankings = JSON.parse(savedRankings)
      }
    }
  },
  created() {
    this.loadRankings()
  }
}
</script>

<style scoped>
.ranking-container {
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 15px;
  text-align: center;
  color: #2c3e50;
}

.ranking-list {
  max-height: 300px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank {
  width: 30px;
  font-weight: bold;
  color: #e74c3c;
}

.player-name {
  flex: 1;
  margin: 0 10px;
}

.score {
  width: 60px;
  text-align: right;
  color: #2ecc71;
  font-weight: bold;
}

.date {
  width: 100px;
  text-align: right;
  color: #7f8c8d;
  font-size: 0.9em;
}

.no-data {
  text-align: center;
  color: #95a5a6;
  padding: 20px;
}
</style>