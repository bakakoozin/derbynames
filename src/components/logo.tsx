import { createSignal } from "solid-js";
export function Logo() {

  const [isHover, setIsHover] = createSignal(false)

  return (
    <div
      class="
    uppercase font-display font-bold text-3xl flex  duration-300 transition-transform ease-in-out
    data-[is-hover=true]:translate-y-4 
    "
      data-is-hover={isHover()}

      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div

        data-is-hover={isHover()}
        class="relative w-4 transition-color  duration-300 transition-transform ease-in-out origin-bottom-right 
      
      data-[is-hover=true]:rotate-90 data-[is-hover=true]:scale-150 data-[is-hover=true]:-translate-y-11 data-[is-hover=true]:bg-dn-500 data-[is-hover=true]:text-dn-100 data-[is-hover=false]:text-dn-500 data-[is-hover=false]:bg-dn-100
      "
      >
        <div class="text-xs origin-right -rotate-90 absolute left-1 top-3 bottom-0 right-0">
          derby
        </div>
      </div>
      <div

        data-is-hover={isHover()}
        class="p-1 transition-color ease-in-out duration-300
      data-[is-hover=true]:text-dn-500 data-[is-hover=true]:bg-dn-100 data-[is-hover=false]:bg-dn-500 data-[is-hover=false]:text-dn-100
      "
      >names</div>
    </div>
  );
}