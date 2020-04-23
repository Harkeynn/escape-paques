<template>
  <div>
    <button class="btn" @click="add">
      +
    </button>
    <transition :name="`slide-${transitionDirection}`">
      <span :key="digit">
        {{ digit }}
      </span>
    </transition>
    <button class="btn" @click="subtract">
      -
    </button>
  </div>
</template>

<script>
export default {
  name: 'code-digit',
  props: {
    value: {
      required: true,
      type: Number,
    },
  },
  data() {
    return {
      transitionDirection: null,
    };
  },
  computed: {
    digit: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    add() {
      this.transitionDirection = 'up';
      if (this.digit + 1 > 9) {
        this.digit = 0;
      } else {
        this.digit += 1;
      }
    },
    subtract() {
      this.transitionDirection = 'down';
      if (this.digit - 1 < 0) {
        this.digit = 9;
      } else {
        this.digit -= 1;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .btn {
    transform: scale(0.8);
    margin: 10px 0;
  }

  span {
    pointer-events: none;
    position: absolute;
    font-weight: bold;
    transition: 0.3s;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    height: 100%;
    left: 0;
    width: 100%;
  }
}

// Slide anims for digit change
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transform: translateY(0%);
  opacity: 1;
}
.slide-up-enter, .slide-down-leave-to {
  transform: translateY(-15%);
  opacity: 0;
}
.slide-up-leave-to, .slide-down-enter {
  transform: translateY(15%);
  opacity: 0;
}
</style>
