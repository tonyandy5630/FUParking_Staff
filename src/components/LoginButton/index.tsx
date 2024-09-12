import { Button } from "@components/ui/button";
import { useNavigate } from "react-router-dom";
import PAGE from "../../../url";

export default function LoginButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant='outline'
      className='border-primary text-primary'
      onClick={() => navigate(PAGE.LOGIN)}
    >
      Đăng nhập
    </Button>
  );
}
