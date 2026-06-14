import * as React from "react";
import { Input } from "@/components/ui/input";

type Props = React.ComponentProps<typeof Input>;

export function DecimalInput(props: Props) {
  return <Input {...props} type="text" inputMode="decimal" autoComplete={props.autoComplete ?? "off"} />;
}

export function IntegerInput(props: Props) {
  return <Input {...props} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={props.autoComplete ?? "off"} />;
}
