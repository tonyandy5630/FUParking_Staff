import CardCheckSection from "@components/SessionCard/Section/CardCheck";
import ParkingSection from "@components/SessionCard/Section/ParkingAreaStatistic";
import { HotkeysProvider } from "react-hotkeys-hook";
import PAGE from "../../url";
import SessionTable from "@components/SessionCard/Section/SessionTable";

export default function CardCheckerPage() {
  return (
    <HotkeysProvider initiallyActiveScopes={[PAGE.CARD_CHECKER]}>
      <div className='flex justify-center h-full'>
        <div className='grid grid-cols-[2fr_1fr] gap-3 min-h-full max-w-screen-xl w-screen-xl'>
          <div className='grid col-span-1 gap-3 grid-rows-[auto_1fr]'>
            <ParkingSection />
            <SessionTable />
          </div>
          <CardCheckSection />
        </div>
      </div>
    </HotkeysProvider>
  );
}
