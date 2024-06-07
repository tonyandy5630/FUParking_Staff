import toLocaleDate from "@utils/date";

const MIN_HEIGHT = 16;

export default function Header() {
  return (
    <>
      <header
        className={`min-h-11 fixed left-0 right-0 flex items-center justify-between px-4`}
      >
        <div className='flex flex-col items-start justify-center h-full'>
          <h2 className='text-xl font-bold text-primary-text'>Cổng 1</h2>
          <p className='text-lg font-bold'>BAI Parking System</p>
        </div>
        <h2 className='text-lg font-bold text-primary-text'>
          {toLocaleDate(new Date())}
        </h2>
      </header>
      <div className={`min-h-11`} />
    </>
  );
}
