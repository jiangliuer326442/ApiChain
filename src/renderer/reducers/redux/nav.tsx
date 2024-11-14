import { cloneDeep } from 'lodash';

import {
  SettingOutlined,
  OneToOneOutlined,
  LineChartOutlined,
  FlagOutlined,
} from '@ant-design/icons';

import { mixedSort } from '../../util';

import {
  NETWORK,
  SETTINGS,
  ITERATOR,
  PROJECT,
} from '../../../config/global_config';

import { 
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_MICRO_SERVICE_FIELDS,
} from '../../../config/db';

import {
  ENV_LIST_ROUTE,
  PROJECT_LIST_ROUTE,
  VERSION_ITERATOR_LIST_ROUTE,
  INTERNET_REQUEST,
  REQUEST_HISTORY,
  ENVVAR_GLOBAL_LIST_ROUTE,
} from '../../../config/routers';

import { 
  GET_VERSION_ITERATORS,
  GET_PRJS
} from '../../../config/redux';

let version_iterator_openFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

export default function (state = {
    navs: [
      {
        key: NETWORK,
        icon: <OneToOneOutlined />,
        label: '请求',
        children:[
          {
            key: INTERNET_REQUEST,
            label: (
              <a href={ "#" + INTERNET_REQUEST } rel="noopener noreferrer">
                发送请求
              </a >
            )
          },
          {
            key: REQUEST_HISTORY,
            label: (
              <a href={ "#" + REQUEST_HISTORY } rel="noopener noreferrer">
                请求记录
              </a >
            )
          }
        ]
      },
      {
        key: ITERATOR,
        icon: <LineChartOutlined />,
        label: '迭代',
        children: [
        ]
      },
      {
        key: PROJECT,
        icon: <FlagOutlined />,
        label: '项目',
        children: [
        ]
      },
      {
        key: SETTINGS,
        icon: <SettingOutlined />,
        label: '设置',
        children: [
          {
            key: VERSION_ITERATOR_LIST_ROUTE,
            label:(
              <a href={ "#" + VERSION_ITERATOR_LIST_ROUTE } rel="noopener noreferrer">
                版本迭代
              </a>
            )
          },
          {
            key: ENVVAR_GLOBAL_LIST_ROUTE,
            label: (
              <a href={ "#" + ENVVAR_GLOBAL_LIST_ROUTE } rel="noopener noreferrer">
                环境变量
              </a >
            )
          },
          {
            key: PROJECT_LIST_ROUTE,
            label: (
              <a href={ "#" + PROJECT_LIST_ROUTE } rel="noopener noreferrer">
                项目
              </a >
            )
          },
          {
            key: ENV_LIST_ROUTE,
            label: (
              <a href={ "#" + ENV_LIST_ROUTE } rel="noopener noreferrer">
                开发环境
              </a >
            )
          },
        ]
      },
    ],
    selected: [ NETWORK, INTERNET_REQUEST ]
}, action : object) {
  switch(action.type) {
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

      mixedSort(versionIterators, version_iterator_title);

      for( let versionIterator of versionIterators) {
        if (versionIterator[version_iterator_openFlg] === 0) continue;
        selectedVersionIteratorNav.children.push({
          key: ITERATOR + "_" + versionIterator[version_iterator_uuid],
          label: versionIterator[version_iterator_title],
          children: [
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_envvar",
              label: <a href={"#/iterator_envvars/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">环境变量</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_doc",
              label: <a href={"#/version_iterator_requests/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">文档</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_unittest",
              label: <a href={"#/version_iterator_tests/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">单测</a >
            },
            {
              key: ITERATOR + "_" + versionIterator[version_iterator_uuid] + "_vip",
              label: <a href={"#/version_iterator_vip/" + versionIterator[version_iterator_uuid] } rel="noopener noreferrer">会员</a >
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

      mixedSort(prjs, prj_remark);

      for( let prj of prjs) {
        selectedProjectNav.children.push({
          key: prj[prj_label],
          label: prj[prj_remark],
          children: [
            {
              key: prj[prj_label] + "_envvar",
              label: <a href={"#/prj_envvars/" + prj[prj_label] } rel="noopener noreferrer">环境变量</a >
            },
            {
              key: prj[prj_label] + "_doc",
              label: <a href={"#/project_requests/" + prj[prj_label] } rel="noopener noreferrer">文档</a >
            },
            {
              key: prj[prj_label] + "_unittest",
              label: <a href={"#/project_tests/" + prj[prj_label] } rel="noopener noreferrer">单测</a >
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