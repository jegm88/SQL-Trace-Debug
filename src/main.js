import Vue from 'vue'
import App from './App.vue'

import Toasted from 'vue-toasted'
import VueHighlightJS from 'vue-highlightjs'
import * as uiv from 'uiv'
import BackToTop from 'vue-backtotop'

import 'bootstrap/dist/css/bootstrap.min.css'
import './css/obsidian.min.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faChevronUp);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(VueHighlightJS);
Vue.use(uiv);
Vue.use(BackToTop);

Vue.use(Toasted, { 
  theme: "primary", 
  position: "top-center", 
  duration : 2000
});

new Vue({
  el: '#app',
  render: h => h(App)
})
