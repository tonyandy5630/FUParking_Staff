import SessionCardColumns from "@components/SessionCard/columns";
import CardCheckSection from "@components/SessionCard/Section/CardCheck";
import ParkingSection from "@components/SessionCard/Section/ParkingAreaStatistic";
import { DataTable } from "@components/Table";
import { HotkeysProvider } from "react-hotkeys-hook";
import PAGE from "../../url";

export default function CardCheckerPage() {
  return (
    <HotkeysProvider initiallyActiveScopes={[PAGE.CARD_CHECKER]}>
      <div className='flex justify-center h-full'>
        <div className='grid grid-cols-[2fr_1fr] gap-3 min-h-full max-w-screen-xl'>
          <div className='grid col-span-1 gap-3 grid-rows-[auto_1fr]'>
            <ParkingSection />
            <DataTable columns={SessionCardColumns} data={[]} />
          </div>
          <CardCheckSection />
        </div>
      </div>
    </HotkeysProvider>
  );
}
