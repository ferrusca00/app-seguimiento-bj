<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Bandeja de Taller</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="taller-content">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title size="large">Bandeja de Taller</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="taller-container">
        <!-- Encabezado Institucional de la Bandeja -->
        <div class="intro-box">
          <h2>Bandeja de Pendientes de Taller</h2>
          <p>Gestión operativa de presupuestos, registro de entrada y salida, y control de mantenimiento - Activo Bellota Jujo</p>
        </div>

        <!-- Tarjetas de Unidades Pendientes en Taller -->
        <ion-card v-for="unidad in expedientesTaller" :key="unidad.id" class="taller-card">
          <!-- Encabezado de la Unidad -->
          <ion-card-header class="card-header-institucional">
            <div class="header-top-row">
              <span class="unidad-tipo">Servicio {{ unidad.tipo_servicio }}</span>
              <div class="header-chips">
                <ion-chip :color="getColorEstatus(unidad.estatus_mantenimiento)" class="mantenimiento-header-chip">
                  <ion-label>{{ getTextoEstatus(unidad.estatus_mantenimiento) }}</ion-label>
                </ion-chip>
                <ion-badge :color="unidad.tipo_servicio === TipoServicio.PREVENTIVO ? 'warning' : 'danger'">
                  {{ unidad.tipo_servicio }}
                </ion-badge>
              </div>
            </div>
            <ion-card-title class="unidad-title">No. Unidad: {{ unidad.numero_economico }}</ion-card-title>
            <ion-card-subtitle class="unidad-subtitle">
              Placas: {{ unidad.placas }} · Apertura: {{ unidad.fecha_apertura }}
            </ion-card-subtitle>
            <div class="diagnostico-preview">
              <span class="diagnostico-label">Diagnóstico Inicial:</span>
              <p>{{ unidad.diagnostico_inicial }}</p>
            </div>
            <div class="estado-tag">
              <strong>Estado Actual:</strong> {{ unidad.estado_actual }}
            </div>
          </ion-card-header>

          <ion-card-content class="card-content-operativo">
            <!-- ============================================== -->
            <!-- BLOQUE 1: CAPTURA DE PRESUPUESTO / COTIZACIÓN   -->
            <!-- ============================================== -->
            <div class="bloque-operativo">
              <div class="bloque-header">
                <ion-icon :icon="documentTextOutline" class="bloque-icon" aria-hidden="true"></ion-icon>
                <h3 class="bloque-titulo">1. Captura de Presupuesto / Cotización</h3>
              </div>

              <div class="bloque-cuerpo">
                <ion-item lines="none" class="input-item">
                  <ion-input
                    v-model="unidad.folios.folio_cotizacion"
                    label="Folio de Cotización del Taller"
                    label-placement="floating"
                    placeholder="Ej. COT-TLL-2026-041"
                    class="custom-input"
                  ></ion-input>
                </ion-item>

                <div v-if="unidad.folios.fecha_envio_cotizacion" class="status-notificado">
                  <ion-icon :icon="checkmarkCircle" color="success" aria-hidden="true"></ion-icon>
                  <span>Enviado a Logística el: <strong>{{ formatearFechaIso(unidad.folios.fecha_envio_cotizacion) }}</strong></span>
                </div>

                <ion-button
                  expand="block"
                  color="primary"
                  class="action-btn"
                  @click="notificarPresupuesto(unidad)"
                >
                  <ion-icon slot="start" :icon="paperPlaneOutline" aria-hidden="true"></ion-icon>
                  Notificar Envío a Logística
                </ion-button>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- BLOQUE 2: REGISTRO DE ENTRADA Y SALIDA        -->
            <!-- (Estampa automática de fecha/hora en background)-->
            <!-- ============================================== -->
            <div class="bloque-operativo">
              <div class="bloque-header">
                <ion-icon :icon="speedometerOutline" class="bloque-icon" aria-hidden="true"></ion-icon>
                <h3 class="bloque-titulo">2. Registro de Entrada y Salida</h3>
              </div>

              <div class="bloque-cuerpo">
                <!-- Entrada al Taller -->
                <div class="transito-seccion">
                  <div class="transito-subtitulo">
                    <ion-icon :icon="logInOutline" color="primary" aria-hidden="true"></ion-icon>
                    <strong>Entrada al Taller</strong>
                  </div>

                  <div v-if="tieneRegistro(unidad, TipoMovimiento.ENTRADA)" class="status-registrado">
                    <ion-icon :icon="checkmarkCircle" color="success" aria-hidden="true"></ion-icon>
                    <div>
                      <span>Registrado: <strong>{{ formatearFechaIso(getRegistro(unidad, TipoMovimiento.ENTRADA)?.fecha_hora_declarada || '') }}</strong></span>
                      <small>Odómetro: <strong>{{ getRegistro(unidad, TipoMovimiento.ENTRADA)?.lectura_odometro.toLocaleString() }} km</strong> (Actor: TALLER)</small>
                    </div>
                  </div>

                  <!-- Único campo manual obligatorio: odómetro numérico en km -->
                  <ion-item lines="none" class="input-item">
                    <ion-input
                      v-model.number="formularioTransito[unidad.id].odometroEntrada"
                      type="number"
                      label="Lectura Odómetro de Entrada (km)"
                      label-placement="floating"
                      placeholder="Ej. 94150"
                      class="custom-input"
                    ></ion-input>
                  </ion-item>

                  <ion-button
                    expand="block"
                    fill="outline"
                    color="primary"
                    class="action-btn-sm"
                    @click="registrarEntradaTaller(unidad)"
                  >
                    <ion-icon slot="start" :icon="logInOutline" aria-hidden="true"></ion-icon>
                    Registrar Entrada
                  </ion-button>
                </div>

                <!-- Salida del Taller -->
                <div class="transito-seccion salida-seccion">
                  <div class="transito-subtitulo">
                    <ion-icon :icon="logOutOutline" color="secondary" aria-hidden="true"></ion-icon>
                    <strong>Salida del Taller</strong>
                  </div>

                  <div v-if="tieneRegistro(unidad, TipoMovimiento.SALIDA)" class="status-registrado">
                    <ion-icon :icon="checkmarkCircle" color="success" aria-hidden="true"></ion-icon>
                    <div>
                      <span>Registrado: <strong>{{ formatearFechaIso(getRegistro(unidad, TipoMovimiento.SALIDA)?.fecha_hora_declarada || '') }}</strong></span>
                      <small>Odómetro: <strong>{{ getRegistro(unidad, TipoMovimiento.SALIDA)?.lectura_odometro.toLocaleString() }} km</strong> (Actor: TALLER)</small>
                    </div>
                  </div>

                  <!-- Único campo manual obligatorio: odómetro numérico en km -->
                  <ion-item lines="none" class="input-item">
                    <ion-input
                      v-model.number="formularioTransito[unidad.id].odometroSalida"
                      type="number"
                      label="Lectura Odómetro de Salida (km)"
                      label-placement="floating"
                      placeholder="Ej. 94155"
                      class="custom-input"
                    ></ion-input>
                  </ion-item>

                  <ion-button
                    expand="block"
                    fill="outline"
                    color="secondary"
                    class="action-btn-sm"
                    @click="registrarSalidaTaller(unidad)"
                  >
                    <ion-icon slot="start" :icon="logOutOutline" aria-hidden="true"></ion-icon>
                    Registrar Salida
                  </ion-button>
                </div>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- BLOQUE 3: CONTROL DE TRABAJOS Y REFACCIONES   -->
            <!-- ============================================== -->
            <div class="bloque-operativo">
              <div class="bloque-header">
                <ion-icon :icon="buildOutline" class="bloque-icon" aria-hidden="true"></ion-icon>
                <h3 class="bloque-titulo">3. Control de Trabajos y Refacciones</h3>
              </div>

              <div class="bloque-cuerpo">
                <!-- Selector de Estatus de Refacciones (Catálogo de 3 estados) -->
                <ion-item lines="none" class="input-item">
                  <ion-select
                    v-model="unidad.estatus_refacciones"
                    label="Estatus de Refacciones"
                    label-placement="floating"
                    interface="action-sheet"
                    class="custom-select"
                  >
                    <ion-select-option :value="EstatusRefacciones.PENDIENTE">
                      PENDIENTE (Por cotizar o autorizar)
                    </ion-select-option>
                    <ion-select-option :value="EstatusRefacciones.EN_PROCESO">
                      EN PROCESO (En compra / distribución)
                    </ion-select-option>
                    <ion-select-option :value="EstatusRefacciones.COMPLETO">
                      COMPLETO (100% en taller)
                    </ion-select-option>
                  </ion-select>
                </ion-item>

                <!-- Selector Táctil Rápido (ion-segment) para Estatus de Mantenimiento -->
                <div class="segment-mantenimiento-box">
                  <div class="segment-header">
                    <span class="segment-label">Estado de Mantenimiento:</span>
                    <ion-chip :color="getColorEstatus(unidad.estatus_mantenimiento)" class="mantenimiento-tag">
                      <ion-label>{{ getTextoEstatus(unidad.estatus_mantenimiento) }}</ion-label>
                    </ion-chip>
                  </div>

                  <ion-segment
                    :value="unidad.estatus_mantenimiento"
                    color="primary"
                    class="custom-segment"
                    @ionChange="cambiarEstatusMantenimiento(unidad, $event.detail.value)"
                  >
                    <ion-segment-button value="NO_INICIADO">
                      <ion-label>No Iniciado</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="EN_REPARACION">
                      <ion-label>En Reparación</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="CONCLUIDO">
                      <ion-label>Concluido</ion-label>
                    </ion-segment-button>
                  </ion-segment>
                </div>

                <ion-button
                  expand="block"
                  color="success"
                  class="action-btn"
                  @click="guardarTrabajos(unidad)"
                >
                  <ion-icon slot="start" :icon="checkmarkCircle" aria-hidden="true"></ion-icon>
                  Confirmar Control de Trabajos
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Notificación Visual Toast -->
      <ion-toast
        :is-open="toastState.isOpen"
        :message="toastState.message"
        :color="toastState.color"
        :duration="2800"
        position="bottom"
        @didDismiss="toastState.isOpen = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
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
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue';
import {
  buildOutline,
  checkmarkCircle,
  documentTextOutline,
  logInOutline,
  logOutOutline,
  paperPlaneOutline,
  speedometerOutline,
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

// Estado de feedback visual con Toast
const toastState = reactive({
  isOpen: false,
  message: '',
  color: 'success',
});

const mostrarToast = (mensaje: string, color = 'success') => {
  toastState.message = mensaje;
  toastState.color = color;
  toastState.isOpen = true;
};

// Formateador amigable de fecha ISO
const formatearFechaIso = (isoStr: string): string => {
  if (!isoStr) return '';
  try {
    const fecha = new Date(isoStr);
    return isNaN(fecha.getTime()) ? isoStr : fecha.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoStr;
  }
};

const getColorEstatus = (estatus: EstatusMantenimiento): string => {
  switch (estatus) {
    case 'NO_INICIADO':
      return 'medium';
    case 'EN_REPARACION':
      return 'primary';
    case 'EN_PRUEBAS':
      return 'warning';
    case 'CONCLUIDO':
      return 'success';
    default:
      return 'medium';
  }
};

const getTextoEstatus = (estatus: EstatusMantenimiento): string => {
  switch (estatus) {
    case 'NO_INICIADO':
      return 'No Iniciado';
    case 'EN_REPARACION':
      return 'En Reparación';
    case 'EN_PRUEBAS':
      return 'En Pruebas';
    case 'CONCLUIDO':
      return 'Concluido';
    default:
      return estatus;
  }
};

// Datos Simulados de Unidades en Bandeja de Taller
const expedientesTaller = ref<ExpedienteMantenimiento[]>([
  {
    id: 'tll-01',
    numero_economico: '1000017590',
    placas: 'VM-4921-A',
    tipo_servicio: TipoServicio.CORRECTIVO,
    diagnostico_inicial: 'Pérdida de potencia en ascenso y fuga de aceite en retén de distribución',
    fecha_apertura: '04/09/2026',
    estado_actual: 'En espera de recepción física y cotización final de taller',
    folios: {
      folio_cotizacion: 'COT-TLL-2026-088',
      fecha_envio_cotizacion: '',
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
    ],
    registros_transito: [],
    estatus_refacciones: EstatusRefacciones.PENDIENTE,
    estatus_mantenimiento: 'NO_INICIADO',
    conformidad_operador: false,
  },
  {
    id: 'tll-02',
    numero_economico: '1000019315',
    placas: 'TR-6029-A',
    tipo_servicio: TipoServicio.CORRECTIVO,
    diagnostico_inicial: 'Falla intermitente en inyección diésel y sensor de cigüeñal (CKP)',
    fecha_apertura: '08/09/2026',
    estado_actual: 'Pendiente captura de cotización y diagnóstico detallado',
    folios: {
      folio_cotizacion: '',
      fecha_envio_cotizacion: '',
      folio_raf: '',
      autorizado_cartera: false,
      folio_solicitud_psl: '',
      folio_orden_taller: '',
    },
    firmas_presupuesto: [],
    registros_transito: [],
    estatus_refacciones: EstatusRefacciones.PENDIENTE,
    estatus_mantenimiento: 'EN_REPARACION',
    conformidad_operador: false,
  },
]);

// Formularios locales para los campos obligatorios de odómetro (km) sin fechas manuales
const formularioTransito = reactive<Record<string, { odometroEntrada: number | null; odometroSalida: number | null }>>({
  'tll-01': {
    odometroEntrada: 94120,
    odometroSalida: null,
  },
  'tll-02': {
    odometroEntrada: 112450,
    odometroSalida: null,
  },
});

// Métodos auxiliares de consulta de tránsitos
const tieneRegistro = (unidad: ExpedienteMantenimiento, mov: TipoMovimiento): boolean => {
  return unidad.registros_transito.some(
    (r) => r.tipo_movimiento === mov && r.actor_reporta === ActorRegistro.TALLER
  );
};

const getRegistro = (unidad: ExpedienteMantenimiento, mov: TipoMovimiento): RegistroTransito | undefined => {
  return unidad.registros_transito.find(
    (r) => r.tipo_movimiento === mov && r.actor_reporta === ActorRegistro.TALLER
  );
};

// ==============================================
// ACCIONES REACTIVAS DE LOS BLOQUES OPERATIVOS
// ==============================================

// 1. Notificar Cotización a Logística
const notificarPresupuesto = (unidad: ExpedienteMantenimiento) => {
  if (!unidad.folios.folio_cotizacion || !unidad.folios.folio_cotizacion.trim()) {
    mostrarToast('Por favor captura un folio de cotización válido antes de notificar.', 'warning');
    return;
  }

  const fechaIso = new Date().toISOString();
  unidad.folios.fecha_envio_cotizacion = fechaIso;
  unidad.estado_actual = `Cotización ${unidad.folios.folio_cotizacion} notificada a Logística (${formatearFechaIso(fechaIso)})`;
  mostrarToast(`Cotización ${unidad.folios.folio_cotizacion} enviada a Logística exitosamente.`, 'success');
};

// 2. Registrar Entrada al Taller (Estampa automática ISO en background, odómetro manual)
const registrarEntradaTaller = (unidad: ExpedienteMantenimiento) => {
  const form = formularioTransito[unidad.id];
  if (form.odometroEntrada === null || form.odometroEntrada <= 0) {
    mostrarToast('Ingresa una lectura de odómetro obligatoria y válida en km.', 'warning');
    return;
  }

  // Estampa automática del sistema en segundo plano
  const fechaHoraSistema = new Date().toISOString();

  const indicePrevio = unidad.registros_transito.findIndex(
    (r) => r.tipo_movimiento === TipoMovimiento.ENTRADA && r.actor_reporta === ActorRegistro.TALLER
  );

  const nuevoRegistro: RegistroTransito = {
    tipo_movimiento: TipoMovimiento.ENTRADA,
    actor_reporta: ActorRegistro.TALLER,
    fecha_hora_declarada: fechaHoraSistema,
    fecha_hora_servidor: fechaHoraSistema,
    lectura_odometro: form.odometroEntrada,
  };

  if (indicePrevio >= 0) {
    unidad.registros_transito[indicePrevio] = nuevoRegistro;
  } else {
    unidad.registros_transito.push(nuevoRegistro);
  }

  unidad.estado_actual = `Unidad ingresada al taller (${formatearFechaIso(fechaHoraSistema)} · ${form.odometroEntrada.toLocaleString()} km)`;
  mostrarToast(`Entrada al taller de la unidad ${unidad.numero_economico} registrada (Actor: TALLER).`, 'success');
};

// 3. Registrar Salida del Taller (Estampa automática ISO en background, odómetro manual)
const registrarSalidaTaller = (unidad: ExpedienteMantenimiento) => {
  const form = formularioTransito[unidad.id];
  if (form.odometroSalida === null || form.odometroSalida <= 0) {
    form.odometroSalida = (form.odometroEntrada || 90000) + 5;
  }

  // Estampa automática del sistema en segundo plano
  const fechaHoraSistema = new Date().toISOString();

  const indicePrevio = unidad.registros_transito.findIndex(
    (r) => r.tipo_movimiento === TipoMovimiento.SALIDA && r.actor_reporta === ActorRegistro.TALLER
  );

  const nuevoRegistro: RegistroTransito = {
    tipo_movimiento: TipoMovimiento.SALIDA,
    actor_reporta: ActorRegistro.TALLER,
    fecha_hora_declarada: fechaHoraSistema,
    fecha_hora_servidor: fechaHoraSistema,
    lectura_odometro: form.odometroSalida,
  };

  if (indicePrevio >= 0) {
    unidad.registros_transito[indicePrevio] = nuevoRegistro;
  } else {
    unidad.registros_transito.push(nuevoRegistro);
  }

  unidad.estado_actual = `Unidad liberada del taller (${formatearFechaIso(fechaHoraSistema)} · ${form.odometroSalida.toLocaleString()} km)`;
  mostrarToast(`Salida del taller de la unidad ${unidad.numero_economico} registrada (Actor: TALLER).`, 'success');
};

// 4. Cambio rápido de estatus de mantenimiento táctil
const cambiarEstatusMantenimiento = (
  unidad: ExpedienteMantenimiento,
  nuevoValor: string | number | undefined | null
) => {
  if (!nuevoValor) return;
  const estatus = String(nuevoValor) as EstatusMantenimiento;
  unidad.estatus_mantenimiento = estatus;
  unidad.estado_actual = `Estado de trabajos: ${getTextoEstatus(estatus)} (Refacciones: ${unidad.estatus_refacciones})`;
  mostrarToast(`Estado de mantenimiento cambiado a "${getTextoEstatus(estatus)}"`, 'primary');
};

// 5. Guardar Trabajos y Refacciones
const guardarTrabajos = (unidad: ExpedienteMantenimiento) => {
  unidad.estado_actual = `Estado de trabajos: ${getTextoEstatus(unidad.estatus_mantenimiento)} (Refacciones: ${unidad.estatus_refacciones})`;
  mostrarToast(
    `Unidad ${unidad.numero_economico}: Trabajos confirmados en "${getTextoEstatus(unidad.estatus_mantenimiento)}" con refacciones en "${unidad.estatus_refacciones}".`,
    'success'
  );
};
</script>

<style scoped>
.taller-content {
  --background: #f4f5f8;
}

.taller-container {
  padding: 8px 6px 36px 6px;
  background-color: #f4f5f8;
  min-height: 100%;
}

.intro-box {
  padding: 8px 16px 12px 16px;
}

.intro-box h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #00573d;
}

.intro-box p {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.taller-card {
  margin-bottom: 22px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  background: #ffffff;
  border: 1px solid var(--ion-color-step-150, #e2e8f0);
}

.card-header-institucional {
  border-bottom: 2px solid #00573d;
  padding-bottom: 12px;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.header-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mantenimiento-header-chip {
  margin: 0;
  height: 24px;
  font-size: 11px;
  font-weight: 700;
}

.unidad-tipo {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #00573d;
  letter-spacing: 0.5px;
}

.unidad-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--ion-color-dark);
}

.unidad-subtitle {
  font-size: 12px;
  color: var(--ion-color-step-600, #666);
  margin-top: 2px;
}

.diagnostico-preview {
  background: #f8fafc;
  border-left: 3px solid #00573d;
  padding: 6px 10px;
  border-radius: 4px;
  margin-top: 8px;
}

.diagnostico-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #00573d;
  text-transform: uppercase;
}

.diagnostico-preview p {
  margin: 2px 0 0 0;
  font-size: 12px;
  line-height: 16px;
  color: var(--ion-color-step-800, #333);
}

.estado-tag {
  margin-top: 8px;
  font-size: 12px;
  color: var(--ion-color-step-700, #444);
  background: rgba(0, 87, 61, 0.06);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-content-operativo {
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bloque-operativo {
  background: #ffffff;
  border: 1px solid var(--ion-color-step-150, #e2e8f0);
  border-radius: 8px;
  padding: 12px;
}

.bloque-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--ion-color-step-100, #f1f5f9);
  padding-bottom: 8px;
}

.bloque-icon {
  font-size: 18px;
  color: #00573d;
}

.bloque-titulo {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #00573d;
}

.bloque-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-item {
  --background: #f8fafc;
  --border-radius: 6px;
  --padding-start: 10px;
  border: 1px solid var(--ion-color-step-200, #cbd5e1);
  border-radius: 6px;
  margin-bottom: 4px;
}

.custom-input {
  font-size: 13px;
  --color: var(--ion-color-dark);
}

.custom-select {
  font-size: 13px;
  width: 100%;
}

.status-notificado,
.status-registrado {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(var(--ion-color-success-rgb), 0.08);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ion-color-dark);
}

.status-registrado small {
  display: block;
  font-size: 11px;
  color: var(--ion-color-step-600, #555);
}

.transito-seccion {
  background: #fbfcfd;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--ion-color-step-100, #f1f5f9);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.salida-seccion {
  margin-top: 6px;
  border-top: 1px dashed var(--ion-color-step-200, #cbd5e1);
  padding-top: 12px;
}

.transito-subtitulo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-color-dark);
  margin-bottom: 2px;
}

.segment-mantenimiento-box {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--ion-color-step-200, #cbd5e1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.segment-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.mantenimiento-tag {
  margin: 0;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
}

.custom-segment {
  --background: #edf2f7;
  border-radius: 8px;
  padding: 2px;
}

.custom-segment ion-segment-button {
  --indicator-color: #00573d;
  --color-checked: #ffffff;
  --color: #47525d;
  font-size: 11px;
  font-weight: 600;
  min-height: 36px;
}

.action-btn {
  margin-top: 4px;
  font-weight: 700;
  font-size: 13px;
  --border-radius: 6px;
}

.action-btn-sm {
  margin: 2px 0 0 0;
  font-weight: 600;
  font-size: 12px;
  --border-radius: 6px;
}
</style>
