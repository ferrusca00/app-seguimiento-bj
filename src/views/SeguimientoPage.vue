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
              <span class="unidad-categoria">{{ unidad.tipoUnidad }}</span>
              <ion-badge :color="unidad.tipoMantenimiento === 'preventivo' ? 'warning' : 'danger'">
                {{ unidad.tipoMantenimiento.toUpperCase() }}
              </ion-badge>
            </div>
            <ion-card-title class="economico-title">No. Unidad: {{ unidad.numeroUnidad }}</ion-card-title>
            <ion-card-subtitle>
              Placas: {{ unidad.placas }} · {{ unidad.ubicacionActivo }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- Diagnóstico / Falla -->
            <div class="falla-box">
              <span class="box-label">Diagnóstico / Motivo de Servicio:</span>
              <p>{{ unidad.descripcionFalla }}</p>
            </div>

            <!-- Estatus / Acción Pendiente Inmediata -->
            <div class="pendiente-box">
              <ion-icon :icon="alertCircleOutline" class="alert-icon" aria-hidden="true"></ion-icon>
              <div>
                <strong>Acción Pendiente:</strong>
                <p>{{ unidad.pendienteActual }}</p>
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
                  <h3>1. Presupuesto (Firmas)</h3>
                  <p class="sub-detalle">Folio Taller: {{ unidad.presupuesto.folioPresupuesto }} ({{ unidad.presupuesto.tallerNombre }})</p>
                  
                  <div class="firmas-grid">
                    <span class="firma-chip" :class="{ signed: unidad.presupuesto.firmas.usuario.firmado }">
                      <ion-icon :icon="unidad.presupuesto.firmas.usuario.firmado ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Usuario (Operador)
                    </span>
                    <span class="firma-chip" :class="{ signed: unidad.presupuesto.firmas.jefe.firmado }">
                      <ion-icon :icon="unidad.presupuesto.firmas.jefe.firmado ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Jefe de Área
                    </span>
                    <span class="firma-chip" :class="{ signed: unidad.presupuesto.firmas.supervisor.firmado }">
                      <ion-icon :icon="unidad.presupuesto.firmas.supervisor.firmado ? checkmarkCircle : timeOutline" aria-hidden="true"></ion-icon>
                      Supervisor Logística
                    </span>
                  </div>
                </ion-label>
              </ion-item>

              <!-- 2. Trámite RAF (No. RAF generado y autorización de Cartera de Proyectos) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.raf.autorizadoCartera ? checkmarkCircle : timeOutline"
                  :color="unidad.raf.autorizadoCartera ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>2. Trámite RAF</h3>
                  <p>
                    <strong>No. RAF:</strong> {{ unidad.raf.numeroRaf || 'Pendiente de generación por Logística' }}
                  </p>
                  <p class="sub-status" :class="unidad.raf.autorizadoCartera ? 'text-success' : 'text-warning'">
                    {{ unidad.raf.autorizadoCartera ? 'Autorizado en Cartera de Proyectos (' + unidad.raf.oficioCartera + ')' : 'Pendiente de autorización en Cartera de Proyectos' }}
                  </p>
                </ion-label>
              </ion-item>

              <!-- 3. Solicitud de Servicio (Indicador de generación vía PSL) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.psl.generadoPorPsl ? checkmarkCircle : timeOutline"
                  :color="unidad.psl.generadoPorPsl ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>3. Solicitud de Servicio (PSL)</h3>
                  <p>
                    <strong>Folio PSL:</strong> {{ unidad.psl.folioSolicitudPsl || 'Pendiente de registrar por Área Usuaria' }}
                  </p>
                  <p class="sub-status" :class="unidad.psl.generadoPorPsl ? 'text-success' : 'text-warning'">
                    {{ unidad.psl.generadoPorPsl ? 'Generada vía PSL por el Área Usuaria' : 'Pendiente de generación en portal PSL' }}
                  </p>
                </ion-label>
              </ion-item>

              <!-- 4. Orden de Taller (Generada / Entregada) -->
              <ion-item lines="full" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.ordenTaller.entregadaAOperador ? checkmarkCircle : timeOutline"
                  :color="unidad.ordenTaller.entregadaAOperador ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>4. Orden de Taller</h3>
                  <p>
                    <strong>No. Orden:</strong> {{ unidad.ordenTaller.folioOrden || 'Pendiente de emitir' }}
                  </p>
                  <div class="orden-status-row">
                    <ion-badge :color="unidad.ordenTaller.generada ? 'primary' : 'medium'" class="mini-tag">
                      {{ unidad.ordenTaller.generada ? 'Generada por Logística' : 'Pendiente Generar' }}
                    </ion-badge>
                    <ion-badge :color="unidad.ordenTaller.entregadaAOperador ? 'success' : 'medium'" class="mini-tag">
                      {{ unidad.ordenTaller.entregadaAOperador ? 'Entregada al Operador' : 'Pendiente Entrega' }}
                    </ion-badge>
                  </div>
                </ion-label>
              </ion-item>

              <!-- 5. Estatus en Taller (Avance de refacciones, avance de mantenimiento y fecha/hora de entrada cruzada) -->
              <ion-item lines="none" class="secuencia-item">
                <ion-icon
                  slot="start"
                  :icon="unidad.ordenTaller.entrada.registradoUsuario ? checkmarkCircle : timeOutline"
                  :color="unidad.ordenTaller.entrada.registradoUsuario ? 'success' : 'medium'"
                  aria-hidden="true"
                ></ion-icon>
                <ion-label>
                  <h3>5. Estatus en Taller</h3>

                  <!-- Registro de Entrada (Usuario y Taller) -->
                  <div class="checkin-cruzado-box">
                    <span class="checkin-title">Registro de Entrada a Taller:</span>
                    <div class="registro-fila">
                      <span>• Operador (Usuario):</span>
                      <strong>{{ unidad.ordenTaller.entrada.fechaHoraUsuario || 'Pendiente de registrar' }}</strong>
                    </div>
                    <div class="registro-fila">
                      <span>• Personal del Taller:</span>
                      <strong>{{ unidad.ordenTaller.entrada.fechaHoraTaller || 'Pendiente de registrar' }}</strong>
                    </div>
                  </div>

                  <!-- Avances Reportados por el Taller -->
                  <div class="avances-box">
                    <div class="avance-row">
                      <span>Compra de Refacciones:</span>
                      <ion-badge :color="unidad.ordenTaller.comprasRefaccionesCompletadas ? 'success' : 'warning'">
                        {{ unidad.ordenTaller.comprasRefaccionesCompletadas ? 'Completadas 100%' : 'En proceso de compra' }}
                      </ion-badge>
                    </div>

                    <div class="progreso-mantenimiento">
                      <div class="progreso-label">
                        <span>Avance de Mantenimiento:</span>
                        <strong>{{ unidad.ordenTaller.porcentajeAvanceTrabajos }}%</strong>
                      </div>
                      <ion-progress-bar :value="unidad.ordenTaller.porcentajeAvanceTrabajos / 100" color="primary"></ion-progress-bar>
                      <p v-if="unidad.ordenTaller.descripcionAvance" class="avance-desc">
                        {{ unidad.ordenTaller.descripcionAvance }}
                      </p>
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
import { UnidadEnProceso } from '@/types/mantenimiento';

const todasFirmasPresupuesto = (unidad: UnidadEnProceso): boolean => {
  return (
    unidad.presupuesto.firmas.usuario.firmado &&
    unidad.presupuesto.firmas.jefe.firmado &&
    unidad.presupuesto.firmas.supervisor.firmado
  );
};

const unidadesEnProceso = ref<UnidadEnProceso[]>([
  {
    id: 'u-01',
    numeroUnidad: '1000017590',
    placas: 'VM-4921-A',
    tipoUnidad: 'Camioneta Pick-up 4x4',
    ubicacionActivo: 'Activo Bellota Jujo',
    operadorNombre: 'C. Juan Pablo Domínguez',
    jefeAreaNombre: 'Ing. Carlos Mendoza (Jefe de Sector)',
    tipoMantenimiento: 'correctivo',
    descripcionFalla: 'Pérdida de potencia en ascenso y fuga de aceite en retén de distribución',
    etapaActual: 'orden_taller',
    pendienteActual: 'El operador debe ingresar la unidad al taller con la orden emitida',
    fechaInicio: '04/09/2026',
    presupuesto: {
      id: 'PRE-001',
      folioPresupuesto: 'COT-STD-4102',
      tallerNombre: 'JR Estética Automotriz S.A. de C.V.',
      contratoPemex: '641002891',
      pedidoSap: '4500918234',
      fechaEmisionDiagnostico: '05/09/2026',
      generadoPorTaller: true,
      conceptos: [
        { id: 'c1', descripcion: 'Retén de cigüeñal delantero', tipo: 'refaccion', cantidad: 1 },
        { id: 'c2', descripcion: 'Juego de sellos para tapa de distribución', tipo: 'refaccion', cantidad: 1 },
        { id: 'c3', descripcion: 'Mano de obra: Desmontaje y cambio de retenes', tipo: 'mano_de_obra', cantidad: 1 },
      ],
      firmas: {
        usuario: { firmado: true, fechaFirma: '05/09/2026 14:30', responsableNombre: 'C. Juan Pablo Domínguez' },
        jefe: { firmado: true, fechaFirma: '06/09/2026 09:15', responsableNombre: 'Ing. Carlos Mendoza' },
        supervisor: { firmado: true, fechaFirma: '06/09/2026 11:40', responsableNombre: 'Ing. Fernando Ruiz' },
      },
    },
    raf: {
      numeroRaf: 'RAF-BJ-2026-089',
      fechaGeneracionLogistica: '06/09/2026',
      generadoPorLogistica: true,
      autorizadoCartera: true,
      fechaAutorizacionCartera: '07/09/2026',
      oficioCartera: 'CP-77/26',
    },
    psl: {
      folioSolicitudPsl: 'DTI2026000293',
      fechaSolicitud: '07/09/2026',
      generadoPorPsl: true,
    },
    ordenTaller: {
      folioOrden: 'MPC2026000456',
      fechaEmisionLogistica: '08/09/2026 08:30',
      generada: true,
      entregadaAOperador: true,
      entrada: {
        registradoUsuario: false,
        registradoTaller: false,
      },
      comprasRefaccionesCompletadas: false,
      porcentajeAvanceTrabajos: 0,
      salida: {
        registradoUsuario: false,
        registradoTaller: false,
      },
      firmaConformidad: {
        firmado: false,
      },
    },
  },
  {
    id: 'u-02',
    numeroUnidad: '1000018420',
    placas: 'TB-1104-C',
    tipoUnidad: 'Camión de Transporte de Personal',
    ubicacionActivo: 'Activo Bellota Jujo',
    operadorNombre: 'C. Roberto Palma Suárez',
    jefeAreaNombre: 'Ing. Héctor Salazar (Coordinador Jujo)',
    tipoMantenimiento: 'preventivo',
    descripcionFalla: 'Mantenimiento preventivo mayor de 500 horas de motor y calibración general',
    etapaActual: 'en_taller',
    pendienteActual: 'Taller ejecutando trabajos mecánicos (Avance: 65%)',
    fechaInicio: '01/09/2026',
    presupuesto: {
      id: 'PRE-002',
      folioPresupuesto: 'COT-TMPT-7820',
      tallerNombre: 'JR Estética Automotriz S.A. de C.V.',
      contratoPemex: '641002891',
      pedidoSap: '4500918235',
      fechaEmisionDiagnostico: '02/09/2026',
      generadoPorTaller: true,
      conceptos: [
        { id: 'c1', descripcion: 'Kit de filtros de aire, aceite y combustible diésel', tipo: 'refaccion', cantidad: 1 },
        { id: 'c2', descripcion: 'Mano de obra: Afinación mayor y calibración de inyectores', tipo: 'mano_de_obra', cantidad: 1 },
      ],
      firmas: {
        usuario: { firmado: true, fechaFirma: '02/09/2026', responsableNombre: 'C. Roberto Palma Suárez' },
        jefe: { firmado: true, fechaFirma: '03/09/2026', responsableNombre: 'Ing. Héctor Salazar' },
        supervisor: { firmado: true, fechaFirma: '03/09/2026', responsableNombre: 'Ing. Fernando Ruiz' },
      },
    },
    raf: {
      numeroRaf: 'RAF-BJ-2026-085',
      fechaGeneracionLogistica: '03/09/2026',
      generadoPorLogistica: true,
      autorizadoCartera: true,
      fechaAutorizacionCartera: '04/09/2026',
      oficioCartera: 'CP-72/26',
    },
    psl: {
      folioSolicitudPsl: 'DTI2026000287',
      fechaSolicitud: '04/09/2026',
      generadoPorPsl: true,
    },
    ordenTaller: {
      folioOrden: 'MPC2026000450',
      fechaEmisionLogistica: '05/09/2026',
      generada: true,
      entregadaAOperador: true,
      entrada: {
        fechaHoraUsuario: '06/09/2026 08:50',
        registradoUsuario: true,
        fechaHoraTaller: '06/09/2026 09:00',
        registradoTaller: true,
        lecturaUso: '1,850 hrs (Horómetro)',
      },
      comprasRefaccionesCompletadas: true,
      porcentajeAvanceTrabajos: 65,
      descripcionAvance: 'Refacciones recibidas; en calibración de bomba de inyección',
      salida: {
        registradoUsuario: false,
        registradoTaller: false,
      },
      firmaConformidad: {
        firmado: false,
      },
    },
  },
  {
    id: 'u-03',
    numeroUnidad: '1000019315',
    placas: 'TR-6029-A',
    tipoUnidad: 'Camioneta Pick-up Supervisión',
    ubicacionActivo: 'Activo Bellota Jujo',
    operadorNombre: 'C. David Cárdenas Gil',
    jefeAreaNombre: 'Ing. Mario Alcocer',
    tipoMantenimiento: 'correctivo',
    descripcionFalla: 'Falla intermitente en inyección diésel y sensor de cigüeñal (CKP)',
    etapaActual: 'presupuesto',
    pendienteActual: 'Pendiente recabar firma física de Jefe de Área Usuaria y Supervisor',
    fechaInicio: '08/09/2026',
    presupuesto: {
      id: 'PRE-004',
      folioPresupuesto: 'COT-INY-5120',
      tallerNombre: 'JR Estética Automotriz S.A. de C.V.',
      contratoPemex: '641002891',
      pedidoSap: '4500918240',
      fechaEmisionDiagnostico: '09/09/2026',
      generadoPorTaller: true,
      conceptos: [
        { id: 'c1', descripcion: 'Sensor de posición de cigüeñal (CKP)', tipo: 'refaccion', cantidad: 1 },
        { id: 'c2', descripcion: 'Bomba auxiliar de combustible diésel', tipo: 'refaccion', cantidad: 1 },
      ],
      firmas: {
        usuario: { firmado: true, fechaFirma: '09/09/2026 15:00', responsableNombre: 'C. David Cárdenas Gil' },
        jefe: { firmado: false },
        supervisor: { firmado: false },
      },
    },
    raf: {
      generadoPorLogistica: false,
      autorizadoCartera: false,
    },
    psl: {
      folioSolicitudPsl: '',
      fechaSolicitud: '',
      generadoPorPsl: false,
    },
    ordenTaller: {
      folioOrden: '',
      generada: false,
      entregadaAOperador: false,
      entrada: {
        registradoUsuario: false,
        registradoTaller: false,
      },
      comprasRefaccionesCompletadas: false,
      porcentajeAvanceTrabajos: 0,
      salida: {
        registradoUsuario: false,
        registradoTaller: false,
      },
      firmaConformidad: {
        firmado: false,
      },
    },
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

.ubicacion-text {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--ion-color-step-600, #555);
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

.avance-desc {
  font-size: 11px;
  font-style: italic;
  color: var(--ion-color-medium);
  margin: 2px 0 0 0;
}
</style>
