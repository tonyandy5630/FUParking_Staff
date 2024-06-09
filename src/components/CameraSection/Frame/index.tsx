type Props = {
  children: any;
};

export default function Frame({ children }: Props) {
  return (
    <div className='border border-black border-solid min-w-[754px] min-h-[372px]'>
      {children}
    </div>
  );
}
