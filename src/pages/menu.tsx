import { Link, useLocation } from 'react-router-dom'
import { Modal } from '../components/modal'
import { AddDerbynameForm } from '../components/add-derbyname-form'


export function Menu() {
  const { pathname } = useLocation();
  return (
    <div className='flex flex-col gap-2 p-2'>
      <Modal button={(onClick) => <div onClick={onClick} className="btn text-center">AJOUTER MON DERBY NAME</div>} >
        {(onClose) => <AddDerbynameForm onClose={onClose} />}
      </Modal >
      <div className='border-b border-500 my-2'/>
      {[{
        link: '/derbynames',
        text: 'LISTE DERBY NAMES'
      }, {
        link: '/clubs',
        text: 'CLUBS DE ROLLER DERBY'
      }].map((link) => {

        const regex = new RegExp(link.link)
        return <div key={link.link} className="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-500 data-[current='true']:text-500 data-[current='true']:bg-100" data-current={!!pathname.match(regex)}>
          <Link to={link.link} >
            {link.text}
          </Link>
        </div>
      })}
    </div>
  )
}