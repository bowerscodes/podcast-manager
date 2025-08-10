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
      className="action-card group"
      isPressable
      disableRipple
      onPress={handlePress}
    >
      <CardHeader className='p-6 flex-col items-start'>
        {header}
      </CardHeader>
      <CardBody className='p-6 text-center flex-1 flex items-center justify-center'>
        {body}
      </CardBody>
      <CardFooter className='p-6 justify-end'>
        {footer}
      </CardFooter>
    </Card>
  );
};
