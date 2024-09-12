import { Button } from "@components/ui/button";
import logo from "../../../assets/Bai_Logo.png";
import UserManualDialog from "@components/UserManual";
import { LOG_OUT_CHANNEL } from "@channels/index";
import { useNavigate } from "react-router-dom";
import PAGE from "../../../../url";
import { removeTokenFromLS } from "@utils/localStorage";

const LOGO_WIDTH = 40;

export default function Header() {
  const navigate = useNavigate();
  const handleLogOut = () => {
    window.ipcRenderer
      .invoke(LOG_OUT_CHANNEL)
      .then(() => {
        removeTokenFromLS();
        navigate(PAGE.LOGIN);
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className='flex items-center justify-between min-w-full p-2 bg-primary-text '>
      <div className='flex items-center justify-between'>
        <img src={logo} width={LOGO_WIDTH} height={LOGO_WIDTH} />
        <p className='font-bold text-white uppercase text-md'>
          BAI PARKING SYSTEM
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <UserManualDialog />
        <Button
          onClick={handleLogOut}
          variant='ghost'
          className='hover:bg-destructive hover:text-black text-destructive'
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
