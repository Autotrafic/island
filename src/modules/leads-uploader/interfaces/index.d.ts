import { LeadType } from './enums';

interface MetaLead {
  nombre_completo: string;
  telefono: string;
}

interface HandleMetaLeadsBody {
  leadType: LeadType;
  leads: MetaLead[];
}
