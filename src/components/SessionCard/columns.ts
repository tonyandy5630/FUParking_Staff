import { SessionCard } from "@my_types/session-card";
import { ColumnDef } from "@tanstack/react-table";

export const SessionCardColumns: ColumnDef<SessionCard>[] = [
  {
    accessorKey: "plateNumber",
    header: "Biển số xe",
  },
  {
    accessorKey: "vehicleType",
    header: "Loại xe",
  },
  {
    accessorKey: "timeIn",
    header: "Thời gian vào",
  },
  {
    accessorKey: "gateIn",
    header: "Cổng vào",
  },
  {
    accessorKey: "cardStatus",
    header: "Trạng thái xe",
  },
];

export default SessionCardColumns;
