import { Button } from 'antd';
import { CarIcon, HandshakeIcon, SquareBinaryIcon } from '../../../shared/assets/icons';
import { TClientType } from '../../../shared/interfaces/enums';
import { TExtendedClient } from '../../../shared/interfaces/totalum/cliente';
import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { validateOrder } from '../handlers';
import { DisplayOrder, DisplayPerson, GeneralOrderInfo, Vehicle } from '../interfaces/DisplayOrder';
import { RenderOrder } from '../interfaces/RenderOrder';
import { getPersonTypeIcon } from '../utils/funcs';
import { parseDateToDDMMYYYY } from '../../../shared/utils/parser';

export function parseOrderToRenderOrder(order: TExtendedOrder): RenderOrder {
  const displayOrder = parseOrderToDisplayOrder(order);

  const renderOrder = parseDisplayOrderToRenderOrder(displayOrder);

  return renderOrder;
}

export function parseOrderToDisplayOrder(order: TExtendedOrder): DisplayOrder {
  try {
    validateOrder(order);
    const mapPerson = (person: TExtendedClient, extraData?: any) => ({
      type: person.tipo,
      nif: person.nif,
      name: person.nombre_o_razon_social,
      firstSurname: person.primer_apellido,
      secondSurname: person.segundo_apellido,
      address: person.direccion,
      birthDate: person.fecha_nacimiento,
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

    const { fecha_matriculacion, marca, modelo, bastidor } = order.vehiculo[0];
    const { cliente, persona_relacionada = [], socio_profesional } = order;
    const [firstRelatedPerson, secondRelatedPerson] = persona_relacionada;

    return {
      vehicle: { registrationDate: fecha_matriculacion, brand: marca, model: modelo, serialNumber: bastidor },
      client: cliente ? mapPerson(cliente) : undefined,
      relatedPerson: firstRelatedPerson ? mapPerson(firstRelatedPerson.cliente) : undefined,
      secondRelatedPerson: secondRelatedPerson ? mapPerson(secondRelatedPerson.cliente) : undefined,
      partner: socio_profesional ? mapPerson(socio_profesional.cliente, { iae: socio_profesional.iae }) : undefined,
      general: {
        orderType: order.tipo,
        orderState: order.estado,
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
    const { vehicle, client, relatedPerson, secondRelatedPerson, partner, general } = displayOrder;

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
          birthDate:
            person.type === TClientType.Particular
              ? { label: 'Fecha de Nacimiento', value: parseDateToDDMMYYYY(person.birthDate), buttons: [] }
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

    const mapVehicleToRenderData = (vehicle: Vehicle) => {
      return {
        title: 'Vehículo',
        icon: CarIcon,
        data: {
          registrationDate: {
            label: 'Fecha de Matriculación',
            value: parseDateToDDMMYYYY(vehicle.registrationDate),
            buttons: [],
          },
          brand: {
            label: 'Marca',
            value: vehicle.brand,
            buttons: [],
          },
          model: {
            label: 'Modelo',
            value: vehicle.model,
            buttons: [],
          },
          serialNumber: {
            label: 'Número de Bastidor',
            value: vehicle.serialNumber,
            buttons: [],
          },
        },
      };
    };

    return {
      vehicle: mapVehicleToRenderData(vehicle),
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

export const isEmptyObject = (obj: Record<string, any> | undefined): boolean => {
  if (!obj) return true;

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
