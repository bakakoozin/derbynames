import { useState, ReactElement } from "react"

type ModalProps = {
    children: (closeModal: () => void) => ReactElement
    button: (openModal: () => void) => ReactElement
}

export function Modal({ children, button }: ModalProps) {
    const [open, setOpen] = useState(false)

    function handleOpen() {
        setOpen(true)
    }
    function handleClose() {
        setOpen(false)
    }
    return <>
        {button(handleOpen)}

        {open && <div className="fixed inset-0 bg-opacity-50 bg-600 flex items-center justify-center">
            <div className="max-w-[500px] p-2 bg-100 m-2">
                <button onClick={handleClose}>Close</button>
                {children(handleClose)}
            </div>
        </div>}
    </>
}