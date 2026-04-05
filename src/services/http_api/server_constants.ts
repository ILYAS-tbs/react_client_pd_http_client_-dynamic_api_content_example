const VITE_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
const VITE_WEBSOCKET_BASEURL =(import.meta.env.VITE_WEBSOCKET_BASEURL ?? "ws://127.0.0.1:8000").replace(/\/$/, "")


function getApiBaseURL(){
    return VITE_API_ORIGIN
}

function getWebsocketBaseURL(){
    return VITE_WEBSOCKET_BASEURL
}


export const SERVER_BASE_URL =  getApiBaseURL();
// export const SERVER_BASE_URL = "https://pd-api.ilyastech.me";

// export const SERVER_BASE_URL = "https://pd-api.pedaconnect.com";

export const WEBSOCKET_BASEURL = getWebsocketBaseURL();
// export const WEBSOCKET_BASEURL = "wss://pd-api.ilyastech.me";

// export const WEBSOCKET_BASEURL = "wss://pd-api.pedaconnect.com";
