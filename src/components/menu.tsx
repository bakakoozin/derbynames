import { Modal } from '../components/modal'
import { AddDerbynameForm } from '../components/add-derbyname-form'
import { MenuLink } from './menu-link'
import { useState } from 'react'

export function Menu() {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => setIsOpen(!isOpen)
  const handleClose = () => setIsOpen(false)

  return (
<>
<div className="fixed top-4 left-2 flex gap-1 flex-col z-[999] md:hidden cursor-pointer" onClick={handleToggle}>
  {
    Array(3).fill(0).map((_, i) => <div key={i} className={`h-2 w-8 bg-500`} />)
  }
  </div>
  <div data-open={isOpen} className="fixed inset-0 backdrop-filter backdrop-blur-sm z-[880] bg-blur transition-color pointer-events-none data-[open=false]:opacity-0 md:opacity-0">
    <div className="fixed inset-0 bg-base-primary opacity-10" />
  </div>
<div 

data-open={isOpen}
onClick={handleClose}
className='flex flex-col gap-2 px-2 pb-2 pr-4 md:pr-2 pt-14 md:pt-2 fixed md:relative top-0 bottom-0 left-0 bg-100 z-[900] transition-all data-[open=false]:-left-[100%]  md:data-[open=false]:left-0' >
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
</>
  )
}