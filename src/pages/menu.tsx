import { Link } from 'react-router-dom'
import { Modal } from '../components/modal'
import { ApiTest } from '../components/api-test'

export function Menu() {
  return (
    <div className='flex flex-col gap-2 p-2'>
      <Modal button={(onClick) => <div onClick={onClick} className="btn">Ajouter mon Derby Name</div>} >
        {(onClose) => <ApiTest onClose={onClose} />}
      </Modal>
      <Link to="/liste-derbynames" className="btn">
          LISTE DERBY NAMES
      </Link>

      <Link to="/liste-clubs"  className='btn'>
          CLUBS DE ROLLER DERBY
      </Link>
    </div>
  )
}


//<div className='mt-10'><Link className='text-600 hover:text-300' to="/api-test">Api-Test</Link></div>