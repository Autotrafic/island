export enum TMomentPayment {
  BeforeProcedure = 'Antes del tramite',
  AfterProcedure = 'Despues del tramite',
}

export enum TOrderState {
  PendienteTramitarA9 = 'Pendiente Tramitar A9',
  PendienteEntregaTrafic = 'Pendiente Entrega Tráfico',
  EnTrafic = 'En Tráfico',
  PendienteEnvioCliente = 'Pendiente Envío Cliente',
  Rechazado = 'Rechazado',
  EnviadoCliente = 'Enviado Cliente',
  EntregadoCliente = 'Entregado Cliente',
  PendienteRecibirPermisoGestoria = 'Pendiente Recibir Permiso Gestoría',
  PendientePagoITP = 'Pendiente Pago ITP',
  PendienteEnviar3Gestoria = 'Pendiente enviar 3º gestoría',
  Enviado3Gestoria = 'Enviado 3º gestoría',
  PendienteRecibirInfoCliente = 'Pendiente recibir info cliente',
  NuevoPedidoWeb = 'Nuevo pedido web',
  PendienteDevolucionCorreos = 'Pendiente devolución Correos',
  PendienteEntregarCorreos = 'Pendiente entrega Correos',
  PendientePagoDevolucionEnvio = 'Pendiente Pago Devolución Envío',
  PendientePagoTramite = 'Pendiente Pago Trámite',
  Cancelado = 'Cancelado',
  EnRevision = 'En revisión',
  EnIncidencia = 'En incidencia',
  PendienteConfirmacionDireccion = 'Pendiente confirmación dirección',
}

export enum TOrderType {
  Transferencia = 'Transferencia',
  TransferenciaPorFinalizacionEntrega = 'Transferencia por finalizacion entrega',
  EntregaCompraventa = 'Entrega compraventa',
  Notificacion = 'Notificacion',
  DuplicadoPermiso = 'Duplicado permiso',
  Distintivo = 'Distintivo',
  AltaPorBajaVoluntaria = 'Alta por baja voluntaria',
  BajaTemporal = 'Baja temporal',
  CambioDeDomicilio = 'Cambio de domicilio',
}

export enum TClientType {
  Particular = 'Particular',
  Autonomo = 'Autónomo',
  Empresa = 'Empresa',
}

export enum TOrderMandate {
  NoEnviados = 'No enviados',
  Enviados = 'Enviados',
  Firmados = 'Firmados',
  Adjuntados = 'Adjuntados',
}

export enum AutonomousCommunity {
  Andalucia = 'Andalucía',
  Aragon = 'Aragón',
  Asturias = 'Asturias',
  Canarias = 'Canarias',
  Cantabria = 'Cantabria',
  CastillaLaMancha = 'Castilla la Mancha',
  CastillaLeon = 'Castilla y León',
  Cataluna = 'Cataluña',
  Extremadura = 'Extremadura',
  Galicia = 'Galicia',
  IslasBaleares = 'Baleares',
  LaRioja = 'La Rioja',
  Madrid = 'Madrid',
  Murcia = 'Murcia',
  Navarra = 'Navarra',
  PaisVasco = 'País Vasco',
  Valencia = 'Valencia',
}
