import { Link,useLocation } from "react-router-dom";

type MenuLinkProps = {
  text: string;
  link: string;
  external?: boolean;
};

export function MenuLink({ text, link, external }:MenuLinkProps) {
  const { pathname } = useLocation();
  const regex = new RegExp(link)

  return <div className="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-500 data-[current='true']:text-500 data-[current='true']:bg-100" data-current={!!pathname.match(regex)} >
   {external ? <a href={link} target="_blank">{text}</a>:<Link to={link} >{text}</Link>}
  </div>
}