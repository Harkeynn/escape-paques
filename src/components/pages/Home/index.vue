<template>
  <div>
    <transition name="penalty">
      <div class="penalty-overlay" v-if="displayPenaltyOverlay"></div>
    </transition>
    <modal v-model="displayIntro" persistent>
      <h1>La grande chasse</h1>
      Cette année, on n'a pas vraiment pu fêter Pâques.
      Je ne sais pas si tu as l'habitude de le faire mais je me suis dit que ça
      serait l'occasion de faire un petit truc sympa !
      Alors laisse-toi aller dans cette petite aventure bien confinée chez toi !
      <br/>
      Ton objectif : <b>découvrir tous les oeufs pour obtenir un grand butin !</b>
      <template v-slot:actions>
        <button class="btn" @click="start">
          Commencer
        </button>
      </template>
    </modal>
    <modal v-model="victoryModal">
      <h1>Victoire ({{finalChrono}})</h1>
      Dans un clic sonore, la porte du placard se déverrouille.
    </modal>
    <div class="chronometer">
      <span>{{ chronometer }}</span>
      <span class="penalty" v-if="penalty > 0">
        (+{{ penalty }} minute{{ penalty > 1 ? 's' : '' }})
      </span>
      <button class="btn" @click="isGamePaused = !isGamePaused; setDeployedCard(null)">
        {{ isGamePaused ? 'Reprendre' : 'Pause' }}
      </button>
      <!-- <button class="btn" @click="addPenalty">
        Pénalité
      </button> -->
    </div>
    <div class="code-btn">
      <button class="btn" @click="codeModal = true">Rentrer un code</button>
    </div>
    <modal class="code-modal" v-model="codeModal">
      <h1>Rentrer un code</h1>
      <ul class="code-digits">
        <li v-for="(_, index) in code" :key="index">
          <code-digit v-model="code[index]"/>
        </li>
      </ul>
      <template v-slot:actions>
        <button class="btn" @click="submitCode">Valider</button>
        <button class="btn" @click="codeModal = false">Fermer</button>
      </template>
    </modal>
    <transition name="slide-left">
      <div
        class="deployed-card-container blue-clue-container"
        v-if="deployedBlueClue"
        :key="deployedBlueClue.value"
      >
        <div class="empty-clue" v-if="deployedBlueClue.value === '?'">
          <point-of-interest :card="deployedBlueClue" disabled/>
        </div>
        <div
          v-else
          class="deployed-card"
          :class="{ 'landscape': deployedBlueClue.landscape }"
        >
          <div class="background-container" v-if="deployedBlueClue.background">
            <img :src="getImagePath(deployedBlueClue.background)" :alt="deployedBlueClue.title">
          </div>
          <div class="card-title">
            <point-of-interest :card="deployedBlueClue" disabled/>
            <h2>
              {{ deployedBlueClue.title }}
            </h2>
          </div>
          <div class="card-subtitle" v-if="deployedBlueClue.subtitle">
            {{ deployedBlueClue.subtitle }}
          </div>
        </div>
      </div>
    </transition>
    <transition name="slide-right">
      <div
        class="deployed-card-container red-clue-container"
        v-if="deployedRedClue"
        :key="deployedRedClue.value"
      >
        <div class="empty-clue" v-if="deployedRedClue.value === '?'">
          <point-of-interest :card="deployedRedClue" disabled/>
        </div>
        <div
          v-else
          class="deployed-card"
          :class="{ 'landscape': deployedRedClue.landscape }"
        >
          <div class="background-container" v-if="deployedRedClue.background">
            <img :src="getImagePath(deployedRedClue.background)" :alt="deployedRedClue.title">
          </div>
          <div class="card-title">
            <point-of-interest :card="deployedRedClue" disabled/>
            <h2>
              {{ deployedRedClue.title }}
            </h2>
          </div>
          <div class="card-subtitle" v-if="deployedRedClue.subtitle">
            {{ deployedRedClue.subtitle }}
          </div>
        </div>
      </div>
    </transition>
    <transition name="pop">
      <div
        class= "combine-btn"
        v-if="deployedBlueClue
          && deployedRedClue
          && [deployedBlueClue.value, deployedRedClue.value].indexOf('?') === -1"
      >
        <button class="btn" @click="combineClues">Combiner</button>
      </div>
    </transition>
    <transition name="slide-up">
      <div
        class="deployed-card-container"
        v-if="deployedCard"
        :key="deployedCard.value"
      >
        <div
          class="deployed-card"
          :class="{ 'landscape': deployedCard.landscape }"
        >
          <div class="background-container" v-if="deployedCard.background">
            <img :src="getImagePath(deployedCard.background)" :alt="deployedCard.title">
          </div>
          <div class="card-title">
            <point-of-interest :card="deployedCard" disabled/>
            <h2>
              {{ deployedCard.title }}
            </h2>
          </div>
          <transition-group name="pop" tag="div" class="points-container">
            <point-of-interest
              class="deployed-point"
              :class="{ hidden: card.hidden }"
              :style="`
                left: ${card.x}px;
                top: ${card.y}px;
              `"
              v-for="card in deployedCardChildren"
              :key="card.value"
              :card="card"
              @draw="draw(card)"
            ></point-of-interest>
          </transition-group>
          <div class="card-subtitle" v-if="deployedCard.subtitle">
            {{ deployedCard.subtitle }}
          </div>
        </div>
      </div>
    </transition>
    <hand :disabled="isGamePaused"/>
  </div>
</template>

<script>
import cards from '@/assets/cards.json';
import codes from '@/assets/codes.json';
import CodeDigit from '@/components/commons/CodeDigit/index.vue';
import Hand from '@/components/commons/Hand/index.vue';
import Modal from '@/components/commons/Modal/index.vue';
import PointOfInterest from '@/components/commons/PointOfInterest/index.vue';
import * as moment from 'moment';
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'home',
  components: {
    PointOfInterest,
    Hand,
    Modal,
    CodeDigit,
  },
  data() {
    return {
      displayIntro: true,
      cards: [],
      codes: [],
      chronoMilliseconds: 0,
      chronoInterval: null,
      isGamePaused: false,
      displayPenaltyOverlay: false,
      codeModal: false,
      code: [0, 0, 0, 0],
      victoryModal: false,
    };
  },
  computed: {
    ...mapState([
      'cardsInHand',
      'deployedCard',
      'deployedBlueClue',
      'deployedRedClue',
      'penalty',
    ]),
    chronometer() {
      return moment(this.chronoMilliseconds).format('mm:ss');
    },
    finalChrono() {
      return moment(this.chronoMilliseconds + 60000 * this.penalty).format('mm:ss');
    },
    deployedCardChildren() {
      if (this.deployedCard) {
        return this.cards.filter((card) => card.parent === this.deployedCard.value && !card.drawed);
      }
      return null;
    },
  },
  methods: {
    ...mapMutations([
      'setCardsInHand',
      'setDeployedCard',
      'setDeployedBlueClue',
      'setDeployedRedClue',
      'setPenalty',
    ]),
    start() {
      this.displayIntro = false;
      this.chronoInterval = setInterval(() => {
        this.chronoMilliseconds += 1000;
      }, 1000);
      const firstCard = this.cards.filter((card) => card.value === '1')[0];
      if (!firstCard.drawed) {
        this.setDeployedCard(firstCard);
        this.setCardsInHand([firstCard]);
        firstCard.drawed = true;
      }
    },
    addPenalty() {
      this.setPenalty(this.penalty + 1);
      this.displayPenaltyOverlay = true;
      setTimeout(() => {
        this.displayPenaltyOverlay = false;
      }, 100);
    },
    draw(card) {
      const targetedIndex = this.cards.indexOf(card);
      if (targetedIndex > -1) {
        this.setCardsInHand([
          ...this.cardsInHand,
          card,
        ]);
        this.cards[targetedIndex].drawed = true;
        this.cards = [...this.cards];
        if (card.withdraw) {
          card.withdraw.forEach((valueToWithdraw) => {
            const indexToWithdraw = this.cardsInHand.map((cardInHand) => cardInHand.value)
              .indexOf(valueToWithdraw);
            if (indexToWithdraw > -1) {
              this.cardsInHand.splice(indexToWithdraw, 1);
            }
          });
        }
      }
    },
    getImagePath(imgName) {
      // eslint-disable-next-line
      return require(`@/assets/${imgName}`);
    },
    combineClues() {
      const blueValue = Number(this.deployedBlueClue.value);
      const redValue = Number(this.deployedRedClue.value);
      if (!Number.isNaN(blueValue) && !Number.isNaN(redValue)) {
        const result = blueValue + redValue;
        if (result === Number(this.deployedBlueClue.result)) {
          const cardToDraw = this.cards.filter((card) => Number(card.value) === result)[0];
          this.draw(cardToDraw);
          this.setDeployedBlueClue(null);
          this.setDeployedRedClue(null);
          this.updateDeployedCard(cardToDraw);
        } else {
          this.addPenalty();
        }
      }
    },
    submitCode() {
      const submittedCode = this.code.join('');
      const matchingCode = this.codes.filter((code) => code.value === Number(submittedCode))[0];
      if (matchingCode
        && this.cardsInHand.filter((card) => card.value === matchingCode.prerequisite)[0]) {
        this.codeModal = false;
        if (matchingCode.reward) {
          const cardToDraw = this.cards.filter((card) => card.value === matchingCode.reward)[0];
          this.draw(cardToDraw);
          matchingCode.entered = true;
          this.updateDeployedCard(cardToDraw);
        } else {
          clearInterval(this.chronoInterval);
          this.finalChrono = this.chronoMilliseconds + 60000 * this.penalty;
          this.victoryModal = true;
        }
      } else if (!matchingCode || !matchingCode.entered) {
        this.addPenalty();
      }
    },
    updateDeployedCard(card) {
      console.log('response');
      console.log(card);
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
  },
  watch: {
    isGamePaused() {
      if (this.isGamePaused) {
        clearInterval(this.chronoInterval);
      } else {
        this.start();
      }
    },
    codeModal() {
      this.code = [0, 0, 0, 0];
    },
  },
  created() {
    this.cards = cards;
    this.codes = codes;
  },
  beforeDestroy() {
    clearInterval(this.chronoInterval);
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.5em;
  text-align: center;
}

.penalty-overlay {
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  width: 100%;
  z-index: 999;
  background: radial-gradient(closest-side, transparent 80%, #c62828 180%);
  pointer-events: none;
}

.chronometer {
  display: flex;
  align-items: center;
  span {
    padding: 5px;
    font-weight: bold;
  }
  .penalty {
    color: #c62828;
    font-size: 0.8em;
  }
}

.code-btn {
  margin-top: 10px;

  .btn {
    transform: scale(1.2);
    transform-origin: top left;
  }
}

.code-modal {
  ul {
    list-style: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
  }

  .btn {
    margin-left: 10px;
  }
}

.deployed-card-container {
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  pointer-events: none;
  &.blue-clue-container {
    .deployed-card {
      transform: translateX(-50%) scale(0.7);
    }
    .empty-clue {
      transform: translateX(-750%) scale(2);
    }
  }
  &.red-clue-container {
    .deployed-card {
      transform: translateX(50%) scale(0.7);
    }
    .empty-clue {
      transform: translateX(750%) scale(2);
    }
  }

  .deployed-card {
    pointer-events: all;
    margin-bottom: 80px;
    width: 425px;
    height: 600px;
    background: #9e9e9e;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    &.landscape {
      width: 700px;
      height: 500px;
    }

    &>* {
      position: relative;
      z-index: 1;
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
      padding: 5px 10px;
      background: rgba($color: #fff, $alpha: 0.5);
      display: inline-flex;
      align-items: center;
      height: 30px;
      border-bottom-right-radius: 4px;
      h2 {
        font-size: 1.2em;
        display: inline;
        padding-left: 5px;
      }
    }

    .points-container {
      position: absolute;
      top: 0;
      height: 100%;
      left: 0;
      width: 100%;
    }

    .deployed-point {
      position: absolute;
      transition: 0.3s;
      transform-origin: center;
      &:hover:not(.hidden) {
        transform: scale(1.1);
      }
    }

    .card-subtitle {
      position: absolute;
      width: calc(100% - 20px);
      bottom: 0;
      left: 0;
      padding: 10px;
      text-align: justify;
      background: rgba($color: #fff, $alpha: 0.5);
    }
  }
}

.combine-btn {
  pointer-events: none;
  transition: 0.3s;
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .btn {
    pointer-events: all;
    margin-bottom: 80px;
    transform: scale(1.2);
  }
}

// Slide anims for deployed card toggle
.slide-up-enter-active, .slide-up-leave-active {
  transform: translateY(0%);
}
.slide-up-enter, .slide-up-leave-to {
  transform: translateY(100%);
}
.slide-left-enter-active, .slide-left-leave-active {
  transform: translateX(0%);
}
.slide-left-enter, .slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-right-enter-active, .slide-right-leave-active {
  transform: translateX(0%);
}
.slide-right-enter, .slide-right-leave-to {
  transform: translateX(100%);
}

// Penalty overlay anim
.penalty-enter-active, .penalty-leave-active {
  opacity: 1;
  transition: 0.05s
}
.penalty-enter, .penalty-leave-to {
  opacity: 0;
  transition: 1s;
}

// Pop anim for point of interest toggle
.pop-enter-active, .pop-leave-active {
  transform: scale(1)!important;
}
.pop-enter, .pop-leave-to {
  transform: scale(0)!important;
}
</style>
