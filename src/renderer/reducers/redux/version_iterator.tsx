import { 
    SHOW_ADD_VERSION_ITERATOR_MODEL,
    SHOW_EDIT_VERSION_ITERATOR_MODEL,
    GET_VERSION_ITERATORS
} from '../../../config/redux';

import { 
    TABLE_VERSION_ITERATION_FIELDS,
} from '../../../config/db';

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;

export default function (state = {
    showAddVersionIteratorModelFlg: false,
    list: []
  }, action : object) {
    switch(action.type) {
        case SHOW_ADD_VERSION_ITERATOR_MODEL:
            return Object.assign({}, state, {
                showAddPrjModelFlg : action.open,
                prj: "",
                remark: "",
            });
        case SHOW_EDIT_VERSION_ITERATOR_MODEL:
          return Object.assign({}, state, {
            showAddPrjModelFlg : action.open
          });
        case GET_VERSION_ITERATORS:
          let list = [];
          action.versionIterators.map(version_iterator => {
            version_iterator.key = version_iterator[version_iterator_uuid];
              list.push(version_iterator);
          });
          return Object.assign({}, state, {
              list
          });
        default:
            return state;
    }
  }