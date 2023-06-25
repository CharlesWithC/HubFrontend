// TODO: This should call https://config.chub.page/config?domain=xxx to get the config
// We will abandon the method of using local config files to improve scability

import { customAxios as axios } from '../functions';

export const loadConfig = async (domain) => {
    const url = `https://config.chub.page/config?domain=${domain}`;
    const resp = (await axios.get(url)).data;
    return resp;
}