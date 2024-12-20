import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { validateOrder } from '../handlers';
import { DisplayOrder, DisplayPerson, GeneralOrderInfo } from '../interfaces/DisplayOrder';
import { RenderOrder } from '../interfaces/RenderOrder';

export function parseOrderToRenderOrder(order: TExtendedOrder): RenderOrder {
  const displayOrder = parseOrderToDisplayOrder(order);

  const renderOrder = parseDisplayOrderToRenderOrder(displayOrder);

  return renderOrder;
}

export function parseOrderToDisplayOrder(order: TExtendedOrder): DisplayOrder {
  try {
    validateOrder(order);

    const mapPerson = (person: any, extraData?: any) => ({
      type: person.tipo,
      nif: person.nif,
      name: person.nombre_o_razon_social,
      firstSurname: person.primer_apellido,
      secondSurname: person.segundo_apellido,
      address: person.direccion,
      representative: person.representante
        ? {
            nif: person.representante.nif,
            name: person.representante.nombre_o_razon_social,
            firstSurname: person.representante.primer_apellido,
            secondSurname: person.representante.segundo_apellido,
          }
        : undefined,
      ...extraData,
    });

    const { cliente, persona_relacionada = [], socio_profesional } = order;
    const [firstRelatedPerson, secondRelatedPerson] = persona_relacionada;

    return {
      client: mapPerson(cliente),
      relatedPerson: firstRelatedPerson ? mapPerson(firstRelatedPerson.cliente) : undefined,
      secondRelatedPerson: secondRelatedPerson ? mapPerson(secondRelatedPerson.cliente) : undefined,
      partner: socio_profesional ? mapPerson(socio_profesional.cliente, { iae: socio_profesional.iae }) : undefined,
      general: {
        orderType: order.tipo,
        vehiclePlate: order.matricula,
        autonomousCommunity: order.comunidad_autonoma,
        mandate: order.mandatos,
      },
    };
  } catch (error) {
    throw error;
  }
}

function parseDisplayOrderToRenderOrder(displayOrder: DisplayOrder): RenderOrder {
  const { client, relatedPerson, secondRelatedPerson, partner, general } = displayOrder;

  const mapPersonToRenderData = (person: DisplayPerson | undefined) => {
    if (!person) return null;

    return {
      nif: {
        label: 'NIF',
        value: person.nif,
        buttons: [],
      },
      name: {
        label: 'Nombre',
        value: person.name,
        buttons: [],
      },
      firstSurname: {
        label: 'Primer Apellido',
        value: person.firstSurname,
        buttons: [],
      },
      secondSurname: {
        label: 'Segundo Apellido',
        value: person.secondSurname,
        buttons: [],
      },
      address: {
        label: 'Dirección',
        value: person.address,
        buttons: [],
      },
      representative: person.representative
        ? {
            nif: {
              label: 'NIF',
              value: person.representative.nif,
              buttons: [],
            },
            name: {
              label: 'Nombre',
              value: person.representative.name,
              buttons: [],
            },
            firstSurname: {
              label: 'Primer Apellido',
              value: person.representative.firstSurname,
              buttons: [],
            },
            secondSurname: {
              label: 'Segundo Apellido',
              value: person.representative.secondSurname,
              buttons: [],
            },
          }
        : null,
    };
  };

  const mapGeneralToRenderData = (general: GeneralOrderInfo) => {
    return {
      orderType: {
        label: 'Tipo de Pedido',
        value: general.orderType,
        buttons: [],
      },
      vehiclePlate: {
        label: 'Matrícula',
        value: general.vehiclePlate,
        buttons: [],
      },
      autonomousCommunity: {
        label: 'Comunidad Autónoma',
        value: general.autonomousCommunity,
        buttons: [],
      },
      mandate: {
        label: 'Mandato',
        value: general.mandate,
        buttons: [],
      },
    };
  };

  return {
    general: mapGeneralToRenderData(general),
    client: mapPersonToRenderData(client),
    relatedPerson: mapPersonToRenderData(relatedPerson),
    secondRelatedPerson: mapPersonToRenderData(secondRelatedPerson),
    partner: mapPersonToRenderData(partner),
  };
}

export const isEmptyObject = (obj: Record<string, any>): boolean => {
    return Object.values(obj).every((fieldValue) => {
      if (fieldValue == null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        return true;
      }
  
      if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        const filteredObject = Object.fromEntries(
          Object.entries(fieldValue).filter(([key]) => key !== 'label')
        );
        return isEmptyObject(filteredObject);
      }
  
      return false;
    });
  };