import { SessionCard } from "@my_types/session-card";
import { ColumnDef } from "@tanstack/react-table";
import { formatPlateNumber } from "@utils/plate-number";

export const SessionCardColumns: ColumnDef<SessionCard>[] = [
  {
    accessorKey: "index",
    header: "STT",
    size: 10,
  },
  {
    accessorKey: "plateNumber",
    header: "Biển số xe",
    cell: ({ row }) => {
      return formatPlateNumber(row.getValue("plateNumber"));
    },
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
    accessorKey: "timeOut",
    header: "Thời gian ra",
  },
  {
    accessorKey: "gateIn",
    header: "Cổng vào",
  },
  {
    accessorKey: "cardStatus",
    header: "Trạng thái phiên",
  },
];

export default SessionCardColumns;
