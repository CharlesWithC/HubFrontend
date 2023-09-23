import { customAxios as axios } from '../functions';

export const loadConfig = async (domain) => {
    const url = `https://config.chub.page/config?domain=${domain}`;
    const resp = (await axios.get(url)).data;
    return resp;
}