import { Webhook } from "lucide-react";
import { CHARGILY_TEST_URL } from "./payment_constants";

const WEBHOOK_URL = 'https://9ccbfdab81d0.ngrok-free.app/payment/payment-webhook/'
const URLS = {
  chargily_pay: CHARGILY_TEST_URL,
  
};
async function chargily_pay(user_id:string,amount:number) {
    const body = JSON.stringify({
    amount: amount,
    currency: "dzd",
    success_url: "https://pd-client.ilyastech.me",
    webhook_endpoint: WEBHOOK_URL,
    metadata: {
        user_id:user_id, 
    }
  });
  
  try {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_CHARGILY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body:body,
    };

    const response = await   fetch("https://pay.chargily.net/test/api/v2/checkouts", options)
    const data = await response.json()

    return {ok:response.ok, status:response.status, data:data}
      
  } catch (error) {
    return { ok: false, error: error };
  }
}

export const payment_http_client = {
    chargily_pay:chargily_pay
}
