import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import texts from './plugins/textCollection'

Vue.config.productionTip = false
Vue.prototype.$texts = texts

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
