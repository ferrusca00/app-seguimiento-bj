/**
 * Modelos de Dominio para el Sistema de Mantenimiento Vehicular
 * Activo Bellota Jujo - PEMEX Exploración y Producción
 * 
 * Rol: Supervisor de Logística Terrestre
 * Enfoque: Panel de control, seguimiento y notificación de estatus.
 * Sin montos financieros. Todos los formatos son generados externamente.
 */

export type RolUsuario = 'supervisor' | 'operador' | 'jefe_area' | 'taller';

export type TipoMantenimiento = 'preventivo' | 'correctivo';

export type EtapaProceso =
  | 'presupuesto'      // 1. Presupuesto (3 firmas: Usuario, Jefe, Supervisor)
  | 'tramite_raf'      // 2. Trámite RAF y autorización en Cartera de Proyectos
  | 'solicitud_psl'    // 3. Solicitud de Servicio vía PSL por Área Usuaria
  | 'orden_taller'     // 4. Orden de Taller generada por Logística y entregada
  | 'en_taller'        // 5. Estatus en taller (Check-in cruzado, compras y avance mecánico)
  | 'concluido';       // 6. Concluido con salida cruzada y firma de conformidad

/**
 * Control del estado de firma física sobre los formatos impresos oficiales
 */
export interface RegistroFirmaFisica {
  firmado: boolean;
  fechaFirma?: string;
  responsableNombre?: string;
  cargo?: string;
  documentoEscaneadoUrl?: string;
}

export interface FirmasPresupuesto {
  usuario: RegistroFirmaFisica;         // Firma 1: Usuario / Operador de la unidad
  jefe: RegistroFirmaFisica;            // Firma 2: Jefe del usuario (Área Usuaria)
  supervisor: RegistroFirmaFisica;      // Firma 3: Supervisor de Logística Terrestre
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
  porcentajeAvanceTrabajos: number; // 0 a 100 %
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

export type ExpedienteMantenimiento = UnidadEnProceso;
