import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from "antd";
import { HashRouter } from 'react-router-dom';

import configureStore from '@store/configureStore';
import RouterContainer from '@contain/index';

const store = configureStore({});
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <ConfigProvider 
        theme={{
            token: {
            },
            algorithm: theme.darkAlgorithm
            }}>
        <Provider store={store}>
            <HashRouter>
                <RouterContainer />
            </HashRouter>
        </Provider>
    </ConfigProvider>
);