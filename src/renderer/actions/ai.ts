import { sendTeamMessage } from '@act/message';
import { AI_LANGUAGE_MODELS_URL } from '@conf/team';

export async function getBigModels() {
    return await sendTeamMessage(AI_LANGUAGE_MODELS_URL, {});
}