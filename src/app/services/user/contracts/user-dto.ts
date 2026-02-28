import { Perfiles } from "./perfiles-enum";

export interface UserDto {
    id: string;
    username: string;
    nombre: string;
    email: string;
    estudioId: string;
    perfil: Perfiles;
}