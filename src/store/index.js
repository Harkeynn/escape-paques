import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cardsInHand: [],
    deployedCard: null,
    deployedBlueClue: null,
    deployedRedClue: null,
    penalty: 0,
  },
  mutations: {
    setCardsInHand(state, value) {
      state.cardsInHand = value;
    },
    setDeployedCard(state, value) {
      state.deployedCard = value;
      if (value) {
        state.deployedBlueClue = null;
        state.deployedRedClue = null;
      }
    },
    setPenalty(state, value) {
      state.penalty = value;
    },
    setDeployedBlueClue(state, value) {
      state.deployedBlueClue = value;
      if (value) {
        state.deployedCard = null;
        if (!state.deployedRedClue) {
          state.deployedRedClue = { value: '?', type: 'red-clue' };
        }
      } else if (state.deployedRedClue && state.deployedRedClue.value !== '?') {
        state.deployedBlueClue = { value: '?', type: 'blue-clue' };
      } else {
        state.deployedRedClue = null;
      }
    },
    setDeployedRedClue(state, value) {
      state.deployedRedClue = value;
      if (value) {
        state.deployedCard = null;
        if (!state.deployedBlueClue) {
          state.deployedBlueClue = { value: '?', type: 'blue-clue' };
        }
      } else if (state.deployedBlueClue && state.deployedBlueClue.value !== '?') {
        state.deployedRedClue = { value: '?', type: 'red-clue' };
      } else {
        state.deployedBlueClue = null;
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
