<template>
  <div :class="[card.type, {hidden: card.hidden && !disabled, disabled}]" @click="addCardInHand">
    {{ card.value }}
  </div>
</template>

<script>
export default {
  name: 'point-of-interest',
  props: {
    card: {
      type: Object,
      required: true,
    },
    disabled: Boolean,
  },
  methods: {
    addCardInHand() {
      this.$emit('draw', this.card);
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),
    0 3px 1px -2px rgba(0,0,0,0.12),
    0 1px 5px 0 rgba(0,0,0,0.2);
  background: #9e9e9e;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  font-weight: bold;
  &.red-clue {
    background: #ef5350;
  }
  &.blue-clue {
    background: #2196f3;
  }
  &.machine {
    background: #4caf50;
  }
  &.code {
    background: #ffd740;
  }
  &.hidden {
    cursor: default;
    background: transparent;
    box-shadow: none;
    color: rgba(0,0,0,0.2);
  }
  &.disabled {
    pointer-events: none;
  }
}
</style>
