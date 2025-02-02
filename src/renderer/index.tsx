import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from "antd";

import RouterContainer from '@contain/index';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <ConfigProvider 
        theme={{
            token: {
            },
            algorithm: theme.darkAlgorithm
            }}>
        <RouterContainer />
    </ConfigProvider>
);