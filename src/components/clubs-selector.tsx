import { useState,useEffect } from 'react';
import { toast } from 'react-toastify';

type ClubSelectorProps = {
  defaultValue?: string,
  name?: string,
  onChange?: (club: {
    name: string
    id: string
  }) => void
}

export function ClubSelector({defaultValue = 'autre',name, onChange}: ClubSelectorProps){
  
  const defaultChoice  = {name: '=== AUTRE ===', id: 'autre'};
  const [clubs, setClubs] = useState([defaultChoice]);
  const [selectedClub, setSelectedClub] = useState(defaultValue);
  const [loading, setLoading] = useState(false)

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>){
    setSelectedClub(e.target.value)
    if(onChange){
      const club = clubs.find(club => club.id === e.target.value)
      if(club) onChange({
        name: club.name,
        id: club.id
      })
    }
  }

  async function getClub(){

      setLoading(true)
      try{
          const response = await fetch(import.meta.env.VITE_DERBY_FRANCE_URL_API + 'clubs');
          const resJson = await response.json();
          if(!response.ok) throw new Error('Erreur lors de la récupération des clubs')
      
            const cl = resJson
            .reduce((acc:{id:string,name:string}[], club:{id:string,titre:string, titre_court:string}) => {
              const name =   club?.titre || club?.titre_court
              if(!name) return acc
              if(!acc.find((c) => name === c.name)){
                acc.push({
                  name,
                  id: club.id
                })
              }
              return acc
            }
            ,[defaultChoice]) 
          setClubs(cl.sort((a:{name:string}, b:{name:string}) => a.name.localeCompare(b.name))
          )
      } catch(e){
        toast.error(e as string)

      } finally{
          setLoading(false)
      }
  }

  useEffect(
      ()=>{
          getClub()
      }
  ,[])


  if(loading) return <div className='input'>Chargement des clubs...</div>
 

  return <select name={name || 'club'} value={selectedClub} onChange={handleSelect} className='lowercase w-full'>
    {
      clubs.map(club => <option
        className='truncate  first-letter:uppercase' 

        key={club.id} 
        value={club.id}
        >
            {club.name}
      </option>)
    }
  
</select>

}