import { CategoriaFiscal } from "./categorias-ficales-dto";

export interface FirmaAbogadoDto {
    id: string;
    nombre: string;
    cuil: string;
    cuit: string;
    domicilio: string;
    domicilioElectronico: string;
    categoriaFiscal: CategoriaFiscal;
    nroLegajo: string;
    nroCajaPrevisoria: string;
}