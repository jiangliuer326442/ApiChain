import { cloneDeep } from 'lodash';

import { 
    SHOW_ADD_UNITTEST_MODEL,
    SHOW_EDIT_UNITTEST_MODEL,
    GET_ITERATOR_TESTS,
    GET_PROJECT_TESTS
} from '../../../config/redux';

import { 
    TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
} from '../../../config/db';

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;

export default function (state = {
    list: {},
    showAddUnittestModelFlg: false,
    iteratorId: "",
    project: "",
    unitTestUuid: "",
    title: "",
    folder: null,
}, action : object) {
    switch(action.type) {
        case SHOW_ADD_UNITTEST_MODEL:
            return Object.assign({}, state, {
                showAddUnittestModelFlg : action.open,
                iteratorId: action.iteratorId,
                unitTestUuid: action.unitTestUuid,
                title: "",
                folder: null,
            });
        case SHOW_EDIT_UNITTEST_MODEL:
            return Object.assign({}, state, {
                showAddUnittestModelFlg : action.open,
                iteratorId: action.iteratorId,
                unitTestUuid: action.unitTestUuid,
                title: action.title,
                folder: action.folder,
            });
        case GET_PROJECT_TESTS:
            let project = action.project;
            let listProject = cloneDeep(state.list);
            listProject[project] = action.unitTests;
            for(let unittest of listProject[project]) {
                unittest.key = unittest[unittest_uuid];
                let children = unittest.children;
                for(let unittest_step of children) {
                    unittest_step.key = unittest_step[step_unittest_uuid] + "$$" + unittest_step[step_uuid];
                }
            }
            return Object.assign({}, state, {
                list: listProject
            });
        case GET_ITERATOR_TESTS:
            let iteratorId = action.iteratorId;
            let listIterator = cloneDeep(state.list);
            listIterator[iteratorId] = action.unitTests;
            for(let unittest of listIterator[iteratorId]) {
                unittest.key = unittest[unittest_uuid];
                let children = unittest.children;
                for(let unittest_step of children) {
                    unittest_step.key = unittest_step[step_unittest_uuid] + "$$" + unittest_step[step_uuid];
                }
            }
            return Object.assign({}, state, {
                list: listIterator
            });
        default:
            return state;
    }
}