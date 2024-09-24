import { useState, ReactElement } from "react"

type ModalProps = {
    children: (closeModal: () => void) => ReactElement
    button: (openModal: () => void) => ReactElement
    closeButton?:boolean
}

export function Modal({ children, button,closeButton }: ModalProps) {
    const [open, setOpen] = useState(false)

    function handleOpen() {
        setOpen(true)
    }
    function handleClose() {
        setOpen(false)
    }
    return <>
        {button(handleOpen)}
        {open && <div className="fixed inset-0 bg-opacity-50 bg-600 flex items-center justify-center z-50">
            <div className="max-w-[500px] p-2 bg-100  m-2 border border-500 ">
               {closeButton && 
                    <div className="flex justify-end">
                        <button onClick={handleClose} className="btn">Fermer</button>
                    </div>
                }
                
                {children(handleClose)}
            </div>
        </div>}
    </>
}