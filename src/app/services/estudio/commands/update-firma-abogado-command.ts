import { FirmaAbogadoDto } from "../contracts/firma-abogado-dto";

export interface UpdateFirmaAbogadoCommand {
    estudioId: string;
    firma: FirmaAbogadoDto | undefined;
}