import { Divider, List } from 'antd';
import { REQUIRED_DOCS, REQUIRED_DOCS_CONDITION } from '../utils/constants';
import NavigationButtons from '../components/NavigationButtons';

export default function RequirementsContainer() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-6 w-full">
        <List
          size="large"
          bordered
          dataSource={REQUIRED_DOCS}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <div className="flex flex-col gap-1">
          <Divider style={{ borderColor: 'blue' }} orientation="left">
            Prepara la documentación
          </Divider>
          <List
            size="large"
            bordered
            dataSource={REQUIRED_DOCS_CONDITION}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
              </List.Item>
            )}
          />
        </div>
      </div>
      <NavigationButtons isOnlyNext />
    </>
  );
}
