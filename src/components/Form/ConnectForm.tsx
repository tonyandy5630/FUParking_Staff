import { useFormContext } from "react-hook-form";

export default function ConnectForm({ children }: any) {
  const methods = useFormContext();

  return children({ ...methods });
}
