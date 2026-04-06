export enum CategoriaFiscal
{
    ResponsableInscripto = 1,
    Monotributista = 2,
    ConsumidorFinal = 3,
    Exento = 4,
    NoResponsable = 5,
    ResponsableMonotributoSocial = 6,
    SujetoNoCategorizado = 7,
    ProveedorExterior = 8,
    ClienteExterior = 9,
    IVA_Liberado = 10
}

export const categoriaFiscalCollection: {id: CategoriaFiscal; description: string}[] = [
    { id: CategoriaFiscal.ResponsableInscripto, description: 'Responsable inscripto' },
    { id: CategoriaFiscal.Monotributista, description: 'Monotributista' },
    { id: CategoriaFiscal.ConsumidorFinal, description: 'Consumidor final' },
    { id: CategoriaFiscal.Exento, description: 'Exento' },
    { id: CategoriaFiscal.NoResponsable, description: 'No responsable' },
    { id: CategoriaFiscal.ResponsableMonotributoSocial, description: 'Responsable monotributo social' },
    { id: CategoriaFiscal.SujetoNoCategorizado, description: 'Sujeto no categorizado' },
    { id: CategoriaFiscal.ProveedorExterior, description: 'Proveedor exterior' },
    { id: CategoriaFiscal.ClienteExterior, description: 'Cliente exterior' },
    { id: CategoriaFiscal.IVA_Liberado, description: 'IVA liberado' },
].sort((x, y) => x.description.localeCompare(y.description));