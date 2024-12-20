import { AutonomousCommunity, TOrderMandate, TOrderType } from '../../../shared/interfaces/enums';

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

export function getCardName(key: string): string {
  switch (key) {
    case 'client':
      return 'Comprador';
    case 'relatedPerson':
      return 'Vendedor';
    case 'secondRelatedPerson':
      return 'Segundo Vendedor';
    case 'partner':
      return 'Socio Profesional';
    default:
      return key;
  }
}
