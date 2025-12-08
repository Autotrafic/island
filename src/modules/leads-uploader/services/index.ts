import { autotraficApi } from '../../../shared/services';
import { MetaLead } from '../interfaces';
import { LeadType } from '../interfaces/enums';

export async function uploadMetaLeads(leads: MetaLead[]) {
  await autotraficApi.files.handleMetaLeads({ leadType: LeadType.Meta, leads });
}
