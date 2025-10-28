import { payment_http_client } from "../../services/payment/payment_http_client"

function ChargilyPayment(){
    const user =JSON.parse(localStorage.getItem("schoolParentOrTeacherManagementUser")??"")
    const user_id = user?.id
    
    const pay_func = async ()=>{
        const res = await payment_http_client.chargily_pay(user_id)
        if(res.ok){
            const data = res.data
            window.location = data?.checkout_url 
        }
    } 
    //?: Payment Button
   return <>
    <button className="w-10 bg-blue-800  text-white px-8 py-1
     flex items-center justify-center rounded "
     onClick={pay_func}
     >
        Pay
    </button>
   </>
}

export default ChargilyPayment;