<template>
  <div class="hannuota" v-if="init">
    <h1>{{ $t('hannuota.title') }}</h1>
    <div>
      <label for="discs">{{ $t('hannuota.discs') }}: </label>
      <input type="number" id="discs" v-model="discCount" min="1">
      <button @click="initGame">{{ $t('hannuota.start') }}</button>
    </div>
    <div style="margin-left: 1rem;">
      <label for="discs">{{ $t('hannuota.aiStep') }}</label>
      <input type="number" id="discs" v-model="gameFast" min="1">
      <button @click="startAutoGame">{{ $t('hannuota.auto') }}</button>
    </div>

    <div class="towers">
      <div v-for="(tower, index) in towers" :key="index" class="tower" @click="selectTower(index)">
        <div v-for="(disc, discIndex) in tower" :key="discIndex" :style="{ width: disc * 20 + 'px' }" class="disc">
        </div>
      </div>
    </div>
    <p v-if="message">{{ message }}</p>
    <p v-if="elapsedTime">{{ $t('hannuota.elapsedTime') }}: {{ elapsedTime }} {{ $t('hannuota.seconds') }}</p>
    <button v-if="gameOver" @click="initGame">{{ $t('hannuota.reset') }}</button>

    <ranking-vue ref="ranking" />
  </div>
</template>

<script>
import autoGame from './autoGame.js';
import RankingVue from './ranking.vue';

export default {
  components: {
    RankingVue  // 注册组件
  },
  data() {
    return {
      init: false,
      discCount: 3,
      gameFast: 0.1, // 游戏速度，数字表示时间，单位秒，每多少秒移动一个圆盘
      towers: [],
      selectedTower: null,
      message: '',
      gameOver: false,
      startTime: null,
      elapsedTime: null,
      rankings: []
    };
  },
  methods: {
    initGame() {
      // 最大圆盘数量为9
      if (this.discCount > 9) {
        this.discCount = 9;
      }
      // 最小圆盘数量为3
      if (this.discCount < 3) {
        this.discCount = 3;
      }
      this.towers = [
        Array.from({ length: this.discCount }, (_, i) => this.discCount - i),
        [],
        []
      ];
      this.selectedTower = null;
      this.message = '';
      this.gameOver = false;
      this.elapsedTime = null;
      this.startTime = Date.now();
      this.isAutoGame = false; // 初始化时标记为手动游戏
    },
    startAutoGame() {
      this.initGame();
      this.isAutoGame = true; // 标记为自动游戏
      autoGame(this);
    },
    selectTower(index) {
      if (this.isAutoGame) return; // 如果是自动游戏，不处理手动选择
      if (this.selectedTower === null) {
        if (this.towers[index].length > 0) {
          this.selectedTower = index;
          if(LocaleType == 'en')
            this.message = `You selected tower ${index + 1}. Please select the target tower.`;
          else
            this.message = `你选择了第 ${index + 1} 个塔，请选择要移动到的目标塔。`;
        } else {
          if(LocaleType == 'en')
            this.message = 'This tower has no discs. Please select a tower with discs.';
          else
            this.message = '此塔没有圆盘，请选择有圆盘的塔。';
        }
      } else {
        if (this.moveDisc(this.selectedTower, index)) {
          if(LocaleType == 'en')
            this.message = `Successfully moved disc from tower ${this.selectedTower + 1} to tower ${index + 1}.`;
          else  
            this.message = `成功将圆盘从第 ${this.selectedTower + 1} 个塔移动到第 ${index + 1} 个塔。`;
          if (this.towers[2].length === this.discCount) {
            this.endGame();
          }
        } else {
          if(LocaleType == 'en')
            this.message = 'Invalid move. Please select a valid target tower.';
          else
            this.message = '移动无效，请选择合适的目标塔。';
        }
        this.selectedTower = null;
      }
    },
    moveDisc(from, to) {
      const fromTower = this.towers[from];
      const toTower = this.towers[to];
      if (fromTower.length === 0) {
        return false;
      }
      const disc = fromTower.pop();
      if (toTower.length === 0 || disc < toTower[toTower.length - 1]) {
        toTower.push(disc);
        return true;
      }
      fromTower.push(disc);
      return false;
    },
    endGame() {
      console.log('endGame this', this);
      console.log('this.isAutoGame', this.isAutoGame);
      const endTime = Date.now();
      this.elapsedTime = ((endTime - this.startTime) / 1000).toFixed(2);
      if(LocaleType == 'en') {
        this.message = `Congratulations! You won the game! Elapsed time: ${this.elapsedTime} seconds`;
      } else {
        this.message = `恭喜你，游戏通关！耗时: ${this.elapsedTime} 秒`;
      }
      this.gameOver = true;
      this.$refs.ranking.saveRecord(this.discCount, this.elapsedTime, this.isAutoGame);
    },
    // 移除 clearRanking 方法
  },
  created() {
    var hannuotaZh = {'hannuota': {
      title: '汉诺塔游戏',
      discs: '圆盘数量:',
      start: '开始游戏',
      aiStep: 'AI秒/步',
      auto: '自动游戏',
      reset: '重新开始',
      elapsedTime: '耗时:',
      seconds: '秒',
      ranking: '排行榜',
      rankingNo: '排名',
      player: '玩家',
      timeSpent: '耗时 (秒)',
      completedTime: '完成时间',
      clearRanking: '清空排名榜',
      rankingTitle: '排名榜',
      recordTitle: '通关记录',
      inputName: '请输入玩家姓名',
      cancel: '取消',
      confirm: '确定'
    }};
    var i18n = I18n;
    i18n.setLocaleMessage('zh', {
        ...i18n.getLocaleMessage('zh'),
        ...hannuotaZh
    });
    var hannuotaEn = {'hannuota': {
      title: 'Tower of Hanoi',
      discs: 'Disc Count:',
      start: 'Start Game',
      aiStep: 'AI Step',
      auto: 'Auto Game',
      reset: 'Reset Game',
      elapsedTime: 'Elapsed Time:',
      seconds: 'seconds',
      ranking: 'Ranking',
      rankingNo: 'No.',
      player: 'Player',
      timeSpent: 'Time (s)',
      completedTime: 'Completed At',
      clearRanking: 'Clear Ranking',
      rankingTitle: 'Ranking Board',
      recordTitle: 'Game Record',
      inputName: 'Please enter your name',
      cancel: 'Cancel',
      confirm: 'Confirm'
    }};
    i18n.setLocaleMessage('en', {
        ...i18n.getLocaleMessage('en'),
        ...hannuotaEn
    });
    this.init = true;
    this.initGame();
  }
};
</script>

<style scoped>
/* 移除 table 相关样式，因为它们已经移动到 ranking.vue */
.hannuota {
  background-color: #fff;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.towers {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.tower {
  width: 20px;
  height: 200px;
  background-color: #333;
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
}

.disc {
  height: 20px;
  background-color: #007BFF;
  margin: 2px 0;
  border-radius: 5px;
}
</style>
