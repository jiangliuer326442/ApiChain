import { createRoot } from 'react-dom/client';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from "antd";
import { HashRouter } from 'react-router-dom';

import { getStartParams } from '@rutil/index';
import configureStore from '@store/configureStore';
import RouterContainer from '@contain/index';

let argsObject = getStartParams();
let preferLang = argsObject.preferLang;
let locale = enUS;
if (preferLang == "zh-CN") {
    locale = zhCN;
} else if (preferLang == "zh-TW") {
    locale = zhTW;
}

const store = configureStore({});
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <ConfigProvider
        locale={ locale } 
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