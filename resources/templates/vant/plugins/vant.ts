import Vant, { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';

export default defineNuxtPlugin((nuxtApp) => {
  // Vant speaks Chinese by default; switch its built-in text for other apps.
  if (!useIsChinese()) Locale.use('en-US', enUS);
  nuxtApp.vueApp.use(Vant);
});
