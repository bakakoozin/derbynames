import { Link } from 'react-router-dom'
import { Modal } from '../components/modal'
import { ApiTest } from '../components/api-test'

export function Menu() {
  return (
    <>
      <div>
        <div className='flex flex-row justify-center'>
          <div className='flex flex-col text-100 place-content-between'>
            <Modal button={(onClick) => <div onClick={onClick} className="pt-10 cursor-pointer">Ajouter mon Derby Name</div>} >
              {(onClose) => <div>
                <ApiTest />
                <button onClick={onClose}>Submit</button>
              </div>}
            </Modal>
            <div className='pt-8'>
              <div className='p-3 border-solid border-2 border-50 rounded-xl hover:opacity-60'
                style={{ backgroundColor: 'rgba(174, 181, 191, 0.2)' }}>
                <Link to="/liste-derbynames">
                  <div className='text-100 font-light flex p-2 bg-500 rounded-md shadow-md justify-center hover:shadow-inner hover:text-500 hover:bg-100'>
                    LISTE <span className='font-bold'> DERBY NAMES</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className='pt-8'>
              <div className='p-3 border-solid border-2 border-50 rounded-xl hover:opacity-60'
                style={{ backgroundColor: 'rgba(174, 181, 191, 0.2)' }}>
                <Link to="/liste-clubs">
                  <div className='text-100 font-light flex p-2 bg-500 rounded-md shadow-md justify-center hover:shadow-inner hover:text-500 hover:bg-100'>
                  <span className='font-bold'>CLUBS</span>DE ROLLER DERBY</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


//<div className='mt-10'><Link className='text-600 hover:text-300' to="/api-test">Api-Test</Link></div>