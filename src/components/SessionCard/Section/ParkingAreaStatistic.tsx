import RectangleContainer, { Rectangle } from "@components/Rectangle";

export default function ParkingSection() {
  return (
    <RectangleContainer className='grid-cols-3'>
      <Rectangle title='Tổng số lượt xe vào' content='0' />
      <Rectangle title='Tổng số lượt xe ra' content='0' />
      <Rectangle title='Tổng xe trong bãi' content='0' />
    </RectangleContainer>
  );
}
