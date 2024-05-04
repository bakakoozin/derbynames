import { Link } from 'react-router-dom'

export function Menu() {
  return (
    <>
      <div>
        <div className='flex flex-row pl-20'>
          <div className='flex flex-col pt-14 text-100'>
            <p className='pt-10'>Ici la zone menu</p>
            <div className='pt-10'><Link className='text-100 hover:text-300' to="/api-test">Api-Test</Link></div>
            <div className='pt-10'><Link className='text-100 hover:text-300' to="/liste-derbynames">La liste des Derby Names</Link></div>
            <div className='pt-10'><Link className='text-100 hover:text-300' to="/liste-clubs">Les clubes de Roller Derby</Link></div>
          </div>
        </div>
      </div>
    </>
  )
}


//<div className='mt-10'><Link className='text-600 hover:text-300' to="/api-test">Api-Test</Link></div>