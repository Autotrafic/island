import { AutonomousCommunity, TOrderMandate } from "../../../shared/interfaces/enums";
import { OptionalButton } from "./DisplayOrder";

interface RenderOrder {
  vehicle: RenderCard<VehicleRenderOrder>;
    general: RenderCard<GeneralRenderOrder>;
    client: RenderCard<PersonRenderOrder> | null;
    relatedPerson: RenderCard<PersonRenderOrder> | null;
    secondRelatedPerson: RenderCard<PersonRenderOrder> | null;
    partner: RenderCard<PersonRenderOrder> | null;
  }

  interface VehicleRenderOrder {
    registrationDate: RenderField<string>;
    brand: RenderField<string>;
    model: RenderField<string>;
    serialNumber: RenderField<string>;
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
    firstSurname: RenderField<string | undefined> | null;
    secondSurname: RenderField<string | undefined> | null;
    address: RenderField<string | undefined>;
    representative: RenderField<RepresentativeRenderOrder> | null;
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
    buttons: JSX.Element[];
  }

  interface RenderCard<T> {
    title: string;
    subtitle?: string;
    icon?: JSX.Element;
    data: T;
  }
  