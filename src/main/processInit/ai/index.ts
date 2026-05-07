import Store from 'electron-store';
import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { OpenAI } from 'openai';

import {
    getLangguageModel,
} from '../../store/config/ai';

import { getLang, langTrans, langFormat } from '../../../lang/i18n';

import { 
    ChannelsAiBreidgeStr, 
    ChannelsAiBreidgeSendStr,
    ChannelsAiBreidgeReplyStr,
} from '../../../config/channel';
import {
    PROJECT_CONFIG_GET_URL
} from '../../../config/team';
import { postRequest, } from '../../util/teamUtil';
import { isStringEmpty } from '../../../renderer/util';

// 流式对话
async function chatStream(type, id, messages, openai, chatModel, event : IpcMainEvent) {

  const stream = await openai.chat.completions.create({
    model: chatModel,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    event.reply(ChannelsAiBreidgeStr, ChannelsAiBreidgeReplyStr, type, id, content, false, true);
  }
  event.reply(ChannelsAiBreidgeStr, ChannelsAiBreidgeReplyStr, type, id, "", true, true);
}

export default function (uuid : string, store : Store){
    let languageModel = getLangguageModel(store);
    if (languageModel == null) {
        return;
    }
    // 配置 OpenAI 客户端
    const openai = new OpenAI({
        apiKey: languageModel.apiKey,
        baseURL: languageModel.baseUrl
    });

    ipcMain.on(ChannelsAiBreidgeStr, async (event : IpcMainEvent, action, type, id : number, content : string, payload : any) => {
        if(action !== ChannelsAiBreidgeSendStr) return;

        const preferLang = getLang();

        let langId = "chatbox lang_en";
        if (preferLang == "zh-CN") {
            langId = "chatbox lang_zh_cn";
        } else if (preferLang == "zh-TW") {
            langId = "chatbox lang_zh_tw";
        }
        let messages = [{
            "role": "system",
            "content": langFormat("chatbox ai_sys_message_base", {
                "lang": langTrans(langId)
            })
        }];

        if (!isStringEmpty(payload.project)) {
            let result = await postRequest(uuid, PROJECT_CONFIG_GET_URL, {
                prj: payload.project, env: ""
            }, store)

            let errorMessage = result[0];
            let responseContent = result[1];
            if (!isStringEmpty(responseContent["projectDesc"])) {
                messages.push({ role: 'system', content: langFormat("chatbox ai_user_message_prj_info", {
                    prjName:payload.project,
                    prjInfo:responseContent["projectDesc"],
                }) });
            }
        }

        if (payload.history.length > 0) {
            messages.push({ role: 'user', content: "chat history:" + JSON.stringify(payload.history) });
        }

        messages.push({ role: 'user', content: content });

        chatStream(type, id, messages, openai, isStringEmpty(payload.aiModel) ? languageModel.chatModel : payload.aiModel, event);
    });

    
}