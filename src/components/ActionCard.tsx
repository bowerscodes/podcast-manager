import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { ReactNode } from 'react';

type Props = {
  header?: ReactNode
  body?: ReactNode;
  footer?: ReactNode
  onPress?: () => void;
};

export default function ActionCard({ 
  header, 
  body, 
  footer,
  onPress 
}: Props) {
  return (
    <Card 
      className="w-[18rem] flex flex-col border-2 border-black rounded-xl bg-blue-500 shadow-md aspect-square cursor-pointer"
      isPressable
      disableRipple
      onPress={onPress}
    >
      <CardHeader className='m-2 flex-col items-start'>
        {header}
      </CardHeader>
      <CardBody className='m-2 text-center flex-1 flex items-center justify-center'>
        {body}
      </CardBody>
      <CardFooter className='m-2 justify-end mt-auto'>
        {footer}
      </CardFooter>
    </Card>
  );
};
