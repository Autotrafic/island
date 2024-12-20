import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { validateOrder } from '../handlers';
import { DisplayOrder } from '../interfaces';

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
