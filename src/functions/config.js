// TODO: This should call https://config.chub.page/config?domain=xxx to get the config
// We will abandon the method of using local config files to improve scability

import axios from "axios";

export const loadConfig = async (abbr, domain) => {
    const url = `https://config.chub.page/config?domain=${domain}`;
    const resp = (await axios.get(url)).data;
    return resp;
}