import { Card } from 'antd';
import { DisplayOrder } from '../interfaces';

export default function GeneralInfoCard({displayOrder}: {displayOrder: DisplayOrder}) {
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
        <h1 className='font-semibold text-2xl'>{displayOrder.general.vehiclePlate}</h1>
        <span className='font-medium text-lg'></span>
      </div>
    </Card>
  );
}
