import { legacy_createStore as createStore } from 'redux';
import rootReducer from "../reducers/redux/index";

export default function configureStore(initialState) {
    const store = createStore(rootReducer, initialState);
  
    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../reducers/redux/index.ts', () => {
        const nextReducer = require('../reducers/redux/index');
        store.replaceReducer(nextReducer);
      });
    }
  
    return store;
  }