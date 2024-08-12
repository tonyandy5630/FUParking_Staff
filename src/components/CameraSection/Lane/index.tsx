type Props = {
  children: any;
  focus?: boolean;
};

export default function Lane({ children, focus }: Props) {
  return (
    <div className='flex flex-col items-start justify-between flex-grow w-1/2 max-w-full p-3'>
      {children}
    </div>
  );
}
