/**
 * Modelos de Dominio para el Sistema de Mantenimiento Vehicular
 * Activo Bellota Jujo - PEMEX Exploración y Producción
 * 
 * Diccionario de datos oficial para el seguimiento operativo y administrativo.
 */

// ==========================================
// ENUMS Y TIPOS DEL DOMINIO ACTIVO BELLOTA JUJO
// ==========================================

export enum TipoServicio {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
}

export enum TipoFirmante {
  OPERADOR = 'OPERADOR',
  JEFE_AREA = 'JEFE_AREA',
  SUPERVISOR = 'SUPERVISOR',
}

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

export enum ActorRegistro {
  OPERADOR = 'OPERADOR',
  TALLER = 'TALLER',
}

export enum EstatusRefacciones {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETO = 'COMPLETO',
}

// ==========================================
// INTERFACES DEL DICCIONARIO DE DATOS
// ==========================================

/**
 * Trazabilidad de firmas físicas sobre formatos impresos oficiales
 */
export interface BitacoraFirma {
  tipo_firmante: TipoFirmante;
  firmado_fisicamente: boolean;
  usuario_que_asienta: string;
  es_contingencia: boolean;
  fecha_hora_asentamiento: string;
}

/**
 * Registro de check-in / check-out cruzado de tránsito vehicular
 */
export interface RegistroTransito {
  tipo_movimiento: TipoMovimiento;
  actor_reporta: ActorRegistro;
  fecha_hora_declarada: string;
  fecha_hora_servidor: string;
  lectura_odometro: number;
}

/**
 * Trazabilidad de folios administrativos generados en plataformas externas
 */
export interface FoliosAdministrativos {
  folio_cotizacion: string;
  fecha_envio_cotizacion: string;
  folio_raf: string;
  autorizado_cartera: boolean;
  folio_solicitud_psl: string;
  folio_orden_taller: string;
}

/**
 * Expediente integral de mantenimiento vehicular
 */
export interface ExpedienteMantenimiento {
  // Datos base de la unidad
  id: string;
  numero_economico: string;
  placas: string;
  tipo_servicio: TipoServicio;
  diagnostico_inicial: string;
  fecha_apertura: string;
  estado_actual: string;

  // Bloques integrados
  folios: FoliosAdministrativos;
  firmas_presupuesto: BitacoraFirma[];
  registros_transito: RegistroTransito[];
  estatus_refacciones: EstatusRefacciones;
  avance_mantenimiento: number; // 0 a 100
  fecha_notificacion_termino?: string;
  conformidad_operador: boolean;
  fecha_conformidad?: string;
}

// ==========================================
// TIPOS E INTERFACES HEREDADAS / COMPATIBILIDAD
// ==========================================

export type RolUsuario = 'supervisor' | 'operador' | 'jefe_area' | 'taller';
export type TipoMantenimiento = 'preventivo' | 'correctivo';
export type EtapaProceso =
  | 'presupuesto'
  | 'tramite_raf'
  | 'solicitud_psl'
  | 'orden_taller'
  | 'en_taller'
  | 'concluido';

export interface RegistroFirmaFisica {
  firmado: boolean;
  fechaFirma?: string;
  responsableNombre?: string;
  cargo?: string;
  documentoEscaneadoUrl?: string;
}

export interface FirmasPresupuesto {
  usuario: RegistroFirmaFisica;
  jefe: RegistroFirmaFisica;
  supervisor: RegistroFirmaFisica;
}

export interface ConceptoMantenimiento {
  id: string;
  descripcion: string;
  tipo: 'refaccion' | 'mano_de_obra';
  cantidad: number;
}

export interface DatosPresupuestoExterno {
  id: string;
  folioPresupuesto: string;
  tallerNombre: string;
  contratoPemex: string;
  pedidoSap: string;
  fechaEmisionDiagnostico: string;
  generadoPorTaller: boolean;
  conceptos: ConceptoMantenimiento[];
  firmas: FirmasPresupuesto;
}

export interface DatosRAF {
  numeroRaf?: string;
  fechaGeneracionLogistica?: string;
  generadoPorLogistica: boolean;
  autorizadoCartera: boolean;
  fechaAutorizacionCartera?: string;
  oficioCartera?: string;
}

export interface DatosPSL {
  folioSolicitudPsl?: string;
  fechaSolicitud?: string;
  generadoPorPsl: boolean;
  solicitudEscaneadaUrl?: string;
}

export interface RegistroCruzadoEntrada {
  fechaHoraUsuario?: string;
  registradoUsuario: boolean;
  fechaHoraTaller?: string;
  registradoTaller: boolean;
  lecturaUso?: string;
}

export interface RegistroCruzadoSalida {
  fechaHoraUsuario?: string;
  registradoUsuario: boolean;
  fechaHoraTaller?: string;
  registradoTaller: boolean;
}

export interface DatosOrdenTaller {
  folioOrden: string;
  fechaEmisionLogistica?: string;
  generada: boolean;
  entregadaAOperador: boolean;
  entrada: RegistroCruzadoEntrada;
  comprasRefaccionesCompletadas: boolean;
  porcentajeAvanceTrabajos: number;
  descripcionAvance?: string;
  salida: RegistroCruzadoSalida;
  firmaConformidad: RegistroFirmaFisica;
}

export interface UnidadEnProceso {
  id: string;
  folio?: string;
  numeroUnidad: string;
  numeroEconomico?: string;
  placas: string;
  tipoUnidad: string;
  ubicacionActivo: string;
  operadorNombre: string;
  jefeAreaNombre: string;
  tipoMantenimiento: TipoMantenimiento;
  descripcionFalla: string;
  etapaActual: EtapaProceso;
  pendienteActual: string;
  fechaInicio: string;
  presupuesto: DatosPresupuestoExterno;
  raf: DatosRAF;
  psl: DatosPSL;
  ordenTaller: DatosOrdenTaller;
}
