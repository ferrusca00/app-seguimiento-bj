<template>
  <ion-app>
    <ion-menu content-id="main-content" type="overlay">
      <ion-content>
        <ion-list id="inbox-list">
          <ion-list-header>Activo Bellota Jujo</ion-list-header>
          <ion-note>marco.santiago@pemex.com</ion-note>

          <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
            <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
              <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
    <SpeedInsights />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
} from '@ionic/vue';
import { ref } from 'vue';
import {
  carOutline,
  carSharp,
  archiveOutline,
  archiveSharp,
} from 'ionicons/icons';
import { SpeedInsights } from '@vercel/speed-insights/vue';

const selectedIndex = ref(0);
const appPages = [
  {
    title: 'Servicios Activos',
    url: '/seguimiento',
    iosIcon: carOutline,
    mdIcon: carSharp,
  },
  {
    title: 'Historial de Mantenimientos',
    url: '/historial',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp,
  },
];

const currentPath = window.location.pathname;
const pageIndex = appPages.findIndex((page) => page.url.toLowerCase() === currentPath.toLowerCase());
if (pageIndex !== -1) {
  selectedIndex.value = pageIndex;
}
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 24px;
  --padding-bottom: 24px;
}

ion-menu.md ion-list {
  padding: 16px 0;
}

ion-menu.md ion-note {
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 12px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #e2e8f0);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-color-primary);
  min-height: 24px;
}

ion-menu.md ion-item {
  --padding-start: 12px;
  --padding-end: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.08);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: var(--ion-color-medium);
  font-size: 20px;
}

ion-menu.md ion-item ion-label {
  font-weight: 600;
  font-size: 14px;
}

ion-menu.ios ion-content {
  --padding-bottom: 24px;
}

ion-menu.ios ion-list {
  padding: 16px 0;
}

ion-menu.ios ion-note {
  line-height: 20px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 48px;
  border-radius: 8px;
  margin-bottom: 4px;
}

ion-menu.ios ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.08);
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 22px;
  color: var(--ion-color-medium);
}

ion-menu.ios ion-list-header {
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-color-primary);
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 12px;
}

ion-note {
  display: inline-block;
  font-size: 13px;
  color: var(--ion-color-medium);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
