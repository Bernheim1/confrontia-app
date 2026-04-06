export interface MevBusquedaCommand {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  domicilioElectronicoId?: number | null;
  tramiteIds?: number[] | null;
  departamento?: string | null;
  organismo?: string | null;
  textoEnCaratula?: string | null;
  textoEnDocumento?: string | null;
  codigoDeBarras?: string | null;
  estadoProceso?: string | null;
  ordenVisualizacion?: string | null;
  soloCasosPendientesHoy?: boolean | null;
}
