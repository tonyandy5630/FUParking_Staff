import toLocaleDate from "@utils/date";

const MIN_HEIGHT = 16;

export default function Header() {
  return (
    <>
      <header
        className={`min-h-9 fixed left-0 right-0 flex items-center justify-between px-3`}
      >
        <h2 className='text-xl font-bold text-primary-text'>Cổng 1</h2>
        <h2 className='text-lg font-bold text-primary-text'>
          {toLocaleDate(new Date())}
        </h2>
      </header>
      <div className={`min-h-4 mb-2`} />
    </>
  );
}
