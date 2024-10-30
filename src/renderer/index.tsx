import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from "antd";
import zhCN from 'antd/locale/zh_CN';

import RouterContainer from './containers';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <ConfigProvider 
        locale={zhCN} 
        theme={{
            token: {
            },
            algorithm: theme.darkAlgorithm
            }}>
        <RouterContainer />
    </ConfigProvider>
);