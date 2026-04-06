import { Perfiles } from "./perfiles-enum";
import { MevConfigDto } from "./mev-config-dto";

export interface UserDto {
    id: string;
    username: string;
    nombre: string;
    email: string;
    estudioId: string;
    perfil: Perfiles;
    mev?: MevConfigDto;
}