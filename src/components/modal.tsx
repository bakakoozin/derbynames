import { createSignal, JSX } from "solid-js";

function IconCloseFlat(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.75" />
    </svg>
  );
}

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
    {open() && (
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-600 bg-opacity-50 p-3">
        <div
          class="
            box-border h-[95dvh] w-full
            max-w-125 min-w-0 overflow-x-hidden
            overflow-y-auto border border-dn-500
            bg-dn-100 p-3 [scrollbar-gutter:stable]
          "
          role="dialog"
          aria-modal="true"
        >
          {props.closeButton &&
            <div class="flex justify-end">
              <button
                type="button"
                onClick={modal.close}
                class="btn inline-flex items-center gap-2"
              >
                <IconCloseFlat class="size-5 shrink-0 text-dn-100" />
                Fermer
              </button>
            </div>
          }

          {props.children}
        </div>
      </div>
    )}
  </>
}
