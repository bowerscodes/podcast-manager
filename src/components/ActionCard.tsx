'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

type Props = {
  header?: ReactNode
  body?: ReactNode;
  footer?: ReactNode
  href: string;
};

export default function ActionCard({ 
  header, 
  body, 
  footer,
  href 
}: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <Card 
      className="w-[18rem] flex flex-col border-2 border-black rounded-xl bg-blue-500 shadow-md aspect-square cursor-pointer"
      isPressable
      disableRipple
      onPress={handlePress}
    >
      <CardHeader className='p-4 flex-col items-start leading-none'>
        {header}
      </CardHeader>
      <CardBody className='p-4 text-center flex-1 flex items-center justify-center'>
        {body}
      </CardBody>
      <CardFooter className='p-4 justify-end mt-auto leading-none'>
        {footer}
      </CardFooter>
    </Card>
  );
};
