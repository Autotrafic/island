import { AutonomousCommunity, TOrderMandate } from "../../../shared/interfaces/enums";
import { OptionalButton } from "./DisplayOrder";

interface RenderOrder {
    general: GeneralRenderOrder;
    client: PersonRenderOrder | null;
    relatedPerson: PersonRenderOrder | null;
    secondRelatedPerson: PersonRenderOrder | null;
    partner: PersonRenderOrder | null;
  }
  
  interface GeneralRenderOrder {
    orderType: RenderField<string>;
    vehiclePlate: RenderField<string>;
    autonomousCommunity: RenderField<AutonomousCommunity>;
    mandate: RenderField<TOrderMandate>;
  }
  
  interface PersonRenderOrder {
    nif: RenderField<string>;
    name: RenderField<string>;
    firstSurname: RenderField<string | undefined>;
    secondSurname: RenderField<string | undefined>;
    address: RenderField<string | undefined>;
    representative: RepresentativeRenderOrder | null;
  }
  
  interface RepresentativeRenderOrder {
    nif: RenderField<string>;
    name: RenderField<string>;
    firstSurname: RenderField<string>;
    secondSurname: RenderField<string>;
  }
  
  interface RenderField<T> {
    label: string;
    value: T;
    buttons: OptionalButton[];
  }
  