import { Link,useLocation } from "react-router-dom";

type MenuLinkProps = {
  text: string;
  link: string;
  external?: boolean;
};

type Link = {
  pathname: string;
  text: string;
  link: string;
  regex: RegExp;
}

function ExtLink({ text, link, pathname,regex }:Link) {
  return  <a href={link} target="_blank" className="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-500 data-[current='true']:text-500 data-[current='true']:bg-100" data-current={!!pathname.match(regex)} >
{text}
 </a>
}

function IntLink({ text, link, pathname,regex }:Link) {
  return  <Link to={link} className="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-500 data-[current='true']:text-500 data-[current='true']:bg-100" data-current={!!pathname.match(regex)} >
{text}
  </Link>
  }

export function MenuLink(props:MenuLinkProps) {
  const { pathname } = useLocation();
  const regex = new RegExp(props.link)

  if(props.external) return <ExtLink {...props} pathname={pathname} regex={regex} />
  
  return <IntLink  {...props} pathname={pathname} regex={regex} />

}