<template>
  <div class="mobile-controls">
    <div class="control-row">
      <button @click="handleDirection('up')" class="direction-btn">↑</button>
    </div>
    <div class="control-row">
      <button @click="handleDirection('left')" class="direction-btn">←</button>
      <button @click="handleDirection('right')" class="direction-btn">→</button>
    </div>
    <div class="control-row">
      <button @click="handleDirection('down')" class="direction-btn">↓</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileControl',
  methods: {
    handleDirection(direction) {
      this.$emit('direction-change', direction);
    }
  }
}
</script>

<style scoped>
.mobile-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.control-row {
  display: flex;
  gap: 10px;
  margin: 5px 0;
}

.direction-btn {
  width: 50px;
  height: 50px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>