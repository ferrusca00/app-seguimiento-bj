<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Servicios Activos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Servicios Activos</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="seguimiento-container">
        <div class="header-intro">
          <h2>Panel de Control y Seguimiento</h2>
          <p>Supervisión del proceso administrativo de mantenimiento de unidades - Activo Bellota Jujo</p>
        </div>

        <!-- Tarjetas de Unidades en Proceso -->
        <ion-card v-for="unidad in unidadesEnProceso" :key="unidad.id" class="unidad-card">
          <!-- Encabezado de la Unidad -->
          <ion-card-header>
            <div class="header-top-row">
              <span class="unidad-categoria">Servicio {{ unidad.tipo_servicio }}</span>
              <ion-badge :color="unidad.tipo_servicio === TipoServicio.PREVENTIVO ? 'warning' : 'danger'">
                {{ unidad.tipo_servicio }}
              </ion-badge>
            </div>
            <ion-card-title class="economico-title">No. Unidad: {{ unidad.numero_economico }}</ion-card-title>
            <ion-card-subtitle>
              Placas: {{ unidad.placas }} · Apertura: {{ unidad.fecha_apertura }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- Diagnóstico / Falla -->
            <div class="falla-box">
              <span class="box-label">Diagnóstico / Motivo de Servicio:</span>
              <p>{{ unidad.diagnostico_inicial }}</p>
            </div>

            <!-- Estatus / Acción Pendiente Inmediata -->
            <div class="pendiente-box">
              <ion-icon :icon="alertCircleOutline" class="alert-icon" aria-hidden="true"></ion-icon>
              <div>
                <strong>Estado Actual:</strong>
                <p>{{ unidad.estado_actual }}</p>
              </div>
            </div>

            <!-- SEGUIMIENTO SECUENCIAL DEL PROCESO ADMINISTRATIVO (5 Fases Oficiales) -->
            <div class="secuencia-titulo">
              <strong>Estatus del Proceso Administrativo:</strong>
            </div>

            <ion-list :inset="true" class="secuencia-list">
              <!-- 1. Presupuesto (Indicador de 3 firmas físicas: Usuario, Jefe, Supervisor) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="todasFirmasPresupuesto(unidad) ? checkmarkCircle : timeOutline"
                  :color="todasFirmasPresupuesto(unidad) ? 'success' : 'warning'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>1. Presupuesto (Firmas Físicas)</h3>
                  <p class="sub-detalle">
                    Folio Cotización: {{ unidad.folios.folio_cotizacion || 'Pendiente' }}
                    <span v-if="unidad.folios.fecha_envio_cotizacion">({{ unidad.folios.fecha_envio_cotizacion }})</span>
                  </p>
                  
                  <div class="firmas-grid">
                    <span class="firma-chip" :class="{ signed: tieneFirma(unidad, TipoFirmante.OPERADOR) }">
                      <ion-icon :icon="tieneFirma(unidad, TipoFirmante.OPERADOR) ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Usuario (Operador)
                    </span>
                    <span class="firma-chip" :class="{ signed: tieneFirma(unidad, TipoFirmante.JEFE_AREA) }">
                      <ion-icon :icon="tieneFirma(unidad, TipoFirmante.JEFE_AREA) ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Jefe de Área
                    </span>
                    <span class="firma-chip" :class="{ signed: tieneFirma(unidad, TipoFirmante.SUPERVISOR) }">
                      <ion-icon :icon="tieneFirma(unidad, TipoFirmante.SUPERVISOR) ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Supervisor Logística
                    </span>
                  </div>
                </ion-label>
              </ion-item>

              <!-- 2. Trámite RAF (No. RAF generado y autorización de Cartera de Proyectos) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.folios.autorizado_cartera ? checkmarkCircle : timeOutline"
                  :color="unidad.folios.autorizado_cartera ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>2. Trámite RAF</h3>
                  <p>
                    <strong>No. RAF:</strong> {{ unidad.folios.folio_raf || 'Pendiente de generación por Logística' }}
                  </p>
                  <p class="sub-status" :class="unidad.folios.autorizado_cartera ? 'text-success' : 'text-warning'">
                    {{ unidad.folios.autorizado_cartera ? 'Autorizado en Cartera de Proyectos' : 'Pendiente de autorización en Cartera de Proyectos' }}
                  </p>
                </ion-label>
              </ion-item>

              <!-- 3. Solicitud de Servicio (Indicador de generación vía PSL) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.folios.folio_solicitud_psl ? checkmarkCircle : timeOutline"
                  :color="unidad.folios.folio_solicitud_psl ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>3. Solicitud de Servicio (PSL)</h3>
                  <p>
                    <strong>Folio PSL:</strong> {{ unidad.folios.folio_solicitud_psl || 'Pendiente de registrar por Área Usuaria' }}
                  </p>
                  <p class="sub-status" :class="unidad.folios.folio_solicitud_psl ? 'text-success' : 'text-warning'">
                    {{ unidad.folios.folio_solicitud_psl ? 'Generada vía PSL por el Área Usuaria' : 'Pendiente de generación en portal PSL' }}
                  </p>
                </ion-label>
              </ion-item>

              <!-- 4. Orden de Taller (Generada / Entregada) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.folios.folio_orden_taller ? checkmarkCircle : timeOutline"
                  :color="unidad.folios.folio_orden_taller ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>4. Orden de Taller</h3>
                  <p>
                    <strong>No. Orden:</strong> {{ unidad.folios.folio_orden_taller || 'Pendiente de emitir' }}
                  </p>
                  <div class="orden-status-row">
                    <ion-badge :color="unidad.folios.folio_orden_taller ? 'primary' : 'medium'" class="mini-tag">
                      {{ unidad.folios.folio_orden_taller ? 'Orden Emitida por Logística' : 'Pendiente Emitir' }}
                    </ion-badge>
                  </div>
                </ion-label>
              </ion-item>

              <!-- 5. Estatus en Taller (Avance de refacciones, avance de mantenimiento y fecha/hora de entrada cruzada con odómetro) -->
              <ion-item lines="none" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR) ? checkmarkCircle : timeOutline"
                  :color="getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR) ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>5. Estatus en Taller</h3>

                  <!-- Registro de Entrada Cruzada (Usuario y Taller) -->
                  <div class="checkin-cruzado-box">
                    <span class="checkin-title">Registro de Entrada a Taller:</span>
                    <div class="registro-fila">
                      <span>• Operador (Usuario):</span>
                      <strong>
                        {{ getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.fecha_hora_declarada || 'Pendiente de registrar' }}
                        <span v-if="getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.lectura_odometro">
                          · {{ getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.OPERADOR)?.lectura_odometro?.toLocaleString() }} km
                        </span>
                      </strong>
                    </div>
                    <div class="registro-fila">
                      <span>• Personal del Taller:</span>
                      <strong>
                        {{ getRegistroTransito(unidad, TipoMovimiento.ENTRADA, ActorRegistro.TALLER)?.fecha_hora_declarada || 'Pendiente de registrar' }}
                      </strong>
                    </div>
                  </div>

                  <!-- Avances Reportados por el Taller -->
                  <div class="avances-box">
                    <div class="avance-row">
                      <span>Estatus de Refacciones:</span>
                      <ion-badge
                        :color="
                          unidad.estatus_refacciones === EstatusRefacciones.COMPLETO
                            ? 'success'
                            : unidad.estatus_refacciones === EstatusRefacciones.EN_PROCESO
                            ? 'warning'
                            : 'medium'
                        "
                      >
                        {{
                          unidad.estatus_refacciones === EstatusRefacciones.COMPLETO
                            ? 'Completadas 100%'
                            : unidad.estatus_refacciones === EstatusRefacciones.EN_PROCESO
                            ? 'En proceso de compra'
                            : 'Pendiente'
                        }}
                      </ion-badge>
                    </div>

                    <div class="progreso-mantenimiento">
                      <div class="progreso-label">
                        <span>Avance de Mantenimiento:</span>
                        <strong>{{ unidad.avance_mantenimiento }}%</strong>
                      </div>
                      <ion-progress-bar :value="unidad.avance_mantenimiento / 100" color="primary"></ion-progress-bar>
                    </div>
                  </div>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonBadge,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import {
  alertCircleOutline,
  checkmarkCircle,
  timeOutline,
} from 'ionicons/icons';
import {
  ExpedienteMantenimiento,
  TipoServicio,
  TipoFirmante,
  TipoMovimiento,
  ActorRegistro,
  EstatusRefacciones,
  RegistroTransito,
} from '@/types/mantenimiento';

const tieneFirma = (expediente: ExpedienteMantenimiento, firmante: TipoFirmante): boolean => {
  return expediente.firmas_presupuesto.some(
    (f) => f.tipo_firmante === firmante && f.firmado_fisicamente
  );
};

const todasFirmasPresupuesto = (expediente: ExpedienteMantenimiento): boolean => {
  return [TipoFirmante.OPERADOR, TipoFirmante.JEFE_AREA, TipoFirmante.SUPERVISOR].every(
    (firmante) => tieneFirma(expediente, firmante)
  );
};

const getRegistroTransito = (
  expediente: ExpedienteMantenimiento,
  mov: TipoMovimiento,
  actor: ActorRegistro
): RegistroTransito | undefined => {
  return expediente.registros_transito.find(
    (r) => r.tipo_movimiento === mov && r.actor_reporta === actor
  );
};

const unidadesEnProceso = ref<ExpedienteMantenimiento[]>([
  {
    id: 'u-01',
    numero_economico: '1000017590',
    placas: 'VM-4921-A',
    tipo_servicio: TipoServicio.CORRECTIVO,
    diagnostico_inicial: 'Pérdida de potencia en ascenso y fuga de aceite en retén de distribución',
    fecha_apertura: '04/09/2026',
    estado_actual: 'El operador debe ingresar la unidad al taller con la orden emitida',
    folios: {
      folio_cotizacion: 'COT-STD-4102',
      fecha_envio_cotizacion: '05/09/2026',
      folio_raf: 'RAF-BJ-2026-089',
      autorizado_cartera: true,
      folio_solicitud_psl: 'DTI2026000293',
      folio_orden_taller: 'MPC2026000456',
    },
    firmas_presupuesto: [
      {
        tipo_firmante: TipoFirmante.OPERADOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'C. Juan Pablo Domínguez',
        es_contingencia: false,
        fecha_hora_asentamiento: '05/09/2026 14:30',
      },
      {
        tipo_firmante: TipoFirmante.JEFE_AREA,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Carlos Mendoza',
        es_contingencia: false,
        fecha_hora_asentamiento: '06/09/2026 09:15',
      },
      {
        tipo_firmante: TipoFirmante.SUPERVISOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Fernando Ruiz',
        es_contingencia: false,
        fecha_hora_asentamiento: '06/09/2026 11:40',
      },
    ],
    registros_transito: [],
    estatus_refacciones: EstatusRefacciones.PENDIENTE,
    avance_mantenimiento: 0,
    conformidad_operador: false,
  },
  {
    id: 'u-02',
    numero_economico: '1000018420',
    placas: 'TB-1104-C',
    tipo_servicio: TipoServicio.PREVENTIVO,
    diagnostico_inicial: 'Mantenimiento preventivo mayor de 500 horas de motor y calibración general',
    fecha_apertura: '01/09/2026',
    estado_actual: 'Taller ejecutando trabajos mecánicos (Avance: 65%)',
    folios: {
      folio_cotizacion: 'COT-TMPT-7820',
      fecha_envio_cotizacion: '02/09/2026',
      folio_raf: 'RAF-BJ-2026-085',
      autorizado_cartera: true,
      folio_solicitud_psl: 'DTI2026000287',
      folio_orden_taller: 'MPC2026000450',
    },
    firmas_presupuesto: [
      {
        tipo_firmante: TipoFirmante.OPERADOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'C. Roberto Palma Suárez',
        es_contingencia: false,
        fecha_hora_asentamiento: '02/09/2026 10:00',
      },
      {
        tipo_firmante: TipoFirmante.JEFE_AREA,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Héctor Salazar',
        es_contingencia: false,
        fecha_hora_asentamiento: '03/09/2026 09:30',
      },
      {
        tipo_firmante: TipoFirmante.SUPERVISOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'Ing. Fernando Ruiz',
        es_contingencia: false,
        fecha_hora_asentamiento: '03/09/2026 12:00',
      },
    ],
    registros_transito: [
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.OPERADOR,
        fecha_hora_declarada: '06/09/2026 08:50',
        fecha_hora_servidor: '06/09/2026 08:51:14',
        lectura_odometro: 1850,
      },
      {
        tipo_movimiento: TipoMovimiento.ENTRADA,
        actor_reporta: ActorRegistro.TALLER,
        fecha_hora_declarada: '06/09/2026 09:00',
        fecha_hora_servidor: '06/09/2026 09:02:05',
        lectura_odometro: 1850,
      },
    ],
    estatus_refacciones: EstatusRefacciones.COMPLETO,
    avance_mantenimiento: 65,
    conformidad_operador: false,
  },
  {
    id: 'u-03',
    numero_economico: '1000019315',
    placas: 'TR-6029-A',
    tipo_servicio: TipoServicio.CORRECTIVO,
    diagnostico_inicial: 'Falla intermitente en inyección diésel y sensor de cigüeñal (CKP)',
    fecha_apertura: '08/09/2026',
    estado_actual: 'Pendiente recabar firma física de Jefe de Área Usuaria y Supervisor',
    folios: {
      folio_cotizacion: 'COT-INY-5120',
      fecha_envio_cotizacion: '09/09/2026',
      folio_raf: '',
      autorizado_cartera: false,
      folio_solicitud_psl: '',
      folio_orden_taller: '',
    },
    firmas_presupuesto: [
      {
        tipo_firmante: TipoFirmante.OPERADOR,
        firmado_fisicamente: true,
        usuario_que_asienta: 'C. David Cárdenas Gil',
        es_contingencia: false,
        fecha_hora_asentamiento: '09/09/2026 15:00',
      },
      {
        tipo_firmante: TipoFirmante.JEFE_AREA,
        firmado_fisicamente: false,
        usuario_que_asienta: '',
        es_contingencia: false,
        fecha_hora_asentamiento: '',
      },
      {
        tipo_firmante: TipoFirmante.SUPERVISOR,
        firmado_fisicamente: false,
        usuario_que_asienta: '',
        es_contingencia: false,
        fecha_hora_asentamiento: '',
      },
    ],
    registros_transito: [],
    estatus_refacciones: EstatusRefacciones.PENDIENTE,
    avance_mantenimiento: 0,
    conformidad_operador: false,
  },
]);
</script>

<style scoped>
.seguimiento-container {
  padding: 8px 4px 32px 4px;
}

.header-intro {
  padding: 8px 16px 12px 16px;
}

.header-intro h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--ion-color-dark);
}

.header-intro p {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.unidad-card {
  margin-bottom: 18px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.header-top-row {
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

.falla-box {
  background: var(--ion-color-light, #f4f5f8);
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.box-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ion-color-step-600, #666);
  margin-bottom: 2px;
}

.falla-box p {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--ion-color-dark);
}

.pendiente-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(var(--ion-color-warning-rgb), 0.08);
  border-left: 4px solid var(--ion-color-warning);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
}

.alert-icon {
  font-size: 20px;
  color: var(--ion-color-warning);
  margin-top: 1px;
}

.pendiente-box strong {
  font-size: 12px;
  color: var(--ion-color-warning-shade);
}

.pendiente-box p {
  margin: 2px 0 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.secuencia-titulo {
  margin: 12px 4px 6px 4px;
  font-size: 13px;
  color: var(--ion-color-step-800, #333);
}

.secuencia-list {
  margin: 0;
  padding: 0;
  border: 1px solid var(--ion-color-step-150, #e2e8f0);
  border-radius: 8px;
}

.secuencia-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
}

.secuencia-item h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin: 0 0 2px 0;
}

.secuencia-item p {
  margin: 2px 0;
  font-size: 12px;
  color: var(--ion-color-step-600, #555);
}

.sub-detalle {
  font-size: 11px !important;
  color: var(--ion-color-medium) !important;
}

.sub-status {
  font-size: 12px;
  font-weight: 600;
}

.text-success {
  color: var(--ion-color-success, #2dd36f);
}

.text-warning {
  color: var(--ion-color-warning-shade, #e0a800);
}

.firmas-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.firma-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  background: var(--ion-color-step-100, #f1f3f5);
  color: var(--ion-color-step-600, #666);
}

.firma-chip.signed {
  background: rgba(var(--ion-color-success-rgb), 0.12);
  color: var(--ion-color-success);
}

.orden-status-row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.mini-tag {
  font-size: 10px;
  padding: 2px 6px;
}

.checkin-cruzado-box {
  background: var(--ion-color-light, #f8fafc);
  padding: 8px 10px;
  border-radius: 6px;
  margin: 6px 0;
  border-left: 3px solid var(--ion-color-secondary);
}

.checkin-title {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--ion-color-step-700, #47525d);
  margin-bottom: 4px;
}

.registro-fila {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 2px;
  color: var(--ion-color-step-800, #333);
}

.avances-box {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--ion-color-step-700, #444);
}

.progreso-mantenimiento {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progreso-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ion-color-step-800, #333);
}
</style>
