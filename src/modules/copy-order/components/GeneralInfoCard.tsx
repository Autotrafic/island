import { Card, Tooltip } from 'antd';
import { DisplayOrder } from '../interfaces';
import { getAutonomousCommunityColor, getMandatesColor, getOrderTypeColor } from '../utils/funcs';

export default function GeneralInfoCard({ displayOrder, copyFunc }: GeneralInfoCardProps) {
  const { general } = displayOrder;

  return (
    <Card
      bordered={true}
      size="small"
      style={{
        fontFamily: 'Poppins',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="flex justify-around items-center">
        <Tooltip placement="top" title="Click para copiar">
          <h1 className="font-semibold text-2xl cursor-pointer" onClick={() => copyFunc(general.vehiclePlate)}>
            {general.vehiclePlate}
          </h1>
        </Tooltip>

        <span
          className="font-medium text-lg rounded px-3 py-1"
          style={{ backgroundColor: getOrderTypeColor(general.orderType) }}
        >
          {general.orderType}
        </span>
        <span
          className="font-medium text-lg rounded px-3 py-1"
          style={{ backgroundColor: getAutonomousCommunityColor(general.autonomousCommunity) }}
        >
          {general.autonomousCommunity}
        </span>
        <span
          className="font-medium text-lg rounded px-3 py-1"
          style={{ backgroundColor: getMandatesColor(general.mandate) }}
        >
          {general.mandate}
        </span>
      </div>
    </Card>
  );
}

interface GeneralInfoCardProps {
  displayOrder: DisplayOrder;
  copyFunc: (text: string) => void;
}
