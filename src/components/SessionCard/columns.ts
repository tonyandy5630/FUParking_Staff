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
    accessorKey: "customerName",
    header: "Tên khách hàng",
  },
  {
    accessorKey: "customerEmail",
    header: "Email khách hàng",
  },
];

export default SessionCardColumns;
