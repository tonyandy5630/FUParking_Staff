type Props = {
  children: any;
  focus: boolean;
};

export default function Lane({ children, focus }: Props) {
  return (
    <div
      className={`flex flex-col items-start justify-between flex-grow w-1/2 p-3 max-w-fit min-h-sm ${
        focus ? "bg-cyan-300" : ""
      }`}
    >
      {children}
    </div>
  );
}
