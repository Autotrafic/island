import { BuildingIcon, UserIcon } from '../../../shared/assets/icons';
import { AutonomousCommunity, TClientType, TOrderMandate, TOrderState, TOrderType } from '../../../shared/interfaces/enums';

export function getAutonomousCommunityColor(autonomousCommunity: AutonomousCommunity): string {
  switch (autonomousCommunity) {
    case AutonomousCommunity.Cataluna:
      return '#3c6aff';
    case AutonomousCommunity.Andalucia:
      return '#ff0000';
    case AutonomousCommunity.Aragon:
      return '#fed519';
    case AutonomousCommunity.Asturias:
      return '#aaff49';
    case AutonomousCommunity.IslasBaleares:
      return '#3be327';
    case AutonomousCommunity.Canarias:
      return '#39fb80';
    case AutonomousCommunity.Cantabria:
      return '#27f7ba';
    case AutonomousCommunity.CastillaLeon:
      return '#30d9f3';
    case AutonomousCommunity.CastillaLaMancha:
      return '#2d9aff';
    case AutonomousCommunity.Extremadura:
      return '#1f64ff';
    case AutonomousCommunity.Galicia:
      return '#7826ff';
    case AutonomousCommunity.Madrid:
      return '#df2bff';
    case AutonomousCommunity.Murcia:
      return '#ff24a6';
    case AutonomousCommunity.Navarra:
      return '#ef0000';
    case AutonomousCommunity.PaisVasco:
      return '#ffd749';
    case AutonomousCommunity.LaRioja:
      return '#9df525';
    case AutonomousCommunity.Valencia:
      return '#43bdff';
  }
}

export function getMandatesColor(mandates: TOrderMandate): string {
  switch (mandates) {
    case TOrderMandate.NoEnviados:
      return '#ffb613';
    case TOrderMandate.Enviados:
      return '#00a3d1';
    case TOrderMandate.Firmados:
      return '#00ce6e';
    case TOrderMandate.Adjuntados:
      return '#ca1dff';
  }
}

export function getOrderStateColor(orderState: TOrderState): string {
  switch (orderState) {
    case TOrderState.PendienteTramitarA9:
      return 'rgba(139,189,255,0.57)';
    case TOrderState.PendienteEntregaTrafic:
      return 'rgba(255,190,70,0.54)';
    case TOrderState.EnTrafic:
      return 'rgba(254,253,109,0.67)';
    case TOrderState.PendienteEnvioCliente:
      return 'rgba(195,107,255,0.45)';
    case TOrderState.Rechazado:
      return 'rgba(222,0,0,0.77)';
    case TOrderState.EnviadoCliente:
      return 'rgba(255,128,203,0.64)';
    case TOrderState.EntregadoCliente:
      return 'rgba(0,179,4,0.47)';
    case TOrderState.PendienteRecibirPermisoGestoria:
      return 'rgba(164,140,255,0.44)';
    case TOrderState.PendientePagoITP:
      return '#91fff6';
    case TOrderState.PendienteEnviar3Gestoria:
      return 'rgba(204,255,81,0.61)';
    case TOrderState.Enviado3Gestoria:
      return 'rgba(144,249,103,0.48)';
    case TOrderState.PendienteRecibirInfoCliente:
      return 'rgba(164,113,35,0.59)';
    case TOrderState.NuevoPedidoWeb:
      return '#ff4dd7';
    case TOrderState.PendienteDevolucionCorreos:
      return 'rgba(255, 149, 80, 0.75)';
    case TOrderState.PendienteEntregarCorreos:
      return '#f7f44d';
    case TOrderState.PendientePagoDevolucionEnvio:
      return '#a490e3';
    case TOrderState.PendientePagoTramite:
      return '#ecb397';
    case TOrderState.Cancelado:
      return '#c3c3c3';
    case TOrderState.EnRevision:
      return '#de8504';
    case TOrderState.EnIncidencia:
      return '#ff1f00';
    case TOrderState.PendienteConfirmacionDireccion:
      return '#9b4aff';
    default:
      return '#c3c3c3';
  }
}

export function getOrderTypeColor(orderType: TOrderType): string {
  switch (orderType) {
    case TOrderType.Transferencia:
      return '#53cdff';
    case TOrderType.DuplicadoPermiso:
      return '#eae541';
    case TOrderType.Distintivo:
      return '#ccff86';
    case TOrderType.Notificacion:
      return '#26ef66';
    case TOrderType.EntregaCompraventa:
      return '#962aff';
    case TOrderType.TransferenciaPorFinalizacionEntrega:
      return '#0053d4';
    case TOrderType.AltaPorBajaVoluntaria:
      return '#83c600';
    case TOrderType.CambioDeDomicilio:
      return '#fe3ba6';
    case TOrderType.BajaTemporal:
      return '#f1874f';
  }
}

export function getClientTypeColor(clientType: TClientType): string {
  switch (clientType) {
    case TClientType.Particular:
      return '#0050cb';
    case TClientType.Autonomo:
      return '#01c29a';
    case TClientType.Empresa:
      return '#5b00d7';
  }
}

export function getCardSubtitleColor(cardSubtitle: string): string {
  switch (cardSubtitle) {
    case 'Particular':
      return 'rgba(0,80,203,0.41)';
    case 'Autónomo':
      return 'rgba(1, 194, 154, 0.46)';
    case 'Empresa':
      return 'rgba(91, 0, 215, 0.46)';
    default:
      return '';
  }
}

export function getPersonTypeIcon(personType: TClientType): JSX.Element {
  switch (personType) {
    case TClientType.Particular:
      return UserIcon;
    case TClientType.Autonomo:
      return UserIcon;
    case TClientType.Empresa:
      return BuildingIcon;
  }
}
