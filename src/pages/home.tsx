import { Link } from 'react-router-dom'
import { Liste } from './liste'

export function Home() {
  return (
    <>
      <div>
        <div className='h-16 flex flex-col items-center font-bold text-100'>
          <h1>Bienvenue sur l'application DERBY NAMES</h1>
        </div>
        <div className='flex flex-row pl-20'>
          <div className='flex flex-col pt-14 text-100'>
            <p>Cette application recense les derby names des clubs français uniquement.</p>
            <p className='pt-10'>On y trouve:</p>
            <p>La liste des derbynames</p>
            <p>Le numéro de joueureuse associé (si renseigné)</p>
            <p>Ainsi que le club associé au derby name</p>
            <p>Modifie tes données quand quand tu le souhaites</p>
            <div><Link className='text-100 hover:text-300' to="/api-test">Api-Test</Link></div>
          </div>
          <div className='flex flex-row items-center pl-40'>
            <Liste />
          </div>
        </div>
      </div>
    </>
  )
}


//<div className='mt-10'><Link className='text-600 hover:text-300' to="/api-test">Api-Test</Link></div>