<template>
  <div class="game-container">
    <div class="game-list">
      <div v-for="game in games" 
           :key="game.id" 
           class="game-item"
           @click="enterGame(game.id)">
        <div class="game-icon">
            <template v-if="game.icon != null && game.icon.indexOf('.png') != -1">
              <img :src="gameIcon(game)" :alt="game.name">
            </template>
            <template v-else>
              <span style="font-size:30px; color:cadetblue;">{{game.icon}}</span>
            </template>
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
    gameIcon(game) {
      return `/html/index/apps/${game.id}/${game.icon}`;
    },
    loadGames() {
      api.getGameData(res => {
        console.log('game data', res);
        this.games = res;
      })
    },
    
    enterGame(id) {
      // TODO 先获取游戏数据
      this.$router.push(`/game/${id}`)
    }
  }
}
</script>

<style lang="less" scoped>
.game-container {
  padding: 20px;
  width: 1300px; 
  margin:0 auto;

  // 增加移动设备宽度100%
  @media screen and (max-width: 768px) {
    padding: 10px !important;
    width: calc(100% - 20px) !important;
  }
  
  .game-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 20px;
    
    @media screen and (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
      gap: 10px;
    }
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
      width: 30px;
      height: 30px;
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