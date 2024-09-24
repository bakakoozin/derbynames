import {useState} from "react"
import { dc } from "../utils/dynamic-classes";
export function Logo() {

    const [isHover, setIsHover] = useState(false)

    return (
        <div className={

            dc("uppercase font-oswald font-bold text-3xl flex  duration-300 transition-transform ease-in-out",
                [isHover,"translate-y-4 "]
            )
        }
            onMouseEnter={()=> setIsHover(true)}
            onMouseLeave={()=> setIsHover(false)}
        >
           <div className={
            dc("relative w-4 transition-color  duration-300 transition-transform ease-in-out origin-bottom-right ",
                [isHover, 'rotate-90 scale-150 -translate-y-11 bg-500 text-100','text-500 bg-100']
            )
           }>
                <div className="text-xs origin-right -rotate-90 absolute left-1 top-3 bottom-0 right-0">
                    derby
                </div>
            </div>
           <div className={dc("p-1 transition-color ease-in-out duration-300",
            [isHover, 'text-500 bg-100','bg-500 text-100']
           )}>names</div>
        </div>
    );
}