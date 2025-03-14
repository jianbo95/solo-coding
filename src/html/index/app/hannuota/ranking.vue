<template>
  <div>
    <h2>排名榜</h2>
    <el-dialog
      title="通关记录"
      :visible.sync="showNameDialog"
      width="30%">
      <el-input 
        v-model="playerName"
        placeholder="请输入玩家姓名"
        maxlength="10"
        show-word-limit>
      </el-input>
      <span slot="footer">
        <el-button @click="cancelSave">取消</el-button>
        <el-button type="primary" @click="confirmSave">确定</el-button>
      </span>
    </el-dialog>

    <el-tabs type="border-card" v-if="showRanking">
      <!-- 修改表格列 -->
      <el-tab-pane v-for="discCount in sortedDiscCounts" :key="discCount" :label="`${discCount} 盘`">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>玩家</th>
              <th>耗时 (秒)</th>
              <th>完成时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in rankings[discCount]" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ record.playerName }}</td>
              <td>{{ record.elapsedTime.toFixed(2) }}</td>
              <td>{{ new Date(record.timestamp).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>
    </el-tabs>
    <button @click="clearRanking" style="margin-top: 20px;">清空排名榜</button>
    <!-- <button @click="loadRanking" style="margin-top: 20px;">加载排名榜</button> -->
  </div>
</template>

<script>
import ranking from './ranking.js';

export default {
  data() {
    return {
      showNameDialog: false,
      playerName: '',
      tempDiscCount: null,
      tempElapsedTime: null,
      showRanking: true,
      sortedDiscCounts: []
    };
  },
  methods: {
    saveRecord(discCount, elapsedTime, isAI = false) {
      if (isAI) {
        // 保存 AI 玩家的记录
        ranking.save(this, discCount, elapsedTime, 'AI');
        return;
      } else {
        this.showNameDialog = true;
      }
      this.tempDiscCount = discCount;
      this.tempElapsedTime = elapsedTime;
      this.showNameDialog = true;
    },
    confirmSave() {
      this.showNameDialog = false;
      ranking.save(this, this.tempDiscCount, this.tempElapsedTime, this.playerName || '匿名玩家');
      this.playerName = '';
    },
    clearRanking() {
      ranking.clear(this);
    },
    loadRanking() {
      ranking.load(this);
    },
    cancelSave() {
      this.showNameDialog = false;
      this.playerName = '';
    },
    sortedDiscCountsMethod() {
      this.sortedDiscCounts = Object.keys(this.rankings)
        .map(Number)
        .sort((a, b) => a - b);
    }
  },
  created() {
    ranking.load(this);
  },

};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
</style>