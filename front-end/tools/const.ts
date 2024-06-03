export const API_KEY = process.env.API_KEY;
export const API_GATEWAY_URL = process.env.API_GATEWAY_URL?.endsWith("/")
  ? process.env.API_GATEWAY_URL
  : process.env.API_GATEWAY_URL + "/" || "";
export const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || "";
