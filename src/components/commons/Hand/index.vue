<template>
  <section>
    <button class="btn" :class="{ displayed: firstIndex > 0 }" @click="previous">
      &#60;
    </button>
    <div class="list-container">
      <transition :name="`slide-${slideDirection}`">
          <transition-group name="slide-up" tag="ul" :class="{disabled}" :key="firstIndex">
            <li
              v-for="card in currentChunk"
              :key="card.value"
              :class="{
                'deployed': [deployedCard, deployedBlueClue, deployedRedClue].indexOf(card) > -1
              }"
              @click="updateDeployedCard(card)"
            >
              <div>
                <div class="background-container" v-if="card.background">
                  <img :src="getImagePath(card.background)" :alt="card.title">
                </div>
                <div class="card-title">
                  <point-of-interest class="card-value" :card="card" disabled/>
                  <h3>{{ card.title }}</h3>
                </div>
              </div>
            </li>
          </transition-group>
      </transition>
    </div>
    <button class="btn" :class="{ displayed: firstIndex + 6 < cardsInHand.length }" @click="next">
      >
    </button>
  </section>
</template>

<script>
import PointOfInterest from '@/components/commons/PointOfInterest/index.vue';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'hand',
  props: {
    disabled: Boolean,
  },
  components: {
    PointOfInterest,
  },
  data() {
    return {
      firstIndex: 0,
      slideDirection: null,
    };
  },
  computed: {
    ...mapState([
      'cardsInHand',
      'deployedCard',
      'deployedBlueClue',
      'deployedRedClue',
    ]),
    currentChunk() {
      return this.cardsInHand.slice(this.firstIndex, this.firstIndex + 6);
    },
  },
  methods: {
    ...mapMutations([
      'setDeployedCard',
      'setDeployedBlueClue',
      'setDeployedRedClue',
    ]),
    updateDeployedCard(card) {
      switch (card.type) {
        case 'blue-clue':
          if (this.deployedBlueClue !== card) {
            this.setDeployedBlueClue(card);
          } else {
            this.setDeployedBlueClue(null);
          }
          break;
        case 'red-clue':
          if (this.deployedRedClue !== card) {
            this.setDeployedRedClue(card);
          } else {
            this.setDeployedRedClue(null);
          }
          break;
        default:
          if (this.deployedCard !== card) {
            this.setDeployedCard(card);
          } else {
            this.setDeployedCard(null);
          }
          break;
      }
    },
    getImagePath(imgName) {
      // eslint-disable-next-line
      return require(`@/assets/${imgName}`);
    },
    previous() {
      this.firstIndex -= 6;
      this.slideDirection = 'right';
    },
    next() {
      this.firstIndex += 6;
      this.slideDirection = 'left';
    },
  },
  watch: {
    cardsInHand: {
      handler() {
        if (this.currentChunk.length === 0) {
          this.previous();
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
section {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

.btn {
  transition: 0.3s;
  display: inline-block;
  width: 30px;
  height: 30px;
  margin: 35px 10vw;
  transform: scale(0);
  &.displayed {
    transform: scale(1);
  }
}

.list-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;

  ul {
    display: flex;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding-right: 40px;
    transition: 300s;
    transition: 0.5s;
    position: absolute;
    bottom: -91px;
    left: 0;
    width: 100%;
    padding: 0;

    &.disabled {
      pointer-events: none;
    }

    li {
      transition: 0.3s;
      &>div {
        pointer-events: all;
        width: 100px;
        height: 140px;
        margin: 0 5px;
        border-radius: 2px;
        background: #9e9e9e;
        transition: 0.3s;
        cursor: pointer;
        overflow: hidden;
        display: inline-block;
        position: relative;
      }
      &:hover>div, &.deployed>div {
        transform: translateY(-20px);
      }


      .background-container {
        position: absolute;
        top: 0;
        height: 100%;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .card-title {
        position: relative;
        background: rgba($color: #fff, $alpha: 0.5);
        display: flex;
        align-items: center;
        height: 30px;

        .card-value {
          transform: scale(0.8);
        }

        h3 {
          width: 70px;
          font-size: 1em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}


// Slide anim for adding/removing cards
.slide-up-enter, .slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-leave-active {
  position: absolute;
}

// Slide anims for chunk change
.slide-left-enter-active, .slide-left-leave-active {
  transform: translateX(0%);
  opacity: 1;
}
.slide-left-enter {
  transform: translateX(50%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-50%);
  opacity: 0;
}

.slide-right-enter-active, .slide-right-leave-active {
  transform: translateX(0%);
  opacity: 1;
}
.slide-right-enter {
  transform: translateX(-50%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(50%);
  opacity: 0;
}
</style>
