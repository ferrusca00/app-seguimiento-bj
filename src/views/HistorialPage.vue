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
              <span class="unidad-categoria">Servicio {{ registro.tipo_servicio }}</span>
              <div class="header-badges">
                <ion-chip color="success" class="mantenimiento-chip">
                  <ion-icon :icon="checkmarkCircle" aria-hidden="true"></ion-icon>
                  <ion-label>Concluido</ion-label>
                </ion-chip>
                <ion-badge color="success">{{ registro.estado_actual }}</ion-badge>
              </div>
            </div>
            <ion-card-title class="economico-title">No. Unidad: {{ registro.numero_economico }}</ion-card-title>
            <ion-card-subtitle>
              Placas: {{ registro.placas }} · Apertura: {{ registro.fecha_apertura }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- 1. Descripción del Mantenimiento Realizado -->
            <div class="seccion-bloque">
              <span class="seccion-titulo">Descripción del Mantenimiento Realizado:</span>
              <p class="descripcion-texto">{{ registro.diagnostico_inicial }}</p>
            </div>

            <!-- 2. Folios Administrativos Oficiales (RAF, Cotización, Orden, PSL) -->
            <div class="raf-bloque">
              <span class="raf-etiqueta">Número de RAF Autorizado:</span>
              <span class="raf-valor">{{ registro.folios.folio_raf }}</span>
              <span class="raf-fecha">
                Cotización: {{ registro.folios.folio_cotizacion }} · Orden: {{ registro.folios.folio_orden_taller }} · PSL: {{ registro.folios.folio_solicitud_psl }}
              </span>
              <span class="raf-fecha">
                Aprobado en Cartera de Proyectos: {{ registro.folios.autorizado_cartera ? 'Sí (Autorizado)' : 'Pendiente' }}
              </span>
            </div>

            <!-- 3. Fechas y Horas Exactas de Entrada y Salida (Registro Cruzado Taller y Usuario con Odómetro) -->
            <div class="registro-cruzado-container">
              <span class="seccion-titulo">Registro de Entrada y Salida:</span>

              <!-- Bloque Entrada -->
              <div class="horario-box entrada-box">
                <div class="horario-header">
                  <ion-icon :icon="timeOutline" class="box-icon" aria-hidden="true"></ion-icon>
                  <strong>Entrada al Taller</strong>
                </div>
                <div class="horario-grid">
                  <div class="horario-item">
                    <span class="actor-label">Registro Usuario (Operador):</span>
                    <strong class="hora-val">
                      {{ getTransito(registro, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.fecha_hora_declarada || 'N/A' }}
                    </strong>
                  </div>
                  <div class="horario-item">
                    <span class="actor-label">Registro Personal de Taller:</span>
                    <strong class="hora-val">
                      {{ getTransito(registro, TipoMovimiento.ENTRADA, ActorRegistro.TALLER)?.fecha_hora_declarada || 'N/A' }}
                    </strong>
                  </div>
                </div>
                <span class="odometro-tag">
                  Lectura de Ingreso:
                  {{
                    getTransito(registro, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.lectura_odometro
                      ? getTransito(registro, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.lectura_odometro.toLocaleString() + ' km (Odómetro)'
                      : 'Sin registro'
                  }}
                </span>
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
                    <strong class="hora-val">
                      {{ getTransito(registro, TipoMovimiento.SALIDA, ActorRegistro.TALLER)?.fecha_hora_declarada || 'N/A' }}
                    </strong>
                  </div>
                  <div class="horario-item">
                    <span class="actor-label">Recepción por Usuario (Operador):</span>
                    <strong class="hora-val">
                      {{ getTransito(registro, TipoMovimiento.SALIDA, ActorRegistro.OPERADOR)?.fecha_hora_declarada || 'N/A' }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Botones Simulados de Consulta de Expediente Externo -->
            <div class="botones-expediente">
              <ion-button expand="block" fill="outline" color="primary" class="btn-doc">
                <ion-icon slot="start" :icon="documentAttachOutline" aria-hidden="true"></ion-icon>
                Ver Solicitud
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
  IonChip,
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
import {
  ExpedienteMantenimiento,
  TipoServicio,
  TipoFirmante,
  TipoMovimiento,
  ActorRegistro,
  EstatusRefacciones,
  EstatusMantenimiento,
  RegistroTransito,
} from '@/types/mantenimiento';

const busqueda = ref('');

const getTransito = (
  expediente: ExpedienteMantenimiento,
  mov: TipoMovimiento,
  actor: ActorRegistro
): RegistroTransito | undefined => {
  return expediente.registros_transito.find(
    (r) => r.tipo_movimiento === mov && r.actor_reporta === actor
  );
};

const registrosConcluidos = ref<ExpedienteMantenimiento[]>([
  {
    id: 'hist-01',
    numero_economico: '1000016830',
    placas: 'WP-8732-B',
    tipo_servicio: TipoServicio.CORRECTIVO,
    diagnostico_inicial:
      'Reemplazo de balatas reforzadas, rectificado de tambores e instalación de válvula neumática de freno de estacionamiento.',
    fecha_apertura: '25/08/2026',
    estado_actual: 'Concluido y Liberado',
    folios: {
      folio_cotizacion: 'COT-FRE-9180',
      fecha_envio_cotizacion: '26/08/2026',
      folio_raf: 'RAF-BJ-2026-072',
      autorizado_cartera: true,
      folio_solicitud_psl: 'DTI2026000210',
      folio_orden_taller: 'MPC2026000390',
    },
    firmas_presupuesto: [
      {
        tipo_firmante: TipoFirmante.OPERADOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'C. Miguel Ángel Torres',
        es_contingencia: false,
        fecha_hora_asentamiento: '26/08/2026 14:00',
      },
      {
        tipo_firmante: TipoFirmante.JEFE_AREA,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Carlos Mendoza',
        es_contingencia: false,
        fecha_hora_asentamiento: '27/08/2026 09:30',
      },
      {
        tipo_firmante: TipoFirmante.SUPERVISOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Fernando Ruiz',
        es_contingencia: false,
        fecha_hora_asentamiento: '27/08/2026 11:15',
      },
    ],
    registros_transito: [
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.OPERADOR,
        fecha_hora_declarada: '31/08/2026 08:15 hrs',
        fecha_hora_servidor: '31/08/2026 08:15:22',
        lectura_odometro: 94100,
      },
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.TALLER,
        fecha_hora_declarada: '31/08/2026 08:20 hrs',
        fecha_hora_servidor: '31/08/2026 08:20:10',
        lectura_odometro: 94100,
      },
      {
        tipo_movimiento: TipoMovimiento.SALIDA,
        actor_reporta: ActorRegistro.TALLER,
        fecha_hora_declarada: '05/09/2026 16:45 hrs',
        fecha_hora_servidor: '05/09/2026 16:45:05',
        lectura_odometro: 94105,
      },
      {
        tipo_movimiento: TipoMovimiento.SALIDA,
        actor_reporta: ActorRegistro.OPERADOR,
        fecha_hora_declarada: '05/09/2026 17:00 hrs',
        fecha_hora_servidor: '05/09/2026 17:00:15',
        lectura_odometro: 94105,
      },
    ],
    estatus_refacciones: EstatusRefacciones.COMPLETO,
    estatus_mantenimiento: EstatusMantenimiento.CONCLUIDO,
    fecha_notificacion_termino: '05/09/2026 16:45',
    conformidad_operador: true,
    fecha_conformidad: '05/09/2026 17:00',
  },
  {
    id: 'hist-02',
    numero_economico: '1000015942',
    placas: 'TR-4512-B',
    tipo_servicio: TipoServicio.PREVENTIVO,
    diagnostico_inicial:
      'Servicio mayor de 120,000 km, reemplazo de kit de distribución, amortiguadores delanteros y alineación con balanceo.',
    fecha_apertura: '10/08/2026',
    estado_actual: 'Concluido y Liberado',
    folios: {
      folio_cotizacion: 'COT-DMT-5021',
      fecha_envio_cotizacion: '11/08/2026',
      folio_raf: 'RAF-BJ-2026-058',
      autorizado_cartera: true,
      folio_solicitud_psl: 'DTI2026000195',
      folio_orden_taller: 'MPC2026000360',
    },
    firmas_presupuesto: [
      {
        tipo_firmante: TipoFirmante.OPERADOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'C. Sergio Narváez Gómez',
        es_contingencia: false,
        fecha_hora_asentamiento: '11/08/2026 12:30',
      },
      {
        tipo_firmante: TipoFirmante.JEFE_AREA,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Héctor Salazar',
        es_contingencia: false,
        fecha_hora_asentamiento: '12/08/2026 10:00',
      },
      {
        tipo_firmante: TipoFirmante.SUPERVISOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Fernando Ruiz',
        es_contingencia: false,
        fecha_hora_asentamiento: '12/08/2026 11:30',
      },
    ],
    registros_transito: [
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.OPERADOR,
        fecha_hora_declarada: '18/08/2026 09:10 hrs',
        fecha_hora_servidor: '18/08/2026 09:10:45',
        lectura_odometro: 121350,
      },
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.TALLER,
        fecha_hora_declarada: '18/08/2026 09:20 hrs',
        fecha_hora_servidor: '18/08/2026 09:20:12',
        lectura_odometro: 121350,
      },
      {
        tipo_movimiento: TipoMovimiento.SALIDA,
        actor_reporta: ActorRegistro.TALLER,
        fecha_hora_declarada: '24/08/2026 15:30 hrs',
        fecha_hora_servidor: '24/08/2026 15:30:50',
        lectura_odometro: 121354,
      },
      {
        tipo_movimiento: TipoMovimiento.SALIDA,
        actor_reporta: ActorRegistro.OPERADOR,
        fecha_hora_declarada: '24/08/2026 16:00 hrs',
        fecha_hora_servidor: '24/08/2026 16:00:22',
        lectura_odometro: 121354,
      },
    ],
    estatus_refacciones: EstatusRefacciones.COMPLETO,
    estatus_mantenimiento: EstatusMantenimiento.CONCLUIDO,
    fecha_notificacion_termino: '24/08/2026 15:30',
    conformidad_operador: true,
    fecha_conformidad: '24/08/2026 16:00',
  },
]);

const registrosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return registrosConcluidos.value;
  const q = busqueda.value.toLowerCase();
  return registrosConcluidos.value.filter(
    (r) =>
      r.numero_economico.toLowerCase().includes(q) ||
      r.placas.toLowerCase().includes(q) ||
      r.folios.folio_raf.toLowerCase().includes(q) ||
      r.diagnostico_inicial.toLowerCase().includes(q)
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

.header-badges {
  display: flex;
  align-items: center;
  gap: 6px;
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

.mantenimiento-chip {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  height: 24px;
}

.empty-box {
  text-align: center;
  padding: 36px 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}
</style>
