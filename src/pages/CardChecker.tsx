import { lazy } from "react";
const CardCheckSection = lazy(
  () => import("@components/SessionCard/Section/CardCheck")
);
const ParkingStatistic = lazy(
  () => import("@components/SessionCard/Section/ParkingAreaStatistic")
);
import { HotkeysProvider } from "react-hotkeys-hook";
import PAGE from "../../url";
const SessionTable = lazy(
  () => import("@components/SessionCard/Section/SessionTable")
);
import useRefresh from "../hooks/useRefresh";
import useGetLogin from "../hooks/useGetLogIn";
import useGetParkingId from "../hooks/useGetParkingId";
import VerificationFallback from "@components/Fallback/VerificationFallback";

export default function CardCheckerPage() {
  const { parkingId, isLoadingParkingAreaData } = useGetParkingId(true);
  useRefresh();
  useGetLogin(true);

  return (
    <HotkeysProvider initiallyActiveScopes={[PAGE.CARD_CHECKER]}>
      {isLoadingParkingAreaData ? (
        <VerificationFallback />
      ) : (
        <div className='flex justify-center h-full max-h-screen'>
          <div className='grid grid-cols-[2fr_1fr] gap-3 min-h-full max-w-screen-xl w-screen-xl'>
            <div className='grid col-span-1 gap-3 grid-rows-[auto_1fr] h-full max-h-full'>
              <ParkingStatistic parkingId={parkingId} />
              <SessionTable parkingId={parkingId} />
            </div>
            <CardCheckSection />
          </div>
        </div>
      )}
    </HotkeysProvider>
  );
}
