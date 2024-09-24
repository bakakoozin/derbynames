
type FieldsetProps = {
  children: React.ReactNode;
  label?: string;
  name?: string;
};

export function Fieldset(props: FieldsetProps) {
const { children, label, name } = props;

  return  <fieldset className="flex flex-col gap-2">
  {label && <label htmlFor={name || ''}>{label}{" :"}</label>}
  {children}
</fieldset>

}