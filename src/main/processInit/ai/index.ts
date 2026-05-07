import Store from 'electron-store';
import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { OpenAI } from 'openai';

import {
    getLangguageModel,
} from '../../store/config/ai'

import { 
    ChannelsAiBreidgeStr, 
    ChannelsAiBreidgeSendStr,
    ChannelsAiBreidgeReplyStr,
} from '../../../config/channel';

// 流式对话
async function chatStream(message, openai, chatModel, event : IpcMainEvent) {
  console.log('\n🤖 AI 正在回复：');

  const stream = await openai.chat.completions.create({
    model: chatModel,
    messages: [{ role: 'user', content: message }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    event.reply(ChannelsAiBreidgeStr, ChannelsAiBreidgeReplyStr, type, id, content, hasFinish, success);
  }
}

export default function (store : Store){
    let languageModel = getLangguageModel(store);
    if (languageModel == null) {
        return;
    }
    log.info("languageModel", languageModel);
        // 配置 OpenAI 客户端
    const openai = new OpenAI({
        apiKey: languageModel.apiKey,
        baseURL: languageModel.baseUrl
    });

    ipcMain.on(ChannelsAiBreidgeStr, async (event : IpcMainEvent, action, type, id : number, content : string, header : any, payload : any) => {
        if(action !== ChannelsAiBreidgeSendStr) return;

        chatStream(content, openai, languageModel.chatModel, event);
    });

    
}