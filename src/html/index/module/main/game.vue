<template>
  <div class="game-container">
    <div class="game-list">
      <div v-for="game in games" 
           :key="game.id" 
           class="game-item"
           @click="enterGame(game.id)">
        <div class="game-icon">
            <img :src="`/html/index/app/${game.id}/${game.icon}`" :alt="game.name">
        </div>
        <div class="game-name">{{ game.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../util/api.js';
export default {
  data() {
    return {
      games: {}
    }
  },
  
  created() {
    this.loadGames()
  },
  
  methods: {
    loadGames() {
      api.getGameData(res => {
        this.games = res;
      })
    },
    
    enterGame(id) {
      this.$router.push(`/game/${id}`)
    }
  }
}
</script>

<style lang="less" scoped>
.game-container {
  padding: 20px;
  
  .game-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .game-item {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .game-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 10px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    
    .game-name {
      font-size: 16px;
      color: #333;
      margin-top: 10px;
    }
  }
}
</style>