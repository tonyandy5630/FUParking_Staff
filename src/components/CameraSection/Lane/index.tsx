type Props = {
  children: any;
};

export default function Lane({ children }: Props) {
  return (
    <div className='flex flex-col items-start justify-between flex-grow w-1/2 p-3 max-w-fit min-h-sm'>
      {children}
    </div>
  );
}
