import { cloneDeep } from 'lodash';

import {
  SettingOutlined,
  OneToOneOutlined,
  LineChartOutlined,
  FlagOutlined,
} from '@ant-design/icons';

import {
  NETWORK,
  SETTINGS,
  ITERATOR,
  PROJECT,
} from '@conf/global_config';

import { 
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_MICRO_SERVICE_FIELDS,
} from '@conf/db';

import {
  ENV_LIST_ROUTE,
  PROJECT_LIST_ROUTE,
  VERSION_ITERATOR_LIST_ROUTE,
  INTERNET_REQUEST,
  REQUEST_HISTORY,
  ENVVAR_GLOBAL_LIST_ROUTE,
} from '@conf/routers';

import { 
  GET_VERSION_ITERATORS,
  SET_NAV_COLLAPSED,
  GET_PRJS
} from '@conf/redux';
import { langTrans } from '@lang/i18n';
let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

export default function (state = {
    navs: [
      {
        key: NETWORK,
        icon: <OneToOneOutlined />,
        label: langTrans("nav request"),
        children:[
          {
            key: INTERNET_REQUEST,
            label: (
              <a href={ "#" + INTERNET_REQUEST } rel="noopener noreferrer">
                {langTrans("nav request send")}
              </a >
            )
          },
          {
            key: REQUEST_HISTORY,
            label: (
              <a href={ "#" + REQUEST_HISTORY } rel="noopener noreferrer">
                {langTrans("nav request log")}
              </a >
            )
          }
        ]
      },
      {
        key: ITERATOR,
        icon: <LineChartOutlined />,
        label: langTrans("nav iterator"),
        children: [
        ]
      },
      {
        key: PROJECT,
        icon: <FlagOutlined />,
        label: langTrans("nav project"),
        children: [
        ]
      },
      {
        key: SETTINGS,
        icon: <SettingOutlined />,
        label: langTrans("nav setting"),
        children: [
          {
            key: VERSION_ITERATOR_LIST_ROUTE,
            label:(
              <a href={ "#" + VERSION_ITERATOR_LIST_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting iterator")}
              </a>
            )
          },
          {
            key: ENVVAR_GLOBAL_LIST_ROUTE,
            label: (
              <a href={ "#" + ENVVAR_GLOBAL_LIST_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting envvar")}
              </a >
            )
          },
          {
            key: PROJECT_LIST_ROUTE,
            label: (
              <a href={ "#" + PROJECT_LIST_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting project")}
              </a >
            )
          },
          {
            key: ENV_LIST_ROUTE,
            label: (
              <a href={ "#" + ENV_LIST_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting env")}
              </a >
            )
          },
        ]
      },
    ],
    selected: [ NETWORK, INTERNET_REQUEST ],
    collapsed: false,
}, action : object) {
  switch(action.type) {
    case SET_NAV_COLLAPSED:
      let newCollapsed = action.collapsed;
      return Object.assign({}, state, {
        collapsed: newCollapsed
      });
    case GET_VERSION_ITERATORS:
      let verIteratorNavs = cloneDeep(state.navs);

      let selectedVersionIteratorNav : any;
      for (let nav of verIteratorNavs) {
        if(nav.key === ITERATOR) {
          selectedVersionIteratorNav = nav;
        }
      }
      selectedVersionIteratorNav.children = [];
      let versionIterators = cloneDeep(action.versionIterators);

      for( let versionIterator of versionIterators) {
        selectedVersionIteratorNav.children.push({
          key: ITERATOR + "_" + versionIterator[version_iterator_uuid],
          label: versionIterator[version_iterator_title],
          children: [
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_envvar",
              label: <a href={"#/iterator_envvars/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator envvar")}</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_doc",
              label: <a href={"#/version_iterator_requests/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator doc")}</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_unittest",
              label: <a href={"#/version_iterator_tests/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator unittest")}</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_vip",
              label: <a href={"#/version_iterator_vip/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator member")}</a >
            }
          ],
        });
      }

      return Object.assign({}, state, {
        navs: verIteratorNavs
      });
      
    case GET_PRJS:
      let projectNavs = cloneDeep(state.navs);

      let selectedProjectNav : any;
      for (let nav of projectNavs) {
        if(nav.key === PROJECT) {
          selectedProjectNav = nav;
        }
      }
      selectedProjectNav.children = [];

      let prjs = cloneDeep(action.prjs);

      for( let prj of prjs) {
        selectedProjectNav.children.push({
          key: prj[prj_label],
          label: prj[prj_remark],
          children: [
            {
              key: prj[prj_label] + "_envvar",
              label: <a href={"#/prj_envvars/" + prj[prj_label] } rel="noopener noreferrer">{langTrans("nav project envvar")}</a >
            },
            {
              key: prj[prj_label] + "_doc",
              label: <a href={"#/project_requests/" + prj[prj_label] } rel="noopener noreferrer">{langTrans("nav project doc")}</a >
            },
            {
              key: prj[prj_label] + "_params",
              label: <a href={"#/project_params/" + prj[prj_label] } rel="noopener noreferrer">{langTrans("nav project params")}</a >
            },
            {
              key: prj[prj_label] + "_unittest",
              label: <a href={"#/project_tests/" + prj[prj_label] } rel="noopener noreferrer">{langTrans("nav project unittest")}</a >
            }
          ]
        });
      }
      return Object.assign({}, state, {
          navs: projectNavs
      });
    default:
      return state;
  }
}