import { SERVER_BASE_URL } from "../server_constants";


const BASE_URL = SERVER_BASE_URL;
const URLS = {
    get_notifications_by_recipient:`${BASE_URL}/notifications/get-notifications-by-recepient/`,
    mark_notifs_as_read:`${BASE_URL}/notifications/mark_notifs_as_read`
}

async function get_notifications_by_recipient(){
    try {
        const response = await fetch(URLS.get_notifications_by_recipient,{
            method:"GET",
            credentials:"include"
        })
        const data = await response.json()

        return {ok:response.ok, status:response.status, data:data}
    } catch (error) {
        return {ok:false, error:error}
    }
}

async function mark_notifs_as_read(){
    try {
        const response = await fetch(URLS.mark_notifs_as_read,{
            method:"GET",
            credentials:"include"
        })
        const data = await response.json()

        return {ok:response.ok, status:response.status, data:data}
    } catch (error) {
        return {ok:false, error:error}
    }
}

export const notifications_client = {
    get_notifications_by_recipient:get_notifications_by_recipient,
    mark_notifs_as_read:mark_notifs_as_read
}