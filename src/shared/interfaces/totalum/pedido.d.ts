import { AutonomousCommunity, TOrderMandate, TOrderState, TOrderType } from "../enums";
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
  estado: TOrderState;
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
