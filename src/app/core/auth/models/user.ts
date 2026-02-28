import { Perfiles } from "../../../services/user/contracts/perfiles-enum";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  perfil: Perfiles;
}