<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="displayModal" @click="displayModal = persistent">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <slot></slot>
        </div>
        <hr/>
        <div class="modal-actions">
          <slot name="actions">
            <button class="btn" @click="displayModal = false">
              OK
            </button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    persistent: Boolean,
  },
  computed: {
    displayModal: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  z-index: 999;
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  width: 100%;
  background: rgba($color: black, $alpha: 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;

  .modal {
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),
      0 3px 1px -2px rgba(0,0,0,0.12),
      0 1px 5px 0 rgba(0,0,0,0.2);
    width: 60vw;
    transition: 0.3s;
    transform-origin: center;

    &>div {
      padding: 10px;
    }

    .modal-content {
      text-align: justify;
    }

    hr {
      margin: 0;
      background: rgba($color: black, $alpha: 0.1);
      height: 1px;
      border: 0;
    }

    .modal-actions {
      display: flex;
      flex-direction: row-reverse;
    }
  }
}

// Slide up anim for modal toggle
.fade-enter-active, .fade-leave-active {
  opacity: 1;

  .modal {
    transform: scale(1);
  }
}
.fade-enter, .fade-leave-to {
  opacity: 0;

  .modal {
    transform: scale(0);
  }
}
</style>
