import { Perfiles } from "../contracts/perfiles-enum";

export interface UpdateUsuarioCommand {
    id: string;
    username: string;
    nombre: string;
    email: string;
    estudioId: string;
    perfil: Perfiles;
}