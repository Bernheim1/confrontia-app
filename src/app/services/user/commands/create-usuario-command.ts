import { Perfiles } from "../contracts/perfiles-enum";

export interface CreateUsuarioCommand {
    username: string;
    nombre: string;
    email: string;
    estudioId: string;
    perfil: Perfiles;
}