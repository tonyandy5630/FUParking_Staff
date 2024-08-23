type Props = {
  children: any;
};

export default function Lane({ children }: Props) {
  return (
    <div className='grid justify-between flex-grow grid-cols-2 p-3 bg-red-300'>
      {children}
    </div>
  );
}
