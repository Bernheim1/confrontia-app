export interface MevConfigDto {
    enabled: boolean;
    username?: string;
    password?: string;
    ultimaEjecucion?: Date;
    error?: string;
}

export interface ConfigurarMevCommand {
    id: string;
    enabled: boolean;
    username?: string;
    password?: string;
}
