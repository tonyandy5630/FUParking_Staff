type Props = {
  children: any;
  focus?: boolean;
};

export default function Lane({ children, focus }: Props) {
  return (
    <div className='grid justify-between flex-grow grid-cols-2 p-3 bg-red-300'>
      {children}
    </div>
  );
}
