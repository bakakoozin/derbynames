import { Modal } from '../components/modal'
import { AddDerbynameForm } from '../components/add-derbyname-form'
import { MenuLink } from './menu-link'


export function Menu() {

  return (
    <div className='flex flex-col gap-2 p-2'>
      <Modal button={(onClick) => <div onClick={onClick} className="btn text-center">AJOUTER MON DERBY NAME</div>} >
        {(onClose) => <AddDerbynameForm onClose={onClose} />}
      </Modal >
      <div className='border-b border-500 my-2' />
      {[{
        link: '/derbynames',
        text: 'LISTE DERBY NAMES'
      }, {
        link: '/clubs',
        text: 'CLUBS DE ROLLER DERBY'
      }].map((link) => <MenuLink key={link.link} {...link} />)}

      <div className='border-b border-500 my-2' />
      {[{
        link: 'https://linktr.ee/bakadev',
        external: true,
        text: 'Contact'
      }, {
        link: '/legal',
        text: 'Mentions légales'
      }].map((link) => <MenuLink key={link.link} {...link} />)}
    </div>
  )
}