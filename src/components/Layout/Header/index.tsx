import logo from "../../../assets/Bai_Logo.png";
import UserManualDialog from "@components/UserManual";

const LOGO_WIDTH = 40;

export default function Header() {
  return (
    <div className='flex items-center justify-between min-w-full p-2 bg-primary-text '>
      <div className='flex items-center justify-between'>
        <img src={logo} width={LOGO_WIDTH} height={LOGO_WIDTH} />
        <p className='font-bold text-white uppercase text-md'>
          BAI PARKING SYSTEM
        </p>
      </div>
      <UserManualDialog />
    </div>
  );
}
