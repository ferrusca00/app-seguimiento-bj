<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial de Mantenimientos</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-searchbar
          v-model="busqueda"
          placeholder="Buscar por No. Unidad, RAF, placas..."
          :debounce="250"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Historial de Mantenimientos</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="historial-container">
        <div class="intro-box">
          <h2>Expedientes Concluidos</h2>
          <p>Registro de mantenimientos y fechas de salida</p>
        </div>

        <!-- Tarjetas de Mantenimientos Concluidos -->
        <ion-card v-for="registro in registrosFiltrados" :key="registro.id" class="historial-card">
          <ion-card-header>
            <div class="card-header-top">
              <span class="unidad-categoria">{{ registro.tipoUnidad }}</span>
              <ion-badge color="success">Concluido y Liberado</ion-badge>
            </div>
            <ion-card-title class="economico-title">No. Unidad: {{ registro.numeroUnidad }}</ion-card-title>
            <ion-card-subtitle>
              Placas: {{ registro.placas }} · {{ registro.ubicacionActivo }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- 1. Descripción del Mantenimiento Realizado -->
            <div class="seccion-bloque">
              <span class="seccion-titulo">Descripción del Mantenimiento Realizado:</span>
              <p class="descripcion-texto">{{ registro.descripcionMantenimiento }}</p>
            </div>

            <!-- 2. No. RAF Oficial -->
            <div class="raf-bloque">
              <span class="raf-etiqueta">Número de RAF Autorizado:</span>
              <span class="raf-valor">{{ registro.numeroRaf }}</span>
              <span class="raf-fecha">Aprobado en Cartera de Proyectos: {{ registro.fechaCartera }}</span>
            </div>

            <!-- 3. Fechas y Horas Exactas de Entrada y Salida (Registro Cruzado Taller y Usuario) -->
            <div class="registro-cruzado-container">
              <span class="seccion-titulo">Registro de Fechas y Horas:</span>

              <!-- Bloque Entrada -->
              <div class="horario-box entrada-box">
                <div class="horario-header">
                  <ion-icon :icon="timeOutline" class="box-icon" aria-hidden="true"></ion-icon>
                  <strong>Entrada al Taller</strong>
                </div>
                <div class="horario-grid">
                  <div class="horario-item">
                    <span class="actor-label">Registro Usuario (Operador):</span>
                    <strong class="hora-val">{{ registro.entrada.fechaHoraUsuario }}</strong>
                  </div>
                  <div class="horario-item">
                    <span class="actor-label">Registro Personal de Taller:</span>
                    <strong class="hora-val">{{ registro.entrada.fechaHoraTaller }}</strong>
                  </div>
                </div>
                <span class="odometro-tag">Lectura de Ingreso: {{ registro.entrada.lecturaUso }}</span>
              </div>

              <!-- Bloque Salida -->
              <div class="horario-box salida-box">
                <div class="horario-header">
                  <ion-icon :icon="checkmarkCircle" class="box-icon icon-success" aria-hidden="true"></ion-icon>
                  <strong>Salida del Taller</strong>
                </div>
                <div class="horario-grid">
                  <div class="horario-item">
                    <span class="actor-label">Aviso de Salida del Taller:</span>
                    <strong class="hora-val">{{ registro.salida.fechaHoraTaller }}</strong>
                  </div>
                  <div class="horario-item">
                    <span class="actor-label">Recepción por Usuario (Operador):</span>
                    <strong class="hora-val">{{ registro.salida.fechaHoraUsuario }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Botones Simulados de Consulta de Expediente Externo -->
            <div class="botones-expediente">
              <ion-button expand="block" fill="outline" color="primary" class="btn-doc">
                <ion-icon slot="start" :icon="documentAttachOutline" aria-hidden="true"></ion-icon>
                Ver Solicitud Escaneada
              </ion-button>

              <ion-button expand="block" fill="outline" color="secondary" class="btn-doc">
                <ion-icon slot="start" :icon="receiptOutline" aria-hidden="true"></ion-icon>
                Ver Presupuesto
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Mensaje de no resultados en búsqueda -->
        <div v-if="registrosFiltrados.length === 0" class="empty-box">
          <p>No se encontraron mantenimientos concluidos que coincidan con "{{ busqueda }}"</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import {
  checkmarkCircle,
  documentAttachOutline,
  receiptOutline,
  timeOutline,
} from 'ionicons/icons';

interface RegistroCruzadoHoras {
  fechaHoraUsuario: string;
  fechaHoraTaller: string;
  lecturaUso?: string;
}

interface HistorialRegistroMock {
  id: string;
  folio?: string;
  numeroUnidad: string;
  placas: string;
  tipoUnidad: string;
  ubicacionActivo: string;
  descripcionMantenimiento: string;
  numeroRaf: string;
  fechaCartera: string;
  entrada: RegistroCruzadoHoras;
  salida: RegistroCruzadoHoras;
  operadorNombre: string;
  tallerNombre: string;
}

const busqueda = ref('');

const registrosConcluidos = ref<HistorialRegistroMock[]>([
  {
    id: 'hist-01',
    numeroUnidad: '1000016830',
    placas: 'WP-8732-B',
    tipoUnidad: 'Pipa de Agua 10,000L',
    ubicacionActivo: 'Base Comalcalco',
    descripcionMantenimiento: 'Reemplazo de balatas reforzadas, rectificado de tambores e instalación de válvula neumática de freno de estacionamiento.',
    numeroRaf: 'RAF-BJ-2026-072',
    fechaCartera: '28/08/2026',
    entrada: {
      fechaHoraUsuario: '31/08/2026 08:15 hrs',
      fechaHoraTaller: '31/08/2026 08:20 hrs',
      lecturaUso: '94,100 km (Odómetro)',
    },
    salida: {
      fechaHoraTaller: '05/09/2026 16:45 hrs',
      fechaHoraUsuario: '05/09/2026 17:00 hrs',
    },
    operadorNombre: 'C. Miguel Ángel Torres',
    tallerNombre: 'Frenos y Suspensiones del Grijalva',
  },
  {
    id: 'hist-02',
    numeroUnidad: '1000015942',
    placas: 'TR-4512-B',
    tipoUnidad: 'Camioneta Pick-up Supervisión',
    ubicacionActivo: 'Batería Jujo Centro',
    descripcionMantenimiento: 'Servicio mayor de 120,000 km, reemplazo de kit de distribución, amortiguadores delanteros y alineación con balanceo.',
    numeroRaf: 'RAF-BJ-2026-058',
    fechaCartera: '14/08/2026',
    entrada: {
      fechaHoraUsuario: '18/08/2026 09:10 hrs',
      fechaHoraTaller: '18/08/2026 09:20 hrs',
      lecturaUso: '121,350 km (Odómetro)',
    },
    salida: {
      fechaHoraTaller: '24/08/2026 15:30 hrs',
      fechaHoraUsuario: '24/08/2026 16:00 hrs',
    },
    operadorNombre: 'C. Sergio Narváez Gómez',
    tallerNombre: 'Servicios Automotrices y Diésel del Sureste S.A. de C.V.',
  },
]);

const registrosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return registrosConcluidos.value;
  const q = busqueda.value.toLowerCase();
  return registrosConcluidos.value.filter(
    (r) =>
      r.numeroUnidad.toLowerCase().includes(q) ||
      r.placas.toLowerCase().includes(q) ||
      r.numeroRaf.toLowerCase().includes(q) ||
      r.descripcionMantenimiento.toLowerCase().includes(q)
  );
});
</script>

<style scoped>
.historial-container {
  padding: 8px 4px 32px 4px;
}

.intro-box {
  padding: 8px 16px 12px 16px;
}

.intro-box h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--ion-color-dark);
}

.intro-box p {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.historial-card {
  margin-bottom: 18px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.unidad-categoria {
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.economico-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--ion-color-dark);
}

.seccion-bloque {
  margin-bottom: 12px;
}

.seccion-titulo {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ion-color-step-700, #47525d);
  margin-bottom: 4px;
}

.descripcion-texto {
  margin: 0;
  font-size: 13px;
  line-height: 19px;
  color: var(--ion-color-dark);
}

.raf-bloque {
  background: var(--ion-color-step-50, #f8fafc);
  border-left: 4px solid var(--ion-color-tertiary);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.raf-etiqueta {
  font-size: 11px;
  font-weight: 700;
  color: var(--ion-color-step-600, #555);
}

.raf-valor {
  font-size: 16px;
  font-weight: 800;
  color: var(--ion-color-tertiary);
}

.raf-fecha {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.registro-cruzado-container {
  margin-bottom: 16px;
}

.horario-box {
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.entrada-box {
  background: var(--ion-color-light, #f8f9fa);
  border: 1px solid var(--ion-color-step-150, #e2e8f0);
  border-left: 3px solid var(--ion-color-primary);
}

.salida-box {
  background: rgba(var(--ion-color-success-rgb), 0.05);
  border: 1px solid rgba(var(--ion-color-success-rgb), 0.2);
  border-left: 3px solid var(--ion-color-success);
}

.horario-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.box-icon {
  font-size: 16px;
  color: var(--ion-color-primary);
}

.icon-success {
  color: var(--ion-color-success) !important;
}

.horario-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.horario-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.actor-label {
  color: var(--ion-color-step-600, #555);
}

.hora-val {
  color: var(--ion-color-dark);
}

.odometro-tag {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--ion-color-step-700, #444);
  margin-top: 6px;
  border-top: 1px dashed #d1e2f3;
  padding-top: 4px;
}

.botones-expediente {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  border-top: 1px solid var(--ion-color-step-150, #e2e8f0);
  padding-top: 12px;
}

.btn-doc {
  margin: 0;
  font-weight: 600;
  font-size: 12px;
}

.empty-box {
  text-align: center;
  padding: 36px 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}
</style>
