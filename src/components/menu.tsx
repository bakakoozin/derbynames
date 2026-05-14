import { AddDerbyNameForm } from '~/components/add-derbyname-form'
import { MenuLink } from '~/components/menu-link'
import { modal, Modal } from '~/components/modal'

import { createSignal, onMount } from 'solid-js'

export function Menu() {

  const [isOpen, setIsOpen] = createSignal(false)
  const [flags, setFlags] = createSignal<{ premiumBadges?: boolean }>({})

  onMount(async () => {
    try {
      const res = await fetch('/api/feature-flags')
      const j = await res.json().catch(() => ({}))
      setFlags(j)
    } catch {
      setFlags({})
    }
  })

  const handleToggle = () => setIsOpen(!isOpen())
  const handleClose = () => setIsOpen(false)

  return (
    <>
      <div class="fixed top-4 left-2 flex gap-1 flex-col z-[999] md:hidden cursor-pointer" onClick={handleToggle}>
        {
          Array(3).fill(0).map((_, i) => <div class={`h-2 w-8 bg-dn-500`} />)
        }
      </div>
      <div data-open={isOpen()} class="fixed inset-0 backdrop-filter backdrop-blur-sm z-[880] bg-blur transition-color data-[open=false]:pointer-events-none data-[open=false]:opacity-0 md:opacity-0">
        <div class="fixed inset-0 bg-dn-500 opacity-10" />
      </div>
      <div
        data-open={isOpen()}
        onClick={handleClose}
        class='flex flex-col gap-2 px-2 pb-2 pr-4 md:pr-2 pt-14 md:pt-2 fixed md:relative top-0 bottom-0 left-0 bg-dn-100 z-[900] transition-all data-[open=false]:-left-[100%]  md:data-[open=false]:left-0' >
        <Modal button={<div onClick={modal.open} class="btn text-center">AJOUTER MON DERBY NAME</div>} >
          <AddDerbyNameForm onClose={modal.close} />
        </Modal >
        <div class='border-b border-dn-500 my-2' />
        {[{
          link: '/',
          text: 'LISTE DERBY NAMES'
        }, {
          link: '/clubs',
          text: 'CLUBS DE ROLLER DERBY'
        }, {
          link: '/historique',
          text: 'HISTORIQUE DERBY NAMES'
        }, ...(flags().premiumBadges ? [{
          link: '/badge-info',
          text: 'BADGE PREMIUM'
        }] : [])].map((link) => <MenuLink  {...link} />)}

        <div class='border-b border-dn-500 my-2' />
        {[{
          link: 'https://linktr.ee/bakadev',
          external: true,
          text: 'Contact'
        }, {
          link: '/legal',
          text: 'Mentions légales'
        }].map((link) => <MenuLink {...link} />)}
      </div>
    </>
  )
}