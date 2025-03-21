<template>
  <div class="led-display">
    <div v-for="(digit, index) in digitsArray" :key="index" class="led-digit">
      <div v-if="digit === '-'" class="led-minus">
        <div class="led-segment led-segment-g"></div>
      </div>
      <template v-else>
        <div class="led-segment led-segment-a" :class="{ 'led-on': segments[digit][0] }"></div>
        <div class="led-segment led-segment-b" :class="{ 'led-on': segments[digit][1] }"></div>
        <div class="led-segment led-segment-c" :class="{ 'led-on': segments[digit][2] }"></div>
        <div class="led-segment led-segment-d" :class="{ 'led-on': segments[digit][3] }"></div>
        <div class="led-segment led-segment-e" :class="{ 'led-on': segments[digit][4] }"></div>
        <div class="led-segment led-segment-f" :class="{ 'led-on': segments[digit][5] }"></div>
        <div class="led-segment led-segment-g" :class="{ 'led-on': segments[digit][6] }"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LedDisplay',
  props: {
    value: {
      type: Number,
      required: true
    },
    digits: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      // 七段数码管显示定义 [a,b,c,d,e,f,g]
      segments: {
        '0': [1,1,1,1,1,1,0],
        '1': [0,1,1,0,0,0,0],
        '2': [1,1,0,1,1,0,1],
        '3': [1,1,1,1,0,0,1],
        '4': [0,1,1,0,0,1,1],
        '5': [1,0,1,1,0,1,1],
        '6': [1,0,1,1,1,1,1],
        '7': [1,1,1,0,0,0,0],
        '8': [1,1,1,1,1,1,1],
        '9': [1,1,1,1,0,1,1]
      }
    };
  },
  computed: {
    digitsArray() {
      // 将数字转换为固定长度的数组，不足位数前面补0
      let valueStr = Math.abs(this.value).toString().padStart(this.digits, '0');
      // 如果是负数，第一位显示负号
      if (this.value < 0) {
        valueStr = valueStr.slice(-(this.digits - 1));
        return ['-', ...valueStr.split('')];
      }
      return valueStr.split('');
    }
  }
}
</script>

<style scoped>
.led-display {
  display: flex;
  background-color: #000;
  padding: 4px;
  border: 2px solid #555;
  border-radius: 2px;
}

.led-digit {
  position: relative;
  width: 20px;
  height: 30px;
  margin: 0 2px;
  background-color: #000;
}

.led-segment {
  position: absolute;
  background-color: #320000; /* 暗红色，未点亮状态 */
  border-radius: 1px;
}

.led-segment.led-on {
  background-color: #ff0000; /* 亮红色，点亮状态 */
  box-shadow: 0 0 5px #ff0000;
}

/* 水平段 */
.led-segment-a, .led-segment-d, .led-segment-g {
  width: 12px;
  height: 2px;
  left: 4px;
}

.led-segment-a { top: 2px; }
.led-segment-g { top: 14px; }
.led-segment-d { bottom: 2px; }

/* 垂直段 */
.led-segment-b, .led-segment-c, .led-segment-e, .led-segment-f {
  width: 2px;
  height: 12px;
}

.led-segment-b, .led-segment-c { right: 2px; }
.led-segment-e, .led-segment-f { left: 2px; }

.led-segment-b, .led-segment-f { top: 3px; }
.led-segment-c, .led-segment-e { bottom: 3px; }

/* 负号 */
.led-minus {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.led-minus .led-segment-g {
  position: static;
  width: 12px;
  height: 2px;
  background-color: #ff0000;
  box-shadow: 0 0 5px #ff0000;
}
</style>