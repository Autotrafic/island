import { AutonomousCommunity, TOrderMandate, TOrderType } from "../enums";
import { TExtendedClient, TExtendedRelatedPerson } from "./cliente";
import { ExtendedTotalumShipment } from "./envio";
import { TExtendedProfessionalPartner } from "./socio_profesional";

interface TExtendedOrder extends Omit<TotalumOrder, 'cliente' | 'socio_profesional'> {
  cliente: TExtendedClient;
  envio: ExtendedTotalumShipment[];
  persona_relacionada: TExtendedRelatedPerson[];
  socio_profesional: TExtendedProfessionalPartner;
  gestoria_colaboradora: TCollaborator;
}

interface TotalumOrder {
  comunidad_autonoma: AutonomousCommunity;
  prioridad: TPriority;
  estado: TState;
  tipo: TOrderType;
  fecha_inicio: Date;
  factura: object;
  matricula: string;
  documentos: string;
  notas: string;
  itp_pagado: number;
  fecha_de_contacto: Date;
  total_facturado: number;
  mandatos: TOrderMandate;
  autotrafic_id: string;
  cliente: string;
  socio_profesional: string;
  createdAt: string;
  updatedAt: string;
  metadata: object;
  _id: string;
}

type TPriority = 'Normal' | 'Alta';

type TState =
  | 'Pendiente Tramitar A9'
  | 'Pendiente Entrega Tráfico'
  | 'En Tráfico'
  | 'Pendiente Envío Cliente'
  | 'Rechazado'
  | 'Enviado Cliente'
  | 'Entregado Cliente'
  | 'Pendiente Recibir Permiso Gestoría'
  | 'Pendiente Pago ITP'
  | 'Pendiente enviar 3º gestoría'
  | 'Enviado 3º gestoría'
  | 'Pendiente recibir info cliente'
  | 'Nuevo pedido web'
  | 'Pendiente devolución Correos'
  | 'Pendiente entrega Correos'
  | 'Pendiente Pago Devolución Envío'
  | 'Pendiente Pago Trámite';