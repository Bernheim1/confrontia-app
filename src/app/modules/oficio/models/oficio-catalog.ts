export type OficioFieldType = 'text' | 'textarea' | 'number' | 'date' | 'money' | 'email' | 'percent';

export interface OficioFieldConfig {
  key: string;
  label: string;
  type: OficioFieldType;
  required?: boolean;
  placeholder?: string;
  section?: string;
}

export interface OficioTypeConfig {
  code: string;
  categoryCode: string;
  categoryName: string;
  label: string;
  organismoDestino: string;
  template: string;
  fields: OficioFieldConfig[];
}

const commonCaseFields: OficioFieldConfig[] = [
  { key: 'caratula', label: 'Carátula', type: 'text', required: true, section: 'Expediente' },
  { key: 'numeroExpediente', label: 'Número de expediente', type: 'text', required: true, section: 'Expediente' }
];

export const OFICIO_TYPES: OficioTypeConfig[] = [
  {
    code: 'OMN-1',
    categoryCode: 'OMN',
    categoryName: 'Oficina de Mandamientos y Notificaciones',
    label: 'Informe de resultado de diligencia',
    organismoDestino: 'Oficina de Mandamientos y Notificaciones',
    template: 'Atento lo solicitado y constancias de autos, líbrese oficio a la Oficina de Mandamientos y Notificaciones del Departamento Judicial de {{departamento}} a fin de que informe el resultado de la cédula/mandamiento librado con fecha {{fecha}}, dirigido al domicilio sito en {{domicilio}}, en los presentes autos caratulados "{{caratula}}", expte. nº {{numeroExpediente}}.',
    fields: [
      { key: 'departamento', label: 'Departamento judicial', type: 'text', required: true, section: 'Destino' },
      { key: 'fecha', label: 'Fecha de libramiento', type: 'date', required: true, section: 'Diligencia' },
      { key: 'domicilio', label: 'Domicilio', type: 'text', required: true, section: 'Diligencia' },
      ...commonCaseFields
    ]
  },
  {
    code: 'OMN-2',
    categoryCode: 'OMN',
    categoryName: 'Oficina de Mandamientos y Notificaciones',
    label: 'Reiteración de diligencia sin resultado',
    organismoDestino: 'Oficina de Mandamientos y Notificaciones',
    template: 'No habiéndose obtenido resultado de la diligencia ordenada con fecha {{fecha}}, reitérese el oficio oportunamente librado a la Oficina de Mandamientos y Notificaciones de {{departamento}}, haciéndose saber que deberá arbitrarse los medios necesarios para su cumplimiento bajo apercibimiento de ley.',
    fields: [
      { key: 'fecha', label: 'Fecha de diligencia previa', type: 'date', required: true, section: 'Diligencia' },
      { key: 'departamento', label: 'Departamento judicial', type: 'text', required: true, section: 'Destino' }
    ]
  },
  {
    code: 'OMN-3',
    categoryCode: 'OMN',
    categoryName: 'Oficina de Mandamientos y Notificaciones',
    label: 'Devolución de cédula diligenciada',
    organismoDestino: 'Oficina de Mandamientos y Notificaciones',
    template: 'Atento el estado de las actuaciones, líbrese oficio a la Oficina de Mandamientos y Notificaciones de {{departamento}} a fin de que proceda a la devolución de la cédula librada en autos con fecha {{fecha}}, debidamente diligenciada o con constancia de la causa de su no diligenciamiento.',
    fields: [
      { key: 'departamento', label: 'Departamento judicial', type: 'text', required: true, section: 'Destino' },
      { key: 'fecha', label: 'Fecha de libramiento', type: 'date', required: true, section: 'Diligencia' }
    ]
  },
  {
    code: 'RPI-1',
    categoryCode: 'RPI',
    categoryName: 'Registro de la Propiedad Inmueble',
    label: 'Informe de dominio e inhibiciones',
    organismoDestino: 'Registro de la Propiedad Inmueble de la Provincia de Buenos Aires',
    template: 'Atento lo peticionado, líbrese oficio al Registro de la Propiedad Inmueble de la Provincia de Buenos Aires a fin de que informe si {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, registra bienes inmuebles a su nombre en el partido de {{partido}} o en cualquier otra jurisdicción provincial, como así también si registra inhibiciones generales de bienes vigentes. Protocolícese.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'partido', label: 'Partido', type: 'text', required: true, section: 'Consulta' }
    ]
  },
  {
    code: 'RPI-2',
    categoryCode: 'RPI',
    categoryName: 'Registro de la Propiedad Inmueble',
    label: 'Anotación de embargo sobre inmueble',
    organismoDestino: 'Registro de la Propiedad Inmueble de la Provincia de Buenos Aires',
    template: 'Atento lo resuelto con fecha {{fecha}} y el monto embargado, líbrese oficio al Registro de la Propiedad Inmueble de la Provincia de Buenos Aires a fin de que proceda a la anotación del embargo decretado en autos sobre el inmueble ubicado en {{direccion}}, Nomenclatura Catastral {{datosCatastrales}}, inscripto bajo Matrícula/Folio Real nº {{matricula}}, hasta cubrir la suma de ${{monto}} con más intereses y costas. Protocolícese.',
    fields: [
      { key: 'fecha', label: 'Fecha de resolución', type: 'date', required: true, section: 'Medida' },
      { key: 'direccion', label: 'Dirección del inmueble', type: 'text', required: true, section: 'Inmueble' },
      { key: 'datosCatastrales', label: 'Nomenclatura catastral', type: 'text', required: true, section: 'Inmueble' },
      { key: 'matricula', label: 'Matrícula / Folio real', type: 'text', required: true, section: 'Inmueble' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' }
    ]
  },
  {
    code: 'RPI-3',
    categoryCode: 'RPI',
    categoryName: 'Registro de la Propiedad Inmueble',
    label: 'Levantamiento de embargo o inhibición',
    organismoDestino: 'Registro de la Propiedad Inmueble de la Provincia de Buenos Aires',
    template: 'Atento lo acordado por las partes / lo resuelto en autos, líbrese oficio al Registro de la Propiedad Inmueble de la Provincia de Buenos Aires a fin de que proceda al levantamiento del embargo/inhibición anotado con fecha {{fecha}} sobre el inmueble / a nombre de {{titular}}, dejando constancia del presente en los registros correspondientes. Protocolícese.',
    fields: [
      { key: 'fecha', label: 'Fecha de anotación', type: 'date', required: true, section: 'Medida' },
      { key: 'titular', label: 'Titular', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'RPA-1',
    categoryCode: 'RPA',
    categoryName: 'Registro Automotor',
    label: 'Informe de titularidad de vehículos',
    organismoDestino: 'Registro Nacional de la Propiedad Automotor',
    template: 'Atento lo solicitado, líbrese oficio al Registro Seccional de la Propiedad Automotor nº {{registroNumero}} de {{localidad}} y/o al Registro Nacional de la Propiedad Automotor a fin de que informe si {{nombreRazonSocial}}, DNI {{numeroDocumento}}, registra vehículos automotores a su nombre, detallando marca, modelo, año, dominio y existencia de gravámenes.',
    fields: [
      { key: 'registroNumero', label: 'Número de registro seccional', type: 'text', required: true, section: 'Destino' },
      { key: 'localidad', label: 'Localidad', type: 'text', required: true, section: 'Destino' },
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'RPA-2',
    categoryCode: 'RPA',
    categoryName: 'Registro Automotor',
    label: 'Anotación de embargo sobre automotor',
    organismoDestino: 'Registro Nacional de la Propiedad Automotor',
    template: 'Atento la medida cautelar decretada, líbrese oficio al Registro Nacional de la Propiedad Automotor a fin de que proceda a la anotación del embargo sobre el vehículo dominio {{patente}}, marca {{marca}}, modelo {{modelo}}, año {{anio}}, titular {{nombreRazonSocial}}, hasta cubrir la suma de ${{monto}} con más intereses y costas.',
    fields: [
      { key: 'patente', label: 'Patente', type: 'text', required: true, section: 'Vehículo' },
      { key: 'marca', label: 'Marca', type: 'text', required: true, section: 'Vehículo' },
      { key: 'modelo', label: 'Modelo', type: 'text', required: true, section: 'Vehículo' },
      { key: 'anio', label: 'Año', type: 'number', required: true, section: 'Vehículo' },
      { key: 'nombreRazonSocial', label: 'Titular', type: 'text', required: true, section: 'Titular' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' }
    ]
  },
  {
    code: 'BCRA-1',
    categoryCode: 'BCRA',
    categoryName: 'Banco Central',
    label: 'Informe general de cuentas',
    organismoDestino: 'Banco Central de la República Argentina',
    template: 'Atento lo peticionado, líbrese oficio al Banco Central de la República Argentina a fin de que informe si {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, registra cuentas bancarias, cajas de ahorro, plazos fijos u otros productos financieros en entidades bajo su supervisión, indicando entidad, tipo de cuenta y saldos aproximados a la fecha de su respuesta.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'BNK-1',
    categoryCode: 'BNK',
    categoryName: 'Entidades Bancarias',
    label: 'Embargo sobre fondos en cuenta bancaria',
    organismoDestino: 'Entidad bancaria',
    template: 'Atento la medida cautelar decretada en autos, líbrese oficio al {{bancoNombre}}, sucursal {{bancoSucursal}}, a fin de que proceda a trabar embargo sobre los fondos depositados en cuentas de cualquier tipo pertenecientes a {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, hasta cubrir la suma de ${{monto}} con más intereses y costas. Deberá informar a este Tribunal dentro del plazo de {{dias}} días hábiles el resultado de la medida.',
    fields: [
      { key: 'bancoNombre', label: 'Banco', type: 'text', required: true, section: 'Destino' },
      { key: 'bancoSucursal', label: 'Sucursal', type: 'text', required: true, section: 'Destino' },
      { key: 'nombreRazonSocial', label: 'Titular', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' },
      { key: 'dias', label: 'Días hábiles', type: 'number', required: true, section: 'Plazo' }
    ]
  },
  {
    code: 'BNK-2',
    categoryCode: 'BNK',
    categoryName: 'Entidades Bancarias',
    label: 'Informe de movimientos bancarios',
    organismoDestino: 'Entidad bancaria',
    template: 'Atento lo ordenado, líbrese oficio al {{bancoNombre}} a fin de que informe los movimientos registrados en la/s cuenta/s perteneciente/s a {{titular}}, CUIT/DNI {{numeroDocumento}}, durante el período comprendido entre el {{fechaInicio}} y el {{fechaFin}}, remitiendo la documentación correspondiente a este Juzgado.',
    fields: [
      { key: 'bancoNombre', label: 'Banco', type: 'text', required: true, section: 'Destino' },
      { key: 'titular', label: 'Titular', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'CUIT / DNI', type: 'text', required: true, section: 'Titular' },
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date', required: true, section: 'Período' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date', required: true, section: 'Período' }
    ]
  },
  {
    code: 'AFIP-1',
    categoryCode: 'AFIP',
    categoryName: 'AFIP / ARCA',
    label: 'Informe patrimonial y fiscal',
    organismoDestino: 'AFIP / ARCA',
    template: 'Atento lo solicitado, líbrese oficio a la Administración Federal de Ingresos Públicos (AFIP/ARCA) a fin de que informe respecto de {{nombreRazonSocial}}, CUIT {{numeroDocumento}}: (i) actividad económica declarada; (ii) última declaración jurada de Ganancias y Bienes Personales; (iii) si registra deudas con el organismo; (iv) bienes declarados. Todo ello en el marco del principio de colaboración entre poderes del Estado.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'AFIP-2',
    categoryCode: 'AFIP',
    categoryName: 'AFIP / ARCA',
    label: 'Anotación de inhibición general de bienes',
    organismoDestino: 'AFIP / ARCA',
    template: 'Atento la condena / medida cautelar dictada en autos, líbrese oficio a la AFIP/ARCA a fin de que proceda a registrar la inhibición general de bienes decretada respecto de {{nombreRazonSocial}}, CUIT {{numeroDocumento}}, en los términos del art. {{articulo}} del CPCC, hasta tanto se satisfaga la suma de ${{monto}}.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'articulo', label: 'Artículo', type: 'text', required: true, section: 'Medida' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' }
    ]
  },
  {
    code: 'ANS-1',
    categoryCode: 'ANS',
    categoryName: 'ANSES',
    label: 'Informe de haberes previsionales',
    organismoDestino: 'ANSES',
    template: 'Atento lo peticionado, líbrese oficio a la Administración Nacional de la Seguridad Social (ANSES) a fin de que informe si {{nombreRazonSocial}}, DNI {{numeroDocumento}}, percibe haberes jubilatorios, pensiones, prestaciones por desempleo u otros beneficios previsionales, indicando monto, periodicidad y CBU de acreditación.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'ANS-2',
    categoryCode: 'ANS',
    categoryName: 'ANSES',
    label: 'Embargo sobre haberes previsionales',
    organismoDestino: 'ANSES',
    template: 'Atento la medida decretada y en los términos del art. 14 bis CN y normativa previsional aplicable, líbrese oficio a ANSES a fin de que proceda a retener y depositar en autos el {{porcentaje}}% de los haberes que percibe {{nombreRazonSocial}}, DNI {{numeroDocumento}}, beneficio nº {{beneficioNumero}}, hasta cubrir la suma de ${{monto}} con más intereses, dando cuenta a este Juzgado dentro de los {{dias}} días hábiles.',
    fields: [
      { key: 'porcentaje', label: 'Porcentaje', type: 'percent', required: true, section: 'Medida' },
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' },
      { key: 'beneficioNumero', label: 'Número de beneficio', type: 'text', required: true, section: 'Beneficio' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' },
      { key: 'dias', label: 'Días hábiles', type: 'number', required: true, section: 'Plazo' }
    ]
  },
  {
    code: 'REN-1',
    categoryCode: 'REN',
    categoryName: 'RENAPER',
    label: 'Informe de domicilio y datos registrales',
    organismoDestino: 'RENAPER',
    template: 'Atento lo solicitado y a efectos de practicar la notificación ordenada, líbrese oficio al Registro Nacional de las Personas (RENAPER) a fin de que informe el último domicilio registrado de {{nombreRazonSocial}}, DNI {{numeroDocumento}}, fecha de nacimiento {{fechaNacimiento}}, como así también si registra defunción.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' },
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'CNE-1',
    categoryCode: 'CNE',
    categoryName: 'Cámara Nacional Electoral',
    label: 'Informe de domicilio electoral',
    organismoDestino: 'Cámara Nacional Electoral',
    template: 'Atento lo solicitado, líbrese oficio a la Cámara Nacional Electoral a fin de que informe el domicilio electoral registrado de {{nombreRazonSocial}}, DNI {{numeroDocumento}}, como así también distrito electoral y cualquier otra información que surja del padrón electoral vigente.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'CNE-2',
    categoryCode: 'CNE',
    categoryName: 'Cámara Nacional Electoral',
    label: 'Constatación de fallecimiento / baja de padrón',
    organismoDestino: 'Cámara Nacional Electoral',
    template: 'Atento las constancias de autos, líbrese oficio a la Cámara Nacional Electoral a fin de que informe si {{nombreRazonSocial}}, DNI {{numeroDocumento}}, figura en el padrón electoral vigente o si registra baja por fallecimiento u otra causal, indicando fecha de la misma.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI', type: 'text', required: true, section: 'Titular' }
    ]
  },
  {
    code: 'IGJ-1',
    categoryCode: 'IGJ',
    categoryName: 'Inspección General de Justicia',
    label: 'Informe de persona jurídica',
    organismoDestino: 'Inspección General de Justicia',
    template: 'Atento lo peticionado, líbrese oficio a la Inspección General de Justicia a fin de que informe respecto de la sociedad {{razonSocial}}, CUIT {{numeroDocumento}}, expediente IGJ nº {{expedienteIgjNumero}}: (i) fecha de constitución y tipo societario; (ii) nómina de autoridades y socios/accionistas registrados; (iii) domicilio legal; (iv) si registra sanciones, intervenciones o irregularidades; (v) si se encuentra en actividad o en proceso de disolución/liquidación.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Sociedad' },
      { key: 'expedienteIgjNumero', label: 'Expediente IGJ', type: 'text', required: false, section: 'Sociedad' }
    ]
  },
  {
    code: 'IGJ-2',
    categoryCode: 'IGJ',
    categoryName: 'Inspección General de Justicia',
    label: 'Informe de representantes legales',
    organismoDestino: 'Inspección General de Justicia',
    template: 'Atento lo solicitado, líbrese oficio a la Inspección General de Justicia a fin de que informe quiénes son los representantes legales y/o apoderados registrados de {{razonSocial}}, CUIT {{numeroDocumento}}, con indicación de sus datos de identidad y domicilios denunciados ante el organismo.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Sociedad' }
    ]
  },
  {
    code: 'IGJ-3',
    categoryCode: 'IGJ',
    categoryName: 'Inspección General de Justicia',
    label: 'Anotación de medida cautelar',
    organismoDestino: 'Inspección General de Justicia',
    template: 'Atento la medida decretada en autos, líbrese oficio a la Inspección General de Justicia a fin de que proceda a tomar razón de la inhibición/intervención/medida cautelar dispuesta respecto de {{razonSocial}}, CUIT {{numeroDocumento}}, en los términos resueltos con fecha {{fecha}}, dando cuenta a este Tribunal de su cumplimiento.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Sociedad' },
      { key: 'fecha', label: 'Fecha de resolución', type: 'date', required: true, section: 'Medida' }
    ]
  },
  {
    code: 'DPPJ-1',
    categoryCode: 'DPPJ',
    categoryName: 'Dirección Provincial de Personas Jurídicas',
    label: 'Informe de persona jurídica provincial',
    organismoDestino: 'Dirección Provincial de Personas Jurídicas de la Provincia de Buenos Aires',
    template: 'Atento lo peticionado, líbrese oficio a la Dirección Provincial de Personas Jurídicas de la Provincia de Buenos Aires a fin de que informe respecto de {{razonSocial}}, CUIT {{numeroDocumento}}, matrícula nº {{matricula}}: (i) tipo societario y fecha de constitución; (ii) socios, accionistas y autoridades vigentes; (iii) domicilio legal registrado; (iv) si se encuentra activa, disuelta, liquidada o sancionada; (v) último balance o acto inscripto.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Sociedad' },
      { key: 'matricula', label: 'Matrícula', type: 'text', required: false, section: 'Sociedad' }
    ]
  },
  {
    code: 'DPPJ-2',
    categoryCode: 'DPPJ',
    categoryName: 'Dirección Provincial de Personas Jurídicas',
    label: 'Informe de representantes y domicilio social',
    organismoDestino: 'Dirección Provincial de Personas Jurídicas',
    template: 'Atento lo solicitado, líbrese oficio a la Dirección Provincial de Personas Jurídicas a fin de que informe los representantes legales, administradores y domicilio social registrados de {{razonSocial}}, CUIT {{numeroDocumento}}, remitiendo copia del instrumento constitutivo y sus modificaciones si las hubiere.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'numeroDocumento', label: 'CUIT', type: 'text', required: true, section: 'Sociedad' }
    ]
  },
  {
    code: 'DPPJ-3',
    categoryCode: 'DPPJ',
    categoryName: 'Dirección Provincial de Personas Jurídicas',
    label: 'Anotación de medida cautelar',
    organismoDestino: 'Dirección Provincial de Personas Jurídicas de la Provincia de Buenos Aires',
    template: 'Atento la cautelar decretada, líbrese oficio a la Dirección Provincial de Personas Jurídicas de la Provincia de Buenos Aires a fin de que proceda a la anotación marginal de la medida dispuesta en autos respecto de {{razonSocial}}, matrícula nº {{matricula}}, dando cuenta de su cumplimiento a este Tribunal dentro del plazo de {{dias}} días hábiles.',
    fields: [
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true, section: 'Sociedad' },
      { key: 'matricula', label: 'Matrícula', type: 'text', required: true, section: 'Sociedad' },
      { key: 'dias', label: 'Días hábiles', type: 'number', required: true, section: 'Plazo' }
    ]
  },
  {
    code: 'ML-1',
    categoryCode: 'ML',
    categoryName: 'Mercado Libre',
    label: 'Informe de cuenta y operaciones',
    organismoDestino: 'Mercado Libre S.R.L.',
    template: 'Atento lo peticionado, líbrese oficio a Mercado Libre S.R.L., con domicilio legal en Arias 3751, piso 7°, Ciudad Autónoma de Buenos Aires, a fin de que informe si {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, correo electrónico {{email}}, registra cuenta activa en dicha plataforma, detallando: (i) datos de registro del usuario; (ii) domicilio declarado; (iii) historial de ventas y compras en el período comprendido entre {{fechaInicio}} y {{fechaFin}}; (iv) monto total operado; (v) si registra cuenta vinculada en Mercado Pago.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'email', label: 'Email', type: 'email', required: false, section: 'Titular' },
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date', required: true, section: 'Período' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date', required: true, section: 'Período' }
    ]
  },
  {
    code: 'ML-2',
    categoryCode: 'ML',
    categoryName: 'Mercado Libre',
    label: 'Bloqueo / medida cautelar sobre cuenta',
    organismoDestino: 'Mercado Libre S.R.L.',
    template: 'Atento la medida cautelar decretada en autos con fecha {{fecha}}, líbrese oficio a Mercado Libre S.R.L. a fin de que proceda a bloquear la cuenta del usuario {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, ID de usuario {{usuarioId}}, impidiendo la extracción, transferencia o disposición de fondos y bienes hasta nueva orden de este Tribunal, dando cuenta de su cumplimiento dentro de los {{dias}} días hábiles.',
    fields: [
      { key: 'fecha', label: 'Fecha de resolución', type: 'date', required: true, section: 'Medida' },
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'usuarioId', label: 'ID de usuario', type: 'text', required: false, section: 'Cuenta' },
      { key: 'dias', label: 'Días hábiles', type: 'number', required: true, section: 'Plazo' }
    ]
  },
  {
    code: 'ML-3',
    categoryCode: 'ML',
    categoryName: 'Mercado Libre',
    label: 'Informe de publicaciones y bienes',
    organismoDestino: 'Mercado Libre S.R.L.',
    template: 'Atento lo solicitado, líbrese oficio a Mercado Libre S.R.L. a fin de que informe las publicaciones activas e históricas del usuario {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, con detalle de productos ofrecidos, precios, estado de las operaciones y datos de envío registrados en el período {{fechaInicio}} a {{fechaFin}}.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date', required: true, section: 'Período' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date', required: true, section: 'Período' }
    ]
  },
  {
    code: 'MP-1',
    categoryCode: 'MP',
    categoryName: 'Mercado Pago',
    label: 'Informe de cuenta y saldo',
    organismoDestino: 'Mercado Pago S.R.L.',
    template: 'Atento lo peticionado, líbrese oficio a Mercado Pago S.R.L., con domicilio legal en Arias 3751, piso 7°, Ciudad Autónoma de Buenos Aires, a fin de que informe si {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, correo electrónico {{email}}, registra cuenta activa en dicha billetera virtual, indicando: (i) saldo actual; (ii) CBU/CVU y alias asociados; (iii) movimientos registrados entre {{fechaInicio}} y {{fechaFin}}; (iv) tarjetas, cuentas bancarias o instrumentos financieros vinculados; (v) créditos otorgados y saldos pendientes.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'email', label: 'Email', type: 'email', required: false, section: 'Titular' },
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date', required: true, section: 'Período' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date', required: true, section: 'Período' }
    ]
  },
  {
    code: 'MP-2',
    categoryCode: 'MP',
    categoryName: 'Mercado Pago',
    label: 'Embargo de fondos en billetera virtual',
    organismoDestino: 'Mercado Pago S.R.L.',
    template: 'Atento la medida cautelar decretada, líbrese oficio a Mercado Pago S.R.L. a fin de que proceda a trabar embargo sobre los fondos disponibles en la cuenta/billetera virtual perteneciente a {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, CVU {{cvu}}, hasta cubrir la suma de ${{monto}} con más intereses y costas, transfiriendo dichos fondos a la cuenta judicial nº {{cuentaJudicialNumero}}, CBU {{cbu}}, e informando a este Tribunal su resultado dentro de los {{dias}} días hábiles.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'cvu', label: 'CVU', type: 'text', required: false, section: 'Cuenta' },
      { key: 'monto', label: 'Monto', type: 'money', required: true, section: 'Medida' },
      { key: 'cuentaJudicialNumero', label: 'Cuenta judicial', type: 'text', required: true, section: 'Transferencia' },
      { key: 'cbu', label: 'CBU', type: 'text', required: true, section: 'Transferencia' },
      { key: 'dias', label: 'Días hábiles', type: 'number', required: true, section: 'Plazo' }
    ]
  },
  {
    code: 'MP-3',
    categoryCode: 'MP',
    categoryName: 'Mercado Pago',
    label: 'Informe de transferencias y destinatarios',
    organismoDestino: 'Mercado Pago S.R.L.',
    template: 'Atento lo ordenado, líbrese oficio a Mercado Pago S.R.L. a fin de que informe el detalle de transferencias realizadas y recibidas por el usuario {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, durante el período {{fechaInicio}} a {{fechaFin}}, con indicación de montos, fechas, CVU/CBU de origen y destino, y datos de los titulares de las cuentas involucradas.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' },
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date', required: true, section: 'Período' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date', required: true, section: 'Período' }
    ]
  },
  {
    code: 'MP-4',
    categoryCode: 'MP',
    categoryName: 'Mercado Pago',
    label: 'Informe de créditos otorgados',
    organismoDestino: 'Mercado Pago S.R.L.',
    template: 'Atento lo solicitado, líbrese oficio a Mercado Pago S.R.L. a fin de que informe si {{nombreRazonSocial}}, DNI/CUIT {{numeroDocumento}}, registra créditos, préstamos o financiaciones otorgados por dicha entidad, con indicación de montos, fechas de otorgamiento, cuotas, saldos pendientes y estado de la deuda.',
    fields: [
      { key: 'nombreRazonSocial', label: 'Nombre y apellido / Razón social', type: 'text', required: true, section: 'Titular' },
      { key: 'numeroDocumento', label: 'DNI / CUIT', type: 'text', required: true, section: 'Titular' }
    ]
  }
];

export const OFICIO_CATEGORIES = Array.from(
  new Map(OFICIO_TYPES.map(item => [item.categoryCode, { code: item.categoryCode, name: item.categoryName }])).values()
);

export function getOficioTypeByCode(code?: string | null): OficioTypeConfig | undefined {
  return OFICIO_TYPES.find(item => item.code === code);
}

export function getOficioTypesByCategory(categoryCode?: string | null): OficioTypeConfig[] {
  if (!categoryCode) {
    return [];
  }

  return OFICIO_TYPES.filter(item => item.categoryCode === categoryCode);
}

export function buildOficioText(template: string, values: Record<string, unknown>): string {
  return template.replace(/{{\s*([\w]+)\s*}}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined || value === null || value === '' ? `[${key}]` : String(value);
  });
}
