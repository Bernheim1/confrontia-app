import { MevConfigDto } from "../../user/contracts/mev-config-dto";

export interface EstudioDto {
    id: string;
    nombre: string;
    cuit: string;
    direccion: string;
    telefono: string;
    email: string;
    mev?: MevConfigDto;
}