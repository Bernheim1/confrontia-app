export interface MevFiltroOption<T = number> {
  value: T;
  text: string;
}

export interface MevFiltrosResponse {
  tramites: MevFiltroOption[];
  departamentos: MevFiltroOption[];
  estadosProceso: MevFiltroOption[];
  ordenesVisualizacion: MevFiltroOption<string>[];
}
