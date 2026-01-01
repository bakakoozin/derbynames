import { A, useLocation } from '@solidjs/router';

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

function ExtLink({ text, link, pathname, regex }: Link) {
  return <a href={link} target="_blank" class="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-dn-500 data-[current='true']:text-dn-500 data-[current='true']:bg-dn-100" data-current={!!pathname.match(regex)} >
    {text}
  </a>
}

function IntLink(props: Link) {


  return <A href={props.link}
    class="btn transition-transform data-[current='true']:translate-x-2 data-[current='true']:border-dn-500 data-[current='true']:text-dn-500 data-[current='true']:bg-dn-100" data-current={props.link === '/' ? props.pathname === '/' : !!props.pathname.match(props.regex)} >
    {props.text}
  </A>
}

export function MenuLink(props: MenuLinkProps) {
  const location = useLocation();
  const regex = new RegExp(props.link)


  if (props.external) return <ExtLink {...props} pathname={location.pathname} regex={regex} />

  return <IntLink  {...props} pathname={location.pathname} regex={regex} />

}