import { JSX } from "solid-js";

type FieldsetProps = {
  children: JSX.Element;
  label?: string;
  name?: string;
};

export function Fieldset(props: FieldsetProps) {


  return <fieldset class="flex min-w-0 w-full max-w-full flex-col gap-2">
    {props.label && <label for={props.name || ''}>{props.label}{" :"}</label>}
    {props.children}
  </fieldset>

}