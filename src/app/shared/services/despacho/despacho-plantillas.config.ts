export const PLANTILLAS: {
  [tipo: string]: {
    [subtipo: string]: {
      [campo: string]: any
    }
  }
} = {
  Mandamiento: {
    IntimacionPago: { 
      tipoDomicilio: { denunciado: true, constituido: false }, 
      expediente: { copiasTraslado: true, tipoDiligencia: 'Mandamiento de intimación de pago y citación de remate' },
      caracter: { urgente: false, habilitacionDiaHora: false }
    },
  },
  Cedula: {
    TrasladoDemanda: { 
      tipoDomicilio: { denunciado: true, constituido: false },
      expediente: { copiasTraslado: true, tipoDiligencia: 'Cédula de traslado de demanda' }
    },
  }
};