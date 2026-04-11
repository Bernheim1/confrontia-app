import { IPagedRequest } from "../../../shared/models/paged-request";

export interface GetGrillaCasosQuery extends GetGrillaCasosQueryFilters, IPagedRequest {

}

export interface GetGrillaCasosQueryFilters {
    nroExpediente: string;
    caratula: string;
    fechaIngresoDesde: Date;
    fechaIngresoHasta: Date;
}

