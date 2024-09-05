import { createContext, ReactNode, useContext } from "react";

const DocumentsDataStore = (orderId: string): IOrderDataContext => {
    const orderDataInitialState: IOrder = { ...defaultOrderData, isProduction, isReferralValid };
  
    const [orderData, setOrderData] = useState<IOrder>(orderDataInitialState);
  
    useEffect(() => {
      setOrderData((prev: IOrder) => ({ ...prev, isReferralValid }));
    }, [isReferralValid]);
  
    const updateOrderData = (setStateFunc: (prevOrder: IOrder) => IOrder) => {
      setOrderData(setStateFunc);
    };
  
    const isBillDataFilled: boolean = !!orderData.billData.fullName && !!orderData.billData.email;
  
    return {
      updateOrderData,
  
      ...orderData,
    };
  };
  
  const OrderDataContext = createContext<IOrderDataContext>(orderDataContextInitialState);
  
  export const useOrderData = () => useContext(OrderDataContext);
  
  export const OrderDataProvider = ({
    orderId,
    children,
  }: {
    orderId: string;
    children: ReactNode;
  }) => {
    const orderDataStore = DocumentsDataStore();
  
    return <OrderDataContext.Provider value={orderDataStore}>{children}</OrderDataContext.Provider>;
  };