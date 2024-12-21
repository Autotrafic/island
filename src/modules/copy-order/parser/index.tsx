import { Button } from 'antd';
import { HandshakeIcon, SquareBinaryIcon } from '../../../shared/assets/icons';
import { TClientType } from '../../../shared/interfaces/enums';
import { TExtendedClient } from '../../../shared/interfaces/totalum/cliente';
import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { validateOrder } from '../handlers';
import { DisplayOrder, DisplayPerson, GeneralOrderInfo } from '../interfaces/DisplayOrder';
import { RenderOrder } from '../interfaces/RenderOrder';
import { getPersonTypeIcon } from '../utils/funcs';

export function parseOrderToRenderOrder(order: TExtendedOrder): RenderOrder {
  const displayOrder = parseOrderToDisplayOrder(order);

  const renderOrder = parseDisplayOrderToRenderOrder(displayOrder);

  return renderOrder;
}

export function parseOrderToDisplayOrder(order: TExtendedOrder): DisplayOrder {
  try {
    validateOrder(order);
    console.log(order);
    const mapPerson = (person: TExtendedClient, extraData?: any) => ({
      type: person.tipo,
      nif: person.nif,
      name: person.nombre_o_razon_social,
      firstSurname: person.primer_apellido,
      secondSurname: person.segundo_apellido,
      address: person.direccion,
      representative:
        person.representante && person.representante.length > 0
          ? {
              nif: person.representante[0].nif,
              name: person.representante[0].nombre_o_razon_social,
              firstSurname: person.representante[0].primer_apellido,
              secondSurname: person.representante[0].segundo_apellido,
            }
          : undefined,
      ...extraData,
    });

    const { cliente, persona_relacionada = [], socio_profesional } = order;
    const [firstRelatedPerson, secondRelatedPerson] = persona_relacionada;

    return {
      client: cliente ? mapPerson(cliente) : undefined,
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
  try {
    const { client, relatedPerson, secondRelatedPerson, partner, general } = displayOrder;

    const mapPersonToRenderData = (
      person: DisplayPerson | undefined,
      cardTitle: string,
      cardSubtitle?: string,
      icon?: JSX.Element
    ) => {
      if (!person) return null;

      return {
        title: cardTitle,
        subtitle: cardSubtitle,
        icon: icon ?? getPersonTypeIcon(person.type as TClientType),
        data: {
          nif: {
            label: person.type === TClientType.Empresa ? 'CIF' : 'NIF',
            value: person.nif,
            buttons: [],
          },
          name: {
            label: 'Nombre',
            value: person.name,
            buttons: [],
          },
          firstSurname:
            person.type !== TClientType.Empresa
              ? {
                  label: 'Primer Apellido',
                  value: person.firstSurname,
                  buttons: [],
                }
              : null,
          secondSurname:
            person.type !== TClientType.Empresa
              ? {
                  label: 'Segundo Apellido',
                  value: person.secondSurname,
                  buttons: [],
                }
              : null,
          address: {
            label: 'Dirección',
            value: person.address,
            buttons: [
              <Button
                icon={SquareBinaryIcon}
                onClick={() => window.open(`https://www.google.com/search?q=${person.address + ', maps'}`, '_blank')}
                style={{ padding: 0 }}
              />,
            ],
          },
          representative: person.representative
            ? {
                label: 'Representante',
                buttons: [],
                value: {
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
                },
              }
            : null,
        },
      };
    };

    const mapGeneralToRenderData = (general: GeneralOrderInfo) => {
      return {
        title: 'General',
        data: {
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
        },
      };
    };

    return {
      general: mapGeneralToRenderData(general),
      client: mapPersonToRenderData(client, 'Comprador', client?.type),
      relatedPerson: mapPersonToRenderData(relatedPerson, 'Vendedor', relatedPerson?.type),
      secondRelatedPerson: mapPersonToRenderData(secondRelatedPerson, 'Segundo Vendedor', secondRelatedPerson?.type),
      partner: mapPersonToRenderData(partner, 'Socio Profesional', partner?.type, HandshakeIcon),
    };
  } catch (error: any) {
    throw new Error(`Error parseando Display Order a Render Order: ${error.message}`);
  }
}

export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.values(obj).every((fieldValue) => {
    if (fieldValue == null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
      return true;
    }

    if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
      const filteredObject = Object.fromEntries(Object.entries(fieldValue).filter(([key]) => key !== 'label'));
      return isEmptyObject(filteredObject);
    }

    return false;
  });
};
