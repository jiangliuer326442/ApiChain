import { AI_RECORD } from '@conf/storage';
import {
    SET_CHAT_RECORD,
    CACHE_CHAT_RECORD,
    CLEAR_CHAT_RECORD
} from '@conf/redux';
import { isStringEmpty } from '@rutil/index'
import { cloneDeep } from 'lodash';

export default function (state = {
    messages: [],
    messageLength: 0
}, action : any) {
    let chatRecord = localStorage.getItem(AI_RECORD);
    if (action.type === SET_CHAT_RECORD) {
        let newState : any = {};
        localStorage.setItem(AI_RECORD, JSON.stringify(action.messages));
        newState.messages = cloneDeep(action.messages);
        state.messageLength = action.messages.length;
        return Object.assign({}, state, newState);
    } else if (action.type === CACHE_CHAT_RECORD) {
        let newState : any = {};
        newState.messages = cloneDeep(action.messages);
        state.messageLength = action.messages.length;
        return Object.assign({}, state, newState);
    } else if (action.type === CLEAR_CHAT_RECORD) {
        let newState : any = {};
        localStorage.removeItem(AI_RECORD);
        newState.messages = [];
        newState.messageLength = 0;
        return Object.assign({}, state, newState);
    } else if (!isStringEmpty(chatRecord)) {
        let messages = JSON.parse(chatRecord);
        state.messages = messages;
        state.messageLength = messages.length;
    }
    return state;
}