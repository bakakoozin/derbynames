import { createSignal, JSX } from "solid-js"

type ModalProps = {
  children: JSX.Element
  button: JSX.Element
  closeButton?: boolean
}

const [open, setOpen] = createSignal(false)

export const modal = {
  open() {
    setOpen(true)
  },
  close() {
    setOpen(false)
  }

}
export function Modal(props: ModalProps) {

  return <>
    {props.button}
    {open() && <div class="fixed inset-0 bg-opacity-50 bg-600 flex items-center justify-center z-50">
      <div class="max-w-[500px] p-2 bg-dn-100  m-2 border border-dn-500 ">
        {props.closeButton &&
          <div class="flex justify-end">
            <button onClick={modal.close} class="btn">Fermer</button>
          </div>
        }

        {props.children}
      </div>
    </div>}
  </>
}