import { sendTeamMessage } from '@act/message';
import { AI_LANGUAGE_MODELS_URL, AI_VECTOR_MODELS_URL, AI_RE_VECTOR_MODELS_URL } from '@conf/team';

export async function getBigModels() {
    return await sendTeamMessage(AI_LANGUAGE_MODELS_URL, {});
}

export async function vectorModels() {
    return await sendTeamMessage(AI_VECTOR_MODELS_URL, {});
}

export async function reVectorModels() {
    return await sendTeamMessage(AI_RE_VECTOR_MODELS_URL, {});
}