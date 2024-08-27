import { useParams,useNavigate } from "react-router-dom";
import { Loader } from "../ui/loader";
import { useState,useEffect } from "react";
import { toast } from "react-toastify";

export function ValidateEmail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const params = useParams<{ token: string }>();

  const handlerSendToken= async () => {
    setLoading(true);
    try{
      const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/validate',{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: params.token  })
      });
      const resJson = await response.json();
      console.log(resJson);
     // navigate("/derbyname/validate-email/" + resJson.slug );
    } catch (error) { 
      console.log(error);
     toast.error("Erreur lors de la validation de l'email");
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    handlerSendToken();
  }, []);

  return <div className="h-full flex flex-col items-center gap-2">
    <h1 className="text-500 text-5xl font-bold text-center">{"Validation de l'email"}</h1>
    <p className="italic text-center">{params.token}</p>
    {loading && <Loader />}
  </div>
} 