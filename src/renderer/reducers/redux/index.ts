import { combineReducers } from 'redux';
import device from './device';
import env from './env';
import prj from './project';
import nav from './nav';
import env_var from './env_var';
import version_iterator from './version_iterator';
import unittest from './unittest';
import chat_record from './chat_record';

const rootReducer = combineReducers({
    device,
    env,
    prj,
    env_var,
    nav,
    version_iterator,
    unittest,
    chat_record,
});

export default rootReducer;